<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import AddServiceModal from '@/components/booking/AddServiceModal.vue'

const router = useRouter()
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
const paymentProofFile = ref<File | null>(null)

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

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files?.length) {
    paymentProofFile.value = target.files[0]
  }
}

const bookedVendors = ref<BookedVendor[]>([])
const vendorExtrasCache = ref<Record<number, ExtraItem[]>>({})

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

onMounted(async () => {
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
  if (!auth.isLoggedIn) {
    alert('Please log in first.')
    router.push('/login')
    return
  }

  if (bookedVendors.value.length === 0) {
    alert('No packages selected.')
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
      id_user: auth.user!.id_user,
      package_ids: packageIds,
      products: productsPayload,
      event_date: new Date(event.value.date).toISOString(),
      event_location: `${location.value.venue || ''}, ${location.value.address || ''}, ${location.value.city || ''}`,
      total_price: grandTotal.value,
      dp_amount: Math.round(grandTotal.value * 0.3), // 30% Down Payment
      notes: specialRequests.value || null
    }

    const res = await auth.authFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json()
      alert('Failed to save booking: ' + (err.error?.message || res.statusText))
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
    alert('Error processing payment request.')
  } finally {
    paymentSubmitting.value = false
  }
}

const paymentSubmitting = ref(false)

async function handleConfirmPayment() {
  if (!createdBooking.value) return

  try {
    paymentSubmitting.value = true
    let proofUrl = ''

    if (selectedPaymentMethod.value === 'Bank Transfer' && paymentProofFile.value) {
      const formData = new FormData()
      formData.append('file', paymentProofFile.value)
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (uploadRes.ok) {
        const uploadJson = await uploadRes.json()
        proofUrl = uploadJson.url
      } else {
        const uploadErr = await uploadRes.json()
        alert('Failed to upload proof: ' + (uploadErr.error?.message || uploadRes.statusText))
        paymentSubmitting.value = false
        return
      }
    }

    const activeTerm = createdBooking.value.payment_terms?.find((t: any) => t.id_term === selectedTermId.value)
    const amountToPay = activeTerm ? activeTerm.amount : createdBooking.value.total_price

    const payload = {
      id_booking: createdBooking.value.id_booking,
      id_term: selectedTermId.value || undefined,
      amount: amountToPay,
      payment_type: selectedPaymentMethod.value,
      payment_proof_url: proofUrl || null,
      status: selectedPaymentMethod.value === 'Bank Transfer' ? 'pending' : 'paid',
      paid_at: selectedPaymentMethod.value === 'Bank Transfer' ? null : new Date().toISOString()
    }

    const res = await auth.authFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      createdBooking.value.status = selectedPaymentMethod.value === 'Bank Transfer' ? 'Pending Approval' : 'Paid'
      currentStep.value = 3
    } else {
      const err = await res.json()
      alert('Failed to record payment: ' + (err.error?.message || res.statusText))
    }
  } catch (error) {
    console.error(error)
    alert('Error recording payment.')
  } finally {
    paymentSubmitting.value = false
  }
}
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
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input v-model="customer.fullName" type="text" placeholder="e.g. John Doe" />
            </div>
            <div class="form-group">
              <label>Phone Number <span class="required">*</span></label>
              <input v-model="customer.phone" type="tel" placeholder="e.g. 08123456789" />
            </div>
            <div class="form-group full-width">
              <label>Email Address <span class="required">*</span></label>
              <input v-model="customer.email" type="email" placeholder="e.g. john@example.com" />
            </div>
          </div>
        </section>

        <!-- 2. Event Information -->
        <section class="form-section">
          <h2 class="section-title">Event Information</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Event Type <span class="required">*</span></label>
              <select v-model="event.type">
                <option value="" disabled>Select event type</option>
                <option v-for="t in eventTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Event Name</label>
              <input v-model="event.name" type="text" placeholder="Optional" />
            </div>
            <div class="form-group">
              <label>Event Date <span class="required">*</span></label>
              <input v-model="event.date" type="date" />
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
              @click="selectedPaymentMethod = 'QRIS'"
            >
              📱 QRIS / E-Wallet
            </button>
            <button
              class="method-tab"
              :class="{ active: selectedPaymentMethod === 'Credit Card' }"
              @click="selectedPaymentMethod = 'Credit Card'"
            >
              💳 Credit Card
            </button>
          </div>

          <!-- Bank Transfer Details & Upload -->
          <div v-if="selectedPaymentMethod === 'Bank Transfer'" class="method-details-pane">
            <div class="bank-instruction-card">
              <h5>Transfer Bank BCA</h5>
              <div class="instruction-row">
                <span>Account Number:</span>
                <strong>123-456-7890</strong>
              </div>
              <div class="instruction-row">
                <span>Account Holder:</span>
                <strong>PT Agregrator Business</strong>
              </div>
              <div class="instruction-row">
                <span>Total Payment:</span>
                <strong class="highlight-text">{{ formatPrice(currentPaymentAmount) }}</strong>
              </div>
            </div>
            
            <div class="upload-proof-section">
              <label class="form-label">Upload Proof of Payment <span class="required">*</span></label>
              <div class="file-drop-area">
                <input type="file" @change="handleFileChange" accept="image/*,application/pdf" id="payment-proof-input" />
                <div class="drop-text-wrapper" v-if="!paymentProofFile">
                  <span class="upload-icon">📁</span>
                  <span>Click to choose or drag photo/file here</span>
                  <span class="file-hint">JPG, PNG, WEBP, or PDF (Max 10MB)</span>
                </div>
                <div class="file-selected-wrapper" v-else>
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ paymentProofFile.name }}</span>
                  <button class="btn-remove-file" @click.prevent="paymentProofFile = null">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <!-- QRIS Mockup -->
          <div v-else-if="selectedPaymentMethod === 'QRIS'" class="method-details-pane text-center">
            <p>Scan this QR code using Gopay, OVO, ShopeePay, Dana, or your mobile banking app to pay.</p>
            <div class="qris-box">
              <div class="qris-frame">
                <div class="qris-header">QRIS GPN</div>
                <div class="qris-qr-mock">
                  <div class="qr-pattern"></div>
                </div>
                <div class="qris-amount">{{ formatPrice(currentPaymentAmount) }}</div>
              </div>
            </div>
            <p class="small text-muted mt-2">After scanning and completing payment, click "Confirm QRIS Payment" below.</p>
          </div>

          <!-- Credit Card Input -->
          <div v-else-if="selectedPaymentMethod === 'Credit Card'" class="method-details-pane">
            <div class="credit-card-form">
              <div class="form-group full-width">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9101 1121" class="cc-input" />
              </div>
              <div class="form-group">
                <label>Expiry Date</label>
                <input type="text" placeholder="MM/YY" class="cc-input" />
              </div>
              <div class="form-group">
                <label>CVV / CVC</label>
                <input type="password" placeholder="123" class="cc-input" />
              </div>
            </div>
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

          <button
            class="btn-proceed"
            :disabled="paymentSubmitting || (selectedPaymentMethod === 'Bank Transfer' && !paymentProofFile)"
            @click="handleConfirmPayment"
          >
            {{ paymentSubmitting ? 'Processing Payment...' : 'Confirm Payment' }}
          </button>
        </div>
      </aside>
    </div>

    <!-- Step 3: Confirmation / Success Page -->
    <div class="container success-layout" v-else-if="currentStep === 3 && createdBooking">
      <div class="success-card">
        <div class="success-icon">🎉</div>
        <h2 class="success-title">Booking Saved & Payment Submitted!</h2>
        <p class="success-desc">
          Thank you! Your booking request has been successfully created and your payment is being processed. 
          We have sent the invoice and booking confirmation details to your registered email.
        </p>

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
            <span class="status-badge-paid">{{ createdBooking.status }}</span>
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

<style scoped>
.booking-page {
  min-height: 100vh;
  background: #f5f5f7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.booking-header {
  background: #fff;
  border-bottom: 1px solid #e8e8ed;
  padding: 104px 0 24px;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
  color: #1d1d1f;
}

.page-subtitle {
  color: #86868b;
  font-size: 1rem;
  margin: 0 0 24px;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #86868b;
  font-weight: 500;
}

.step.active {
  color: #1d1d1f;
  font-weight: 600;
}

.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e8e8ed;
  font-size: 0.75rem;
  font-weight: 700;
  color: #86868b;
}

.step.active .step-num {
  background: #1d1d1f;
  color: #fff;
}

.step-divider {
  width: 40px;
  height: 2px;
  background: #e8e8ed;
}

/* Layout */
.booking-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  padding-top: 32px;
  padding-bottom: 60px;
  align-items: start;
}

.booking-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Form Sections */
.form-section {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8e8ed;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.section-header-row .section-title {
  margin: 0;
}

.item-count {
  font-size: 0.85rem;
  color: #86868b;
  background: #f5f5f7;
  padding: 4px 12px;
  border-radius: 20px;
}

.section-desc {
  color: #86868b;
  font-size: 0.9rem;
  margin: 4px 0 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.required { color: #ff3b30; }

.form-group input,
.form-group select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d2d2d7;
  border-radius: 10px;
  font-size: 0.95rem;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
textarea:focus {
  border-color: #1d1d1f;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.radio-group {
  display: flex;
  gap: 8px;
}

.radio-pill {
  padding: 10px 20px;
  border: 1.5px solid #d2d2d7;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  color: #1d1d1f;
}

.radio-pill.active {
  border-color: #1d1d1f;
  background: #1d1d1f;
  color: #fff;
}

.radio-pill input { display: none; }

textarea {
  margin-top: 12px;
  resize: vertical;
  min-height: 100px;
}

/* Booking Items */
.empty-booking {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
}

.empty-icon { font-size: 2.5rem; margin-bottom: 8px; }
.empty-hint { font-size: 0.85rem; margin-top: 4px; }

.booking-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.vendor-card {
  border: 1.5px solid #e8e8ed;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.2s;
}

.vendor-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.vendor-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  cursor: pointer;
}

.vendor-cover {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f7;
}

.vendor-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-info { flex: 1; min-width: 0; }

.vendor-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: #1d1d1f;
}

.vendor-category {
  font-size: 0.8rem;
  color: #86868b;
  display: block;
}

.vendor-package {
  font-size: 0.8rem;
  color: #1d1d1f;
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.vendor-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
}

.vendor-rating { color: #f5b342; font-weight: 600; }
.vendor-price { color: #1d1d1f; font-weight: 600; }

.vendor-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.btn-remove {
  background: none;
  border: none;
  font-size: 1rem;
  color: #86868b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fef2f2;
  color: #ff3b30;
}

.expand-icon {
  font-size: 0.7rem;
  color: #86868b;
}

/* Extras */
.vendor-extras {
  padding: 0 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.extras-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 12px 0 10px;
  color: #1d1d1f;
}

.extras-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1.5px solid #e8e8ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
}

.extra-item:hover { border-color: #1d1d1f; }
.extra-item.selected {
  border-color: #1d1d1f;
  background: #f8f8fa;
}

.extra-icon { font-size: 1rem; }
.extra-name { flex: 1; font-weight: 500; }
.extra-price { color: #86868b; font-size: 0.8rem; }
.extra-check {
  color: #1d1d1f;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.2s;
}
.extra-item.selected .extra-check { opacity: 1; }

.btn-view-portfolio {
  margin-top: 12px;
  background: none;
  border: none;
  color: #1d1d1f;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Add Service */
.add-service-section {
  text-align: center;
  border-style: dashed;
  border-color: #d2d2d7;
}

.btn-add-service {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  margin-top: 4px;
}

.btn-add-service:hover {
  background: #2d2d2f;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1.3rem;
  font-weight: 300;
}

/* Checkout */
.checkout-section {
  background: #fff;
}

.terms-check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #1d1d1f;
  cursor: pointer;
  margin-bottom: 20px;
}

.terms-check a {
  color: #1d1d1f;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.terms-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #1d1d1f;
}

.btn-proceed {
  width: 100%;
  padding: 16px;
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.btn-proceed:hover:not(:disabled) {
  background: #2d2d2f;
  transform: translateY(-1px);
}

.btn-proceed:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
}

/* Sidebar Summary */
.booking-sidebar {
  position: sticky;
  top: 24px;
}

.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8e8ed;
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: #1d1d1f;
}

.summary-items,
.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #1d1d1f;
}

.summary-row span:first-child { color: #86868b; }

.summary-divider {
  height: 1px;
  background: #e8e8ed;
  margin: 14px 0;
}

.summary-divider.thick {
  height: 2px;
  background: #1d1d1f;
  margin: 16px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-total span:first-child {
  font-weight: 700;
  color: #1d1d1f;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1d1d1f;
}

.summary-vendors h4 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #86868b;
  margin: 0 0 10px;
}

.summary-vendor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-vendor-row:last-child { border-bottom: none; }

.sv-info {
  display: flex;
  flex-direction: column;
}

.sv-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
}

.sv-cat {
  font-size: 0.75rem;
  color: #86868b;
}
.sv-pkg {
  font-size: 0.75rem;
  color: #1d1d1f;
  font-weight: 600;
}

.sv-price {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* Responsive */
@media (max-width: 992px) {
  .booking-header {
    padding: 96px 0 20px;
  }
  .booking-layout {
    grid-template-columns: 1fr;
  }
  .booking-sidebar {
    position: static;
  }
  .extras-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .booking-header {
    padding: 88px 0 16px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-section {
    padding: 20px;
  }
  .page-title {
    font-size: 1.5rem;
  }
}

.product-id-badge {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  display: inline-block;
  vertical-align: middle;
}

.product-id-badge-sm {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0px 4px;
  border-radius: 3px;
  margin-left: 4px;
  display: inline-block;
}

.qty-badge {
  background: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  display: inline-block;
  vertical-align: middle;
}

.qty-badge-sm {
  background: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0px 4px;
  border-radius: 3px;
  margin-left: 4px;
  display: inline-block;
}

.price-unit {
  font-size: 0.8rem;
  font-weight: 400;
  color: #86868b;
  margin-left: 4px;
}

.btn-edit-details {
  padding: 6px 12px;
  background: #f5f5f7;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-edit-details:hover {
  background: #e8e8ed;
  border-color: #86868b;
}

/* Step 2 & 3 styles */
.payment-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  padding-top: 32px;
  padding-bottom: 60px;
  align-items: start;
}

.payment-terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.term-card {
  border: 1.5px solid #d2d2d7;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  display: flex;
  gap: 14px;
  background: #fff;
  transition: all 0.2s ease;
}

.term-card:hover {
  border-color: #86868b;
  transform: translateY(-1px);
}

.term-card.active {
  border-color: #1d1d1f;
  background: #fdfdfd;
  box-shadow: 0 0 0 1px #1d1d1f;
}

.term-radio {
  display: flex;
  align-items: center;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border: 1.5px solid #d2d2d7;
  border-radius: 50%;
  position: relative;
  display: inline-block;
}

.term-card.active .radio-dot {
  border-color: #1d1d1f;
  background: #1d1d1f;
}

.term-card.active .radio-dot::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.term-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.term-amount {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 4px;
}

.term-notes {
  font-size: 0.8rem;
  color: #86868b;
  margin: 0;
}

.payment-methods-tabs {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  border-bottom: 1.5px solid #e8e8ed;
  padding-bottom: 14px;
}

.method-tab {
  flex: 1;
  padding: 14px 20px;
  border: 1.5px solid #d2d2d7;
  border-radius: 12px;
  background: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.2s;
}

.method-tab:hover {
  background: #f5f5f7;
  border-color: #86868b;
}

.method-tab.active {
  background: #1d1d1f;
  color: #fff;
  border-color: #1d1d1f;
}

.method-details-pane {
  padding: 24px 0 0;
}

.bank-instruction-card {
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.bank-instruction-card h5 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 14px;
  color: #1d1d1f;
}

.instruction-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.instruction-row:last-child {
  margin-bottom: 0;
  border-top: 1px dashed #d2d2d7;
  padding-top: 8px;
}

.highlight-text {
  font-size: 1.1rem;
  color: #ff3b30;
}

.upload-proof-section {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.file-drop-area {
  border: 2px dashed #d2d2d7;
  border-radius: 14px;
  padding: 32px 20px;
  text-align: center;
  position: relative;
  background: #fff;
  transition: all 0.2s;
  cursor: pointer;
}

.file-drop-area:hover {
  border-color: #86868b;
  background: #f5f5f7;
}

.file-drop-area input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.drop-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-icon {
  font-size: 2rem;
}

.file-hint {
  font-size: 0.75rem;
  color: #86868b;
  margin-top: 4px;
}

.file-selected-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 2rem;
}

.file-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d1d1f;
}

.btn-remove-file {
  padding: 6px 14px;
  background: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 10;
}

.qris-box {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.qris-frame {
  width: 220px;
  background: #fff;
  border: 1px solid #d2d2d7;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.qris-header {
  font-size: 0.9rem;
  font-weight: 800;
  color: #102a43;
  margin-bottom: 12px;
  border-bottom: 2px solid #102a43;
  padding-bottom: 4px;
}

.qris-qr-mock {
  width: 180px;
  height: 180px;
  margin: 0 auto 12px;
  background: 
    repeating-conic-gradient(from 45deg, #1d1d1f 0% 25%, #fff 0% 50%) 
    50% / 20px 20px;
  border-radius: 8px;
  position: relative;
}

.qris-qr-mock::before {
  content: 'QRIS';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  color: #1d1d1f;
  font-size: 0.8rem;
  font-weight: 900;
  padding: 4px 8px;
  border-radius: 4px;
  border: 2px solid #1d1d1f;
}

.qris-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #1d1d1f;
}

.credit-card-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: #f5f5f7;
  border-radius: 12px;
  padding: 20px;
}

.cc-input {
  background: #fff !important;
}

/* Success Card styling */
.success-layout {
  padding-top: 40px;
  padding-bottom: 80px;
  max-width: 600px !important;
}

.success-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8e8ed;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 12px;
}

.success-desc {
  color: #86868b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 32px;
}

.success-details-box {
  background: #f5f5f7;
  border-radius: 16px;
  padding: 24px;
  text-align: left;
  margin-bottom: 32px;
}

.success-details-box h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #1d1d1f;
}

.detail-row:last-child {
  margin-bottom: 0;
  border-top: 1px solid #d2d2d7;
  padding-top: 10px;
  margin-top: 10px;
}

.status-badge-paid {
  background: #e6f4ea;
  color: #137333;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
}

.success-actions {
  display: flex;
  gap: 16px;
}

.btn-primary-success {
  flex: 1;
  padding: 16px;
  background: #1d1d1f;
  color: #fff;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn-primary-success:hover {
  background: #2d2d2f;
}

.btn-secondary-success {
  flex: 1;
  padding: 16px;
  background: #fff;
  color: #1d1d1f;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-secondary-success:hover {
  background: #f5f5f7;
  border-color: #86868b;
}
</style>
