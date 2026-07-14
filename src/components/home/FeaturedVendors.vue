<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useSwiper } from '@/composables/useSwiper'

interface PortfolioItem {
  id_portfolio: number
  cover_url: string
  title: string
  category: string
  vendor?: {
    business_name: string
    starting_price?: number
  }
}

const portfolios: Ref<PortfolioItem[]> = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/portfolios')
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    const items = json.data || []
    portfolios.value = Array.isArray(items) ? items.slice(0, 8) : []
  } catch (e) {
    error.value = 'Gagal memuat portfolio'
    console.error(e)
  } finally {
    loading.value = false
  }
})

useSwiper('.featured-swiper', {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false,
  pagination: {
    el: '.featured-pagination',
    clickable: true
  },
  navigation: {
    nextEl: '.featured-next',
    prevEl: '.featured-prev'
  },
  breakpoints: {
    576: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    992: { slidesPerView: 4, spaceBetween: 20 }
  }
})

function formatPrice(price: number | undefined): string {
  if (!price) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <section class="featured-vendors py-5 overflow-hidden">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3" data-aos="fade-up">
        <div>
          <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Featured</span>
          <h4 class="section-title display-6 mt-2">Portfolio Terbaru</h4>
        </div>
        <router-link to="/shop" class="btn-link text-uppercase text-decoration-none item-anchor">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24">
            <use xlink:href="#arrow-right"></use>
          </svg>
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-5 text-muted">
        <p>{{ error }}</p>
      </div>

      <div v-else class="swiper featured-swiper open-up" data-aos="zoom-out">
        <div class="swiper-wrapper d-flex">
          <div v-for="item in portfolios" :key="item.id_portfolio" class="swiper-slide">
            <router-link
              :to="`/portfolio/${item.id_portfolio}`"
              class="text-decoration-none"
            >
              <div class="portfolio-card image-zoom-effect link-effect">
                <div class="image-holder">
                  <img
                    :src="item.cover_url"
                    :alt="item.title"
                    class="product-image img-fluid"
                  >
                </div>
                <div class="portfolio-content mt-3">
                  <span class="text-uppercase text-secondary fs-6 letter-spacing-1">
                    {{ item.category }}
                  </span>
                  <h5 class="element-title text-uppercase mt-1">
                    {{ item.vendor?.business_name || item.title }}
                  </h5>
                  <span v-if="item.vendor?.starting_price" class="text-dark fw-medium">
                    {{ formatPrice(item.vendor.starting_price) }}
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        <div class="featured-pagination d-flex justify-content-center mt-4"></div>
      </div>

      <div class="d-flex justify-content-center gap-3 mt-4">
        <div class="icon-arrow featured-prev">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <use xlink:href="#arrow-left"></use>
          </svg>
        </div>
        <div class="icon-arrow featured-next">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <use xlink:href="#arrow-right"></use>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.2em;
}
.letter-spacing-1 {
  letter-spacing: 0.1em;
}
.portfolio-card {
  cursor: pointer;
}
.portfolio-content {
  transition: transform 0.3s ease;
}
.portfolio-card:hover .portfolio-content {
  transform: translateY(-4px);
}
.image-holder {
  border-radius: 12px;
  overflow: hidden;
}
</style>
