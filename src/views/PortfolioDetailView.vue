<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import PortfolioGallery from '@/components/portfolio/PortfolioGallery.vue'
import ReviewCard from '@/components/portfolio/ReviewCard.vue'
import BookingCard from '@/components/portfolio/BookingCard.vue'
import defaultImage from '@/assets/default/nothing.png'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const portfolio = ref<any>(null)
const vendorInfo = ref<any>(null)
const relatedPortfolios = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const isSaving = ref(false)
const isSaved = ref(false)
const saveMessage = ref('')

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
    // check if this portfolio's package is already favorited
    if (auth.isLoggedIn && json.data?.id_package) {
      try {
        const favRes = await auth.authFetch(`/api/favorites/check/${json.data.id_package}`)
        const favJson = await favRes.json()
        if (favRes.ok) isSaved.value = favJson.data?.is_favorited
      } catch { /* fallback */ }
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function handleBookNow() {
  if (!portfolio.value?.vendor) return
  const vendor = portfolio.value.vendor
  localStorage.setItem('sigyn_booking_config', JSON.stringify({
    vendorId: vendor.id_vendor,
    businessName: vendor.business_name,
    startingPrice: startingPrice.value,
  }))
  router.push('/booking')
}

async function handleSavePortfolio() {
  saveMessage.value = ''
  const packageId = portfolio.value?.id_package
  if (!packageId) {
    saveMessage.value = 'No package linked to this portfolio.'
    return
  }
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  isSaving.value = true
  try {
    if (isSaved.value) {
      const res = await auth.authFetch(`/api/favorites/${packageId}`, { method: 'DELETE' })
      if (res.ok) {
        isSaved.value = false
        saveMessage.value = 'Removed from wishlist.'
        auth.refreshWishlistCount()
      } else {
        const err = await res.json()
        saveMessage.value = err.error?.message || 'Failed to remove.'
      }
    } else {
      const res = await auth.authFetch('/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ id_package: packageId }),
      })
      if (res.ok) {
        isSaved.value = true
        saveMessage.value = 'Saved to wishlist!'
        auth.refreshWishlistCount()
      } else if (res.status === 409) {
        isSaved.value = true
        saveMessage.value = 'Already in your wishlist.'
      } else {
        const err = await res.json()
        saveMessage.value = err.error?.message || 'Failed to save.'
      }
    }
  } catch {
    saveMessage.value = 'Something went wrong. Please try again.'
  } finally {
    isSaving.value = false
  }
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
          <img :src="portfolio.cover_url || defaultImage" :alt="portfolio.title" />
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
                  <img :src="item.cover_url || defaultImage" :alt="item.title" loading="lazy" />
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
            :saving="isSaving"
            :saved="isSaved"
            @book="handleBookNow"
            @save="handleSavePortfolio"
          />
          <p v-if="saveMessage" class="save-feedback mt-2 mb-0 text-center small">{{ saveMessage }}</p>
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>
