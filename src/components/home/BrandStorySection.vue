<script setup lang="ts">
import brandImage from '@/assets/kaira/images/banner-image-1.jpg'
</script>

<template>
  <section class="brand-story py-5 overflow-hidden">
    <div class="container">
      <div class="row align-items-center g-5">
        <div class="col-lg-6" data-aos="fade-right">
          <div class="story-image image-zoom-effect">
            <div class="image-holder">
              <img :src="brandImage" alt="Tentang Sigyn" class="img-fluid">
            </div>
          </div>
        </div>
        <div class="col-lg-6" data-aos="fade-left" data-aos-delay="200">
          <div class="story-content">
            <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Tentang Sigyn</span>
            <h2 class="section-title display-5 mt-2 mb-4">Where Art Meets<br>Every Occasion</h2>
            <p class="mb-4">
              Terinspirasi dari nama dewi kesetiaan dalam mitologi Nordik, <strong>Sigyn</strong> hadir untuk menemani setiap momen berharga Anda. Kami adalah platform aggregator yang menghubungkan Anda dengan vendor jasa kreatif terkurasi — dari fotografi, makeup artist, nail art, hingga bouquet flowers.
            </p>
            <p class="mb-4">
              Setiap vendor telah melewati kurasi ketat untuk memastikan kualitas terbaik untuk hari spesial Anda. Percayakan momen berharga Anda pada Sigyn — <em>where art meets every occasion</em>.
            </p>
            <router-link to="/about" class="btn-link text-uppercase text-decoration-none item-anchor">
              Learn Our Story
              <svg width="16" height="16" viewBox="0 0 24 24" class="ms-1">
                <use xlink:href="#arrow-right"></use>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.letter-spacing-2 {
  letter-spacing: 0.2em;
}
.story-content p {
  font-size: 1.05rem;
  line-height: 1.8;
}
</style>
