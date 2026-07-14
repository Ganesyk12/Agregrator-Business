<script setup lang="ts">
import { useSwiper } from '@/composables/useSwiper'

interface Testimonial {
  id: number
  text: string
  author: string
  role: string
}

const testimonials: Testimonial[] = [
  { id: 1, text: '"Hasil foto preweddingnya luar biasa! Semua momen kebener dengan sempurna. Thank you Sigyn for connecting us with such a talented photographer!"', author: 'Sarah & Andi', role: 'Wedding Photography' },
  { id: 2, text: '"Makeupnya tahan seharian dan flawless banget. Aku dapat MUA yang sesuai banget sama requestku. Highly recommended untuk bridal!"', author: 'Dina Pratiwi', role: 'Bridal Makeup' },
  { id: 3, text: '"Bouquet bunganya segar banget dan sesuai persis sama referensi yang aku kasih. Pengiriman juga tepat waktu. Thank you Sigyn!"', author: 'Rina Amelia', role: 'Bouquet Flowers' },
  { id: 4, text: '"Gak nyangka booking semudah ini. Tinggal pilih vendor, atur jadwal, bayar DP, sisanya beres. Acara pernikahanku jadi lancar!"', author: 'Bunga Lestari', role: 'Wedding Organizer' }
]

useSwiper('.testimonial-swiper', {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: '.testimonial-swiper-pagination',
    clickable: true
  },
  breakpoints: {
    768: { slidesPerView: 2, spaceBetween: 30 },
    992: { slidesPerView: 3, spaceBetween: 30 }
  }
})
</script>

<template>
  <section class="testimonials py-5 bg-light">
    <div class="container">
      <div class="section-header text-center mt-5" data-aos="fade-up">
        <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Testimonials</span>
        <h3 class="section-title display-6 mt-2">Apa Kata Mereka?</h3>
      </div>
      <div class="swiper testimonial-swiper overflow-hidden my-5" data-aos="fade-up" data-aos-delay="200">
        <div class="swiper-wrapper d-flex">
          <div v-for="testimonial in testimonials" :key="testimonial.id" class="swiper-slide">
            <div class="testimonial-item text-center p-4">
              <div class="stars mb-3">
                <svg v-for="i in 5" :key="i" width="18" height="18" viewBox="0 0 15 15" class="text-secondary">
                  <use xlink:href="#star-solid"></use>
                </svg>
              </div>
              <blockquote class="mb-4">
                <p class="fs-5 fst-italic">{{ testimonial.text }}</p>
              </blockquote>
              <div class="review-author">
                <strong class="text-uppercase d-block">{{ testimonial.author }}</strong>
                <span class="text-muted small">{{ testimonial.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="testimonial-swiper-pagination d-flex justify-content-center pb-4"></div>
    </div>
  </section>
</template>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.2em;
}
.testimonial-item blockquote p {
  line-height: 1.6;
}
</style>
