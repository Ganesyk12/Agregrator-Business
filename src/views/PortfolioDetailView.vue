<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import PortfolioGallery from '@/components/portfolio/PortfolioGallery.vue'
import ReviewCard from '@/components/portfolio/ReviewCard.vue'
import BookingCard from '@/components/portfolio/BookingCard.vue'

const route = useRoute()
const router = useRouter()
const portfolio = ref<any>(null)
const vendorInfo = ref<any>(null)
const relatedPortfolios = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const hasAvailability = computed(() => {
  return vendorInfo.value?.availability !== null && vendorInfo.value?.availability !== undefined
})

const vendorReviews = computed(() => vendorInfo.value?.reviews || [])

const startingPrice = computed(() => {
  const packages = vendorInfo.value?.packages
  if (!packages || packages.length === 0) return 0
  return Math.min(...packages.map((p: any) => p.price))
})

async function fetchPortfolio() {
  try {
    const id = route.params.id
    const res = await fetch(`/api/portfolios/${id}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load portfolio')
    portfolio.value = json.data

    const vendorRes = await fetch(`/api/portfolios/vendor/${json.data.id_vendor}/info`)
    const vendorJson = await vendorRes.json()
    if (vendorRes.ok) vendorInfo.value = vendorJson.data

    const relatedRes = await fetch(`/api/portfolios/${id}/related`)
    const relatedJson = await relatedRes.json()
    if (relatedRes.ok) relatedPortfolios.value = relatedJson.data
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function handleBookNow() {
  if (!portfolio.value?.vendor) return
  const vendor = portfolio.value.vendor
  const query = new URLSearchParams({
    vendorId: String(vendor.id_vendor),
    businessName: vendor.business_name,
    startingPrice: String(startingPrice.value),
  })
  router.push(`/booking?${query.toString()}`)
}

function handleSavePortfolio() {
  alert('Portfolio saved to favorites!')
}

function goToPortfolio(id: number) {
  router.push(`/portfolio/${id}`)
}

function goToVendorProfile() {
  if (portfolio.value?.vendor) {
    router.push(`/vendor/${portfolio.value.vendor.id_vendor}`)
  }
}

onMounted(fetchPortfolio)
</script>

<template>
  <div class="portfolio-detail">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading portfolio...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Oops!</h2>
      <p>{{ error }}</p>
      <router-link to="/" class="btn-back">Back to Home</router-link>
    </div>

    <div v-else-if="portfolio" class="detail-content">
      <!-- 1. Hero Section -->
      <section class="section hero-section">
        <div class="hero-image">
          <img :src="portfolio.cover_url" :alt="portfolio.title" />
        </div>
      </section>

      <!-- Gallery -->
      <section class="section gallery-section">
        <div class="container">
          <h2 class="section-title">Gallery</h2>
          <PortfolioGallery :images="portfolio.images || []" />
        </div>
      </section>

      <div class="container detail-layout">
        <div class="detail-main">
          <!-- 2. Project Information -->
          <section class="section project-info-section">
            <h2 class="section-title">Project Information</h2>
            <div class="project-meta">
              <h1 class="project-title">{{ portfolio.title }}</h1>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">Portfolio Code</span>
                  <span class="meta-value">{{ portfolio.code }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Category</span>
                  <span class="meta-value category-badge">{{ portfolio.category?.category_name || '-' }}</span>
                </div>
              </div>
              <p v-if="portfolio.description" class="project-description">{{ portfolio.description }}</p>
            </div>
          </section>

          <!-- 3. Vendor Information -->
          <section class="section vendor-section">
            <h2 class="section-title">Vendor Information</h2>
            <div class="vendor-card">
              <div class="vendor-header">
                <div class="vendor-avatar">
                  <span class="vendor-avatar-text">{{ portfolio.vendor?.business_name?.charAt(0) || 'V' }}</span>
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ portfolio.vendor?.business_name }}</h3>
                  <div class="vendor-stats">
                    <span class="stat">
                      <strong>★</strong> {{ vendorInfo?.vendor?.average_rating || 'N/A' }}
                    </span>
                    <span class="stat-divider">|</span>
                    <span class="stat">{{ portfolio.vendor?._count?.portfolios || 0 }} Projects</span>
                    <span class="stat-divider">|</span>
                    <span class="stat">{{ portfolio.vendor?.years_exp || 0 }} Years Exp</span>
                  </div>
                </div>
              </div>
              <p class="vendor-description">{{ portfolio.vendor?.description }}</p>
              <p class="vendor-location" v-if="portfolio.vendor?.location">
                <span class="location-icon">📍</span> {{ portfolio.vendor.location }}
              </p>
              <button class="btn-vendor-profile" @click="goToVendorProfile">View Vendor Profile</button>
            </div>
          </section>

          <!-- 4. Customer Reviews -->
          <section class="section reviews-section">
            <h2 class="section-title">Customer Reviews</h2>
            <div v-if="vendorReviews.length === 0" class="empty-state">No reviews yet.</div>
            <div v-else class="reviews-list">
              <ReviewCard v-for="review in vendorReviews" :key="review.id_review" :review="review" />
            </div>
          </section>

          <!-- 5. Related Portfolio -->
          <section class="section related-section">
            <h2 class="section-title">Related Portfolios</h2>
            <div v-if="relatedPortfolios.length === 0" class="empty-state">No related portfolios.</div>
            <div v-else class="related-grid">
              <div
                v-for="item in relatedPortfolios"
                :key="item.id_portfolio"
                class="related-card"
                @click="goToPortfolio(item.id_portfolio)"
              >
                <div class="related-image">
                  <img :src="item.cover_url" :alt="item.title" loading="lazy" />
                </div>
                <div class="related-info">
                  <h4 class="related-title">{{ item.title }}</h4>
                  <span class="related-category">{{ item.category?.category_name || item.category }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 6. Sticky Booking Card (sidebar) -->
        <aside class="detail-sidebar">
          <BookingCard
            :vendor="{
              id_vendor: portfolio.vendor?.id_vendor || 0,
              business_name: portfolio.vendor?.business_name || '',
              starting_price: startingPrice,
              status: portfolio.vendor?.status || 'pending',
            }"
            :availability="hasAvailability ? 'Available' : null"
            @book="handleBookNow"
            @save="handleSavePortfolio"
          />
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.portfolio-detail {
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

/* Hero */
.hero-section {
  padding: 0;
}
.hero-image {
  width: 100%;
  max-height: 70vh;
  overflow: hidden;
}
.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  max-height: 70vh;
}

/* Section */
.section { margin-bottom: 48px; }
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  position: relative;
  padding-bottom: 12px;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: #222;
  border-radius: 2px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-content {
  padding-bottom: 60px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 40px;
  margin-top: 40px;
}

/* Project Info */
.project-info-section { padding: 0 20px; }
.project-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
}
.meta-grid {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.meta-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
  font-weight: 600;
}
.meta-value {
  font-size: 1rem;
  font-weight: 600;
}
.category-badge {
  background: #f0f0f0;
  padding: 4px 14px;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.85rem;
}
.project-description {
  color: #555;
  line-height: 1.8;
  font-size: 1rem;
  max-width: 700px;
}

/* Vendor Card */
.vendor-section { padding: 0 20px; }
.vendor-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 24px;
}
.vendor-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}
.vendor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.vendor-avatar-text {
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
}
.vendor-info { flex: 1; }
.vendor-name {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 8px;
}
.vendor-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #666;
}
.vendor-stats strong { color: #f5b342; }
.stat-divider { color: #ddd; }
.vendor-description {
  color: #555;
  line-height: 1.7;
  margin-bottom: 12px;
}
.vendor-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
}
.location-icon { margin-right: 4px; }
.btn-vendor-profile {
  padding: 10px 24px;
  background: transparent;
  color: #222;
  border: 2px solid #222;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-vendor-profile:hover {
  background: #222;
  color: #fff;
}

/* Reviews */
.reviews-section { padding: 0 20px; }
.reviews-list { max-width: 700px; }
.empty-state {
  color: #999;
  font-style: italic;
  padding: 20px 0;
}

/* Related */
.related-section { padding: 0 20px; }
.related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.related-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}
.related-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.related-image {
  aspect-ratio: 16/10;
  overflow: hidden;
}
.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.related-card:hover .related-image img {
  transform: scale(1.05);
}
.related-info {
  padding: 12px 16px;
}
.related-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px;
}
.related-category {
  font-size: 0.8rem;
  color: #888;
}

/* Sidebar */
.detail-sidebar {
  position: relative;
}

.gallery-section {
  padding: 40px 20px;
}

@media (max-width: 992px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .detail-sidebar {
    order: -1;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 576px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
  .meta-grid {
    gap: 16px;
  }
}
</style>
