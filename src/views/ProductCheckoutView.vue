<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import defaultImage from '@/assets/default/nothing.png'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

const auth = useAuthStore()

const currentStep = ref(1) // 1: Details, 2: Payment, 3: Confirmation
const createdOrder = ref<any>(null)

const checkoutItems = ref<any[]>([])
const deliveryInfo = ref({
  name: '', phone: '', email: '', address: '', city: '', province: '', postalCode: '',
  notes: '', deliveryDate: '', deliveryTime: '',
})
const submitting = ref(false)
const errorMsg = ref('')
const serviceFeePercent = ref(5) // default 5%, akan di-fetch dari DB
const DELIVERY_FEE = ref(25000) // default, akan di-fetch dari DB

// Payment states
const selectedPaymentMethod = ref<string>('Bank Transfer')
const selectedBank = ref('')
const paymentSubmitting = ref(false)

const vaData = ref<{ order_id: string; va_number: string; bank: string; amount: number; expiry_time: string } | null>(null)
const vaLoading = ref(false)
const vaError = ref('')

const qrisData = ref<{ order_id: string; qr_string: string; amount: number; expiry_time: string } | null>(null)
const qrisLoading = ref(false)
const qrisError = ref('')

const snapData = ref<{ order_id: string; token: string; redirect_url: string } | null>(null)
const paymentStatus = ref<'idle' | 'polling' | 'paid' | 'expired' | 'failed'>('idle')
const countdown = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const bankOptions = [
  { id: 'bca', name: 'BCA', icon: '🏦' },
  { id: 'mandiri', name: 'Mandiri', icon: '🏦' },
  { id: 'bni', name: 'BNI', icon: '🏦' },
  { id: 'bri', name: 'BRI', icon: '🏦' },
  { id: 'permata', name: 'Permata', icon: '🏦' },
  { id: 'cimb', name: 'CIMB Niaga', icon: '🏦' },
  { id: 'danamon', name: 'Danamon', icon: '🏦' },
  { id: 'maybank', name: 'Maybank', icon: '🏦' },
]

onMounted(async () => {
  if (auth.isLoggedIn && auth.user) {
    deliveryInfo.value.name = auth.user.full_name || ''
    deliveryInfo.value.phone = auth.user.phone || ''
    deliveryInfo.value.email = auth.user.email || ''
  }
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

onUnmounted(() => {
  stopCountdown()
  stopPolling()
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
  return 'Rp ' + (val || 0).toLocaleString('id-ID')
}

function formatExtras(extras: any[]) {
  return (extras || []).map((e: any) => e.name).join(', ')
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  Toast.fire({ icon: 'success', title: 'Copied to clipboard' })
}

function startCountdown(expiryTimeStr: string) {
  stopCountdown()
  if (!expiryTimeStr) return
  const expiryTime = new Date(expiryTimeStr.replace(' ', 'T')).getTime()

  function update() {
    const now = Date.now()
    const diff = expiryTime - now
    if (diff <= 0) {
      countdown.value = 'Expired'
      stopCountdown()
      return
    }
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    countdown.value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  update()
  countdownTimer = setInterval(update, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startPolling(orderId: string) {
  stopPolling()
  paymentStatus.value = 'polling'

  pollTimer = setInterval(async () => {
    try {
      const res = await auth.authFetch(`/api/payments/midtrans/status/${orderId}`)
      if (res.ok) {
        const json = await res.json()
        if (json.data.is_paid) {
          paymentStatus.value = 'paid'
          stopPolling()
          stopCountdown()
          if (createdOrder.value) {
            createdOrder.value.payment_status = 'paid'
            createdOrder.value.status = 'confirmed'
          }
          currentStep.value = 3
        } else if (json.data.transaction_status === 'expire') {
          paymentStatus.value = 'expired'
          stopPolling()
          stopCountdown()
        } else if (json.data.transaction_status === 'cancel') {
          paymentStatus.value = 'failed'
          stopPolling()
          stopCountdown()
        }
      }
    } catch { /* keep polling */ }
  }, 5000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function submitOrder() {
  if (!deliveryInfo.value.name || !deliveryInfo.value.phone || !deliveryInfo.value.address || (!auth.isLoggedIn && !deliveryInfo.value.email)) {
    errorMsg.value = 'Please fill in recipient name, phone, address, and email'
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
        guest_info: !auth.isLoggedIn ? {
          email: deliveryInfo.value.email,
          name: deliveryInfo.value.name,
          phone: deliveryInfo.value.phone,
        } : undefined,
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
    createdOrder.value = json.data
    localStorage.removeItem('sigyn_cart_checkout')
    localStorage.removeItem('sigyn_checkout_config')

    // Proceed to Step 2: Payment
    currentStep.value = 2
  } catch (err: any) {
    errorMsg.value = err.message
    Toast.fire({ icon: 'error', title: 'Error: ' + err.message })
  } finally {
    submitting.value = false
  }
}

async function handleSelectBank(bankId: string) {
  if (!createdOrder.value || vaLoading.value) return
  selectedBank.value = bankId
  vaData.value = null
  qrisData.value = null
  snapData.value = null
  paymentStatus.value = 'idle'
  vaError.value = ''
  stopPolling()
  vaLoading.value = true

  try {
    const res = await auth.authFetch('/api/payments/midtrans/va', {
      method: 'POST',
      body: JSON.stringify({
        id_order: createdOrder.value.id_order,
        bank: bankId,
      }),
    })

    if (res.ok) {
      const json = await res.json()
      vaData.value = json.data
      startCountdown(json.data.expiry_time)
      startPolling(json.data.order_id)
    } else {
      const err = await res.json()
      Toast.fire({ icon: 'error', title: 'Failed to generate VA: ' + (err.error?.message || res.statusText) })
      vaError.value = err.error?.message || res.statusText
      selectedBank.value = ''
    }
  } catch {
    Toast.fire({ icon: 'error', title: 'Error generating Virtual Account.' })
    vaError.value = 'Network error or Midtrans API timeout'
    selectedBank.value = ''
  } finally {
    vaLoading.value = false
  }
}

async function handleSelectQRIS() {
  if (!createdOrder.value || qrisLoading.value) return
  qrisData.value = null
  vaData.value = null
  snapData.value = null
  paymentStatus.value = 'idle'
  qrisError.value = ''
  stopPolling()
  qrisLoading.value = true

  try {
    const res = await auth.authFetch('/api/payments/midtrans/qris', {
      method: 'POST',
      body: JSON.stringify({
        id_order: createdOrder.value.id_order,
      }),
    })

    if (res.ok) {
      const json = await res.json()
      qrisData.value = json.data
      startCountdown(json.data.expiry_time)
      startPolling(json.data.order_id)
    } else {
      const err = await res.json()
      Toast.fire({ icon: 'error', title: 'Failed to generate QRIS: ' + (err.error?.message || res.statusText) })
      qrisError.value = err.error?.message || res.statusText
    }
  } catch {
    Toast.fire({ icon: 'error', title: 'Error generating QRIS.' })
    qrisError.value = 'Network error or Midtrans API timeout'
  } finally {
    qrisLoading.value = false
  }
}

function getQrisImageUrl(orderId: string): string {
  return `/api/payments/midtrans/qris-image/${orderId}`
}

async function handlePayCreditCard() {
  if (!createdOrder.value) return
  paymentSubmitting.value = true

  try {
    const res = await auth.authFetch('/api/payments/midtrans/snap-token', {
      method: 'POST',
      body: JSON.stringify({
        id_order: createdOrder.value.id_order,
      }),
    })

    if (res.ok) {
      const json = await res.json()
      snapData.value = json.data

      if (json.data.token) {
        const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || ''
        const script = document.createElement('script')
        script.src = midtransClientKey.includes('SB-Mid')
          ? 'https://app.sandbox.midtrans.com/snap/snap.js'
          : 'https://app.midtrans.com/snap/snap.js'
        script.setAttribute('data-client-key', midtransClientKey)
        script.onload = () => {
          const w = window as any
          if (w.snap) {
            w.snap.pay(json.data.token, {
              onSuccess: (result: any) => {
                console.log('[Snap] success:', result)
                paymentStatus.value = 'paid'
                stopPolling()
                if (createdOrder.value) {
                  createdOrder.value.payment_status = 'paid'
                  createdOrder.value.status = 'confirmed'
                }
                currentStep.value = 3
              },
              onPending: (result: any) => {
                console.log('[Snap] pending:', result)
                paymentStatus.value = 'polling'
                startPolling(json.data.order_id)
              },
              onError: (result: any) => {
                console.error('[Snap] error:', result)
                paymentStatus.value = 'failed'
                Toast.fire({ icon: 'error', title: 'Payment failed: ' + (result.message || 'Unknown error') })
              },
              onClose: () => {
                console.log('[Snap] popup closed')
              },
            })
          }
          document.head.removeChild(script)
        }
        document.head.appendChild(script)
      }
    } else {
      const err = await res.json()
      Toast.fire({ icon: 'error', title: 'Payment initialization failed: ' + (err.error?.message || res.statusText) })
    }
  } catch {
    Toast.fire({ icon: 'error', title: 'Error initializing credit card payment.' })
  } finally {
    paymentSubmitting.value = false
  }
}

async function handleSimulatePayment(orderId: string) {
  try {
    const res = await auth.authFetch(`/api/payments/midtrans/simulate/${orderId}`, { method: 'POST' })
    const result = await res.json()
    if (result.error) throw new Error(result.error.message)
    Toast.fire({ icon: 'success', title: 'Payment confirmed!' })
    if (createdOrder.value) {
      createdOrder.value.payment_status = 'paid'
      createdOrder.value.status = 'confirmed'
    }
    stopCountdown()
    stopPolling()
    paymentStatus.value = 'paid'
    setTimeout(() => { currentStep.value = 3 }, 1500)
  } catch (err) {
    console.error('[Simulate] Failed:', err)
    Toast.fire({ icon: 'error', title: 'Failed to simulate payment: ' + (err instanceof Error ? err.message : String(err)) })
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
        <!-- Progress Steps -->
        <div class="checkout-progress-bar">
          <div class="step-item" :class="{ active: currentStep >= 1, current: currentStep === 1 }">
            <span class="step-num">1</span>
            <span class="step-label">Details</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep >= 2 }"></div>
          <div class="step-item" :class="{ active: currentStep >= 2, current: currentStep === 2 }">
            <span class="step-num">2</span>
            <span class="step-label">Payment</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep >= 3 }"></div>
          <div class="step-item" :class="{ active: currentStep >= 3, current: currentStep === 3 }">
            <span class="step-num">3</span>
            <span class="step-label">Confirmation</span>
          </div>
        </div>

        <div class="checkout-header-area">
          <h1 class="checkout-title" v-if="currentStep === 1">Product Checkout</h1>
          <h1 class="checkout-title" v-else-if="currentStep === 2">Complete Payment</h1>
          <h1 class="checkout-title" v-else>Order Confirmed</h1>
          <p class="checkout-subtitle" v-if="currentStep === 1">Review your items and complete your delivery details</p>
          <p class="checkout-subtitle" v-else-if="currentStep === 2">Choose your payment method to complete order #{{ createdOrder?.order_number || createdOrder?.id_order }}</p>
        </div>

        <!-- STEP 1: Details Form & Summary -->
        <div v-if="currentStep === 1" class="checkout-layout">
          <!-- Column 1: Recipient & Delivery Information (Order Form) -->
          <div class="checkout-main">
            <div class="checkout-card">
              <div class="card-header-clean">
                <div class="step-badge">1</div>
                <div>
                  <h3 class="card-title">Recipient &amp; Delivery Information</h3>
                  <p class="card-subtitle">Enter the shipping address and contact details for this order</p>
                </div>
              </div>

              <div class="card-body-clean">
                <div class="form-row">
                  <div class="form-group">
                    <label>Recipient Name <span class="required">*</span></label>
                    <input v-model="deliveryInfo.name" type="text" class="form-control-custom" placeholder="e.g. Jane Doe" />
                  </div>
                  <div class="form-group">
                    <label>Recipient Phone <span class="required">*</span></label>
                    <input v-model="deliveryInfo.phone" type="tel" class="form-control-custom" placeholder="e.g. 08123456789" />
                  </div>
                </div>

                <div v-if="!auth.isLoggedIn" class="form-group">
                  <label>Email Address <span class="required">*</span></label>
                  <input v-model="deliveryInfo.email" type="email" class="form-control-custom" placeholder="e.g. jane@example.com (used for order confirmation)" />
                  <span class="field-hint">Your customer account will be automatically created to track this order.</span>
                </div>

                <div class="form-group">
                  <label>Delivery Address <span class="required">*</span></label>
                  <textarea v-model="deliveryInfo.address" class="form-control-custom" rows="3" placeholder="Street address, building name, floor, or unit number"></textarea>
                </div>

                <div class="form-row three-col">
                  <div class="form-group">
                    <label>City</label>
                    <input v-model="deliveryInfo.city" type="text" class="form-control-custom" placeholder="City" />
                  </div>
                  <div class="form-group">
                    <label>Province</label>
                    <input v-model="deliveryInfo.province" type="text" class="form-control-custom" placeholder="Province" />
                  </div>
                  <div class="form-group">
                    <label>Postal Code</label>
                    <input v-model="deliveryInfo.postalCode" type="text" class="form-control-custom" placeholder="Postal code" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Preferred Delivery Date</label>
                    <input v-model="deliveryInfo.deliveryDate" type="date" class="form-control-custom" />
                  </div>
                  <div class="form-group">
                    <label>Preferred Delivery Time</label>
                    <input v-model="deliveryInfo.deliveryTime" type="time" class="form-control-custom" />
                  </div>
                </div>

                <div class="form-group mb-0">
                  <label>Delivery Notes / Special Instructions</label>
                  <textarea v-model="deliveryInfo.notes" class="form-control-custom" rows="2" placeholder="e.g. Leave with receptionist, please handle with care"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Order Summary Card -->
          <div class="checkout-sidebar">
            <div class="checkout-card summary-card">
              <div class="card-header-clean">
                <div class="d-flex justify-content-between align-items-center w-100">
                  <div>
                    <h3 class="card-title">Order Summary</h3>
                    <p class="card-subtitle">{{ totalItems.length }} item{{ totalItems.length > 1 ? 's' : '' }} in order</p>
                  </div>
                  <span class="item-count-tag">{{ totalItems.length }} item{{ totalItems.length > 1 ? 's' : '' }}</span>
                </div>
              </div>

              <div class="order-items-wrap">
                <div v-for="(item, idx) in totalItems" :key="idx" class="order-item-card">
                  <img class="item-thumb" :src="item.thumbnail || defaultImage" :alt="item.productName" />
                  <div class="item-details">
                    <div class="item-title">{{ item.productName || item.product?.name || 'Product' }}</div>
                    <div class="item-vendor-name">{{ item.vendorName }}</div>
                    <div v-if="item.size_name" class="item-spec"><span class="spec-label">Size:</span> {{ item.size_name }}</div>
                    <div v-if="item.variant_name" class="item-spec"><span class="spec-label">Variant:</span> {{ item.variant_name }}</div>
                    <div v-if="item.options?.length">
                      <div v-for="o in item.options" :key="o.groupName" class="item-spec">
                        <span class="spec-label">{{ o.groupName }}:</span> {{ o.valueName }}
                        <span v-if="o.priceAdjust > 0"> (+{{ formatPrice(o.priceAdjust) }})</span>
                      </div>
                    </div>
                    <div v-if="item.extras?.length" class="item-spec"><span class="spec-label">Extras:</span> {{ formatExtras(item.extras) }}</div>
                    <div v-if="item.greeting_card" class="item-spec"><span class="spec-label">Card:</span> {{ item.greeting_card }}</div>
                    <div v-if="item.greeting_message" class="item-greeting-quote">"{{ item.greeting_message }}"</div>
                    
                    <div class="item-footer-row">
                      <span class="item-qty-badge">Qty: {{ item.quantity }}</span>
                      <span class="item-subtotal-val">{{ formatPrice((item.subtotal) || item.unitPrice * item.quantity) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="price-breakdown">
                <div class="breakdown-row">
                  <span>Subtotal</span>
                  <span>{{ formatPrice(subtotal) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Delivery Fee</span>
                  <span>{{ formatPrice(DELIVERY_FEE) }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Service Fee ({{ serviceFeePercent }}%)</span>
                  <span>{{ formatPrice(serviceFee) }}</span>
                </div>
                <div class="breakdown-divider"></div>
                <div class="breakdown-row grand-row">
                  <span>Grand Total</span>
                  <strong class="grand-total-amount">{{ formatPrice(grandTotal) }}</strong>
                </div>
              </div>

              <div v-if="errorMsg" class="checkout-alert-box">
                <i class="fa fa-exclamation-triangle"></i>
                <span>{{ errorMsg }}</span>
              </div>

              <button class="btn-submit-order" @click="submitOrder" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ submitting ? 'Processing Order...' : `Proceed to Payment · ${formatPrice(grandTotal)}` }}
              </button>

              <div class="trust-badge-row">
                <i class="fa fa-lock"></i>
                <span>Secure guest &amp; account checkout</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Payment Selection & Execution -->
        <div v-else-if="currentStep === 2 && createdOrder" class="checkout-layout">
          <!-- Column 1: Payment Method Tabs & Details -->
          <div class="checkout-main">
            <div class="checkout-card">
              <div class="card-header-clean">
                <div class="step-badge">2</div>
                <div>
                  <h3 class="card-title">Select Payment Method</h3>
                  <p class="card-subtitle">Choose how you would like to pay for order #{{ createdOrder.order_number || createdOrder.id_order }}</p>
                </div>
              </div>

              <!-- Payment Method Tabs -->
              <div class="payment-tabs-container">
                <button
                  class="payment-tab-btn"
                  :class="{ active: selectedPaymentMethod === 'Bank Transfer' }"
                  @click="selectedPaymentMethod = 'Bank Transfer'"
                >
                  <span class="tab-icon">🏢</span>
                  <span class="tab-text">Bank Transfer (VA)</span>
                </button>
                <button
                  class="payment-tab-btn"
                  :class="{ active: selectedPaymentMethod === 'QRIS' }"
                  @click="selectedPaymentMethod = 'QRIS'; selectedBank = ''; vaData = null"
                >
                  <span class="tab-icon">📱</span>
                  <span class="tab-text">QRIS / E-Wallet</span>
                </button>
                <button
                  class="payment-tab-btn"
                  :class="{ active: selectedPaymentMethod === 'Credit Card' }"
                  @click="selectedPaymentMethod = 'Credit Card'; selectedBank = ''; vaData = null"
                >
                  <span class="tab-icon">💳</span>
                  <span class="tab-text">Credit Card</span>
                </button>
              </div>

              <!-- Bank Transfer (VA) Details -->
              <div v-if="selectedPaymentMethod === 'Bank Transfer'" class="payment-pane">
                <p class="pane-instruction">Select your preferred bank to generate an automated Virtual Account number:</p>

                <div class="bank-grid">
                  <button
                    v-for="bank in bankOptions"
                    :key="bank.id"
                    class="bank-select-btn"
                    :class="{ active: selectedBank === bank.id }"
                    :disabled="vaLoading && selectedBank !== bank.id"
                    @click="handleSelectBank(bank.id)"
                  >
                    <span class="bank-icon">{{ bank.icon }}</span>
                    <span class="bank-name">{{ bank.name }}</span>
                    <span v-if="vaData && selectedBank === bank.id" class="bank-check">✓</span>
                  </button>
                </div>

                <div v-if="vaLoading" class="va-loading-box">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span>Generating Virtual Account from Midtrans...</span>
                </div>

                <div v-if="vaError && !vaLoading && !vaData" class="payment-error-alert">
                  <span>⚠️ {{ vaError }}</span>
                  <button class="btn btn-sm btn-outline-danger ms-auto" @click="handleSelectBank(selectedBank)">Retry</button>
                </div>

                <div v-if="vaData" class="va-result-card">
                  <div class="va-result-header">
                    <span class="bank-pill">{{ vaData.bank.toUpperCase() }} Virtual Account</span>
                    <span class="expiry-pill" v-if="countdown && countdown !== 'Expired'">Expires in: <strong>{{ countdown }}</strong></span>
                  </div>

                  <div class="va-code-box">
                    <span class="va-label">VA Number</span>
                    <div class="va-num-action">
                      <strong class="va-number-text">{{ vaData.va_number }}</strong>
                      <button class="btn-copy-va" @click="copyToClipboard(vaData.va_number)" title="Copy VA Number">
                        <i class="fa fa-clone me-1"></i> Copy
                      </button>
                    </div>
                  </div>

                  <div class="va-amount-box">
                    <span>Total Payment</span>
                    <strong class="va-total-text">{{ formatPrice(vaData.amount) }}</strong>
                  </div>

                  <div v-if="paymentStatus === 'polling'" class="payment-live-status">
                    <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
                    <span>Waiting for transfer confirmation...</span>
                  </div>

                  <div v-if="paymentStatus === 'paid'" class="payment-live-status success">
                    <span>✅ Payment confirmed! Redirecting...</span>
                  </div>

                  <p class="va-instruction-note">Transfer the exact amount to the VA number above. Payment confirmation will be detected automatically.</p>

                  <button v-if="vaData && paymentStatus !== 'paid'" class="btn-dev-simulate" @click="handleSimulatePayment(vaData.order_id)">
                    ⚡ Simulate Payment (Dev Mode)
                  </button>
                </div>
              </div>

              <!-- QRIS Details -->
              <div v-else-if="selectedPaymentMethod === 'QRIS'" class="payment-pane text-center">
                <p class="pane-instruction">Scan the QRIS code with any supported banking app or e-wallet (GoPay, OVO, ShopeePay, Dana, BCA Mobile, etc.):</p>

                <div v-if="qrisLoading" class="va-loading-box justify-content-center">
                  <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                  <span>Generating QRIS Code from Midtrans...</span>
                </div>

                <div v-if="qrisError && !qrisLoading && !qrisData" class="payment-error-alert">
                  <span>⚠️ {{ qrisError }}</span>
                  <button class="btn btn-sm btn-outline-danger ms-auto" @click="handleSelectQRIS">Retry</button>
                </div>

                <div v-if="qrisData" class="qris-display-box">
                  <div class="qris-card-wrapper">
                    <div class="qris-card-header">QRIS GPN · INSTANT PAYMENT</div>
                    <img :src="getQrisImageUrl(qrisData.order_id)" alt="QRIS Code" class="qris-qr-image" />
                    <div class="qris-card-amount">{{ formatPrice(qrisData.amount) }}</div>
                  </div>

                  <div v-if="countdown && countdown !== 'Expired'" class="qris-timer-text">
                    Time Remaining: <strong>{{ countdown }}</strong>
                  </div>

                  <div v-if="paymentStatus === 'polling'" class="payment-live-status justify-content-center mt-2">
                    <div class="spinner-border spinner-border-sm text-secondary me-2"></div>
                    <span>Waiting for QR payment...</span>
                  </div>

                  <div v-if="paymentStatus === 'paid'" class="payment-live-status success justify-content-center mt-2">
                    <span>✅ Payment confirmed! Redirecting...</span>
                  </div>

                  <button v-if="paymentStatus !== 'paid'" class="btn-dev-simulate mt-3" @click="handleSimulatePayment(qrisData.order_id)">
                    ⚡ Simulate QRIS Payment (Dev Mode)
                  </button>
                </div>

                <button v-if="!qrisData && !qrisLoading && !qrisError" class="btn-generate-qris" @click="handleSelectQRIS">
                  📱 Generate QRIS Code
                </button>
              </div>

              <!-- Credit Card Details -->
              <div v-else-if="selectedPaymentMethod === 'Credit Card'" class="payment-pane">
                <p class="pane-instruction">Pay securely using Visa, MasterCard, JCB, or American Express via Midtrans Secure Gateway:</p>
                <div class="cc-info-box">
                  <i class="fa fa-credit-card fa-2x mb-2 text-muted"></i>
                  <p class="text-muted small">You will be redirected to Midtrans 3D-Secure payment popup with end-to-end encryption.</p>
                  <button class="btn-pay-cc" :disabled="paymentSubmitting" @click="handlePayCreditCard">
                    <span v-if="paymentSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                    {{ paymentSubmitting ? 'Opening Payment Gateway...' : `Pay with Credit Card · ${formatPrice(createdOrder.grand_total || createdOrder.total_price)}` }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Order Payment Summary Sidebar -->
          <div class="checkout-sidebar">
            <div class="checkout-card summary-card">
              <div class="card-header-clean">
                <h3 class="card-title">Payment Summary</h3>
              </div>

              <div class="order-id-highlight">
                <span class="order-id-label">Order Number</span>
                <strong class="order-id-value">#{{ createdOrder.order_number || createdOrder.id_order }}</strong>
              </div>

              <div class="price-breakdown mt-3">
                <div class="breakdown-row">
                  <span>Recipient</span>
                  <span>{{ createdOrder.recipient_name || deliveryInfo.name }}</span>
                </div>
                <div class="breakdown-row">
                  <span>Delivery Address</span>
                  <span class="text-truncate" style="max-width: 200px;">{{ createdOrder.delivery_city || deliveryInfo.city || 'Standard' }}</span>
                </div>
                <div class="breakdown-divider"></div>
                <div class="breakdown-row grand-row">
                  <span>Amount Due</span>
                  <strong class="grand-total-amount text-primary">{{ formatPrice(createdOrder.grand_total || createdOrder.total_price) }}</strong>
                </div>
              </div>

              <div class="trust-badge-row mt-4">
                <i class="fa fa-shield"></i>
                <span>Midtrans 256-bit Encrypted Security</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Confirmation / Success State -->
        <div v-else-if="currentStep === 3 && createdOrder" class="order-success-card">
          <div class="success-icon">&#10003;</div>
          <h2>Order &amp; Payment Confirmed!</h2>
          <p class="order-success-desc">Thank you! Your payment has been received and your product order is now confirmed for fulfillment.</p>
          
          <div class="order-info-pill">
            <div class="info-item">
              <span class="info-label">Order Number</span>
              <strong class="info-value">#{{ createdOrder.order_number || createdOrder.id_order }}</strong>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Status</span>
              <span class="badge bg-success">PAID</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Paid</span>
              <strong class="info-value text-success">{{ formatPrice(createdOrder.grand_total || createdOrder.total_price) }}</strong>
            </div>
          </div>

          <div class="mt-4 d-flex justify-content-center gap-3">
            <router-link to="/" class="btn btn-outline-dark px-4 py-2">Back to Home</router-link>
            <router-link to="/booking-history" class="btn btn-dark px-4 py-2">View Order History</router-link>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
