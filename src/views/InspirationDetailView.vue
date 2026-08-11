<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const route = useRoute()
const router = useRouter()

interface InspirationDetail {
  id: number
  image: string
  gallery: string[]
  occasion: string
  style: string
  caption: string
  description: string
  budget: string
  budgetMin: number
  budgetMax: number
  saved: boolean
  height: string
  vendorRefs: {
    photography?: { id: number; name: string; image: string }
    mua?: { id: number; name: string; image: string }
    bouquet?: { id: number; name: string; image: string }
  }
}

const inspiration = ref<InspirationDetail | null>(null)
const loading = ref(true)
const activeGalleryImage = ref(0)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const res = await fetch(`/api/portfolios/${id}`)
    const json = await res.json()
    const p = json.data
    if (p) {
      const price = p.package?.price || 0
      inspiration.value = {
        id: p.id_portfolio,
        image: p.cover_url,
        gallery: (p.images || []).map((i: any) => i.image_url),
        occasion: p.label || p.title || 'Creative',
        style: p.vendor?.category || 'Creative',
        caption: p.title || '',
        description: p.description || '',
        budget: price ? `Rp ${price.toLocaleString('id-ID')}` : '',
        budgetMin: price,
        budgetMax: price ? price + Math.round(price * 0.3) : 0,
        saved: false,
        height: 'medium',
        vendorRefs: {
          photography: p.vendor?.category === 'Photography' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: '' } : undefined,
          mua: p.vendor?.category === 'Makeup Artist' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: '' } : undefined,
          bouquet: p.vendor?.category === 'Bouquet Flowers' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: '' } : undefined,
        }
      }
    }
  } catch {
    // API unavailable
  } finally {
    loading.value = false
  }
})

function goToVendor(id: number) {
  router.push(`/vendor/${id}`)
}

function goToExplore() {
  router.push('/explore')
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}

</script>

<template>
  <div class="inspiration-detail">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading inspiration...</p>
    </div>

    <div v-else-if="!inspiration" class="error-state">
      <h2>Inspiration Not Found</h2>
      <p>The inspiration you're looking for doesn't exist.</p>
      <button class="btn-back" @click="goToExplore">Browse Inspirations</button>
    </div>

    <div v-else class="detail-content">
      <section class="gallery-section">
        <div class="gallery-main">
          <div class="gallery-actions">
            <button @click="router.back()" class="btn-back-nav">
              <i class="fa fa-arrow-left"></i> Back
            </button>
          </div>
          <div class="main-image">
            <img :src="inspiration.gallery[activeGalleryImage] || inspiration.image" :alt="inspiration.caption" />
            <div class="occasion-badge">
              {{ (inspiration.occasion || '').split(',').map(s => s.trim().charAt(0).toUpperCase() + s.trim().slice(1)).join(', ') }}
            </div>
          </div>
          <div v-if="inspiration.gallery.length > 1" class="gallery-thumbs">
            <button
              v-for="(img, i) in inspiration.gallery"
              :key="i"
              class="thumb-btn"
              :class="{ active: activeGalleryImage === i }"
              @click="activeGalleryImage = i"
            >
              <img :src="img" :alt="`Gallery ${i + 1}`" />
            </button>
          </div>
        </div>
      </section>

      <div class="container detail-layout">
        <div class="detail-main">
          <section class="info-section">
            <div class="info-header">
              <div class="info-tags">
                <template v-if="inspiration.occasion">
                  <span v-for="occ in (inspiration.occasion || '').split(',').filter(Boolean)" :key="occ" class="info-tag occasion">
                    {{ occ.trim().charAt(0).toUpperCase() + occ.trim().slice(1) }}
                  </span>
                </template>
                <span class="info-tag style">{{ inspiration.style }}</span>
              </div>
              <h1 class="info-title">{{ inspiration.caption }}</h1>
            </div>

            <div class="info-description">
              <p>{{ inspiration.description }}</p>
            </div>

            <div class="info-budget">
              <span class="budget-label">Estimated Budget</span>
              <span class="budget-range">{{ formatPrice(inspiration.budgetMin) }} – {{ formatPrice(inspiration.budgetMax) }}</span>
            </div>
          </section>

          <section class="vendors-section" v-if="inspiration.vendorRefs.photography || inspiration.vendorRefs.mua || inspiration.vendorRefs.bouquet">
            <h2 class="section-title">Related Vendors</h2>
            <p class="section-desc">These trusted vendors can help bring this inspiration to life</p>

            <div class="related-vendors">
              <div v-if="inspiration.vendorRefs.photography" class="vendor-card" @click="goToVendor(inspiration.vendorRefs.photography.id)">
                <div class="vendor-image">
                  <img :src="inspiration.vendorRefs.photography.image" :alt="inspiration.vendorRefs.photography.name" />
                  <div class="vendor-badge">Photography</div>
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ inspiration.vendorRefs.photography.name }}</h3>
                  <button class="btn-view" @click.stop="goToVendor(inspiration.vendorRefs.photography.id)">View Vendor</button>
                </div>
              </div>

              <div v-if="inspiration.vendorRefs.mua" class="vendor-card" @click="goToVendor(inspiration.vendorRefs.mua.id)">
                <div class="vendor-image">
                  <img :src="inspiration.vendorRefs.mua.image" :alt="inspiration.vendorRefs.mua.name" />
                  <div class="vendor-badge">Makeup Artist</div>
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ inspiration.vendorRefs.mua.name }}</h3>
                  <button class="btn-view" @click.stop="goToVendor(inspiration.vendorRefs.mua.id)">View Vendor</button>
                </div>
              </div>

              <div v-if="inspiration.vendorRefs.bouquet" class="vendor-card" @click="goToVendor(inspiration.vendorRefs.bouquet.id)">
                <div class="vendor-image">
                  <img :src="inspiration.vendorRefs.bouquet.image" :alt="inspiration.vendorRefs.bouquet.name" />
                  <div class="vendor-badge">Bouquet Flowers</div>
                </div>
                <div class="vendor-info">
                  <h3 class="vendor-name">{{ inspiration.vendorRefs.bouquet.name }}</h3>
                  <button class="btn-view" @click.stop="goToVendor(inspiration.vendorRefs.bouquet.id)">View Vendor</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="detail-sidebar">
          <div class="cta-card">
            <h3 class="cta-title">Bring This Inspiration to Life</h3>
            <p class="cta-desc">Connect with trusted vendors who can make this vision a reality for your special moment.</p>

            <div class="cta-budget">
              <span class="cta-budget-label">Estimated Budget</span>
              <span class="cta-budget-value">{{ formatPrice(inspiration.budgetMin) }} – {{ formatPrice(inspiration.budgetMax) }}</span>
            </div>

            <button class="cta-btn-primary" @click="goToExplore">
              View Related Vendors
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <p class="cta-hint">Browse vendors, compare packages, and book with confidence.</p>
          </div>
        </aside>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.inspiration-detail {
  min-height: 100vh;
  background: #fff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 120px 20px;
  font-family: 'Jost', sans-serif;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: var(--bs-secondary, #B89C7B);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-state h2 {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2rem;
  margin-bottom: 8px;
}

.error-state p {
  color: var(--bs-body-color, #5a5a5a);
  margin-bottom: 20px;
}

.btn-back {
  padding: 12px 32px;
  background: var(--bs-black, #2a2a2a);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--bs-secondary, #B89C7B);
}

/* Gallery */
.gallery-section {
  background: #fff;
  padding: 120px 0 40px;
}

.gallery-actions {
  margin-bottom: 20px;
}

.btn-back-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: var(--bs-black, #2a2a2a);
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back-nav:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateX(-2px);
}

.btn-back-nav i {
  font-size: 0.8rem;
}

.gallery-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
}

.main-image {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  aspect-ratio: 4/3;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.occasion-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  max-width: calc(100% - 40px);
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: #fff;
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 20px;
  white-space: normal;
  word-break: keep-all;
}

.gallery-thumbs {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.thumb-btn {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.thumb-btn.active,
.thumb-btn:hover {
  border-color: var(--bs-secondary, #B89C7B);
  opacity: 1;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.detail-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 48px;
  padding-top: 40px;
  padding-bottom: 120px;
  align-items: start;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Info Section */
.info-section {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.info-header {
  margin-bottom: 24px;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.info-tag {
  display: inline-block;
  padding: 6px 16px;
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-radius: 999px;
  text-transform: uppercase;
}

.info-tag.occasion {
  background: rgba(184, 156, 123, 0.15);
  color: var(--bs-secondary, #B89C7B);
}

.info-tag.style {
  background: rgba(0, 0, 0, 0.04);
  color: var(--bs-body-color, #5a5a5a);
}

.info-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0;
  line-height: 1.2;
}

.info-description {
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.8;
  margin-bottom: 24px;
}

.info-budget {
  display: inline-flex;
  flex-direction: column;
  background: rgba(184, 156, 123, 0.08);
  border: 1px solid rgba(184, 156, 123, 0.2);
  border-radius: 16px;
  padding: 16px 24px;
}

.budget-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 4px;
}

.budget-range {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bs-black, #2a2a2a);
}

/* Related Vendors */
.vendors-section {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.section-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.5rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 8px;
}

.section-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 24px;
}

.related-vendors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.vendor-card {
  background: var(--bs-body-bg, #F7F4EF);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vendor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.vendor-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.vendor-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.vendor-card:hover .vendor-image img {
  transform: scale(1.08);
}

.vendor-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: #fff;
  font-family: 'Jost', sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 999px;
}

.vendor-info {
  padding: 14px 16px;
}

.vendor-name {
  font-family: 'Marcellus', serif;
  font-size: 1rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 10px;
}

.btn-view {
  width: 100%;
  padding: 8px;
  border: 1.5px solid var(--bs-black, #2a2a2a);
  border-radius: 999px;
  background: transparent;
  font-family: 'Jost', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--bs-black, #2a2a2a);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: var(--bs-black, #2a2a2a);
  color: #fff;
}

/* Sidebar */
.detail-sidebar {
  position: sticky;
  top: 88px;
}

.cta-card {
  background: #fff;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.cta-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.3rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 12px;
}

.cta-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  line-height: 1.6;
  margin: 0 0 24px;
}

.cta-budget {
  background: rgba(184, 156, 123, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cta-budget-label {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
}

.cta-budget-value {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bs-black, #2a2a2a);
}

.cta-btn-primary {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(184, 156, 123, 0.3);
}

.cta-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(184, 156, 123, 0.4);
  gap: 12px;
}

.cta-hint {
  font-family: 'Jost', sans-serif;
  font-size: 0.78rem;
  color: var(--bs-body-color, #5a5a5a);
  text-align: center;
  margin: 16px 0 0;
}

@media (max-width: 992px) {
  .gallery-section {
    padding: 110px 0 24px;
  }

  .detail-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .detail-sidebar {
    position: static;
  }

  .info-title {
    font-size: 1.6rem;
  }

  .related-vendors {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .gallery-section {
    padding: 100px 0 16px;
  }

  .main-image {
    border-radius: 16px;
  }

  .thumb-btn {
    width: 60px;
    height: 46px;
  }

  .info-section,
  .vendors-section,
  .cta-card {
    padding: 20px;
    border-radius: 16px;
  }

  .info-title {
    font-size: 1.3rem;
  }

  .related-vendors {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 0 16px;
  }
}
</style>