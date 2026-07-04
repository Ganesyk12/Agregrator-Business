<script setup lang="ts">
import { useSwiper } from '@/composables/useSwiper'

interface Testimonial {
  id: number
  text: string
  author: string
}

const testimonials: Testimonial[] = [
  { id: 1, text: '“More than expected crazy soft, flexible and best fitted white simple denim shirt.”', author: 'casual way' },
  { id: 2, text: '“Best fitted white denim shirt more than expected crazy soft, flexible', author: 'uptop' },
  { id: 3, text: '“Best fitted white denim shirt more white denim than expected flexible crazy soft.”', author: 'Denim craze' },
  { id: 4, text: '“Best fitted white denim shirt more than expected crazy soft, flexible', author: 'uptop' }
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
    <div class="section-header text-center mt-5">
      <h3 class="section-title">WE LOVE GOOD COMPLIMENT</h3>
    </div>
    <div class="swiper testimonial-swiper overflow-hidden my-5">
      <div class="swiper-wrapper d-flex">
        <div v-for="testimonial in testimonials" :key="testimonial.id" class="swiper-slide">
          <div class="testimonial-item text-center">
            <blockquote>
              <p>{{ testimonial.text }}</p>
              <div class="review-title text-uppercase">{{ testimonial.author }}</div>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
    <div class="testimonial-swiper-pagination d-flex justify-content-center mb-5"></div>
  </section>
</template>