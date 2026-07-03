<script setup lang="ts">
import instaItem1 from '@/assets/kaira/images/insta-item1.jpg'
import instaItem2 from '@/assets/kaira/images/insta-item2.jpg'
import instaItem3 from '@/assets/kaira/images/insta-item3.jpg'
import instaItem4 from '@/assets/kaira/images/insta-item4.jpg'
import instaItem5 from '@/assets/kaira/images/insta-item5.jpg'
import instaItem6 from '@/assets/kaira/images/insta-item6.jpg'

const instagramImages = [
  instaItem1,
  instaItem2,
  instaItem3,
  instaItem4,
  instaItem5,
  instaItem6
]
</script>

<template>
  <section class="instagram position-relative">
    <div class="d-flex justify-content-center w-100 position-absolute bottom-0 z-1">
      <a href="https://www.instagram.com/templatesjungle/" class="btn btn-dark px-5" target="_blank">
        Follow us on Instagram
      </a>
    </div>
    <div class="row g-0">
      <div v-for="(image, index) in instagramImages" :key="index" class="col-6 col-sm-4 col-md-2">
        <div class="insta-item">
          <a href="https://www.instagram.com/templatesjungle/" target="_blank">
            <img :src="image" alt="instagram" class="insta-image img-fluid">
          </a>
        </div>
      </div>
    </div>
  </section>
</template>