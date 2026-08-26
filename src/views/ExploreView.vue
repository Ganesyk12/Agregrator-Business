<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import defaultImage from '@/assets/default/nothing.png'

const router = useRouter()

const props = withDefaults(defineProps<{
  defaultTab?: string
}>(), {
  defaultTab: 'vendors'
})

const activeTab = ref<'inspirations' | 'vendors'>(props.defaultTab === 'inspirations' ? 'inspirations' : 'vendors')
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)
const selectedSort = ref('popular')

const categories = [
  { id: 'all', name: 'All', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'Photography', name: 'Photography', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { id: 'Makeup Artist', name: 'Makeup Artist', icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' },
  { id: 'Bouquet Flowers', name: 'Bouquet Flowers', icon: 'M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 7v14 M9 10.5c-2.5 0-4.5 1.5-4.5 4 0 1 .5 2 1.5 2.5L12 20l6-3c1-.5 1.5-1.5 1.5-2.5 0-2.5-2-4-4.5-4 M7 14c-1.5 0-3 1-3 3 M17 14c1.5 0 3 1 3 3' }
]

const sortOptions = [
  { id: 'popular', name: 'Popular' },
  { id: 'newest', name: 'Newest' },
  { id: 'highest-rated', name: 'Highest Rated' },
  { id: 'trending', name: 'Trending' }
]

const allInspirations = ref<any[]>([])
const allVendors = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [venRes, porRes, prodRes, pkgRes] = await Promise.all([
      fetch('/api/vendors'),
      fetch('/api/portfolios'),
      fetch('/api/products'),
      fetch('/api/packages')
    ])
    const venJson = await venRes.json()
    const porJson = await porRes.json()
    const prodJson = await prodRes.json()
    const pkgJson = await pkgRes.json()
    const vendors = venJson.data || []
    const portfolios = porJson.data || []
    const products = prodJson.data || []
    const packages = pkgJson.data || []

    allVendors.value = vendors
      .filter((v: any) => v.status !== 'inactive')
      .map((v: any) => {
        const vendorPkgs = packages.filter((pkg: any) => pkg.id_vendor === v.id_vendor && pkg.status === 'active')
        const vendorProds = products.filter((prod: any) => prod.id_vendor === v.id_vendor && prod.status === 'active')
        const prices = [...vendorPkgs.map((p: any) => p.price), ...vendorProds.map((p: any) => p.price)]
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0

        return {
          id: v.id_vendor,
          name: v.business_name,
          category: v.category,
          location: v.location || '',
          rating: 0,
          reviews: 0,
          startingPrice: minPrice,
          image: v.avatar_url || '',
          logo: (v.business_name || 'V')[0],
          verified: v.status === 'verified'
        }
      })

    const portfolioInspirations = portfolios
      .filter((p: any) => p.vendor?.status !== 'inactive')
      .map((p: any) => ({
        id: p.id_portfolio,
        image: p.cover_url || defaultImage,
        occasion: p.label || p.title || 'Creative',
        style: p.vendor?.category || 'Creative',
        caption: p.title || p.description || '',
        budget: p.package?.price ? `Rp ${p.package.price.toLocaleString('id-ID')}` : '',
        saved: false,
        height: 'medium' as const,
        vendor: p.vendor?.business_name || '',
        category: p.vendor?.category || '',
        source: 'portfolio' as const
      }))

    const productInspirations = products
      .filter((pr: any) => pr.vendor?.status !== 'inactive')
      .map((pr: any) => ({
        id: `product-${pr.id_product}`,
        image: pr.images?.[0]?.image_url || defaultImage,
        occasion: pr.occasion?.name || pr.labels || 'Bouquet',
        style: 'Bouquet Flowers',
        caption: pr.name || '',
        budget: pr.price ? `Rp ${pr.price.toLocaleString('id-ID')}` : '',
        saved: false,
        height: 'medium' as const,
        vendor: pr.vendor?.business_name || '',
        category: 'Bouquet Flowers',
        source: 'product' as const
      }))

    allInspirations.value = [...portfolioInspirations, ...productInspirations]
  } catch {
    // API unavailable — stay empty
  } finally {
    loading.value = false
  }
})

const filteredVendors = computed(() => {
  let result = allVendors.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    result = result.filter(v => v.category === selectedCategory.value)
  }
  if (selectedSort.value === 'highest-rated') {
    result = [...result].sort((a, b) => b.rating - a.rating)
  } else if (selectedSort.value === 'newest') {
    result = [...result].reverse()
  }
  return result
})

const filteredInspirations = computed(() => {
  let result = allInspirations.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i =>
      i.caption.toLowerCase().includes(q) ||
      i.occasion.toLowerCase().includes(q) ||
      i.style.toLowerCase().includes(q) ||
      (i.vendor || '').toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value && selectedCategory.value !== 'all') {
    result = result.filter(i => i.category === selectedCategory.value)
  }
  return result
})

function toggleSave(id: number | string) {
  const idx = allInspirations.value.findIndex(i => i.id === id)
  if (idx !== -1) allInspirations.value[idx].saved = !allInspirations.value[idx].saved
}

function getGridClass(height: string) {
  if (height === 'tall') return 'grid-tall'
  if (height === 'short') return 'grid-short'
  return 'grid-medium'
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}

function goToVendor(id: number) {
  router.push(`/vendor/${id}`)
}

function goToInspiration(id: number | string) {
  if (typeof id === 'string' && id.startsWith('product-')) {
    const productId = id.replace('product-', '')
    router.push(`/product/${productId}`)
  } else {
    router.push(`/inspiration/${id}`)
  }
}

</script>

<template>
  <div class="explore-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="explore-hero">
      <div class="container">
        <div class="explore-header">
          <h1 class="explore-title">Explore</h1>
          <p class="explore-subtitle">Discover inspirations and trusted vendors for your special moments</p>
        </div>

        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by vendor, location, occasion, or style..."
          />
        </div>

        <div class="explore-tabs">
          <button
            class="explore-tab"
            :class="{ active: activeTab === 'vendors' }"
            @click="activeTab = 'vendors'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Vendors
          </button>
          <button
            class="explore-tab"
            :class="{ active: activeTab === 'inspirations' }"
            @click="activeTab = 'inspirations'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Inspirations
          </button>
        </div>
      </div>
    </div>

    <div class="explore-filters">
      <div class="container">
        <div class="filter-row">
          <div class="category-filters">
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="category-chip"
              :class="{ active: selectedCategory === cat.id || (!selectedCategory && cat.id === 'all') }"
              @click="selectedCategory = cat.id === 'all' ? null : cat.id"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path :d="cat.icon"/>
              </svg>
              {{ cat.name }}
            </button>
          </div>
          <div class="sort-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M6 12h12M10 18h4"/>
            </svg>
            <select v-model="selectedSort" class="sort-select">
              <option v-for="opt in sortOptions" :key="opt.id" :value="opt.id">{{ opt.name }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="explore-content">
      <div class="container">
        <div v-if="activeTab === 'vendors'" class="vendors-grid">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            class="vendor-card"
            @click="goToVendor(vendor.id)"
          >
            <div class="vendor-card-image">
              <img v-if="vendor.image" :src="vendor.image" :alt="vendor.name" />
              <div v-else class="vendor-card-placeholder">
                <span>{{ vendor.logo }}</span>
              </div>
              <div class="vendor-card-badge">{{ vendor.category }}</div>
              <div v-if="vendor.verified" class="vendor-verified-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Verified
              </div>
            </div>
            <div class="vendor-card-body">
              <div class="vendor-card-header">
                <div class="vendor-logo">{{ vendor.logo }}</div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ vendor.name }}</h3>
                  <span class="vendor-category">{{ vendor.category }}</span>
                </div>
              </div>
              <div class="vendor-meta">
                <span class="vendor-location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ vendor.location }}
                </span>
                <span class="vendor-rating">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {{ vendor.rating }} ({{ vendor.reviews }})
                </span>
              </div>
              <div class="vendor-price">
                <span class="price-label">Starting from</span>
                <span class="price-value">{{ formatPrice(vendor.startingPrice) }}</span>
              </div>
              <button class="vendor-cta" @click="goToVendor(vendor.id)">{{ vendor.category === 'Bouquet Flowers' ? 'View Products' : 'View Vendor' }}</button>
            </div>
          </div>
          <div v-if="filteredVendors.length === 0" class="empty-state">
            <p>No vendors found matching your criteria.</p>
          </div>
        </div>

        <div v-if="activeTab === 'inspirations'" class="inspiration-grid">
          <div
            v-for="item in filteredInspirations"
            :key="item.id"
            class="inspiration-card"
            :class="[getGridClass(item.height)]"
            @click="goToInspiration(item.id)"
          >
            <div class="card-image">
              <img :src="item.image" :alt="item.caption" loading="lazy" @error="onImgError" />
              <div class="card-image-overlay"></div>
              <div class="card-tags">
                <span class="tag occasion-tag">{{ item.occasion }}</span>
                <span class="tag style-tag">{{ item.style }}</span>
              </div>
              <button
                class="save-btn"
                :class="{ saved: item.saved }"
                @click.stop="toggleSave(item.id)"
              >
                <svg v-if="!item.saved" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
            <div class="card-body">
              <p class="card-caption">{{ item.caption }}</p>
              <div class="card-footer-info">
                <span class="card-budget">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h6a2 2 0 0 1 0 4H8"/>
                  </svg>
                  {{ item.budget }}
                </span>
                <span class="card-link">
                  View Details
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div v-if="filteredInspirations.length === 0" class="empty-state">
            <p>No inspirations found matching your criteria.</p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.explore-page {
  min-height: 100vh;
  background: var(--bs-body-bg, #F7F4EF);
}

.explore-hero {
  background: #fff;
  padding: 120px 0 40px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.explore-header {
  text-align: center;
  margin-bottom: 32px;
}

.explore-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 3rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 12px;
  line-height: 1.15;
}

.explore-subtitle {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0;
}

.search-bar {
  position: relative;
  max-width: 600px;
  margin: 0 auto 32px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--bs-body-color, #5a5a5a);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 52px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  color: var(--bs-black, #2a2a2a);
  background: var(--bs-body-bg, #F7F4EF);
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: var(--bs-secondary, #B89C7B);
  background: #fff;
  box-shadow: 0 4px 20px rgba(184, 156, 123, 0.15);
}

.search-input::placeholder {
  color: #b0b0b0;
}

.explore-tabs {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.explore-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  background: transparent;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--bs-body-color, #5a5a5a);
  cursor: pointer;
  transition: all 0.3s ease;
}

.explore-tab:hover {
  border-color: var(--bs-secondary, #B89C7B);
  color: var(--bs-secondary, #B89C7B);
}

.explore-tab.active {
  background: var(--bs-black, #2a2a2a);
  border-color: var(--bs-black, #2a2a2a);
  color: #fff;
}

.explore-filters {
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding: 16px 0;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.category-filters {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
  flex-grow: 1;
  min-width: 0;
}

.category-filters::-webkit-scrollbar {
  display: none;
}

.category-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  background: transparent;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--bs-body-color, #5a5a5a);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-chip:hover {
  border-color: var(--bs-secondary, #B89C7B);
  color: var(--bs-secondary, #B89C7B);
}

.category-chip.active {
  background: rgba(184, 156, 123, 0.1);
  border-color: var(--bs-secondary, #B89C7B);
  color: var(--bs-secondary, #B89C7B);
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  color: var(--bs-body-color, #5a5a5a);
  flex-shrink: 0;
}

.sort-select {
  border: none;
  background: transparent;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--bs-black, #2a2a2a);
  outline: none;
  cursor: pointer;
}

.explore-content {
  padding: 40px 0 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Vendors Grid */
.vendors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.vendor-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.vendor-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.vendor-card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.vendor-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vendor-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #e0b3b3, #c96f6f);
}
.vendor-card-placeholder span {
  text-transform: uppercase;
  opacity: 0.85;
}

.vendor-card:hover .vendor-card-image img {
  transform: scale(1.08);
}

.vendor-card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 999px;
}

.vendor-verified-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(249, 115, 22, 0.9);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.vendor-card-body {
  padding: 20px;
}

.vendor-card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.vendor-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Marcellus', serif;
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
}

.vendor-info {
  flex: 1;
  min-width: 0;
}

.vendor-name {
  font-family: 'Marcellus', serif;
  font-size: 1.05rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 2px;
  line-height: 1.2;
}

.vendor-category {
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  color: var(--bs-secondary, #B89C7B);
  font-weight: 500;
}

.vendor-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  color: var(--bs-body-color, #5a5a5a);
}

.vendor-location,
.vendor-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.vendor-location svg,
.vendor-rating svg {
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.vendor-price {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.price-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  color: var(--bs-body-color, #5a5a5a);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.price-value {
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--bs-black, #2a2a2a);
}

.vendor-cta {
  width: 100%;
  padding: 10px;
  border: 2px solid var(--bs-black, #2a2a2a);
  border-radius: 12px;
  background: transparent;
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bs-black, #2a2a2a);
  cursor: pointer;
  transition: all 0.3s ease;
}

.vendor-cta:hover {
  background: var(--bs-black, #2a2a2a);
  color: #fff;
}

/* Inspiration Grid */
.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 10px;
  gap: 20px;
}

.inspiration-card {
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  break-inside: avoid;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.inspiration-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
}

.grid-tall { grid-row-end: span 16; }
.grid-medium { grid-row-end: span 12; }
.grid-short { grid-row-end: span 10; }

.card-image {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.grid-tall .card-image { aspect-ratio: 3/4; }
.grid-medium .card-image { aspect-ratio: 4/3; }
.grid-short .card-image { aspect-ratio: 1/1; }

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.inspiration-card:hover .card-image img {
  transform: scale(1.06);
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.5) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.inspiration-card:hover .card-image-overlay {
  opacity: 1;
}

.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.tag {
  display: inline-block;
  font-family: 'Jost', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.occasion-tag {
  background: rgba(184, 156, 123, 0.9);
  color: #fff;
  backdrop-filter: blur(4px);
}

.style-tag {
  background: rgba(255, 255, 255, 0.85);
  color: var(--bs-black, #2a2a2a);
  backdrop-filter: blur(4px);
}

.save-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: var(--bs-black, #2a2a2a);
}

.inspiration-card:hover .save-btn {
  opacity: 1;
  transform: translateY(0);
}

.save-btn:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.save-btn.saved {
  opacity: 1;
  transform: translateY(0);
  background: #f97316;
  color: #fff;
}

.card-body {
  padding: 14px 16px 16px;
}

.card-caption {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 10px;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-budget {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  color: var(--bs-body-color, #5a5a5a);
  font-weight: 500;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Jost', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--bs-secondary, #B89C7B);
  transition: all 0.3s ease;
}

.inspiration-card:hover .card-link {
  gap: 8px;
  color: var(--bs-black, #2a2a2a);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: var(--bs-body-color, #5a5a5a);
  font-family: 'Jost', sans-serif;
}

@media (max-width: 1200px) {
  .vendors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .explore-hero {
    padding: 100px 0 32px;
  }

  .explore-title {
    font-size: 2.2rem;
  }

  .vendors-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inspiration-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .category-filters {
    justify-content: flex-start;
  }

  .sort-wrapper {
    justify-content: flex-start;
    padding: 8px 12px;
  }
}

@media (max-width: 576px) {
  .explore-hero {
    padding: 80px 0 24px;
  }

  .explore-title {
    font-size: 1.8rem;
  }

  .explore-tab {
    padding: 10px 20px;
    font-size: 0.85rem;
  }

  .vendors-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .inspiration-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .grid-tall,
  .grid-medium,
  .grid-short {
    grid-row-end: span 10;
  }

  .container {
    padding: 0 16px;
  }
}
</style>