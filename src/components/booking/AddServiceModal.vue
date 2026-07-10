<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface ExtraItem {
  id: string
  name: string
  price: number
  icon: string
  category: string
}

interface VendorItem {
  id_vendor: number
  business_name: string
  category: string
  location: string
  description: string
  starting_price: number
  years_exp: number
  status: string
  average_rating: number
  completed_projects: number
  cover_url: string
  logo_url: string | null
  availability: string
  extras: ExtraItem[]
}

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; add: [vendor: VendorItem] }>()

const categories = ref<{ name: string }[]>([])
const vendors = ref<VendorItem[]>([])
const step = ref(1)
const selectedCategory = ref('')
const searchQuery = ref('')
const filterCity = ref('')
const filterRating = ref('')
const filterMaxPrice = ref('')

const filteredVendors = computed(() => {
  let result = vendors.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((v) => v.business_name.toLowerCase().includes(q))
  }
  if (filterCity.value) result = result.filter((v) => v.location === filterCity.value)
  if (filterRating.value) result = result.filter((v) => v.average_rating >= Number(filterRating.value))
  if (filterMaxPrice.value) result = result.filter((v) => v.starting_price <= Number(filterMaxPrice.value))
  return result
})

const citiesList = computed(() => {
  if (!selectedCategory.value) return []
  const citySet = new Set(vendors.value.map((v) => v.location))
  return [...citySet]
})

onMounted(async () => {
  try {
    const catRes = await fetch('/api/portfolios/vendors/categories')
    const catJson = await catRes.json()
    if (catRes.ok) categories.value = catJson.data

    const venRes = await fetch('/api/portfolios/vendors')
    const venJson = await venRes.json()
    if (venRes.ok) vendors.value = venJson.data
  } catch {
    // fallback
  }
})

function selectCategory(cat: string) {
  selectedCategory.value = cat
  step.value = 2
}

function goBack() {
  step.value = 1
  selectedCategory.value = ''
  searchQuery.value = ''
  filterCity.value = ''
  filterRating.value = ''
  filterMaxPrice.value = ''
}

function viewPortfolio(vendorId: number) {
  window.open(`/portfolio/${vendorId}`, '_blank')
}

function addVendor(v: VendorItem) {
  emit('add', v)
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

function availabilityLabel(status: string) {
  const map: Record<string, string> = { available: 'Available', limited: 'Limited Slots', booked: 'Fully Booked' }
  return map[status] || status
}

function availabilityClass(status: string) {
  return `avail-${status}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-container">
          <div class="modal-header">
            <button v-if="step === 2" class="btn-back" @click="goBack">← Back</button>
            <h2 class="modal-title">{{ step === 1 ? 'Choose Service Category' : `Browse ${selectedCategory} Vendors` }}</h2>
            <button class="btn-close" @click="emit('close')">✕</button>
          </div>

          <div class="modal-body">
            <!-- Step 1: Categories -->
            <div v-if="step === 1" class="categories-grid">
              <button
                v-for="cat in categories"
                :key="cat.name"
                class="category-card"
                @click="selectCategory(cat.name)"
              >
                <span class="cat-icon">
                  {{ cat.name === 'Photography' ? '📷' : cat.name === 'MUA' ? '💄' : '🎥' }}
                </span>
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-arrow">→</span>
              </button>
            </div>

            <!-- Step 2: Vendor List -->
            <div v-if="step === 2" class="vendor-browse">
              <!-- Search & Filters -->
              <div class="search-bar">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search vendors by name..."
                  class="search-input"
                />
              </div>

              <div class="filters-row">
                <select v-model="filterCity" class="filter-select">
                  <option value="">All Cities</option>
                  <option v-for="c in citiesList" :key="c" :value="c">{{ c }}</option>
                </select>
                <select v-model="filterRating" class="filter-select">
                  <option value="">Min Rating</option>
                  <option value="4.5">★ 4.5+</option>
                  <option value="4">★ 4.0+</option>
                  <option value="3.5">★ 3.5+</option>
                </select>
                <select v-model="filterMaxPrice" class="filter-select">
                  <option value="">Max Price</option>
                  <option value="2000000">≤ Rp 2Jt</option>
                  <option value="5000000">≤ Rp 5Jt</option>
                  <option value="10000000">≤ Rp 10Jt</option>
                </select>
              </div>

              <div class="vendor-count">{{ filteredVendors.length }} vendor{{ filteredVendors.length !== 1 ? 's' : '' }} found</div>

              <!-- Vendor Cards -->
              <div class="vendor-list">
                <div v-for="v in filteredVendors" :key="v.id_vendor" class="vendor-card-full">
                  <div class="vendor-card-cover">
                    <img :src="v.cover_url" :alt="v.business_name" />
                    <span :class="['avail-badge', availabilityClass(v.availability)]">
                      {{ availabilityLabel(v.availability) }}
                    </span>
                  </div>
                  <div class="vendor-card-body">
                    <div class="vendor-card-top">
                      <div class="vendor-card-info">
                        <h3 class="vendor-card-name">{{ v.business_name }}</h3>
                        <span class="vendor-card-cat">{{ v.category }}</span>
                        <div class="vendor-card-meta">
                          <span class="v-rating">★ {{ v.average_rating.toFixed(1) }}</span>
                          <span class="v-projects">{{ v.completed_projects }} projects</span>
                        </div>
                      </div>
                      <div class="vendor-card-price">
                        <span class="v-price-start">Starting from</span>
                        <span class="v-price-value">{{ formatPrice(v.starting_price) }}</span>
                      </div>
                    </div>
                    <p class="vendor-card-desc">{{ v.description }}</p>
                    <div class="vendor-card-actions">
                      <button class="btn-outline" @click="viewPortfolio(v.id_vendor)">View Portfolio</button>
                      <button class="btn-primary" @click="addVendor(v)">Add to Booking</button>
                    </div>
                  </div>
                </div>

                <div v-if="filteredVendors.length === 0" class="no-results">
                  <p>No vendors found matching your criteria.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8ed;
  flex-shrink: 0;
}

.btn-back {
  background: none;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1d1d1f;
  cursor: pointer;
  padding: 4px 8px;
  margin-right: 12px;
}

.modal-title {
  flex: 1;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: #1d1d1f;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #86868b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-close:hover { background: #f5f5f7; }

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Step 1: Categories */
.categories-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border: 1.5px solid #e8e8ed;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: inherit;
}

.category-card:hover {
  border-color: #1d1d1f;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.cat-icon { font-size: 2rem; }
.cat-name { flex: 1; font-size: 1.1rem; font-weight: 600; color: #1d1d1f; }
.cat-arrow { font-size: 1.2rem; color: #86868b; }

/* Step 2: Browse */
.search-bar {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #d2d2d7;
  border-radius: 12px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #1d1d1f;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.filters-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 120px;
  padding: 10px 12px;
  border: 1.5px solid #d2d2d7;
  border-radius: 10px;
  font-size: 0.85rem;
  background: #fff;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #1d1d1f;
}

.vendor-count {
  font-size: 0.85rem;
  color: #86868b;
  margin-bottom: 16px;
}

.vendor-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vendor-card-full {
  border: 1.5px solid #e8e8ed;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  background: #fff;
}

.vendor-card-full:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.vendor-card-cover {
  position: relative;
  height: 140px;
  overflow: hidden;
  background: #f5f5f7;
}

.vendor-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avail-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}

.avail-available { background: #22c55e; }
.avail-limited { background: #f59e0b; }
.avail-booked { background: #ef4444; }

.vendor-card-body {
  padding: 16px;
}

.vendor-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 10px;
}

.vendor-card-info { flex: 1; }

.vendor-card-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: #1d1d1f;
}

.vendor-card-cat {
  font-size: 0.8rem;
  color: #86868b;
  display: block;
  margin-bottom: 6px;
}

.vendor-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
}

.v-rating { color: #f5b342; font-weight: 600; }
.v-projects { color: #86868b; }

.vendor-card-price {
  text-align: right;
  flex-shrink: 0;
}

.v-price-start {
  display: block;
  font-size: 0.75rem;
  color: #86868b;
}

.v-price-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1d1d1f;
}

.vendor-card-desc {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  margin: 0 0 14px;
}

.vendor-card-actions {
  display: flex;
  gap: 10px;
}

.btn-outline,
.btn-primary {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-outline {
  background: #fff;
  color: #1d1d1f;
  border: 1.5px solid #1d1d1f;
}

.btn-outline:hover {
  background: #f5f5f7;
}

.btn-primary {
  background: #1d1d1f;
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background: #2d2d2f;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #86868b;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container {
  transform: scale(0.95) translateY(10px);
}
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}

@media (max-width: 600px) {
  .modal-container { max-height: 90vh; }
  .vendor-card-cover { height: 100px; }
  .vendor-card-top { flex-direction: column; }
  .vendor-card-price { text-align: left; }
}
</style>
