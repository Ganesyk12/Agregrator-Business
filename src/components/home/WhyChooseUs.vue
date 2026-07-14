<script setup lang="ts">
interface Reason {
  icon: string
  title: string
  description: string
}

const reasons: Reason[] = [
  {
    icon: 'check',
    title: 'Vendors Terkurasi',
    description: 'Setiap vendor telah melewati proses kurasi ketat untuk memastikan kualitas dan profesionalisme terbaik.'
  },
  {
    icon: 'calendar',
    title: 'Easy Booking',
    description: 'Booking dalam 3 langkah mudah. Pilih vendor, tentukan jadwal, dan lakukan pembayaran DP.'
  },
  {
    icon: 'cart',
    title: 'Pembayaran Aman',
    description: 'Sistem DP yang aman dan terpercaya. Bayar sebagian di awal, sisanya setelah puas dengan hasilnya.'
  },
  {
    icon: 'user',
    title: 'Konsultasi Gratis',
    description: 'Tanya-tanya dulu sebelum booking. Tim kami siap membantu kamu memilih vendor yang tepat.'
  }
]
</script>

<template>
  <section class="why-choose-us py-5 overflow-hidden">
    <div class="container">
      <div class="row justify-content-center text-center mb-5">
        <div class="col-md-8" data-aos="fade-up">
          <span class="text-uppercase text-secondary letter-spacing-2 fs-6">Kenapa Sigyn?</span>
          <h2 class="section-title display-6 mt-2">Alasan Memilih Platform Kami</h2>
        </div>
      </div>
      <div class="row g-4">
        <div
          v-for="(reason, index) in reasons"
          :key="index"
          class="col-md-6 col-lg-3 text-center"
          data-aos="fade-in"
          :data-aos-delay="index * 200"
        >
          <div class="reason-card py-4 px-3 h-100">
            <div class="reason-icon mx-auto mb-3 d-flex align-items-center justify-content-center">
              <svg width="32" height="32" viewBox="0 0 24 24">
                <use :xlink:href="`#${reason.icon}`"></use>
              </svg>
            </div>
            <h4 class="element-title text-uppercase my-3">{{ reason.title }}</h4>
            <p class="text-muted">{{ reason.description }}</p>
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
.reason-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--bs-light);
  color: var(--bs-secondary);
  transition: all 0.3s ease;
}
.reason-card:hover .reason-icon {
  background: var(--bs-secondary);
  color: #fff;
  transform: scale(1.1);
}
.reason-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}
.reason-card:hover {
  background: var(--bs-light);
}
</style>
