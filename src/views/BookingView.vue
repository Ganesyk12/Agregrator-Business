<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import AddServiceModal from '@/components/booking/AddServiceModal.vue'

const auth = useAuthStore()

interface BookedVendor {
  id_vendor: number
  id_package?: number
  id_product?: number
  package_name?: string
  business_name: string
  category: string
  starting_price: number
  description: string
  cover_url: string
  rating: number
  selectedExtras: ExtraItem[]
  expanded: boolean
  quantity?: number
  rawConfig?: any
}

interface ExtraItem {
  id: string
  name: string
  price: number
  icon: string
  selected: boolean
}

interface PackageItem {
  id_package: number
  name: string
  price: number
  duration: string | null
  description: string | null
  whats_included: string | null
  vendor: {
    id_vendor: number
    business_name: string
    category: string
    location: string | null
    description: string | null
    status: string
    years_exp: number
    _count: { portfolios: number; reviews: number }
  }
  category: { category_name: string }
}

const eventTypes = ['Wedding', 'Pre Wedding', 'Graduation', 'Birthday', 'Family', 'Corporate', 'Engagement', 'Product Photoshoot', 'Others']

const customer = ref({ fullName: '', phone: '', email: '' })
const errors = ref({
  fullName: '',
  phone: '',
  email: '',
  eventType: '',
  eventDate: '',
})
const event = ref({ type: '', name: '', date: '', startTime: '', endTime: '' })
const location = ref({ venue: '', address: '', city: '', type: '' })
const specialRequests = ref('')
const agreeTerms = ref(false)
const showAddModal = ref(false)
const editingProduct = ref<any>(null)

const currentStep = ref(1)
const createdBooking = ref<any>(null)
const selectedTermId = ref<number | null>(null)
const selectedPaymentMethod = ref<string>('Bank Transfer')

const currentPaymentAmount = computed(() => {
  if (!createdBooking.value) return 0
  if (selectedTermId.value) {
    const term = createdBooking.value.payment_terms?.find((t: any) => t.id_term === selectedTermId.value)
    return term ? term.amount : createdBooking.value.total_price
  }
  return createdBooking.value.total_price
})

function getTermNameById(id: number) {
  if (!createdBooking.value) return ''
  const term = createdBooking.value.payment_terms?.find((t: any) => t.id_term === id)
  return term ? term.term_name : ''
}

function formatDateString(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

const bookedVendors = ref<BookedVendor[]>([])
const vendorExtrasCache = ref<Record<number, ExtraItem[]>>({})

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

const categoryToEventType: Record<string, string> = {
  Photography: 'Wedding',
  Videography: 'Wedding',
  'Wedding Organizer': 'Wedding',
  'Pre-wedding': 'Pre Wedding',
  Makeup: 'Wedding',
  Catering: 'Wedding',
  Decoration: 'Wedding',
  'Photo Booth': 'Birthday',
  MC: 'Corporate',
  Entertainment: 'Corporate',
  Florist: 'Wedding',
  Booking: 'Wedding',
}

onMounted(async () => {
  if (auth.user) {
    customer.value.fullName = auth.user.full_name || ''
    customer.value.email = auth.user.email || ''
    customer.value.phone = auth.user.phone || ''
  }
  const stored = localStorage.getItem('sigyn_booking_config')
  const config = stored ? JSON.parse(stored) : null
  if (config) localStorage.removeItem('sigyn_booking_config')

  const vid = config?.vendorId ? String(config.vendorId) : null
  const name = config?.businessName as string
  const price = config?.startingPrice ? String(config.startingPrice) : null
  const pkgId = config?.packageId ? String(config.packageId) : null
  const pkgName = config?.packageName as string
  const pkgPrice = config?.packagePrice ? String(config.packagePrice) : null

  if (vid) {
    try {
      const res = await fetch(`/api/portfolios/vendor/${vid}/info`)
      const json = await res.json()
      if (res.ok && json.data) {
        const vendorData = json.data
        const vendorCat = vendorData.vendor?.category
        if (vendorCat && !event.value.type) {
          event.value.type = categoryToEventType[vendorCat] || ''
        }
        const vendorLoc = vendorData.vendor?.location
        if (vendorLoc && !location.value.venue) {
          location.value.venue = vendorData.vendor.business_name || ''
          location.value.address = vendorLoc
        }
        if (pkgId) {
          const pkg = vendorData.packages?.find((p: any) => String(p.id_package) === pkgId)
          if (pkg) {
            addPackageToBooking(pkg)
          } else {
            bookedVendors.value.push({
              id_vendor: vendorData.vendor.id_vendor,
              id_package: Number(pkgId),
              package_name: pkgName || 'Package',
              business_name: vendorData.vendor.business_name,
              category: vendorData.vendor.category,
              starting_price: Number(pkgPrice) || 0,
              description: vendorData.vendor.description || '',
              cover_url: '',
              rating: vendorData.vendor.average_rating || 0,
              selectedExtras: [],
              expanded: false,
            })
          }
        } else {
          const minPrice = vendorData.packages?.length > 0
            ? Math.min(...vendorData.packages.map((p: any) => p.price))
            : Number(price) || 0
          bookedVendors.value.push({
            id_vendor: vendorData.vendor.id_vendor,
            business_name: vendorData.vendor.business_name,
            category: vendorData.vendor.category,
            starting_price: minPrice,
            description: vendorData.vendor.description || '',
            cover_url: '',
            rating: vendorData.vendor.average_rating || 0,
            selectedExtras: [],
            expanded: false,
          })
        }
        if (vendorData.vendor.extras?.length) {
          vendorExtrasCache.value[vendorData.vendor.id_vendor] = vendorData.vendor.extras.map((e: any) => ({
            id: String(e.id_extra || e.id),
            name: e.name,
            price: e.price,
            icon: e.icon || '',
            selected: false,
          }))
        }
      }
    } catch {
      if (!event.value.type) {
        event.value.type = categoryToEventType['Photography'] || ''
      }
      if (pkgId) {
        bookedVendors.value.push({
          id_vendor: Number(vid),
          id_package: Number(pkgId),
          package_name: pkgName || 'Package',
          business_name: name || pkgName || 'Vendor',
          category: 'Photography',
          starting_price: Number(pkgPrice) || 0,
          description: '',
          cover_url: '',
          rating: 0,
          selectedExtras: [],
          expanded: false,
        })
      } else if (name) {
        bookedVendors.value.push({
          id_vendor: Number(vid),
          business_name: name,
          category: 'Photography',
          starting_price: Number(price) || 0,
          description: '',
          cover_url: '',
          rating: 0,
          selectedExtras: [],
          expanded: false,
        })
      }
    }
  }

  // load cart items if coming from cart
  const cartData = localStorage.getItem('sigyn_cart_checkout')
  if (cartData) {
    localStorage.removeItem('sigyn_cart_checkout')
    try {
      const items = JSON.parse(cartData)
      for (const item of items) {
        const pkg = item.package
        if (!pkg || bookedVendors.value.some(v => v.id_package === pkg.id_package)) continue
        bookedVendors.value.push({
          id_vendor: pkg.vendor?.id_vendor || 0,
          id_package: pkg.id_package,
          package_name: pkg.name,
          business_name: pkg.vendor?.business_name || 'Vendor',
          category: 'Services',
          starting_price: pkg.price || 0,
          description: pkg.description || '',
          cover_url: '',
          rating: 0,
          selectedExtras: [],
          expanded: false,
        })
      }
    } catch (_) { /* fallback */ }
  }
})

function addPackageToBooking(p: PackageItem & { quantity?: number }) {
  const isProduct = 'id_product' in p && (p as any).id_product
  const matchId = isProduct ? (p as any).id_product : p.id_package
  
  if (bookedVendors.value.some((b) => isProduct ? b.id_product === matchId : b.id_package === matchId)) return
  
  const extras = ((p as any).extras || []).map((e: any) => ({
    id: String(e.id_extra || e.id),
    name: e.name,
    price: e.price,
    icon: e.icon || '',
    selected: 'selected' in e ? !!e.selected : false,
  }))
  bookedVendors.value.push({
    id_vendor: p.vendor.id_vendor,
    id_package: isProduct ? undefined : p.id_package,
    id_product: isProduct ? (p as any).id_product : undefined,
    package_name: p.name,
    business_name: p.vendor.business_name,
    category: p.category.category_name,
    starting_price: p.price,
    description: p.vendor.description || p.description || '',
    cover_url: '',
    rating: 0,
    selectedExtras: extras.filter((e: any) => e.selected),
    expanded: false,
    quantity: p.quantity || 1,
    rawConfig: (p as any).rawConfig
  })
  if (extras.length > 0) {
    vendorExtrasCache.value[p.vendor.id_vendor] = extras
  }
}

function toggleVendorExpand(id: number, idPackage?: number, idProduct?: number) {
  const v = bookedVendors.value.find((b) => {
    if (idPackage) return b.id_package === idPackage
    if (idProduct) return b.id_product === idProduct
    return b.id_vendor === id
  })
  if (v) v.expanded = !v.expanded
}

function toggleExtra(vendorId: number, extraId: string) {
  const extras = vendorExtrasCache.value[vendorId]
  if (!extras) return
  const ex = extras.find((e) => e.id === extraId)
  if (ex) ex.selected = !ex.selected
}

function removeVendor(id: number, idPackage?: number, idProduct?: number) {
  if (idPackage) {
    const idx = bookedVendors.value.findIndex((b) => b.id_package === idPackage)
    if (idx !== -1) bookedVendors.value.splice(idx, 1)
  } else if (idProduct) {
    const idx = bookedVendors.value.findIndex((b) => b.id_product === idProduct)
    if (idx !== -1) bookedVendors.value.splice(idx, 1)
  } else {
    bookedVendors.value = bookedVendors.value.filter((b) => b.id_vendor !== id)
  }
  const stillHasVendor = bookedVendors.value.some((b) => b.id_vendor === id)
  if (!stillHasVendor) delete vendorExtrasCache.value[id]
}

function viewPortfolio(id: number) {
  window.open(`/portfolio/${id}`, '_blank')
}

function openAddModal() {
  showAddModal.value = true
}

function handleAddPackage(p: any) {
  addPackageToBooking(p as PackageItem)
  showAddModal.value = false
}

function openEditModal(vendor: BookedVendor) {
  if (!vendor.rawConfig) {
    vendor.rawConfig = {
      id_product: vendor.id_product,
      quantity: vendor.quantity || 1,
      sizeName: null,
      selectedOptions: {},
      selectedExtrasNames: [],
      selectedVariantId: null,
      selectedAddonIds: []
    }
  }
  editingProduct.value = vendor.rawConfig
  showAddModal.value = true
}

function handleCloseModal() {
  showAddModal.value = false
  editingProduct.value = null
}

function handleEditPackage(p: any) {
  const idx = bookedVendors.value.findIndex(v => v.id_product === p.id_product)
  if (idx !== -1) {
    bookedVendors.value[idx] = {
      ...bookedVendors.value[idx],
      package_name: p.name,
      starting_price: p.price,
      quantity: p.quantity,
      selectedExtras: p.extras || [],
      rawConfig: p.rawConfig
    }
    
    if (p.extras && p.extras.length > 0) {
      vendorExtrasCache.value[p.vendor.id_vendor] = p.extras.map((e: any) => ({
        id: String(e.id),
        name: e.name,
        price: e.price,
        icon: e.icon || '',
        selected: true
      }))
    } else {
      delete vendorExtrasCache.value[p.vendor.id_vendor]
    }
  }
  showAddModal.value = false
  editingProduct.value = null
}

const subtotal = computed(() => {
  return bookedVendors.value.reduce((sum, v) => {
    const extras = vendorExtrasCache.value[v.id_vendor] || []
    const extrasTotal = extras.filter((e) => e.selected).reduce((s, e) => s + e.price, 0)
    return sum + (v.starting_price * (v.quantity || 1)) + extrasTotal
  }, 0)
})

const serviceFee = computed(() => Math.round(subtotal.value * 0.05))
const grandTotal = computed(() => subtotal.value + serviceFee.value)

const totalExtrasCount = computed(() => {
  return Object.values(vendorExtrasCache.value).reduce((sum, arr) => sum + arr.filter((e) => e.selected).length, 0)
})

async function handleProceedToPayment() {
  if (bookedVendors.value.length === 0) {
    Toast.fire({ icon: 'warning', title: 'No packages selected.' })
    return
  }

  errors.value = {
    fullName: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
  }

  let hasError = false

  if (!customer.value.fullName || !customer.value.fullName.trim()) {
    errors.value.fullName = 'Full Name is required.'
    hasError = true
  }
  if (!customer.value.phone || !customer.value.phone.trim()) {
    errors.value.phone = 'Phone Number is required.'
    hasError = true
  }
  if (!customer.value.email || !customer.value.email.trim()) {
    errors.value.email = 'Email Address is required.'
    hasError = true
  }
  if (!event.value.type) {
    errors.value.eventType = 'Event Type is required.'
    hasError = true
  }
  if (!event.value.date) {
    errors.value.eventDate = 'Event Date is required.'
    hasError = true
  }

  if (hasError) {
    setTimeout(() => {
      const el = document.querySelector('.error-message')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    return
  }

  try {
    paymentSubmitting.value = true
    
    const packageIds = bookedVendors.value
      .map(v => v.id_package)
      .filter((id): id is number => id !== undefined)

    const productsPayload = bookedVendors.value
      .filter(v => v.id_product !== undefined)
      .map(v => {
        const optionsList = v.rawConfig?.selectedOptions
          ? Object.entries(v.rawConfig.selectedOptions).map(([g, val]) => ({
              groupName: g,
              valueName: val
            }))
          : []
        const extrasList = v.selectedExtras.map(e => ({
          id: Number(e.id),
          name: e.name,
          price: e.price
        }))

        return {
          id_product: v.id_product!,
          quantity: v.quantity || 1,
          price: v.starting_price,
          size_name: v.rawConfig?.sizeName || null,
          options: optionsList,
          extras: extrasList
        }
      })
      
    const payload = {
      id_user: auth.user?.id_user,
      guest_info: !auth.isLoggedIn ? {
        email: customer.value.email,
        fullName: customer.value.fullName,
        phone: customer.value.phone
      } : undefined,
      package_ids: packageIds,
      products: productsPayload,
      event_date: new Date(event.value.date).toISOString(),
      event_location: `${location.value.venue || ''}, ${location.value.address || ''}, ${location.value.city || ''}`,
      total_price: grandTotal.value,
      dp_amount: 0, // No Down Payment (Pay in Full)
      notes: specialRequests.value || null
    }

    const res = await auth.authFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      Toast.fire({ icon: 'error', title: 'Failed to save booking: ' + (err.error?.message || res.statusText) })
      return
    }

    const json = await res.json()
    createdBooking.value = json.data
    
    if (createdBooking.value.payment_terms?.length > 0) {
      selectedTermId.value = createdBooking.value.payment_terms[0].id_term
    }
    
    currentStep.value = 2
  } catch (error) {
    console.error(error)
    Toast.fire({ icon: 'error', title: 'Error processing payment request.' })
  } finally {
    paymentSubmitting.value = false
  }
}

const paymentSubmitting = ref(false)
const selectedBank = ref('')
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

async function handleSelectBank(bankId: string) {
  if (!createdBooking.value || vaLoading.value) return
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
        id_booking: createdBooking.value.id_booking,
        id_term: selectedTermId.value || undefined,
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
      Toast.fire({ icon: 'error', title: 'Gagal generate Virtual Account: ' + (err.error?.message || res.statusText) })
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
  if (!createdBooking.value || qrisLoading.value) return
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
        id_booking: createdBooking.value.id_booking,
        id_term: selectedTermId.value || undefined,
      }),
    })

    if (res.ok) {
      const json = await res.json()
      qrisData.value = json.data
      startCountdown(json.data.expiry_time)
      startPolling(json.data.order_id)
    } else {
      const err = await res.json()
      Toast.fire({ icon: 'error', title: 'Gagal generate QRIS: ' + (err.error?.message || res.statusText) })
      qrisError.value = err.error?.message || res.statusText
    }
  } catch {
    Toast.fire({ icon: 'error', title: 'Error generating QRIS.' })
    qrisError.value = 'Network error or Midtrans API timeout'
  } finally {
    qrisLoading.value = false
  }
}

async function handlePayCreditCard() {
  if (!createdBooking.value) return
  paymentSubmitting.value = true

  try {
    const res = await auth.authFetch('/api/payments/midtrans/snap-token', {
      method: 'POST',
      body: JSON.stringify({
        id_booking: createdBooking.value.id_booking,
        id_term: selectedTermId.value || undefined,
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
                createdBooking.value.status = 'Paid'
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
      Toast.fire({ icon: 'error', title: 'Gagal inisialisasi pembayaran: ' + (err.error?.message || res.statusText) })
    }
  } catch {
    Toast.fire({ icon: 'error', title: 'Error initializing credit card payment.' })
  } finally {
    paymentSubmitting.value = false
  }
}

function startCountdown(expiryTimeStr: string) {
  stopCountdown()
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

async function handleSimulatePayment(orderId: string) {
  try {
    const res = await auth.authFetch(`/api/payments/midtrans/simulate/${orderId}`, { method: 'POST' })
    const result = await res.json()
    if (result.error) throw new Error(result.error.message)
    console.log('[Simulate] Payment marked as paid:', orderId)
    Toast.fire({ icon: 'success', title: 'Payment confirmed!' })
    if (createdBooking.value) createdBooking.value.status = 'paid'
    stopCountdown()
    stopPolling()
    paymentStatus.value = 'paid'
    setTimeout(() => { currentStep.value = 3 }, 1500)
  } catch (err) {
    console.error('[Simulate] Failed:', err)
    Toast.fire({ icon: 'error', title: 'Failed to simulate payment: ' + (err instanceof Error ? err.message : String(err)) })
  }
}

function getQrisImageUrl(orderId: string): string {
  return `/api/payments/midtrans/qris-image/${orderId}`
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
          createdBooking.value.status = 'Paid'
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

onUnmounted(() => {
  stopPolling()
  stopCountdown()
})

</script>

<template>
  <div class="booking-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="booking-header">
      <div class="container">
        <h1 class="page-title">Booking Checkout</h1>
        <p class="page-subtitle">Complete your event booking details</p>
        <div class="progress-steps">
          <span class="step" :class="{ active: currentStep >= 1 }"><span class="step-num">1</span> Details</span>
          <span class="step-divider"></span>
          <span class="step" :class="{ active: currentStep >= 2 }"><span class="step-num">2</span> Payment</span>
          <span class="step-divider"></span>
          <span class="step" :class="{ active: currentStep >= 3 }"><span class="step-num">3</span> Confirmation</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Details -->
    <div class="container booking-layout" v-if="currentStep === 1">
      <div class="booking-main">

        <!-- 1. Customer Information -->
        <section class="form-section">
          <h2 class="section-title">Customer Information</h2>
          <div class="form-grid">
            <div class="form-group" :class="{ 'has-error': errors.fullName }">
              <label>Full Name <span class="required">*</span></label>
              <input v-model="customer.fullName" type="text" placeholder="e.g. John Doe" />
              <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error': errors.phone }">
              <label>Phone Number <span class="required">*</span></label>
              <input v-model="customer.phone" type="tel" placeholder="e.g. 08123456789" />
              <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            </div>
            <div class="form-group full-width" :class="{ 'has-error': errors.email }">
              <label>Email Address <span class="required">*</span></label>
              <input v-model="customer.email" type="email" placeholder="e.g. john@example.com" />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>
          </div>
        </section>

        <!-- 2. Event Information -->
        <section class="form-section">
          <h2 class="section-title">Event Information</h2>
          <div class="form-grid">
            <div class="form-group" :class="{ 'has-error': errors.eventType }">
              <label>Event Type <span class="required">*</span></label>
              <select v-model="event.type">
                <option value="" disabled>Select event type</option>
                <option v-for="t in eventTypes" :key="t" :value="t">{{ t }}</option>
              </select>
              <span v-if="errors.eventType" class="error-message">{{ errors.eventType }}</span>
            </div>
            <div class="form-group">
              <label>Event Name</label>
              <input v-model="event.name" type="text" placeholder="Optional" />
            </div>
            <div class="form-group" :class="{ 'has-error': errors.eventDate }">
              <label>Event Date <span class="required">*</span></label>
              <input v-model="event.date" type="date" />
              <span v-if="errors.eventDate" class="error-message">{{ errors.eventDate }}</span>
            </div>
            <div class="form-group">
              <label>Start Time</label>
              <input v-model="event.startTime" type="time" />
            </div>
            <div class="form-group">
              <label>End Time</label>
              <input v-model="event.endTime" type="time" />
            </div>
          </div>
        </section>

        <!-- 3. Event Location -->
        <section class="form-section">
          <h2 class="section-title">Event Location</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Venue Name</label>
              <input v-model="location.venue" type="text" placeholder="e.g. Grand Ballroom" />
            </div>
            <div class="form-group full-width">
              <label>Full Address</label>
              <input v-model="location.address" type="text" placeholder="e.g. Jl. Sudirman No. 1" />
            </div>
            <div class="form-group">
              <label>City</label>
              <input v-model="location.city" type="text" placeholder="e.g. Jakarta" />
            </div>
            <div class="form-group">
              <label>Location Type</label>
              <div class="radio-group">
                <label class="radio-pill" :class="{ active: location.type === 'Indoor' }">
                  <input v-model="location.type" type="radio" value="Indoor" /> Indoor
                </label>
                <label class="radio-pill" :class="{ active: location.type === 'Outdoor' }">
                  <input v-model="location.type" type="radio" value="Outdoor" /> Outdoor
                </label>
                <label class="radio-pill" :class="{ active: location.type === 'Both' }">
                  <input v-model="location.type" type="radio" value="Both" /> Both
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. Booking Items -->
        <section class="form-section">
          <div class="section-header-row">
            <h2 class="section-title">Booking Items</h2>
            <span class="item-count">{{ bookedVendors.length }} vendor{{ bookedVendors.length !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="bookedVendors.length === 0" class="empty-booking">
            <div class="empty-icon">📋</div>
            <p>No vendors added yet.</p>
            <p class="empty-hint">Click "Add Another Service" below to browse and add vendors.</p>
          </div>

          <div v-else class="booking-items">
            <div v-for="vendor in bookedVendors" :key="vendor.id_package ? 'pkg-' + vendor.id_package : 'prod-' + vendor.id_product" class="vendor-card">
              <div class="vendor-card-header" @click="toggleVendorExpand(vendor.id_vendor, vendor.id_package, vendor.id_product)">
                <div class="vendor-cover" v-if="vendor.cover_url">
                  <img :src="vendor.cover_url" :alt="vendor.business_name" />
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ vendor.business_name }}</h3>
                  <span class="vendor-category">{{ vendor.category }}</span>
                  <span class="vendor-package" v-if="vendor.package_name">
                    {{ vendor.package_name }}
                    <span v-if="vendor.quantity && vendor.quantity > 1" class="qty-badge">x{{ vendor.quantity }}</span>
                    <span v-if="vendor.id_product" class="product-id-badge">Product ID: #{{ vendor.id_product }}</span>
                  </span>
                  <div class="vendor-meta">
                    <span class="vendor-price">
                      {{ formatPrice(vendor.starting_price * (vendor.quantity || 1)) }}
                      <span class="price-unit" v-if="vendor.quantity && vendor.quantity > 1">({{ formatPrice(vendor.starting_price) }} / unit)</span>
                    </span>
                  </div>
                </div>
                <div class="vendor-actions">
                  <button v-if="vendor.id_product" class="btn-edit-details" @click.stop="openEditModal(vendor)">Edit Details</button>
                  <button class="btn-remove" @click.stop="removeVendor(vendor.id_vendor, vendor.id_package, vendor.id_product)" title="Remove">✕</button>
                  <span class="expand-icon">{{ vendor.expanded ? '▲' : '▼' }}</span>
                </div>
              </div>

              <Transition name="expand">
                <div v-if="vendor.expanded" class="vendor-extras">
                  <h4 class="extras-title">Additional Extras</h4>
                  <div class="extras-grid">
                    <label
                      v-for="extra in (vendorExtrasCache[vendor.id_vendor] || [])"
                      :key="extra.id"
                      class="extra-item"
                      :class="{ selected: extra.selected }"
                    >
                      <input
                        type="checkbox"
                        :checked="extra.selected"
                        @change="toggleExtra(vendor.id_vendor, extra.id)"
                        hidden
                      />
                      <span class="extra-icon">{{ extra.icon }}</span>
                      <span class="extra-name">{{ extra.name }}</span>
                      <span class="extra-price">{{ formatPrice(extra.price) }}</span>
                      <span class="extra-check">✓</span>
                    </label>
                  </div>
                  <button class="btn-view-portfolio" @click="viewPortfolio(vendor.id_vendor)">View Portfolio →</button>
                </div>
              </Transition>
            </div>
          </div>
        </section>

        <!-- 5. Add Another Service -->
        <section class="form-section add-service-section">
          <h2 class="section-title">Need Additional Services?</h2>
          <p class="section-desc">Browse and add more vendors to your event package</p>
          <button class="btn-add-service" @click="openAddModal">
            <span class="btn-icon">+</span> Add Another Service
          </button>
        </section>

        <!-- 6. Special Requests -->
        <section class="form-section">
          <h2 class="section-title">Special Requests</h2>
          <textarea
            v-model="specialRequests"
            placeholder="Write additional requests, schedules, or important notes for the booked vendors..."
            rows="4"
          ></textarea>
        </section>

        <!-- 7. Checkout -->
        <section class="form-section checkout-section">
          <label class="terms-check">
            <input v-model="agreeTerms" type="checkbox" />
            <span>I agree to the <a href="#" @click.prevent>Terms &amp; Conditions</a> and <a href="#" @click.prevent>Privacy Policy</a></span>
          </label>
          <button
            class="btn-proceed"
            :disabled="!agreeTerms || bookedVendors.length === 0"
            @click="handleProceedToPayment"
          >
            Proceed to Payment
          </button>
        </section>
      </div>

      <!-- 8. Booking Summary (Sticky Sidebar) -->
      <aside class="booking-sidebar">
        <div class="summary-card">
          <h3 class="summary-title">Booking Summary</h3>

          <div class="summary-items">
            <div class="summary-row">
              <span>Vendors ({{ bookedVendors.length }})</span>
              <span>{{ formatPrice(bookedVendors.reduce((s, v) => s + (v.starting_price * (v.quantity || 1)), 0)) }}</span>
            </div>
            <div class="summary-row" v-if="totalExtrasCount > 0">
              <span>Extras ({{ totalExtrasCount }})</span>
              <span>{{ formatPrice(Object.values(vendorExtrasCache).flat().filter(e => e.selected).reduce((s, e) => s + e.price, 0)) }}</span>
            </div>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span>Service Fee (5%)</span>
              <span>{{ formatPrice(serviceFee) }}</span>
            </div>
          </div>

          <div class="summary-divider thick"></div>

          <div class="summary-total">
            <span>Grand Total</span>
            <span class="total-price">{{ formatPrice(grandTotal) }}</span>
          </div>

          <div v-if="bookedVendors.length > 0" class="summary-vendors">
            <h4>Booked Vendors</h4>
            <div v-for="v in bookedVendors" :key="v.id_package ? 'pkg-' + v.id_package : 'prod-' + v.id_product" class="summary-vendor-row">
              <div class="sv-info">
                <span class="sv-name">{{ v.business_name }}</span>
                <span class="sv-cat">{{ v.category }}</span>
                <span class="sv-pkg" v-if="v.package_name">
                  {{ v.package_name }}
                  <span v-if="v.quantity && v.quantity > 1" class="qty-badge-sm">x{{ v.quantity }}</span>
                  <span v-if="v.id_product" class="product-id-badge-sm">ID: #{{ v.id_product }}</span>
                </span>
              </div>
              <span class="sv-price">{{ formatPrice(v.starting_price * (v.quantity || 1)) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Step 2: Payment Page -->
    <div class="container payment-layout" v-else-if="currentStep === 2 && createdBooking">
      <div class="booking-main">
        <!-- Billing / Payment Term Options -->
        <section class="form-section">
          <h2 class="section-title">Select Payment Type</h2>
          <p class="section-desc">Choose whether to pay the initial Down Payment (DP) or pay in full.</p>
          <div class="payment-terms-grid">
            <div
              v-for="term in createdBooking.payment_terms"
              :key="term.id_term"
              class="term-card"
              :class="{ active: selectedTermId === term.id_term }"
              @click="selectedTermId = term.id_term"
            >
              <div class="term-radio">
                <span class="radio-dot"></span>
              </div>
              <div class="term-details">
                <h4 class="term-name">{{ term.term_name }}</h4>
                <p class="term-amount">{{ formatPrice(term.amount) }}</p>
                <p class="term-notes">{{ term.notes }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Choose Payment Method -->
        <section class="form-section">
          <h2 class="section-title">Payment Method</h2>
          <p class="section-desc">Select your preferred payment method</p>
          
          <div class="payment-methods-tabs">
            <button
              class="method-tab"
              :class="{ active: selectedPaymentMethod === 'Bank Transfer' }"
              @click="selectedPaymentMethod = 'Bank Transfer'"
            >
              🏢 Bank Transfer
            </button>
            <button
              class="method-tab"
              :class="{ active: selectedPaymentMethod === 'QRIS' }"
              @click="selectedPaymentMethod = 'QRIS'; selectedBank = ''; vaData = null"
            >
              📱 QRIS / E-Wallet
            </button>
            <button
              class="method-tab"
              :class="{ active: selectedPaymentMethod === 'Credit Card' }"
              @click="selectedPaymentMethod = 'Credit Card'; selectedBank = ''; vaData = null"
            >
              💳 Credit Card
            </button>
          </div>

          <!-- Bank Transfer Details -->
          <div v-if="selectedPaymentMethod === 'Bank Transfer'" class="method-details-pane">
            <p class="section-desc">Select your bank to generate a Virtual Account number for payment.</p>

            <div class="bank-grid">
              <button
                v-for="bank in bankOptions"
                :key="bank.id"
                class="bank-btn"
                :class="{ active: selectedBank === bank.id }"
                :disabled="vaLoading && selectedBank !== bank.id"
                @click="handleSelectBank(bank.id)"
              >
                <span class="bank-icon">{{ bank.icon }}</span>
                <span class="bank-name">{{ bank.name }}</span>
                <span v-if="vaData && selectedBank === bank.id" class="bank-check">✓</span>
              </button>
            </div>

            <div v-if="vaLoading" class="va-loading">
              <div class="spinner-small"></div>
              <span>Generating Virtual Account...</span>
            </div>

            <div v-if="vaError && !vaLoading && !vaData" class="error-card">
              <span class="error-icon">⚠️</span>
              <span class="error-msg">{{ vaError }}</span>
              <button class="btn-retry" @click="handleSelectBank(selectedBank)">Try Again</button>
            </div>

            <div v-if="vaData" class="va-card">
              <h5>Virtual Account {{ vaData.bank.toUpperCase() }}</h5>
              <div class="va-row">
                <span>VA Number:</span>
                <div class="va-number-group">
                  <strong class="va-number">{{ vaData.va_number }}</strong>
                  <button class="btn-copy" @click="copyToClipboard(vaData.va_number)" title="Copy VA Number">📋</button>
                </div>
              </div>
              <div class="va-row">
                <span>Total Payment:</span>
                <strong class="highlight-text">{{ formatPrice(vaData.amount) }}</strong>
              </div>
              <div v-if="countdown && countdown !== 'Expired'" class="va-row countdown-row">
                <span>Time Remaining:</span>
                <strong class="countdown-text">{{ countdown }}</strong>
              </div>
              <div v-if="countdown === 'Expired'" class="va-row">
                <span>Status:</span>
                <strong class="expired-text">Expired</strong>
              </div>
              <div v-if="paymentStatus === 'polling'" class="va-status-bar">
                <div class="spinner-small"></div>
                <span>Waiting for payment confirmation...</span>
              </div>
              <div v-if="paymentStatus === 'paid'" class="va-status-bar paid">
                <span>✅ Payment confirmed!</span>
              </div>
              <p class="va-note">Transfer exactly the amount above to the VA number. Payment will be confirmed automatically.</p>
              <button v-if="vaData && paymentStatus !== 'paid'" class="btn-simulate" @click="handleSimulatePayment(vaData.order_id)">
                ⚡ Simulate Payment (Dev Only)
              </button>
            </div>
          </div>

          <!-- QRIS Section -->
          <div v-else-if="selectedPaymentMethod === 'QRIS'" class="method-details-pane text-center">
            <p v-if="!qrisData && !qrisLoading">Click the button below to generate a QRIS code.</p>

            <div v-if="qrisLoading" class="va-loading">
              <div class="spinner-small"></div>
              <span>Generating QRIS code...</span>
            </div>

            <div v-if="qrisError && !qrisLoading && !qrisData" class="error-card">
              <span class="error-icon">⚠️</span>
              <span class="error-msg">{{ qrisError }}</span>
              <button class="btn-retry" @click="handleSelectQRIS">Try Again</button>
            </div>

            <div v-if="qrisData" class="qris-box">
              <div class="qris-frame">
                <div class="qris-header">QRIS GPN</div>
                <img :src="getQrisImageUrl(qrisData.order_id)" alt="QRIS Code" class="qris-image" />
                <div class="qris-amount">{{ formatPrice(qrisData.amount) }}</div>
              </div>
            </div>

            <div v-if="qrisData && paymentStatus === 'polling'" class="status-waiting">
              <div class="spinner-small"></div>
              <span>Waiting for payment... <strong v-if="countdown">{{ countdown }}</strong></span>
            </div>
            <p v-if="qrisData" class="small text-muted mt-2">Scan using Gopay, OVO, ShopeePay, Dana, or mobile banking. Payment detected automatically.</p>
            <button v-if="qrisData && paymentStatus !== 'paid'" class="btn-simulate" @click="handleSimulatePayment(qrisData.order_id)">
              ⚡ Simulate Payment (Dev Only)
            </button>

            <button v-if="!qrisData && !qrisLoading && !qrisError" class="btn-proceed" style="margin-top:16px" @click="handleSelectQRIS">
              Generate QRIS
            </button>
          </div>

          <!-- Credit Card Input -->
          <div v-else-if="selectedPaymentMethod === 'Credit Card'" class="method-details-pane">
            <p>Click the button below to open Midtrans secure payment page for credit card.</p>
            <button class="btn-proceed" style="margin-top:16px" :disabled="paymentSubmitting" @click="handlePayCreditCard">
              {{ paymentSubmitting ? 'Opening Payment Page...' : 'Pay with Credit Card' }}
            </button>
          </div>
        </section>
      </div>

      <!-- Payment Summary Sidebar -->
      <aside class="booking-sidebar">
        <div class="summary-card">
          <h3 class="summary-title">Payment Summary</h3>
          <div class="summary-items">
            <div class="summary-row">
              <span>Event Booking</span>
              <span>{{ createdBooking.event_location ? createdBooking.event_location.split(',')[0] : 'Event' }}</span>
            </div>
            <div class="summary-row">
              <span>Grand Total</span>
              <span>{{ formatPrice(createdBooking.total_price) }}</span>
            </div>
            <div class="summary-row" v-if="selectedTermId">
              <span>Payment Step</span>
              <span>{{ getTermNameById(selectedTermId) }}</span>
            </div>
          </div>
          <div class="summary-divider thick"></div>
          <div class="summary-total">
            <span>Amount Due Now</span>
            <span class="total-price">{{ formatPrice(currentPaymentAmount) }}</span>
          </div>
        </div>
      </aside>
    </div>

    <!-- Step 3: Confirmation / Success Page -->
    <div class="container success-layout" v-else-if="currentStep === 3 && createdBooking">
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <template v-if="paymentStatus === 'paid'">
          <h2 class="success-title">Payment Confirmed!</h2>
          <p class="success-desc">
            Thank you! Your payment has been successfully received and your booking is now confirmed. We have sent the invoice and booking confirmation details to your registered email.
          </p>
        </template>
        <template v-else>
          <h2 class="success-title">{{ vaData ? 'Virtual Account Generated!' : 'Booking Saved & Payment Submitted!' }}</h2>
          <p class="success-desc">
            {{ vaData
              ? 'Please transfer the exact amount to the Virtual Account below. Payment will be confirmed automatically by Midtrans.'
              : 'Thank you! Your booking request has been successfully created and your payment is being processed. We have sent the invoice and booking confirmation details to your registered email.'
            }}
          </p>
        </template>

        <div v-if="vaData && paymentStatus !== 'paid'" class="va-confirm-card">
          <h4>Transfer Details</h4>
          <div class="va-row">
            <span>Bank:</span>
            <strong>{{ vaData.bank.toUpperCase() }}</strong>
          </div>
          <div class="va-row">
            <span>VA Number:</span>
            <div class="va-number-group">
              <strong class="va-number">{{ vaData.va_number }}</strong>
              <button class="btn-copy" @click="copyToClipboard(vaData.va_number)" title="Copy">📋</button>
            </div>
          </div>
          <div class="va-row">
            <span>Amount:</span>
            <strong class="highlight-text">{{ formatPrice(vaData.amount) }}</strong>
          </div>
          <div class="va-row">
            <span>Valid Until:</span>
            <strong>{{ vaData.expiry_time }}</strong>
          </div>
        </div>

        <div class="success-details-box">
          <h4>Booking Invoice Summary</h4>
          <div class="detail-row">
            <span>Booking ID:</span>
            <strong>#{{ createdBooking.id_booking }}</strong>
          </div>
          <div class="detail-row">
            <span>Event Date:</span>
            <strong>{{ formatDateString(createdBooking.event_date) }}</strong>
          </div>
          <div class="detail-row">
            <span>Location:</span>
            <strong>{{ createdBooking.event_location || '-' }}</strong>
          </div>
          <div class="detail-row">
            <span>Total Price:</span>
            <strong>{{ formatPrice(createdBooking.total_price) }}</strong>
          </div>
          <div class="detail-row">
            <span>Status:</span>
            <span class="status-badge-paid">{{ paymentStatus === 'paid' ? 'confirmed' : createdBooking.status }}</span>
          </div>
        </div>

        <div class="success-actions">
          <router-link to="/booking-history" class="btn-primary-success">MyBooking</router-link>
          <router-link to="/" class="btn-secondary-success">Back to Home</router-link>
        </div>
      </div>
    </div>

    <Footer />

    <AddServiceModal
      :visible="showAddModal"
      :edit-product="editingProduct"
      @close="handleCloseModal"
      @add="handleAddPackage"
      @edit="handleEditPackage"
    />
  </div>
</template>
