<script setup lang="ts">
import { useSwiper } from '@/composables/useSwiper'

import bannerImage1 from '@/assets/kaira/images/banner-image-1.jpg'
import bannerImage2 from '@/assets/kaira/images/banner-image-2.jpg'
import bannerImage3 from '@/assets/kaira/images/banner-image-3.jpg'
import bannerImage4 from '@/assets/kaira/images/banner-image-5.jpg'

interface Banner {
  id: number
  image: string
  title: string
  subtitle: string
}

const banners: Banner[] = [
  {
    id: 1,
    image: bannerImage1,
    title: 'Momen Spesial, Abadi Selamanya',
    subtitle: 'Jasa fotografi profesional untuk setiap momen berharga'
  },
  {
    id: 2,
    image: bannerImage2,
    title: 'Glow Up for Your Big Day',
    subtitle: 'Makeup artist berpengalaman untuk penampilan memukau'
  },
  {
    id: 3,
    image: bannerImage3,
    title: 'Harum Bunga, Penuh Makna',
    subtitle: 'Rangkaian bouquet segar untuk yang tersayang'
  },
  {
    id: 4,
    image: bannerImage4,
    title: 'Seni di Ujung Jarimu',
    subtitle: 'Nail art unik dan stylish untuk melengkapi gaya'
  }
]

useSwiper('.hero-swiper', {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  effect: 'fade',
  autoplay: {
    delay: 5000,
    disableOnInteraction: false
  },
  pagination: {
    el: '.hero-pagination',
    clickable: true
  }
})
</script>

<template>
  <section id="hero" class="hero-banner position-relative overflow-hidden">
    <div class="swiper hero-swiper h-100">
      <div class="swiper-wrapper">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="swiper-slide"
        >
          <div class="hero-slide position-relative d-flex align-items-center" :style="{ backgroundImage: 'url(' + banner.image + ')' }">
            <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
            <div class="container position-relative z-1">
              <div class="row">
                <div class="col-lg-7">
                  <span class="hero-tag text-uppercase text-white-50 letter-spacing-2 fs-6 d-block mb-3">
                    Sigyn — Where Art Meets Every Occasion
                  </span>
                  <h1 class="hero-title display-3 text-white fw-normal mb-4">
                    {{ banner.title }}
                  </h1>
                  <p class="hero-subtitle lead text-white-50 mb-4">
                    {{ banner.subtitle }}
                  </p>
                  <div class="hero-cta d-flex flex-wrap gap-3">
                    <router-link to="/photography" class="btn btn-light btn-lg text-uppercase px-4 rounded-pill">
                      Explore Services
                    </router-link>
                    <router-link to="/about" class="btn btn-outline-light btn-lg text-uppercase px-4 rounded-pill">
                      Learn More
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-pagination d-flex justify-content-center position-absolute bottom-0 start-50 translate-middle-x z-1 pb-4"></div>
    </div>
  </section>
</template>

<style scoped>
.hero-banner {
  height: 90vh;
  min-height: 500px;
  max-height: 800px;
}
.hero-slide {
  height: 90vh;
  min-height: 500px;
  max-height: 800px;
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}
.letter-spacing-2 {
  letter-spacing: 0.2em;
}
.hero-title {
  line-height: 1.15;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.hero-subtitle {
  max-width: 540px;
}
.hero-tag {
  font-size: 0.85rem;
}
</style>
