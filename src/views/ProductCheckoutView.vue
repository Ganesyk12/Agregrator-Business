<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'

const router = useRouter()
const auth = useAuthStore()

const checkoutItems = ref<any[]>([])
const deliveryInfo = ref({
  name: '', phone: '', address: '', city: '', province: '', postalCode: '',
  notes: '', deliveryDate: '', deliveryTime: '',
})
const submitting = ref(false)
const orderResult = ref<any>(null)
const errorMsg = ref('')
const serviceFeePercent = ref(5) // default 5%, akan di-fetch dari DB
const DELIVERY_FEE = ref(25000) // default, akan di-fetch dari DB

onMounted(async () => {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  loadCheckoutItems()
  try {
    const res = await fetch('/api/company-info')
    if (res.ok) {
      const json = await res.json()
      if (typeof json.data?.service_fee_percent === 'number') {
        serviceFeePercent.value = json.data.service_fee_percent
      }
      if (typeof json.data?.delivery_fee === 'number') {
        DELIVERY_FEE.value = json.data.delivery_fee
      }
    }
  } catch { /* gunakan default */ }
})

function loadCheckoutItems() {
  const buyNowCfg = localStorage.getItem('sigyn_checkout_config')
  if (buyNowCfg) {
    try {
      const c = JSON.parse(buyNowCfg)
      checkoutItems.value = [{
        id_product: c.productId,
        id_variant: c.variantId || null,
        addon_ids: (c.addonIds || []).join(','),
        quantity: c.quantity,
        product: null,
        productName: c.productName,
        thumbnail: c.thumbnail,
        vendorName: c.vendorName,
        unit_price: c.unitPrice,
        extras_price: c.extrasPrice,
        subtotal: c.subtotal,
        size_name: c.sizeName,
        variant_name: c.variantName,
        options: c.options || [],
        extras: c.extras || [],
        greeting_card: c.greetingCard,
        greeting_message: c.greetingMessage,
      }]
      fetchProduct(c.productId)
    } catch { /* ignore */ }
    return
  }
  const stored = localStorage.getItem('sigyn_cart_checkout')
  if (stored) {
    checkoutItems.value = JSON.parse(stored)
      .filter((i: any) => i.product)
      .map(loadCartToConfig)
    return
  }

}

function loadCartToConfig(i: any) {
  return {
    id_product: i.id_product || i.product?.id_product,
    id_variant: i.id_variant || null,
    quantity: i.quantity,
    product: i.product,
    productName: i.product?.name,
    thumbnail: i.thumbnail || i.product?.images?.[0]?.image_url || '',
    vendorName: i.vendor_name || i.product?.vendor?.business_name || '',
    unit_price: i.unit_price || i.product?.price,
    extras_price: i.extras_price || 0,
    subtotal: i.subtotal,
    size_name: i.size_name,
    variant_name: i.variant_name,
    options: i.options || [],
    extras: i.extras || [],
    greeting_card: i.greeting_card,
    greeting_message: i.greeting_message,
  }
}

async function fetchProduct(id: number) {
  try {
    const res = await fetch(`/api/products/${id}`)
    if (res.ok) {
      const json = await res.json()
      const p = json.data
      if (checkoutItems.value[0]) {
        checkoutItems.value[0].product = p
        checkoutItems.value[0].thumbnail = checkoutItems.value[0].thumbnail || p?.images?.[0]?.image_url || ''
        checkoutItems.value[0].productName = p?.name
      }
    }
  } catch { /* ignore */ }
}

const totalItems = computed(() => checkoutItems.value.map(loadCartToNormalized))

function loadCartToNormalized(i: any) {
  const unitPrice =
    typeof i.unit_price === 'number' && i.unit_price
      ? i.unit_price
      : i.product?.price || 0
  const extrasRaw = i.extras || []
  const extrasPrice =
    typeof i.extras_price === 'number' ? i.extras_price : extrasRaw.reduce((s: number, e: any) => s + Number(e.price || 0), 0)
  return {
    ...i,
    unitPrice,
    extrasPrice,
    subtotal: typeof i.subtotal === 'number' && i.subtotal ? i.subtotal : unitPrice * i.quantity,
  }
}

const subtotal = computed(() => totalItems.value.reduce((s: number, i: any) => s + (i.subtotal || i.unitPrice * i.quantity), 0))
const serviceFee = computed(() => Math.round(subtotal.value * (serviceFeePercent.value / 100)))
const grandTotal = computed(() => subtotal.value + serviceFee.value + DELIVERY_FEE.value)

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatExtras(extras: any[]) {
  return (extras || []).map((e: any) => e.name).join(', ')
}

async function submitOrder() {
  if (!deliveryInfo.value.name || !deliveryInfo.value.phone || !deliveryInfo.value.address) {
    errorMsg.value = 'Please fill in recipient name, phone, and address'
    return
  }
  submitting.value = true
  errorMsg.value = ''

  const first = checkoutItems.value[0]
  const vendorId = first?.product?.id_vendor
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
          price: i.unit_price || i.product?.price || 0,
          addon_ids: i.addon_ids || '',
          size_name: i.size_name,
          variant_name: i.variant_name,
          options: i.options || null,
          greeting_card: i.greeting_card,
          greeting_message: i.greeting_message,
          extras: i.extras || null,
          unit_price: i.unit_price || i.product?.price || 0,
          extras_price: i.extras_price || 0,
          subtotal: (i.unit_price || i.product?.price || 0) * i.quantity,
        })),
        recipient_name: deliveryInfo.value.name,
        recipient_phone: deliveryInfo.value.phone,
        delivery_address: deliveryInfo.value.address,
        delivery_city: deliveryInfo.value.city,
        delivery_province: deliveryInfo.value.province,
        delivery_postal_code: deliveryInfo.value.postalCode,
        delivery_notes: deliveryInfo.value.notes,
        delivery_date: deliveryInfo.value.deliveryDate ? new Date(deliveryInfo.value.deliveryDate).toISOString() : null,
        delivery_time: deliveryInfo.value.deliveryTime,
        delivery_fee: DELIVERY_FEE.value,
        service_fee: serviceFee.value,
        grand_total: grandTotal.value,
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
    localStorage.removeItem('sigyn_checkout_config')
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
          <p>Order Number: <strong>#{{ orderResult.order_number || orderResult.id_order }}</strong></p>
          <p>Status: <span class="badge bg-warning text-dark">{{ orderResult.status }}</span></p>
          <p>Total: <strong>{{ formatPrice(orderResult.total_price) }}</strong></p>
          <div class="mt-3 d-flex justify-content-center gap-2">
            <router-link to="/" class="btn btn-dark">Home</router-link>
            <router-link to="/booking-history" class="btn btn-outline-dark">Booking History</router-link>
          </div>
        </div>

        <div v-else class="checkout-content">
          <!-- Order Summary -->
          <div class="checkout-section">
            <h3>Order Summary</h3>
            <div class="order-items">
              <div v-for="(item, idx) in totalItems" :key="idx" class="order-item">
                <div class="item-info">
                  <img class="item-thumb" :src="item.thumbnail || 'https://placehold.co/80x80?text=Flower'" :alt="item.productName" />
                  <div>
                    <div class="item-name">{{ item.productName || item.product?.name || 'Product' }}</div>
                    <div class="item-vendor">{{ item.vendorName }}</div>
                    <div v-if="item.size_name" class="item-opt"><span class="opt-label">Size:</span> {{ item.size_name }}</div>
                    <div v-if="item.variant_name" class="item-opt"><span class="opt-label">Variant:</span> {{ item.variant_name }}</div>
                    <div v-if="item.options?.length">
                      <div v-for="o in item.options" :key="o.groupName" class="item-opt">
                        <span class="opt-label">{{ o.groupName }}:</span> {{ o.valueName }}
                        <span v-if="o.priceAdjust > 0"> (+{{ formatPrice(o.priceAdjust) }})</span>
                      </div>
                    </div>
                    <div v-if="item.extras?.length" class="item-opt"><span class="opt-label">Extras:</span> {{ formatExtras(item.extras) }}</div>
                    <div v-if="item.greeting_card" class="item-opt"><span class="opt-label">Greeting Card:</span> {{ item.greeting_card }}</div>
                    <div v-if="item.greeting_message" class="item-opt item-greeting">"{{ item.greeting_message }}"</div>
                    <div class="item-qty">Qty: {{ item.quantity }}</div>
                  </div>
                </div>
                <div class="item-price-col">
                  <div class="item-unit">{{ formatPrice(item.unitPrice || 0) }}</div>
                  <div class="item-sub">{{ formatPrice((item.subtotal) || item.unitPrice * item.quantity) }}</div>
                </div>
              </div>
            </div>
            <div class="order-total">
              <div class="total-row"><span>Subtotal</span><span>{{ formatPrice(subtotal) }}</span></div>
              <div class="total-row"><span>Delivery Fee</span><span>{{ formatPrice(DELIVERY_FEE) }}</span></div>
              <div class="total-row"><span>Service Fee ({{ serviceFeePercent }}%)</span><span>{{ formatPrice(serviceFee) }}</span></div>
              <div class="total-row grand"><span>Grand Total</span><strong>{{ formatPrice(grandTotal) }}</strong></div>
            </div>
          </div>

          <!-- Recipient & Delivery Info -->
          <div class="checkout-section">
            <h3>Recipient &amp; Delivery Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Recipient Name *</label>
                <input v-model="deliveryInfo.name" type="text" class="form-control" placeholder="Recipient name" />
              </div>
              <div class="form-group">
                <label>Recipient Phone *</label>
                <input v-model="deliveryInfo.phone" type="tel" class="form-control" placeholder="Phone number" />
              </div>
            </div>
            <div class="form-group">
              <label>Delivery Address *</label>
              <textarea v-model="deliveryInfo.address" class="form-control" rows="2" placeholder="Street address"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>City</label>
                <input v-model="deliveryInfo.city" type="text" class="form-control" placeholder="City" />
              </div>
              <div class="form-group">
                <label>Province</label>
                <input v-model="deliveryInfo.province" type="text" class="form-control" placeholder="Province" />
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input v-model="deliveryInfo.postalCode" type="text" class="form-control" placeholder="Postal code" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Preferred Delivery Date</label>
                <input v-model="deliveryInfo.deliveryDate" type="date" class="form-control" />
              </div>
              <div class="form-group">
                <label>Preferred Delivery Time</label>
                <input v-model="deliveryInfo.deliveryTime" type="time" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Delivery Notes</label>
              <textarea v-model="deliveryInfo.notes" class="form-control" rows="2" placeholder="Special instructions (e.g. leave at gate)"></textarea>
            </div>
          </div>

          <p v-if="errorMsg" class="text-danger">{{ errorMsg }}</p>

          <button class="btn btn-primary btn-lg w-100" @click="submitOrder" :disabled="submitting">
            {{ submitting ? 'Processing...' : `Place Order · ${formatPrice(grandTotal)}` }}
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.checkout-page { background: #f8f8f8; min-height: 100vh; }
.checkout-wrapper { padding: 112px 0 80px; }
.checkout-title { font-family: 'Marcellus', serif; font-size: 2rem; margin-bottom: 32px; }

.checkout-content { max-width: 720px; margin: 0 auto; }
.checkout-section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
.checkout-section h3 { font-size: 1.1rem; font-weight: 600; margin: 0 0 16px; }

.order-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.item-info { display: flex; gap: 12px; align-items: flex-start; }
.item-thumb { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.item-name { font-weight: 600; }
.item-vendor { font-size: 0.8rem; color: #B89C7B; margin-bottom: 4px; }
.item-opt { font-size: 0.78rem; color: #666; }
.opt-label { font-weight: 600; color: #444; }
.item-greeting { font-style: italic; color: #888; }
.item-qty { font-size: 0.82rem; color: #888; margin-top: 4px; }
.item-price-col { text-align: right; }
.item-unit { font-size: 0.82rem; color: #888; }
.item-sub { font-weight: 600; }

.order-total { padding-top: 12px; }
.total-row { display: flex; justify-content: space-between; padding: 4px 0; color: #555; }
.total-row.grand { border-top: 1px solid #e5e5e5; margin-top: 6px; padding-top: 12px; font-size: 1.1rem; color: #222; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px; color: #333; }
.form-control { width: 100%; padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: 0.9rem; transition: border-color 0.2s; }
.form-control:focus { outline: none; border-color: var(--bs-secondary, #B89C7B); }

.order-success { text-align: center; padding: 60px 20px; max-width: 500px; margin: 0 auto; }
.success-icon { width: 72px; height: 72px; border-radius: 50%; background: #2ecc71; color: #fff; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
.order-success h2 { font-family: 'Marcellus', serif; margin-bottom: 16px; }
.order-success p { color: #666; margin-bottom: 8px; }

@media (max-width: 576px) {
  .checkout-wrapper { padding: 96px 0 60px; }
  .checkout-section { padding: 16px; }
  .form-row { grid-template-columns: 1fr; gap: 0; }
}
</style>