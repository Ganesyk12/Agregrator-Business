<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import defaultImage from '@/assets/default/nothing.png'

interface PortfolioItem {
  id_portfolio: number
  cover_url: string
  title: string
  category: string
  description: string | null
  vendor?: {
    id_vendor: number
    business_name: string
    category: string
    location: string | null
    starting_price: number
  }
}

interface Category {
  name: string
}

const portfolios = ref<PortfolioItem[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const activeCategory = ref('all')
const searchQuery = ref('')

const filteredPortfolios = computed(() => {
  let result = portfolios.value
  if (activeCategory.value !== 'all') {
    result = result.filter(p => p.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.vendor?.business_name.toLowerCase().includes(q)
    )
  }
  return result
})

onMounted(async () => {
  try {
    const [portRes, catRes] = await Promise.all([
      fetch('/api/portfolios'),
      fetch('/api/portfolios/vendors/categories')
    ])
    const portJson = await portRes.json()
    const catJson = await catRes.json()
    portfolios.value = Array.isArray(portJson.data) ? portJson.data : []
    categories.value = Array.isArray(catJson.data) ? catJson.data : []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="shop-header py-5 bg-light">
      <div class="container text-center">
        <h1 class="display-5 text-uppercase mb-2">Explore Portfolios</h1>
        <p class="text-muted">Temukan vendor impianmu dari ribuan portfolio terbaik</p>
        <div class="row justify-content-center mt-4">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <use xlink:href="#search"></use>
                </svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control border-start-0"
                placeholder="Cari portfolio atau vendor..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5">
      <div class="d-flex flex-wrap gap-2 mb-4 justify-content-center" data-aos="fade-up">
        <button
          :class="['btn', activeCategory === 'all' ? 'btn-dark' : 'btn-outline-dark']"
          @click="activeCategory = 'all'"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.name"
          :class="['btn', activeCategory === cat.name ? 'btn-dark' : 'btn-outline-dark']"
          @click="activeCategory = cat.name"
        >
          {{ cat.name }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="filteredPortfolios.length === 0" class="text-center py-5">
        <p class="text-muted fs-5">Tidak ada portfolio yang ditemukan.</p>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="item in filteredPortfolios"
          :key="item.id_portfolio"
          class="col-sm-6 col-lg-4 col-xl-3"
          data-aos="fade-up"
        >
          <router-link
            :to="`/portfolio/${item.id_portfolio}`"
            class="portfolio-card text-decoration-none d-block"
          >
            <div class="card border-0 h-100 shadow-sm">
              <div class="card-img-wrapper">
                <img
                  :src="item.cover_url || defaultImage"
                  :alt="item.title"
                  class="card-img-top"
                >
                <span class="category-badge">{{ item.category }}</span>
              </div>
              <div class="card-body">
                <h5 class="card-title text-uppercase mb-1">{{ item.vendor?.business_name || item.title }}</h5>
                <p class="card-text text-muted small mb-2">{{ item.title }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-secondary fw-medium" v-if="item.vendor?.starting_price">
                    {{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.vendor.starting_price) }}
                  </span>
                  <span class="text-muted small" v-if="item.vendor?.location">
                    {{ item.vendor.location }}
                  </span>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.shop-header {
  padding-top: 120px !important;
  padding-bottom: 48px !important;
}
.card-img-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.card-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.portfolio-card:hover .card-img-wrapper img {
  transform: scale(1.1);
}
.category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.portfolio-card:hover .card {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
}
</style>
