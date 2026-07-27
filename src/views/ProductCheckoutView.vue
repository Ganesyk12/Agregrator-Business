<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const checkoutItems = ref<any[]>([])
const deliveryInfo = ref({ name: '', phone: '', address: '', city: '', notes: '' })
const submitting = ref(false)
const orderResult = ref<any>(null)
const errorMsg = ref('')

onMounted(() => {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  loadCheckoutItems()
})

function loadCheckoutItems() {
  const productId = route.query.productId
  if (productId) {
    checkoutItems.value = [{
      id_product: Number(productId),
      quantity: Number(route.query.quantity || 1),
      id_variant: route.query.variantId ? Number(route.query.variantId) : undefined,
      addon_ids: route.query.addonIds || '',
      product: { name: 'Loading...', price: 0 },
    }]
    fetchProduct(Number(productId))
  } else {
    const stored = localStorage.getItem('sigyn_cart_checkout')
    if (stored) {
      checkoutItems.value = JSON.parse(stored).filter((i: any) => i.product)
    }
  }
}

async function fetchProduct(id: number) {
  try {
    const res = await fetch(`/api/products/${id}`)
    if (res.ok) {
      const json = await res.json()
      if (checkoutItems.value[0]) {
        checkoutItems.value[0].product = json.data
      }
    }
  } catch { /* ignore */ }
}

const totalPrice = computed(() => {
  return checkoutItems.value.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0)
})

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

async function submitOrder() {
  if (!deliveryInfo.value.name || !deliveryInfo.value.phone || !deliveryInfo.value.address) {
    errorMsg.value = 'Please fill in name, phone, and address'
    return
  }
  submitting.value = true
  errorMsg.value = ''

  const vendorId = checkoutItems.value[0]?.product?.id_vendor
  if (!vendorId) { errorMsg.value = 'Product vendor not found'; submitting.value = false; return }

  try {
    const res = await auth.authFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        id_vendor: vendorId,
        items: checkoutItems.value.map(i => ({
          id_product: i.id_product,
          id_variant: i.id_variant || null,
          quantity: i.quantity,
          price: i.product?.price || 0,
          addon_ids: i.addon_ids || '',
        })),
        delivery_info: `${deliveryInfo.value.name}, ${deliveryInfo.value.phone}, ${deliveryInfo.value.address}, ${deliveryInfo.value.city}`,
        notes: deliveryInfo.value.notes,
      }),
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      throw new Error(e?.error?.message || 'Failed to create order')
    }
    const json = await res.json()
    orderResult.value = json.data
    localStorage.removeItem('sigyn_cart_checkout')
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="checkout-wrapper">
      <div class="container">
        <h1 class="checkout-title">Product Checkout</h1>

        <div v-if="orderResult" class="order-success">
          <div class="success-icon">&#10003;</div>
          <h2>Order Placed Successfully!</h2>
          <p>Order ID: <strong>#{{ orderResult.id_order }}</strong></p>
          <p>Status: <span class="badge bg-warning text-dark">{{ orderResult.status }}</span></p>
          <p>Total: <strong>{{ formatPrice(orderResult.total_price) }}</strong></p>
          <p v-if="orderResult.delivery_info">Delivery: {{ orderResult.delivery_info }}</p>
          <router-link to="/" class="btn btn-dark mt-3">Back to Home</router-link>
        </div>

        <div v-else class="checkout-content">
          <!-- Order Summary -->
          <div class="checkout-section">
            <h3>Order Summary</h3>
            <div class="order-items">
              <div v-for="(item, idx) in checkoutItems" :key="idx" class="order-item">
                <div class="item-info">
                  <span class="item-name">{{ item.product?.name || 'Product' }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">{{ formatPrice((item.product?.price || 0) * item.quantity) }}</span>
              </div>
            </div>
            <div class="order-total">
              <span>Total</span>
              <strong>{{ formatPrice(totalPrice) }}</strong>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="checkout-section">
            <h3>Delivery Information</h3>
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="deliveryInfo.name" type="text" class="form-control" placeholder="Recipient name" />
            </div>
            <div class="form-group">
              <label>Phone Number *</label>
              <input v-model="deliveryInfo.phone" type="tel" class="form-control" placeholder="Phone number" />
            </div>
            <div class="form-group">
              <label>Delivery Address *</label>
              <textarea v-model="deliveryInfo.address" class="form-control" rows="2" placeholder="Street address"></textarea>
            </div>
            <div class="form-group">
              <label>City</label>
              <input v-model="deliveryInfo.city" type="text" class="form-control" placeholder="City" />
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea v-model="deliveryInfo.notes" class="form-control" rows="2" placeholder="Special instructions"></textarea>
            </div>
          </div>

          <p v-if="errorMsg" class="text-danger">{{ errorMsg }}</p>

          <button class="btn btn-primary btn-lg w-100" @click="submitOrder" :disabled="submitting">
            {{ submitting ? 'Processing...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.checkout-page { background: #f8f8f8; min-height: 100vh; }
.checkout-wrapper { padding: 40px 0 80px; }
.checkout-title { font-family: 'Marcellus', serif; font-size: 2rem; margin-bottom: 32px; }

.checkout-content { max-width: 700px; margin: 0 auto; }
.checkout-section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
.checkout-section h3 { font-size: 1.1rem; font-weight: 600; margin: 0 0 16px; }

.order-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.item-info { display: flex; gap: 8px; align-items: center; }
.item-name { font-weight: 500; }
.item-qty, .item-price { color: #888; }

.order-total { display: flex; justify-content: space-between; padding-top: 12px; font-size: 1.1rem; }

.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: #333; }
.form-control { width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 0.9rem; transition: border-color 0.2s; }
.form-control:focus { outline: none; border-color: var(--bs-secondary, #B89C7B); }

.order-success { text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto; }
.success-icon { width: 72px; height: 72px; border-radius: 50%; background: #2ecc71; color: #fff; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
.order-success h2 { font-family: 'Marcellus', serif; margin-bottom: 16px; }
.order-success p { color: #666; margin-bottom: 8px; }

@media (max-width: 576px) {
  .checkout-wrapper { padding: 24px 0 60px; }
  .checkout-section { padding: 16px; }
}
</style>
