<script setup lang="ts">
import videoImage from '@/assets/kaira/images/video-image-2.jpg'
import textPattern from '@/assets/kaira/images/text-pattern.png'
</script>

<template>
  <section class="video py-5 overflow-hidden">
    <div class="container-fluid">
      <div class="row">
        <div class="video-content open-up" data-aos="zoom-out">
          <div class="video-bg">
            <img :src="videoImage" alt="video" class="video-image img-fluid">
          </div>
          <div class="video-player">
            <a class="youtube" href="https://www.youtube.com/embed/pjtsGzQjFM4" target="_blank">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <use xlink:href="#play"></use>
              </svg>
              <img :src="textPattern" alt="pattern" class="text-rotate">
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>