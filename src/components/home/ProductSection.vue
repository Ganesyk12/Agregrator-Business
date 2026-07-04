<script setup lang="ts">
import { useSwiper } from '@/composables/useSwiper'

interface Product {
  id: number
  image: string
  name: string
  price: string
}

const props = defineProps<{
  title: string
  viewAllLink?: string
  products: Product[]
  swiperClass: string
}>()

// Gunakan composable useSwiper dengan selector dinamis
useSwiper(`.${props.swiperClass}`, {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: false,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  navigation: {
    nextEl: '.icon-arrow-right',
    prevEl: '.icon-arrow-left'
  },
  breakpoints: {
    576: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 20 },
    992: { slidesPerView: 4, spaceBetween: 20 }
  }
})
</script>

<template>
  <section class="product-carousel py-5 position-relative overflow-hidden">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mt-5 mb-3">
        <h4 class="text-uppercase">{{ title }}</h4>
        <a :href="viewAllLink || '#'" class="btn-link">View All Products</a>
      </div>
      <div class="swiper open-up" :class="swiperClass" data-aos="zoom-out">
        <div class="swiper-wrapper d-flex">
          <div v-for="product in products" :key="product.id" class="swiper-slide">
            <div class="product-item image-zoom-effect link-effect">
              <div class="image-holder position-relative">
                <a href="#">
                  <img :src="product.image" :alt="product.name" class="product-image img-fluid">
                </a>
                <a href="#" class="btn-icon btn-wishlist">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <use xlink:href="#heart"></use>
                  </svg>
                </a>
                <div class="product-content">
                  <h5 class="element-title text-uppercase fs-5 mt-3">
                    <a href="#">{{ product.name }}</a>
                  </h5>
                  <a href="#" class="text-decoration-none" data-after="Add to cart">
                    <span>{{ product.price }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="swiper-pagination"></div>
      </div>
      <div class="icon-arrow icon-arrow-left">
        <svg width="50" height="50" viewBox="0 0 24 24">
          <use xlink:href="#arrow-left"></use>
        </svg>
      </div>
      <div class="icon-arrow icon-arrow-right">
        <svg width="50" height="50" viewBox="0 0 24 24">
          <use xlink:href="#arrow-right"></use>
        </svg>
      </div>
    </div>
  </section>
</template>