<script setup lang="ts">
interface Step {
  number: string
  title: string
  description: string
  icon: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Browse',
    description: 'Jelajahi portofolio vendor terkurasi kami. Pilih gaya yang sesuai dengan seleramu.',
    icon: 'search'
  },
  {
    number: '02',
    title: 'Book',
    description: 'Pilih paket, tentukan jadwal, dan lakukan booking dengan sistem DP yang aman.',
    icon: 'calendar'
  },
  {
    number: '03',
    title: 'Enjoy',
    description: 'Nikmati momen spesialmu! Vendor kami akan memberikan hasil terbaik untukmu.',
    icon: 'star-solid'
  }
]
</script>

<template>
  <section class="how-it-works py-5 overflow-hidden">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-md-8" data-aos="fade-up">
          <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Cara Mudah Booking</span>
          <h2 class="section-title display-6 mt-2">Tiga Langkah Mudah Bersama Sigyn</h2>
        </div>
      </div>
      <div class="row g-4 position-relative">
        <div class="col-lg-4" v-for="(step, index) in steps" :key="index">
          <div class="step-card text-center" data-aos="fade-up" :data-aos-delay="index * 200">
            <div class="step-number position-relative d-inline-block mb-4">
              <span class="display-3 fw-bold text-secondary opacity-25">{{ step.number }}</span>
              <div class="step-icon-wrapper position-absolute top-50 start-50 translate-middle">
                <svg width="32" height="32" viewBox="0 0 24 24" class="text-dark">
                  <use :xlink:href="`#${step.icon}`"></use>
                </svg>
              </div>
            </div>
            <div v-if="index < steps.length - 1" class="step-connector d-none d-lg-block"></div>
            <h4 class="text-uppercase mb-3">{{ step.title }}</h4>
            <p class="text-muted px-3">{{ step.description }}</p>
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
.step-number {
  width: 100px;
  height: 100px;
}
.step-icon-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bs-light);
  border-radius: 50%;
}
.step-card {
  position: relative;
}
.step-connector {
  position: absolute;
  top: 50px;
  right: -20px;
  width: 40px;
  height: 2px;
  border-top: 2px dashed var(--bs-secondary);
}
</style>
