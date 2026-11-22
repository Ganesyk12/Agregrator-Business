<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import defaultImage from '@/assets/default/nothing.png'

interface PortfolioItem {
  id: number
  image: string
  occasion: string
  caption: string
  budget: string
  height: 'tall' | 'short' | 'medium'
}

interface ProductItem {
  id: number
  name: string
  price: number
  images: any[]
  vendor?: any
  labels?: string
}

const props = defineProps<{
  celebrationFilter: string | null
}>()

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const portfolioData = ref<PortfolioItem[]>([])
const productData = ref<ProductItem[]>([])
const loading = ref(true)

const celebrationTaglines: Record<string, string> = {
  wedding: 'Momen pernikahan impian Anda dimulai di sini',
  graduation: 'Rayakan pencapaian dengan gaya terbaik',
  birthday: 'Buat hari spesial semakin berkesan',
  engagement: 'Awal dari kisah cinta yang abadi',
  anniversary: 'Rayakan cinta yang tak pernah pudar'
}

function getOccasions(value: string) {
  return (value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}

async function fetchData() {
  loading.value = true
  try {
    const params = props.celebrationFilter ? `?label=${props.celebrationFilter}` : ''
    const [portRes, prodRes] = await Promise.all([
      fetch(`/api/portfolios${params}`),
      fetch('/api/products')
    ])

    const portData = await portRes.json()
    const prodData = await prodRes.json()

    const portfolios = portData.data || []
    const products = prodData.data || []

    // Portfolio data for Photography & Makeup Artist
    portfolioData.value = portfolios.map((p: any) => ({
      id: p.id_portfolio,
      image: p.cover_url || defaultImage,
      occasion: p.label || p.title || 'Creative',
      caption: p.title || p.description || '',
      budget: p.package?.price ? `Rp ${p.package.price.toLocaleString('id-ID')}` : '',
      height: (['tall', 'medium', 'short'] as const)[Math.floor(Math.random() * 3)]
    }))

    // Product data for Bouquet Flowers
    productData.value = products
      .filter((p: any) => p.status === 'active')
      .map((p: any) => ({
        id: p.id_product,
        name: p.name,
        price: p.price,
        images: p.images || [],
        vendor: p.vendor,
        labels: p.labels
      }))
  } catch {
    portfolioData.value = []
    productData.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

const photographyPortfolios = computed(() => {
  return portfolioData.value.slice(0, 8)
})

const muaPortfolios = computed(() => {
  return portfolioData.value.slice(8, 16)
})

const bouquetProducts = computed(() => {
  return productData.value.slice(0, 8)
})

function goToPortfolio(id: number) {
  router.push(`/portfolio/${id}`)
}

function goToProduct(id: number) {
  router.push(`/product/${id}`)
}

async function addToCart(product: any) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  await cart.addProduct(product.id, 1)
}
</script>

<template>
  <section class="category-section">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Categories</span>
        <h2 class="section-title">Explore by Category</h2>
        <p class="section-desc">
          {{ celebrationFilter ? (celebrationTaglines[celebrationFilter] || 'Vendor terbaik untuk momen spesial Anda') : 'Temukan vendor dan layanan sesuai kebutuhan Anda' }}
        </p>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <template v-else>
        <!-- Row 1: Photography -->
        <div class="category-row">
          <div class="category-header">
            <div class="category-icon">📷</div>
            <h3>Photography</h3>
          </div>
          <div class="showcase-grid">
            <div
              v-for="portfolio in photographyPortfolios"
              :key="portfolio.id"
              class="showcase-card"
              :class="{ 'portrait': portfolio.height === 'short' }"
              @click="goToPortfolio(portfolio.id)"
            >
              <div class="card-image">
                <img :src="portfolio.image" :alt="portfolio.caption" loading="lazy" @error="onImgError" />
                <div class="card-image-overlay"></div>
                <div v-if="portfolio.budget" class="budget-tag">
                  {{ portfolio.budget }}
                </div>
              </div>
              <div class="card-body">
                <p class="card-caption">{{ portfolio.caption }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Makeup Artist -->
        <div class="category-row">
          <div class="category-header">
            <div class="category-icon">💄</div>
            <h3>Makeup Artist</h3>
          </div>
          <div class="showcase-grid">
            <div
              v-for="portfolio in muaPortfolios"
              :key="portfolio.id"
              class="showcase-card"
              :class="{ 'portrait': portfolio.height === 'short' }"
              @click="goToPortfolio(portfolio.id)"
            >
              <div class="card-image">
                <img :src="portfolio.image" :alt="portfolio.caption" loading="lazy" @error="onImgError" />
                <div class="card-image-overlay"></div>
                <div v-if="portfolio.budget" class="budget-tag">
                  {{ portfolio.budget }}
                </div>
              </div>
              <div class="card-body">
                <p class="card-caption">{{ portfolio.caption }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Bouquet Flowers -->
        <div class="category-row">
          <div class="category-header">
            <div class="category-icon">💐</div>
            <h3>Bouquet Flowers</h3>
          </div>
          <div class="showcase-grid">
            <div
              v-for="product in bouquetProducts"
              :key="product.id"
              class="showcase-card product-card"
              @click="goToProduct(product.id)"
            >
              <div class="card-image">
                <img :src="product.images?.[0]?.image_url || defaultImage" :alt="product.name" loading="lazy" @error="onImgError" />
                <button class="btn-cart-add" @click.stop="addToCart(product)" title="Add to cart">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </button>
              </div>
              <div class="card-body">
                <h4 class="product-name">{{ product.name }}</h4>
                <p v-if="product.vendor" class="product-vendor">{{ product.vendor.business_name }}</p>
                <span class="product-price">Rp {{ product.price.toLocaleString('id-ID') }}</span>
                <div v-if="product.labels" class="product-occasion-pills">
                  <span v-for="label in getOccasions(product.labels)" :key="label" class="product-occasion-pill">
                    {{ label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.category-section {
  padding: 100px 0;
  background: var(--bs-body-bg, #F7F4EF);
  position: relative;
}

.section-header {
  margin-bottom: 60px;
}

.section-label {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2.8rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 16px;
  line-height: 1.2;
}

.section-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 1.1rem;
  color: var(--bs-body-color, #5a5a5a);
  max-width: 500px;
  margin: 0 auto;
}

.category-row {
  margin-bottom: 40px;
}

.category-row:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.category-icon {
  font-size: 2rem;
}

.category-header h3 {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.75rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0;
  font-weight: 400;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.showcase-card {
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 380px;
  display: flex;
  flex-direction: column;
}

.showcase-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(0,0,0,0.12);
}

.portrait {
  height: 420px;
}

.card-image {
  position: relative;
  flex: 0 0 auto;
  height: 260px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.showcase-card:hover .card-image img {
  transform: scale(1.06);
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.showcase-card:hover .card-image-overlay {
  opacity: 1;
}

.budget-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255,255,255,0.9);
  color: var(--bs-black, #2a2a2a);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-caption {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.95rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
}

.product-card {
  cursor: pointer;
}

.product-name {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 8px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-vendor {
  font-size: 0.8rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 8px;
}

.product-price {
  display: block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--bs-secondary, #B89C7B);
  margin: 0 0 10px;
}

.btn-cart-add {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.9);
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

.product-card:hover .btn-cart-add {
  opacity: 1;
  transform: translateY(0);
}

.product-card:hover .btn-cart-add:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-occasion-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: auto;
}

.product-occasion-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid rgba(184, 156, 123, 0.35);
  border-radius: 999px;
  background: rgba(184, 156, 123, 0.12);
  color: #8a6d4b;
  font-family: 'Jost', sans-serif;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: capitalize;
  white-space: nowrap;
}

@media (max-width: 992px) {
  .showcase-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .category-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .category-row {
    margin-bottom: 32px;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .section-desc {
    font-size: 0.95rem;
  }
}
</style>