<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

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

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; add: [pkg: PackageItem] }>()

const categories = ref<{ name: string }[]>([])
const packages = ref<PackageItem[]>([])
const loadingPackages = ref(false)
const step = ref(1)
const selectedCategory = ref('')
const searchQuery = ref('')
const filterMaxPrice = ref('')

const filteredPackages = computed(() => {
  let result = packages.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) =>
      p.vendor.business_name.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q)
    )
  }
  if (filterMaxPrice.value) result = result.filter((p) => p.price <= Number(filterMaxPrice.value))
  return result
})

onMounted(async () => {
  try {
    const catRes = await fetch('/api/portfolios/vendors/categories')
    const catJson = await catRes.json()
    if (catRes.ok) categories.value = catJson.data
  } catch {
    // fallback
  }
})

async function selectCategory(cat: string) {
  selectedCategory.value = cat
  step.value = 2
  loadingPackages.value = true
  try {
    const res = await fetch(`/api/portfolios/packages/category/${encodeURIComponent(cat)}`)
    const json = await res.json()
    if (res.ok) packages.value = json.data
  } catch {
    packages.value = []
  } finally {
    loadingPackages.value = false
  }
}

function goBack() {
  step.value = 1
  selectedCategory.value = ''
  searchQuery.value = ''
  filterMaxPrice.value = ''
  packages.value = []
}

function viewPortfolio(vendorId: number) {
  window.open(`/portfolio/${vendorId}`, '_blank')
}

function addPackage(p: PackageItem) {
  emit('add', p)
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

function groupByVendor(pkgs: PackageItem[]) {
  const map = new Map<number, { vendor: PackageItem['vendor']; packages: PackageItem[] }>()
  for (const p of pkgs) {
    if (!map.has(p.vendor.id_vendor)) {
      map.set(p.vendor.id_vendor, { vendor: p.vendor, packages: [] })
    }
    map.get(p.vendor.id_vendor)!.packages.push(p)
  }
  return Array.from(map.values())
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-container">
          <div class="modal-header">
            <button v-if="step === 2" class="btn-back" @click="goBack">← Back</button>
            <h2 class="modal-title">{{ step === 1 ? 'Choose Service Category' : `${selectedCategory} Packages` }}</h2>
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

            <!-- Step 2: Package List -->
            <div v-if="step === 2" class="vendor-browse">
              <div class="search-bar">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by vendor or package name..."
                  class="search-input"
                />
              </div>

              <div class="filters-row">
                <select v-model="filterMaxPrice" class="filter-select">
                  <option value="">Max Price</option>
                  <option value="2000000">≤ Rp 2Jt</option>
                  <option value="5000000">≤ Rp 5Jt</option>
                  <option value="10000000">≤ Rp 10Jt</option>
                </select>
              </div>

              <div v-if="loadingPackages" class="loading-state">
                <div class="spinner"></div>
                <p>Loading packages...</p>
              </div>

              <template v-else>
                <div class="vendor-count">{{ filteredPackages.length }} package{{ filteredPackages.length !== 1 ? 's' : '' }} found</div>

                <div class="package-list">
                  <div v-for="(group, idx) in groupByVendor(filteredPackages)" :key="idx" class="vendor-group">
                    <div class="vendor-group-header">
                      <span class="vendor-group-avatar">{{ group.vendor.business_name.charAt(0) }}</span>
                      <div class="vendor-group-info">
                        <h3 class="vendor-group-name">{{ group.vendor.business_name }}</h3>
                        <span class="vendor-group-location">{{ group.vendor.location }}</span>
                      </div>
                      <button class="btn-outline-sm" @click="viewPortfolio(group.vendor.id_vendor)">View Portfolio</button>
                    </div>
                    <div class="vendor-group-packages">
                      <div v-for="pkg in group.packages" :key="pkg.id_package" class="package-card" @click="addPackage(pkg)">
                        <div class="package-info">
                          <h4 class="package-name">{{ pkg.name }}</h4>
                          <span class="package-duration" v-if="pkg.duration">⏱ {{ pkg.duration }}</span>
                          <p class="package-desc" v-if="pkg.description">{{ pkg.description }}</p>
                        </div>
                        <div class="package-right">
                          <span class="package-price">{{ formatPrice(pkg.price) }}</span>
                          <button class="btn-add-pkg">+ Add</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="filteredPackages.length === 0" class="no-results">
                  <p>No packages found matching your criteria.</p>
                </div>
              </template>
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

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #86868b;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e8e8ed;
  border-top-color: #1d1d1f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.package-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.vendor-group {
  background: #fff;
  border: 1.5px solid #e8e8ed;
  border-radius: 14px;
  overflow: hidden;
}

.vendor-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.vendor-group-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1d1d1f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.vendor-group-info { flex: 1; }

.vendor-group-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #1d1d1f;
}

.vendor-group-location {
  font-size: 0.8rem;
  color: #86868b;
}

.btn-outline-sm {
  padding: 6px 14px;
  border: 1.5px solid #1d1d1f;
  border-radius: 8px;
  background: #fff;
  color: #1d1d1f;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.btn-outline-sm:hover {
  background: #f5f5f7;
}

.vendor-group-packages {
  display: flex;
  flex-direction: column;
}

.package-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f7;
  cursor: pointer;
  transition: background 0.15s;
}

.package-card:last-child { border-bottom: none; }

.package-card:hover {
  background: #f8f8fa;
}

.package-info { flex: 1; }

.package-name {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 2px;
  color: #1d1d1f;
}

.package-duration {
  font-size: 0.8rem;
  color: #86868b;
  display: inline-block;
  margin-bottom: 4px;
}

.package-desc {
  font-size: 0.8rem;
  color: #555;
  margin: 4px 0 0;
  line-height: 1.4;
}

.package-right {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
}

.package-price {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.btn-add-pkg {
  padding: 6px 16px;
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-add-pkg:hover {
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
  .package-card { flex-direction: column; align-items: flex-start; gap: 8px; }
  .package-right { margin-left: 0; text-align: left; width: 100%; display: flex; justify-content: space-between; align-items: center; }
}
</style>
