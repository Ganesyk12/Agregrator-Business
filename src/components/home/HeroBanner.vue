<script setup lang="ts">
import { useSwiper } from '@/composables/useSwiper'

import bannerImage1 from '@/assets/kaira/images/banner-image-1.jpg'
import bannerImage2 from '@/assets/kaira/images/banner-image-2.jpg'
import bannerImage3 from '@/assets/kaira/images/banner-image-3.jpg'
import bannerImage4 from '@/assets/kaira/images/banner-image-4.jpg'
import bannerImage5 from '@/assets/kaira/images/banner-image-5.jpg'
import bannerImage6 from '@/assets/kaira/images/banner-image-6.jpg'

interface Banner {
  id: number
  image: string
  title: string
  description: string
}

const banners: Banner[] = [
  {
    id: 1,
    image: bannerImage6,
    title: 'Soft leather jackets',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  },
  {
    id: 2,
    image: bannerImage1,
    title: 'Soft leather jackets',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  },
  {
    id: 3,
    image: bannerImage2,
    title: 'Soft leather jackets',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  },
  {
    id: 4,
    image: bannerImage3,
    title: 'Soft leather jackets',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  },
  {
    id: 5,
    image: bannerImage4,
    title: 'Out crop sweater',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  },
  {
    id: 6,
    image: bannerImage5,
    title: 'Soft leather jackets',
    description: 'Scelerisque duis aliquam qui lorem ipsum dolor amet, consectetur adipiscing elit.'
  }
]

useSwiper('.main-swiper', {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  navigation: {
    nextEl: '.icon-arrow-right',
    prevEl: '.icon-arrow-left'
  },
  breakpoints: {
    768: { slidesPerView: 2, spaceBetween: 30 },
    992: { slidesPerView: 3, spaceBetween: 30 }
  }
})
</script>

<template>
  <section id="billboard" class="bg-light py-5">
    <div class="container">
      <div class="row justify-content-center">
        <h1 class="section-title text-center mt-4" data-aos="fade-up">New Collections</h1>
        <div class="col-md-6 text-center" data-aos="fade-up" data-aos-delay="300">
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe voluptas ut dolorum consequuntur, adipisci
            repellat! Eveniet commodi voluptatem voluptate, eum minima, in suscipit explicabo voluptatibus harum,
            quibusdam ex repellat eaque!</p>
        </div>
      </div>
      <div class="row">
        <div class="swiper main-swiper py-4" data-aos="fade-up" data-aos-delay="600">
          <div class="swiper-wrapper d-flex border-animation-left">
            <div v-for="banner in banners" :key="banner.id" class="swiper-slide">
              <div class="banner-item image-zoom-effect">
                <div class="image-holder">
                  <a href="#">
                    <img :src="banner.image" :alt="banner.title" class="img-fluid">
                  </a>
                </div>
                <div class="banner-content py-4">
                  <h5 class="element-title text-uppercase">
                    <a href="/" class="item-anchor">{{ banner.title }}</a>
                  </h5>
                  <p>{{ banner.description }}</p>
                  <div class="btn-left">
                    <a href="#" class="btn-link fs-6 text-uppercase item-anchor text-decoration-none">Discover Now</a>
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
    </div>
  </section>
</template>