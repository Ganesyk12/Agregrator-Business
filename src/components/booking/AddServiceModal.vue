<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import defaultImage from '@/assets/default/nothing.png'

interface PackageItem {
  id_package: number
  id_product?: number
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

const props = defineProps<{
  visible: boolean
  editProduct?: any
}>()
const emit = defineEmits<{
  close: []
  add: [pkg: PackageItem]
  edit: [pkg: any]
}>()

watch(() => props.visible, async (newVal) => {
  if (newVal && props.editProduct) {
    const ep = props.editProduct
    await openProductCustomizer({ id_product: ep.id_product } as PackageItem)
    
    // Pre-populate selections based on props.editProduct
    customQuantity.value = ep.quantity || 1
    
    if (ep.sizeName) {
      selectedSize.value = ep.sizeName
    }
    if (ep.selectedOptions) {
      selectedOptions.value = { ...ep.selectedOptions }
    }
    if (ep.selectedExtrasNames) {
      selectedExtras.value = [...ep.selectedExtrasNames]
    }
    if (ep.selectedVariantId != null) {
      selectedVariant.value = ep.selectedVariantId
    }
    if (ep.selectedAddonIds) {
      selectedAddons.value = new Set(ep.selectedAddonIds)
    }
  } else if (!newVal) {
    // Reset state
    step.value = 1
    selectedCategory.value = ''
    selectedProductDetails.value = null
  }
})

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
    if (catRes.ok && catJson.data) {
      const rawCategories = catJson.data || []
      const mergedNames = new Set<string>()
      const result: { name: string }[] = []
      
      for (const cat of rawCategories) {
        let normalized = cat.name
        if (cat.name === 'Make Up Artist' || cat.name.startsWith('MUA')) {
          normalized = 'MUA'
        } else if (cat.name === 'Photographer' || cat.name === 'Photography') {
          normalized = 'Photography'
        } else if (cat.name === 'Bouquet Flowers' || cat.name === 'Bouquet') {
          normalized = 'Bouquet'
        }
        
        if (!mergedNames.has(normalized)) {
          mergedNames.add(normalized)
          result.push({ name: normalized })
        }
      }
      categories.value = result
    }
  } catch {
    // fallback
  }
})

async function selectCategory(cat: string) {
  selectedCategory.value = cat
  step.value = 2
  loadingPackages.value = true
  try {
    if (cat === 'Bouquet') {
      const res = await fetch('/api/products')
      const json = await res.json()
      if (res.ok && json.data) {
        const allProducts = json.data || []
        const categoryProducts = allProducts.filter((p: any) => p.vendor?.category === 'Bouquet Flowers')
        packages.value = categoryProducts.map((p: any) => ({
          id_package: p.id_product, // unique fallback key
          id_product: p.id_product, // product id directly
          name: p.name,
          price: p.price,
          duration: null,
          description: p.description || '',
          whats_included: null,
          vendor: {
            id_vendor: p.vendor?.id_vendor || 0,
            business_name: p.vendor?.business_name || 'Vendor',
            category: p.vendor?.category || 'Bouquet Flowers',
            location: p.vendor?.location || '',
            description: '',
            status: 'active',
            years_exp: 0,
            _count: { portfolios: 0, reviews: 0 }
          },
          category: { category_name: 'Bouquet Flowers' }
        }))
      } else {
        packages.value = []
      }
    } else {
      let queryCategories: string[] = []
      if (cat === 'MUA') {
        queryCategories = ['MUA', 'MUA (Make Up Artis)', 'Make Up Artist']
      } else if (cat === 'Photography') {
        queryCategories = ['Photography', 'Photographer']
      } else {
        queryCategories = [cat]
      }
      
      const allPkgs: PackageItem[] = []
      for (const queryCat of queryCategories) {
        try {
          const res = await fetch(`/api/portfolios/packages/category/${encodeURIComponent(queryCat)}`)
          const json = await res.json()
          if (res.ok && json.data) {
            allPkgs.push(...json.data)
          }
        } catch (_) {}
      }
      packages.value = allPkgs
    }
  } catch {
    packages.value = []
  } finally {
    loadingPackages.value = false
  }
}

const selectedProductDetails = ref<any>(null)
const customQuantity = ref(1)
const selectedOptions = ref<Record<string, string>>({})
const selectedSize = ref<string | null>(null)
const selectedExtras = ref<string[]>([])
const loadingCustomizer = ref(false)
const selectedVariant = ref<number | null>(null)
const selectedAddons = ref<Set<number>>(new Set())

const isNewProduct = computed(() => {
  return selectedProductDetails.value?.option_groups?.length > 0 || selectedProductDetails.value?.option_groups
})

const customBasePrice = computed(() => selectedProductDetails.value?.price || 0)

const customVariantAdjustment = computed(() => {
  if (!isNewProduct.value && selectedVariant.value !== null) {
    const variant = (selectedProductDetails.value?.variants || []).find((v: any) => v.id_variant === selectedVariant.value)
    return variant?.price_adjust || 0
  }
  return 0
})

const customOptionsAdjustment = computed(() => {
  if (!isNewProduct.value || !selectedProductDetails.value?.option_groups) return 0
  let total = 0
  for (const [groupName, valueName] of Object.entries(selectedOptions.value)) {
    const group = selectedProductDetails.value.option_groups.find((g: any) => g.name === groupName)
    if (group) {
      const value = group.values?.find((v: any) => v.name === valueName)
      if (value) total += Number(value.price_adjust || 0)
    }
  }
  return total
})

const customSizePrice = computed(() => {
  if (!isNewProduct.value || !selectedSize.value) return 0
  const size = selectedProductDetails.value?.size_configs?.find((s: any) => s.name === selectedSize.value)
  return size ? Number(size.price || 0) : 0
})

const customExtrasTotal = computed(() => {
  if (!isNewProduct.value) {
    let total = 0
    for (const id of selectedAddons.value) {
      const addon = selectedProductDetails.value?.addons?.find((a: any) => a.id_addon === id)
      if (addon) total += Number(addon.price || 0)
    }
    return total
  }
  let total = 0
  for (const name of selectedExtras.value) {
    const extra = selectedProductDetails.value?.optional_extras?.find((e: any) => e.name === name)
    if (extra) total += Number(extra.price || 0)
  }
  return total
})

const customUnitPrice = computed(() => {
  return customBasePrice.value + customVariantAdjustment.value + customOptionsAdjustment.value + customSizePrice.value + customExtrasTotal.value
})

const customGrandTotal = computed(() => {
  return customUnitPrice.value * customQuantity.value
})

async function openProductCustomizer(p: PackageItem) {
  loadingCustomizer.value = true
  step.value = 3
  try {
    const res = await fetch(`/api/products/${p.id_product}`)
    const json = await res.json()
    if (res.ok && json.data) {
      selectedProductDetails.value = json.data
      
      // Initialize defaults
      customQuantity.value = 1
      selectedOptions.value = {}
      selectedSize.value = null
      selectedExtras.value = []
      selectedVariant.value = null
      selectedAddons.value = new Set()
      
      // Default selections for required option groups
      if (selectedProductDetails.value.option_groups) {
        for (const group of selectedProductDetails.value.option_groups) {
          if (group.is_required && group.values?.length) {
            selectedOptions.value[group.name] = group.values[0].name
          }
        }
      }
      
      // Default size
      if (selectedProductDetails.value.size_configs?.length) {
        selectedSize.value = selectedProductDetails.value.size_configs[0].name
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loadingCustomizer.value = false
  }
}

function goBack() {
  if (props.editProduct) {
    emit('close')
    return
  }
  if (step.value === 3) {
    step.value = 2
    selectedProductDetails.value = null
    return
  }
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
  if (p.id_product || selectedCategory.value === 'Bouquet') {
    openProductCustomizer(p)
  } else {
    emit('add', p)
  }
}

function confirmAddProduct() {
  if (!selectedProductDetails.value) return
  
  const p = selectedProductDetails.value
  
  const optsText: string[] = []
  if (selectedSize.value) {
    optsText.push(`Size: ${selectedSize.value}`)
  }
  for (const [groupName, valueName] of Object.entries(selectedOptions.value)) {
    optsText.push(`${groupName}: ${valueName}`)
  }
  if (!isNewProduct.value && selectedVariant.value !== null) {
    const v = (p.variants || []).find((x: any) => x.id_variant === selectedVariant.value)
    if (v) optsText.push(`Variant: ${v.name}`)
  }
  
  const extrasList: any[] = []
  const selectedExtrasNames: string[] = []
  if (isNewProduct.value) {
    for (const name of selectedExtras.value) {
      const extra = p.optional_extras?.find((e: any) => e.name === name)
      if (extra) {
        extrasList.push({
          id: String(extra.id_optional_extra),
          name: extra.name,
          price: Number(extra.price),
          icon: '💐',
          selected: true
        })
        selectedExtrasNames.push(extra.name)
      }
    }
  } else {
    for (const id of selectedAddons.value) {
      const a = p.addons?.find((x: any) => x.id_addon === id)
      if (a) {
        extrasList.push({
          id: String(id),
          name: a.name,
          price: Number(a.price),
          icon: '➕',
          selected: true
        })
      }
    }
  }

  const customizedItem: any = {
    id_package: undefined,
    id_product: p.id_product,
    name: p.name + (optsText.length > 0 ? ` (${optsText.join(', ')})` : ''),
    price: customUnitPrice.value,
    duration: null,
    description: p.description || '',
    whats_included: null,
    vendor: {
      id_vendor: p.vendor?.id_vendor || 0,
      business_name: p.vendor?.business_name || 'Vendor',
      category: p.vendor?.category || 'Bouquet Flowers',
      location: p.vendor?.location || '',
      description: '',
      status: 'active',
      years_exp: 0,
      _count: { portfolios: 0, reviews: 0 }
    },
    category: { category_name: 'Bouquet Flowers' },
    quantity: customQuantity.value,
    extras: extrasList,
    
    // Save raw configuration details for editing later
    rawConfig: {
      id_product: p.id_product,
      quantity: customQuantity.value,
      sizeName: selectedSize.value,
      selectedOptions: { ...selectedOptions.value },
      selectedExtrasNames,
      selectedVariantId: selectedVariant.value,
      selectedAddonIds: Array.from(selectedAddons.value)
    }
  }
  
  if (props.editProduct) {
    emit('edit', customizedItem)
  } else {
    emit('add', customizedItem)
  }
}

function toggleExtraName(name: string) {
  if (selectedExtras.value.includes(name)) {
    selectedExtras.value = selectedExtras.value.filter(e => e !== name)
  } else {
    selectedExtras.value = [...selectedExtras.value, name]
  }
}

function toggleAddonId(id: number) {
  const s = new Set(selectedAddons.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedAddons.value = s
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
            <button v-if="step === 2 || step === 3" class="btn-back" @click="goBack">← Back</button>
            <h2 class="modal-title">
              {{ step === 1 ? 'Choose Service Category' : step === 2 ? `${selectedCategory} Packages` : 'Customize Product' }}
            </h2>
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
                  {{ cat.name === 'Photography' ? '📷' : cat.name === 'Videography' ? '🎥' : cat.name === 'MUA' ? '💄' : cat.name === 'Bouquet' ? '💐' : cat.name === 'Catering' ? '🍳' : cat.name === 'Decoration' ? '🏰' : '✨' }}
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

            <!-- Step 3: Product Customizer -->
            <div v-if="step === 3" class="product-customizer">
              <div v-if="loadingCustomizer" class="loading-state">
                <div class="spinner"></div>
                <p>Loading product details...</p>
              </div>
              <div v-else-if="selectedProductDetails" class="customizer-layout">
                <!-- Left side: image / gallery -->
                <div class="customizer-gallery">
                  <img :src="selectedProductDetails.images?.[0]?.image_url || defaultImage" :alt="selectedProductDetails.name" class="main-image" />
                </div>
                
                <!-- Right side: customization controls -->
                <div class="customizer-info">
                  <h3 class="product-name">{{ selectedProductDetails.name }}</h3>
                  <p class="product-price">
                    {{ formatPrice(customGrandTotal) }}
                    <span class="price-unit" v-if="customQuantity > 1">({{ formatPrice(customUnitPrice) }} / unit)</span>
                  </p>
                  <p class="product-desc">{{ selectedProductDetails.description }}</p>
                  
                  <!-- Size configs -->
                  <div v-if="selectedProductDetails.size_configs?.length" class="section">
                    <h4 class="section-title">Size</h4>
                    <div class="variant-list">
                      <button
                        v-for="size in selectedProductDetails.size_configs"
                        :key="size.name"
                        :class="['variant-btn', { active: selectedSize === size.name }]"
                        @click="selectedSize = size.name"
                      >
                        <span class="variant-name">{{ size.name }}</span>
                        <span v-if="size.price > 0" class="variant-price">{{ formatPrice(size.price) }}</span>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Option groups -->
                  <template v-if="isNewProduct">
                    <div v-for="group in (selectedProductDetails.option_groups || [])" :key="group.name" class="section">
                      <h4 class="section-title">{{ group.name }} <span v-if="group.is_required" class="required-star">*</span></h4>
                      <div class="variant-list">
                        <button
                          v-for="val in (group.values || [])"
                          :key="val.name"
                          :class="['variant-btn', { active: selectedOptions[group.name] === val.name }]"
                          @click="selectedOptions[group.name] = val.name"
                        >
                          <span class="variant-name">{{ val.name }}</span>
                          <span v-if="val.price_adjust > 0" class="variant-price">+{{ formatPrice(val.price_adjust) }}</span>
                        </button>
                      </div>
                    </div>
                    
                    <!-- Optional Extras -->
                    <div v-if="selectedProductDetails.optional_extras?.length" class="section">
                      <h4 class="section-title">Optional Extras</h4>
                      <div class="addon-list">
                        <label v-for="extra in selectedProductDetails.optional_extras" :key="extra.name" class="addon-item">
                          <input type="checkbox" :checked="selectedExtras.includes(extra.name)" @change="toggleExtraName(extra.name)" />
                          <span class="addon-name">{{ extra.name }}</span>
                          <span class="addon-price">+{{ formatPrice(extra.price) }}</span>
                        </label>
                      </div>
                    </div>
                  </template>
                  
                  <!-- Old System Variants & Addons -->
                  <template v-else>
                    <div v-if="selectedProductDetails.variants?.length" class="section">
                      <h4 class="section-title">Variants</h4>
                      <div class="variant-list">
                        <button
                          v-for="v in selectedProductDetails.variants"
                          :key="v.id_variant"
                          :class="['variant-btn', { active: selectedVariant === v.id_variant }]"
                          @click="selectedVariant = selectedVariant === v.id_variant ? null : v.id_variant"
                        >
                          <span class="variant-name">{{ v.name }}</span>
                          <span v-if="v.price_adjust > 0" class="variant-price">+{{ formatPrice(v.price_adjust) }}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="selectedProductDetails.addons?.length" class="section">
                      <h4 class="section-title">Add-ons</h4>
                      <div class="addon-list">
                        <label v-for="a in selectedProductDetails.addons" :key="a.id_addon" class="addon-item">
                          <input type="checkbox" :checked="selectedAddons.has(a.id_addon)" @change="toggleAddonId(a.id_addon)" />
                          <span class="addon-name">{{ a.name }}</span>
                          <span class="addon-price">+{{ formatPrice(a.price) }}</span>
                        </label>
                      </div>
                    </div>
                  </template>
                  
                  <!-- Quantity Selector -->
                  <div class="section quantity-section">
                    <h4 class="section-title">Quantity</h4>
                    <div class="quantity-selector">
                      <button @click="customQuantity = Math.max(1, customQuantity - 1)" :disabled="customQuantity <= 1">-</button>
                      <span>{{ customQuantity }}</span>
                      <button @click="customQuantity = customQuantity + 1">+</button>
                    </div>
                  </div>
                  
                  <!-- Add Button -->
                  <div class="action-section">
                    <button class="btn-confirm-add" @click="confirmAddProduct">Confirm & Add to Booking</button>
                  </div>
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

/* Step 3: Product Customizer */
.product-customizer {
  padding: 8px 0;
}
.customizer-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
}
.customizer-gallery img.main-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e8e8ed;
}
.customizer-info .product-name {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
}
.customizer-info .product-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px;
}
.customizer-info .price-unit {
  font-size: 0.85rem;
  font-weight: 400;
  color: #86868b;
  margin-left: 6px;
}
.customizer-info .product-desc {
  font-size: 0.9rem;
  color: #515154;
  line-height: 1.5;
  margin-bottom: 20px;
}
.customizer-info .section {
  margin-bottom: 20px;
}
.customizer-info .section-title {
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1d1d1f;
  margin: 0 0 10px;
}
.customizer-info .required-star {
  color: #e44;
}
.customizer-info .variant-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.customizer-info .variant-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border: 1.5px solid #e8e8ed;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.customizer-info .variant-btn:hover {
  border-color: #ccc;
}
.customizer-info .variant-btn.active {
  border-color: #1d1d1f;
  background: rgba(0, 0, 0, 0.02);
}
.customizer-info .variant-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}
.customizer-info .variant-price {
  font-size: 0.75rem;
  color: #86868b;
  margin-top: 2px;
}
.customizer-info .addon-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.customizer-info .addon-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1.5px solid #e8e8ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.customizer-info .addon-item:hover {
  border-color: #ccc;
}
.customizer-info .addon-item input {
  accent-color: #1d1d1f;
}
.customizer-info .addon-name {
  flex: 1;
  font-size: 0.85rem;
  color: #333;
}
.customizer-info .addon-price {
  font-size: 0.85rem;
  color: #1d1d1f;
  font-weight: 600;
}
.customizer-info .quantity-selector {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid #d2d2d7;
  border-radius: 10px;
  overflow: hidden;
}
.customizer-info .quantity-selector button {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f7;
  cursor: pointer;
  font-size: 1.1rem;
  color: #1d1d1f;
  transition: all 0.2s;
}
.customizer-info .quantity-selector button:hover {
  background: #e8e8ed;
}
.customizer-info .quantity-selector button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.customizer-info .quantity-selector span {
  width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
}
.customizer-info .action-section {
  margin-top: 28px;
}
.customizer-info .btn-confirm-add {
  width: 100%;
  padding: 14px;
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.customizer-info .btn-confirm-add:hover {
  background: #2d2d2f;
}
@media (max-width: 768px) {
  .customizer-layout {
    grid-template-columns: 1fr;
  }
}
</style>
