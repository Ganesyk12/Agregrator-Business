<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import ReviewCard from '@/components/portfolio/ReviewCard.vue'
import defaultImage from '@/assets/default/nothing.png'

const route = useRoute()
const router = useRouter()

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}
const vendor = ref<any>(null)
const vendorPackages = ref<any[]>([])
const vendorPortfolios = ref<any[]>([])
const vendorProducts = ref<any[]>([])
const reviews = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'services' | 'portfolio' | 'reviews'>('services')

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isBouquetVendor = computed(() => vendor.value?.category === 'Bouquet Flowers')

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc: number, r: any) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const groupedPackages = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const pkg of vendorPackages.value) {
    const cat = pkg.category?.category_name || 'General'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(pkg)
  }
  return groups
})

const categoryList = computed(() => Object.keys(groupedPackages.value))

async function fetchVendorProfile() {
  try {
    const id = route.params.id

    const vendorRes = await fetch(`${apiUrl}/api/vendors/${id}`)
    const vendorJson = await vendorRes.json()
    if (!vendorRes.ok) throw new Error(vendorJson.error?.message || 'Vendor not found')
    vendor.value = vendorJson.data

    if (vendor.value?.category === 'Bouquet Flowers') {
      const prodRes = await fetch(`${apiUrl}/api/products/vendor/${id}`)
      if (prodRes.ok) {
        const prodJson = await prodRes.json()
        vendorProducts.value = prodJson.data || []
      }
    } else {
      const infoRes = await fetch(`${apiUrl}/api/portfolios/vendor/${id}/info`)
      const infoJson = await infoRes.json()
      if (infoRes.ok) {
        vendorPackages.value = infoJson.data.packages || []
        reviews.value = infoJson.data.reviews || []
      }
    }

    const portfolioRes = await fetch(`${apiUrl}/api/portfolios/vendor/${id}`)
    const portfolioJson = await portfolioRes.json()
    if (portfolioRes.ok) vendorPortfolios.value = portfolioJson.data || []

  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function goToPortfolio(id: number) {
  router.push(`/portfolio/${id}`)
}

function formatPrice(value: number) {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function handleBookPackage(pkg: any) {
  if (!vendor.value) return
  localStorage.setItem('sigyn_booking_config', JSON.stringify({
    vendorId: vendor.value.id_vendor,
    packageId: pkg.id_package,
    packageName: pkg.name,
    packagePrice: pkg.price,
  }))
  router.push('/booking')
}

function goToProduct(id: number) {
  router.push(`/product/${id}`)
}

onMounted(fetchVendorProfile)
</script>

<template>
  <div class="vendor-profile">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading vendor profile...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Oops!</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="btn-back">Back to Home</router-link>
    </div>

    <div v-else-if="vendor" class="profile-content">
      <!-- Vendor Hero -->
      <section class="vendor-hero">
        <div class="container">
          <div class="vendor-hero-inner">
            <div class="vendor-avatar-large">
              <img v-if="vendor.avatar_url" :src="vendor.avatar_url" :alt="vendor.business_name" />
              <span v-else class="avatar-text">{{ vendor.business_name?.charAt(0) || 'V' }}</span>
            </div>
            <div class="vendor-hero-info">
              <h1 class="vendor-business-name">{{ vendor.business_name }}</h1>
              <div class="vendor-badge" v-if="vendor.status === 'active' || vendor.status === 'verified'">
                <span class="verified-badge">Verified</span>
              </div>
              <div class="vendor-meta">
                <span class="meta-item">
                  <strong>★</strong> {{ averageRating }} ({{ reviews.length }} reviews)
                </span>
                <span class="meta-sep">|</span>
                <span class="meta-item">{{ vendorPortfolios.length }} Projects</span>
                <span class="meta-sep">|</span>
                <span class="meta-item">{{ vendor.years_exp || 0 }} Years Experience</span>
              </div>
              <p class="vendor-description" v-if="vendor.description">{{ vendor.description }}</p>
              <p class="vendor-location" v-if="vendor.location">
                📍 {{ vendor.location }}
              </p>
              <p class="vendor-instagram" v-if="vendor.instagram">
                <a :href="vendor.instagram" target="_blank" rel="noopener noreferrer">
                  📷 {{ vendor.instagram.replace('https://instagram.com/', '@') }}
                </a>
              </p>
              <div class="price-range" v-if="!isBouquetVendor && vendorPackages.length > 0">
                <span class="price-range-label">Price Range</span>
                <span class="price-range-value">
                  {{ formatPrice(Math.min(...vendorPackages.map(p => p.price))) }} 
                  - {{ formatPrice(Math.max(...vendorPackages.map(p => p.price))) }}
                </span>
              </div>
              <div class="price-range" v-if="isBouquetVendor && vendorProducts.length > 0">
                <span class="price-range-label">Products</span>
                <span class="price-range-value">{{ vendorProducts.length }} Items</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <section class="tabs-section">
        <div class="container">
          <div class="tabs-nav">
            <button
              :class="['tab-btn', { active: activeTab === 'services' }]"
              @click="activeTab = 'services'"
            >
              {{ isBouquetVendor ? 'Products' : 'Services' }} ({{ isBouquetVendor ? vendorProducts.length : vendorPackages.length }})
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'portfolio' }]"
              @click="activeTab = 'portfolio'"
            >
              Portfolio ({{ vendorPortfolios.length }})
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'reviews' }]"
              @click="activeTab = 'reviews'"
            >
              Reviews ({{ reviews.length }})
            </button>
          </div>
        </div>
      </section>

      <!-- Services / Packages by Category (Service Vendors) -->
      <section v-if="activeTab === 'services' && !isBouquetVendor" class="section services-section">
        <div class="container">
          <div v-if="vendorPackages.length === 0" class="empty-state">
            No services available yet.
          </div>
          <div v-else class="categories-list">
            <div v-for="category in categoryList" :key="category" class="category-group">
              <h3 class="category-title">{{ category }}</h3>
              <div class="packages-grid">
                <div v-for="pkg in groupedPackages[category]" :key="pkg.id_package" class="package-card">
                  <div class="package-header">
                    <h4 class="package-name">{{ pkg.name }}</h4>
                    <span class="package-price">{{ formatPrice(pkg.price) }}</span>
                  </div>
                  <p class="package-desc" v-if="pkg.description">{{ pkg.description }}</p>
                  <div class="package-meta">
                    <span v-if="pkg.duration" class="package-duration">⏱ {{ pkg.duration }}</span>
                  </div>
                  <div class="package-included" v-if="pkg.whats_included">
                    <strong>Includes:</strong>
                    <p>{{ pkg.whats_included }}</p>
                  </div>
                  <button class="btn-book-package" @click.stop="handleBookPackage(pkg)">
                    Book Now - {{ formatPrice(pkg.price) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Product Catalog (Bouquet Vendors) -->
      <section v-if="activeTab === 'services' && isBouquetVendor" class="section products-section">
        <div class="container">
          <div v-if="vendorProducts.length === 0" class="empty-state">
            No products available yet.
          </div>
          <div v-else class="products-grid">
            <div v-for="product in vendorProducts" :key="product.id_product" class="product-card" @click="goToProduct(product.id_product)">
              <div class="product-image">
                <img :src="product.images?.[0]?.image_url || defaultImage" :alt="product.name" loading="lazy" @error="onImgError" />
                <span class="product-occasion-badge" v-if="product.labels">{{ (product.labels.split(',')[0]).charAt(0).toUpperCase() + (product.labels.split(',')[0]).slice(1) }}</span>
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ product.name }}</h4>
                <div class="product-meta-row">
                  <span class="product-type" v-if="product.type_name">{{ product.type_name }}</span>
                  <span class="product-size" v-if="product.size_name">{{ product.size_name }}</span>
                </div>
                <span class="product-price">{{ formatPrice(product.price) }}</span>
                <div class="product-actions">
                  <button class="btn-add-cart" @click.stop><i class="fa fa-shopping-cart"></i> Add to Cart</button>
                  <router-link :to="`/product/${product.id_product}`" class="btn-view">View Detail</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Portfolio -->
      <section v-if="activeTab === 'portfolio'" class="section portfolio-section">
        <div class="container">
          <div v-if="vendorPortfolios.length === 0" class="empty-state">
            No portfolios yet.
          </div>
          <div v-else class="portfolio-grid">
            <div
              v-for="item in vendorPortfolios"
              :key="item.id_portfolio"
              class="portfolio-card"
              @click="goToPortfolio(item.id_portfolio)"
            >
              <div class="portfolio-image">
                <img :src="item.cover_url || defaultImage" :alt="item.title" loading="lazy" @error="onImgError" />
                <span class="portfolio-label" v-if="item.label">{{ item.label }}</span>
              </div>
              <div class="portfolio-info">
                <h4 class="portfolio-title">{{ item.title }}</h4>
                <span class="portfolio-category" v-if="item.category">{{ item.category.category_name }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews -->
      <section v-if="activeTab === 'reviews'" class="section reviews-section">
        <div class="container">
          <div v-if="reviews.length === 0" class="empty-state">
            No reviews yet.
          </div>
          <div v-else class="reviews-list">
            <ReviewCard v-for="review in reviews" :key="review.id_review" :review="review" />
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>
