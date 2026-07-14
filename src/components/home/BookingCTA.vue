<script setup lang="ts">
import ctaBg from '@/assets/kaira/images/banner-image-2.jpg'
</script>

<template>
  <section class="booking-cta py-5 position-relative overflow-hidden">
    <div
      class="cta-bg position-absolute top-0 start-0 w-100 h-100"
      :style="{ backgroundImage: 'url(' + ctaBg + ')' }"
    ></div>
    <div class="cta-overlay position-absolute top-0 start-0 w-100 h-100"></div>
    <div class="container position-relative z-1">
      <div class="row justify-content-center text-center" data-aos="fade-up">
        <div class="col-md-8 col-lg-6 py-5">
          <h2 class="display-5 text-white mb-3">Ready to Start Your Journey?</h2>
          <p class="lead text-white-50 mb-4">
            Temukan vendor impianmu dan wujudkan momen spesialmu bersama Sigyn.
          </p>
          <router-link
            to="/photography"
            class="btn btn-lg btn-cta text-uppercase px-5 py-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" class="me-2">
              <use xlink:href="#star-solid"></use>
            </svg>
            Start Booking Now
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-cta {
  min-height: 400px;
}
.cta-bg {
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
}
.cta-overlay {
  background: linear-gradient(135deg, rgba(42,42,42,0.6) 0%, rgba(0,0,0,0.3) 100%);
}
.btn-cta {
  background: var(--bs-secondary);
  border-color: var(--bs-secondary);
  color: #fff;
  border-radius: 50px;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}
.btn-cta:hover {
  background: var(--bs-primary);
  border-color: var(--bs-primary);
  color: var(--bs-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3);
}
</style>
