<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroBanner from '@/components/home/HeroBanner.vue'
import CelebrationSection from '@/components/home/CelebrationSection.vue'
import InspirationSection from '@/components/home/InspirationSection.vue'
import VendorCategoryShowcase from '@/components/home/VendorCategoryShowcase.vue'
import WhyChooseUs from '@/components/home/WhyChooseUs.vue'
import HowItWorks from '@/components/home/HowItWorks.vue'
import PartnerSection from '@/components/home/PartnerSection.vue'
import defaultImage from '@/assets/default/nothing.png'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const selectedCelebration = ref<string | null>(null)
const products = ref<any[]>([])

const filteredProducts = computed(() => {
  let r = products.value
  if (selectedCelebration.value) {
    const slug = selectedCelebration.value.toLowerCase()
    r = r.filter(p => (p.labels || '').toLowerCase().includes(slug))
  }
  return r
})
const productsLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/products')
    if (res.ok) {
      const json = await res.json()
      products.value = (json.data || []).filter((p: any) => p.status === 'active')
    }
  } catch { /* ignore */ }
  finally { productsLoading.value = false }
})

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}

async function addToCart(product: any) {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  await cart.addProduct(product.id_product, 1)
}

function onCelebrationSelect(celebration: string | null) {
  selectedCelebration.value = celebration
}
</script>

<template>
  <div class="homepage">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <HeroBanner />

    <CelebrationSection
      :selected="selectedCelebration"
      @select="onCelebrationSelect"
    />

    <InspirationSection
      :celebration-filter="selectedCelebration"
    />

    <VendorCategoryShowcase
      :celebration-filter="selectedCelebration"
    />

    <!-- Bouquet Products Section -->
    <section class="bouquet-section py-5">
      <div class="container">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div>
            <h4 class="text-uppercase section-title mb-0">Bouquet Flowers</h4>
            <p class="text-muted mb-0">Fresh floral arrangements for every occasion</p>
          </div>
          <router-link to="/bouquet" class="btn-link">View All Products</router-link>
        </div>

        <div v-if="productsLoading" class="text-center py-5">
          <p class="text-muted">Loading products...</p>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-5">
          <p class="text-muted">No products available yet.</p>
        </div>

        <div v-else class="row g-4">
          <div
            v-for="product in filteredProducts.slice(0, 8)"
            :key="product.id_product"
            class="col-lg-3 col-md-4 col-sm-6"
          >
            <div class="product-card">
              <div class="product-image-wrap">
                <router-link :to="'/product/' + product.id_product">
                  <img
                    :src="product.images?.[0]?.image_url || defaultImage"
                    :alt="product.name"
                    @error="onImgError"
                  />
                </router-link>
                <span v-if="product.labels" class="product-badge">{{ (product.labels.split(',')[0]).charAt(0).toUpperCase() + (product.labels.split(',')[0]).slice(1) }}</span>
                <button class="btn-cart-add" @click="addToCart(product)" title="Add to cart">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </button>
              </div>
              <div class="product-info-wrap">
                <router-link :to="'/product/' + product.id_product" class="product-name">{{ product.name }}</router-link>
                <span class="product-vendor">{{ product.vendor?.business_name }}</span>
                <div class="product-meta-row">
                  <span v-if="product.type_name" class="product-type-tag">{{ product.type_name }}</span>
                  <span v-if="product.size_name" class="product-size-tag">{{ product.size_name }}</span>
                </div>
                <span class="product-price">{{ formatPrice(product.price) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <WhyChooseUs />
    <HowItWorks />
    <PartnerSection />

    <Footer />
  </div>
</template>


