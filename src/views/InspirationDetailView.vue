<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import defaultImage from '@/assets/default/nothing.png'

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
        image: p.cover_url || defaultImage,
        gallery: (p.images || []).map((i: any) => i.image_url).filter(Boolean),
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
          photography: p.vendor?.category === 'Photography' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: defaultImage } : undefined,
          mua: p.vendor?.category === 'Makeup Artist' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: defaultImage } : undefined,
          bouquet: p.vendor?.category === 'Bouquet Flowers' ? { id: p.vendor.id_vendor, name: p.vendor.business_name, image: defaultImage } : undefined,
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

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
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
            <img :src="inspiration.gallery[activeGalleryImage] || inspiration.image" :alt="inspiration.caption" @error="onImgError" />
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
              <img :src="img" :alt="`Gallery ${i + 1}`" @error="onImgError" />
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