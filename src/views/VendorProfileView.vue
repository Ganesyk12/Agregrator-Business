<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import ReviewCard from '@/components/portfolio/ReviewCard.vue'

const route = useRoute()
const router = useRouter()
const vendor = ref<any>(null)
const vendorPackages = ref<any[]>([])
const vendorPortfolios = ref<any[]>([])
const reviews = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<'services' | 'portfolio' | 'reviews'>('services')

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

    const vendorRes = await fetch(`/api/vendors/${id}`)
    const vendorJson = await vendorRes.json()
    if (!vendorRes.ok) throw new Error(vendorJson.error?.message || 'Vendor not found')
    vendor.value = vendorJson.data

    const infoRes = await fetch(`/api/portfolios/vendor/${id}/info`)
    const infoJson = await infoRes.json()
    if (infoRes.ok) {
      vendorPackages.value = infoJson.data.packages || []
      reviews.value = infoJson.data.reviews || []
    }

    const portfolioRes = await fetch(`/api/portfolios/vendor/${id}`)
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
  const query = new URLSearchParams({
    vendorId: String(vendor.value.id_vendor),
    packageId: String(pkg.id_package),
    packageName: pkg.name,
    packagePrice: String(pkg.price),
  })
  router.push(`/booking?${query.toString()}`)
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
              <span class="avatar-text">{{ vendor.business_name?.charAt(0) || 'V' }}</span>
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
              <div class="price-range" v-if="vendorPackages.length > 0">
                <span class="price-range-label">Price Range</span>
                <span class="price-range-value">
                  {{ formatPrice(Math.min(...vendorPackages.map(p => p.price))) }} 
                  - {{ formatPrice(Math.max(...vendorPackages.map(p => p.price))) }}
                </span>
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
              Services ({{ vendorPackages.length }})
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

      <!-- Services / Packages by Category -->
      <section v-if="activeTab === 'services'" class="section services-section">
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
                <img :src="item.cover_url" :alt="item.title" loading="lazy" />
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

<style scoped>
.vendor-profile {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #222;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state h2 { font-size: 2rem; margin-bottom: 8px; }
.error-state p { color: #888; margin-bottom: 20px; }
.btn-back {
  display: inline-block;
  padding: 12px 28px;
  background: #222;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero */
.vendor-hero {
  background: #fff;
  padding: 60px 0 40px;
  border-bottom: 1px solid #eee;
}

.vendor-hero-inner {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.vendor-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
}

.vendor-hero-info {
  flex: 1;
}

.vendor-business-name {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
}

.vendor-badge {
  margin-bottom: 12px;
}

.verified-badge {
  display: inline-block;
  padding: 4px 14px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.vendor-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 16px;
}

.vendor-meta strong { color: #f5b342; }
.meta-sep { color: #ddd; }

.vendor-description {
  color: #555;
  line-height: 1.8;
  max-width: 700px;
  margin-bottom: 12px;
}

.vendor-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.price-range {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 20px;
}

.price-range-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  font-weight: 600;
}

.price-range-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #222;
}

/* Tabs */
.tabs-section {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-nav {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 16px 28px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #444;
}

.tab-btn.active {
  color: #222;
  border-bottom-color: #222;
}

/* Section */
.section {
  padding: 48px 0;
}

.empty-state {
  color: #999;
  font-style: italic;
  padding: 40px 0;
  text-align: center;
}

/* Categories / Services */
.category-group {
  margin-bottom: 40px;
}

.category-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #222;
  display: inline-block;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.package-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}

.package-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.package-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.package-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: #222;
  white-space: nowrap;
}

.package-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 12px;
}

.package-meta {
  margin-bottom: 8px;
}

.package-duration {
  font-size: 0.85rem;
  color: #888;
}

.package-included {
  font-size: 0.85rem;
  color: #555;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.package-included strong {
  display: block;
  margin-bottom: 4px;
}

.btn-book-package {
  width: 100%;
  padding: 12px;
  margin-top: auto;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-book-package:hover {
  background: #444;
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.portfolio-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.portfolio-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.portfolio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.portfolio-card:hover .portfolio-image img {
  transform: scale(1.05);
}

.portfolio-label {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 0.75rem;
  border-radius: 4px;
  font-weight: 600;
}

.portfolio-info {
  padding: 16px;
}

.portfolio-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px;
}

.portfolio-category {
  font-size: 0.8rem;
  color: #888;
}

/* Reviews */
.reviews-list {
  max-width: 700px;
}

@media (max-width: 992px) {
  .portfolio-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .vendor-hero-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .vendor-description {
    max-width: 100%;
  }

  .price-range {
    justify-content: center;
  }

  .packages-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
  }

  .tabs-nav {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-btn {
    padding: 14px 20px;
    font-size: 0.9rem;
    white-space: nowrap;
  }
}
</style>
