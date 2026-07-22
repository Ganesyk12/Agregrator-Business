<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import AddServiceModal from '@/components/booking/AddServiceModal.vue'

const route = useRoute()

interface BookedVendor {
  id_vendor: number
  id_package?: number
  package_name?: string
  business_name: string
  category: string
  starting_price: number
  description: string
  cover_url: string
  rating: number
  selectedExtras: ExtraItem[]
  expanded: boolean
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

const bookedVendors = ref<BookedVendor[]>([])
const vendorExtrasCache = ref<Record<number, ExtraItem[]>>({})

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

onMounted(async () => {
  const vid = route.query.vendorId as string
  const pkgId = route.query.packageId as string
  const pkgName = route.query.packageName as string
  const pkgPrice = route.query.packagePrice as string
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
            : Number(pkgPrice) || 0
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
      }
    } catch (_) {
      try {
        if (pkgId) {
          bookedVendors.value.push({
            id_vendor: Number(vid),
            id_package: Number(pkgId),
            package_name: pkgName || 'Package',
            business_name: pkgName || 'Vendor',
            category: 'Photography',
            starting_price: Number(pkgPrice) || 0,
            description: '',
            cover_url: '',
            rating: 0,
            selectedExtras: [],
            expanded: false,
          })
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
      } catch (_) {
        if (name) {
          bookedVendors.value.push({
            id_vendor: Number(vid),
            business_name: pkgName,
            category: 'Photography',
            starting_price: Number(pkgPrice) || 0,
            description: '',
            cover_url: '',
            rating: 0,
            selectedExtras: [],
            expanded: false,
          })
        }
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

function addPackageToBooking(p: PackageItem) {
  if (bookedVendors.value.some((b) => b.id_package === p.id_package)) return
  const extras = ((p as any).extras || []).map((e: any) => ({
    id: String(e.id_extra || e.id),
    name: e.name,
    price: e.price,
    icon: e.icon || '',
    selected: false,
  }))
  bookedVendors.value.push({
    id_vendor: p.vendor.id_vendor,
    id_package: p.id_package,
    package_name: p.name,
    business_name: p.vendor.business_name,
    category: p.category.category_name,
    starting_price: p.price,
    description: p.vendor.description || p.description || '',
    cover_url: '',
    rating: 0,
    selectedExtras: extras.filter((e: any) => e.selected),
    expanded: false,
  })
  if (extras.length > 0) {
    vendorExtrasCache.value[p.vendor.id_vendor] = extras
  }
}

function toggleVendorExpand(id: number, idPackage?: number) {
  const v = bookedVendors.value.find((b) => idPackage ? b.id_package === idPackage : b.id_vendor === id)
  if (v) v.expanded = !v.expanded
}

function toggleExtra(vendorId: number, extraId: string) {
  const extras = vendorExtrasCache.value[vendorId]
  if (!extras) return
  const ex = extras.find((e) => e.id === extraId)
  if (ex) ex.selected = !ex.selected
}

function removeVendor(id: number, idPackage?: number) {
  if (idPackage) {
    const idx = bookedVendors.value.findIndex((b) => b.id_package === idPackage)
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

const subtotal = computed(() => {
  return bookedVendors.value.reduce((sum, v) => {
    const extras = vendorExtrasCache.value[v.id_vendor] || []
    const extrasTotal = extras.filter((e) => e.selected).reduce((s, e) => s + e.price, 0)
    return sum + v.starting_price + extrasTotal
  }, 0)
})

const serviceFee = computed(() => Math.round(subtotal.value * 0.05))
const grandTotal = computed(() => subtotal.value + serviceFee.value)

const totalExtrasCount = computed(() => {
  return Object.values(vendorExtrasCache.value).reduce((sum, arr) => sum + arr.filter((e) => e.selected).length, 0)
})

function handleProceedToPayment() {
  alert('Proceeding to payment... (Demo)')
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
          <span class="step active"><span class="step-num">1</span> Details</span>
          <span class="step-divider"></span>
          <span class="step"><span class="step-num">2</span> Payment</span>
          <span class="step-divider"></span>
          <span class="step"><span class="step-num">3</span> Confirmation</span>
        </div>
      </div>
    </div>

    <div class="container booking-layout">
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
            <div v-for="vendor in bookedVendors" :key="vendor.id_package || vendor.id_vendor" class="vendor-card">
              <div class="vendor-card-header" @click="toggleVendorExpand(vendor.id_vendor, vendor.id_package)">
                <div class="vendor-cover" v-if="vendor.cover_url">
                  <img :src="vendor.cover_url" :alt="vendor.business_name" />
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ vendor.business_name }}</h3>
                  <span class="vendor-category">{{ vendor.category }}</span>
                  <span class="vendor-package" v-if="vendor.package_name">{{ vendor.package_name }}</span>
                  <div class="vendor-meta">
                    <span class="vendor-price">{{ formatPrice(vendor.starting_price) }}</span>
                  </div>
                </div>
                <div class="vendor-actions">
                  <button class="btn-remove" @click.stop="removeVendor(vendor.id_vendor, vendor.id_package)" title="Remove">✕</button>
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
              <span>{{ formatPrice(bookedVendors.reduce((s, v) => s + v.starting_price, 0)) }}</span>
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
            <div v-for="v in bookedVendors" :key="v.id_package || v.id_vendor" class="summary-vendor-row">
              <div class="sv-info">
                <span class="sv-name">{{ v.business_name }}</span>
                <span class="sv-cat">{{ v.category }}</span>
                <span class="sv-pkg" v-if="v.package_name">{{ v.package_name }}</span>
              </div>
              <span class="sv-price">{{ formatPrice(v.starting_price) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <Footer />

    <AddServiceModal
      :visible="showAddModal"
      @close="showAddModal = false"
      @add="handleAddPackage"
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
  padding: 32px 0 24px;
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
</style>
