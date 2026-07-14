<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import mainLogo from '@/assets/kaira/images/logosigyn.png'
import aboutHero from '@/assets/kaira/images/banner-image-4.jpg'
import aboutTeam from '@/assets/kaira/images/banner-image-3.jpg'

const stats = [
  { number: '50+', label: 'Vendors Terkurasi' },
  { number: '200+', label: 'Projects Selesai' },
  { number: '95%', label: 'Kepuasan Pelanggan' },
  { number: '5+', label: 'Kota Tersedia' },
]

const values = [
  { icon: 'star-solid', title: 'Kurasi Ketat', desc: 'Setiap vendor melewati proses seleksi untuk memastikan kualitas terbaik.' },
  { icon: 'heart', title: 'Komitmen', desc: 'Kami berkomitmen menemani setiap momen berharga Anda dengan layanan terbaik.' },
  { icon: 'check', title: 'Transparansi', desc: 'Harga jelas, tanpa biaya tersembunyi. Booking mudah dan aman.' },
  { icon: 'user', title: 'Personal Approach', desc: 'Kami memahami setiap klien unik, dan merekomendasikan vendor yang sesuai.' },
]
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <section class="about-hero position-relative d-flex align-items-center" :style="{ backgroundImage: 'url(' + aboutHero + ')' }">
      <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
      <div class="container position-relative z-1 text-center text-white">
        <h1 class="display-4 mb-3" data-aos="fade-up">Tentang Sigyn</h1>
        <p class="lead text-white-50 col-md-6 mx-auto" data-aos="fade-up" data-aos-delay="200">
          Platform aggregator jasa kreatif yang menghubungkan Anda dengan vendor terbaik untuk setiap momen spesial.
        </p>
      </div>
    </section>

    <section class="story-section py-5">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-5" data-aos="fade-right">
            <div class="logo-section text-center">
              <img :src="mainLogo" alt="Sigyn" style="max-width: 200px; height: auto;">
              <div class="tagline-wrapper mt-4 p-4 bg-light rounded-4">
                <em class="fs-5 text-secondary">"Where Art Meets Every Occasion"</em>
              </div>
            </div>
          </div>
          <div class="col-lg-7" data-aos="fade-left" data-aos-delay="200">
            <h2 class="display-6 mb-4">Our Story</h2>
            <p class="mb-3">
              Dalam mitologi Nordik, <strong>Sigyn</strong> adalah dewi kesetiaan yang setia mendampingi — dan itulah filosofi kami. <strong>Sigyn</strong> lahir dari visi untuk menciptakan ekosistem jasa kreatif yang terpercaya, transparan, dan mudah diakses.
            </p>
            <p class="mb-3">
              Kami percaya setiap momen spesial layak diabadikan dengan sempurna. Dari lensa kamera yang menangkap tawa bahagia, sentuhan kuas MUA yang mempercantik, rangkaian bunga yang mekar indah, hingga detail nail art yang memukau — <strong>Sigyn</strong> hadir untuk memastikan setiap detail kreatif berjalan sesuai impian Anda.
            </p>
            <p>
              Dengan sistem kurasi ketat, booking yang mudah, dan pembayaran yang aman, kami ingin memberikan pengalaman terbaik dalam menemukan vendor jasa kreatif impian Anda.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="stats-section py-5 bg-light">
      <div class="container">
        <div class="row g-4">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="col-6 col-lg-3 text-center"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <h3 class="display-4 text-secondary fw-bold mb-1">{{ stat.number }}</h3>
            <p class="text-muted text-uppercase small letter-spacing">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="values-section py-5">
      <div class="container">
        <div class="text-center mb-5" data-aos="fade-up">
          <h2 class="display-6">Nilai-Nilai Kami</h2>
        </div>
        <div class="row g-4">
          <div
            v-for="(val, index) in values"
            :key="index"
            class="col-md-6 col-lg-3"
            data-aos="fade-up"
            :data-aos-delay="index * 150"
          >
            <div class="value-card text-center p-4 h-100">
              <div class="value-icon mx-auto mb-3 d-flex align-items-center justify-content-center">
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <use :xlink:href="`#${val.icon}`"></use>
                </svg>
              </div>
              <h4 class="text-uppercase mb-3">{{ val.title }}</h4>
              <p class="text-muted">{{ val.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="services-section py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5" data-aos="fade-up">
          <h2 class="display-6">Layanan Kami</h2>
        </div>
        <div class="row g-4">
          <div class="col-md-6 col-lg-3" data-aos="fade-up">
            <div class="service-item text-center p-4">
              <div class="service-icon mx-auto mb-3">📷</div>
              <h4 class="text-uppercase">Photography</h4>
              <p class="text-muted">Abadikan momen berharga dengan fotografer profesional untuk wedding, prewedding, dan event spesial.</p>
              <router-link to="/photography" class="btn-link text-uppercase text-decoration-none item-anchor">Explore</router-link>
            </div>
          </div>
          <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
            <div class="service-item text-center p-4">
              <div class="service-icon mx-auto mb-3">💄</div>
              <h4 class="text-uppercase">MUA</h4>
              <p class="text-muted">Tampil memukau di hari spesialmu dengan makeup artist profesional dan berpengalaman.</p>
              <router-link to="/mua" class="btn-link text-uppercase text-decoration-none item-anchor">Explore</router-link>
            </div>
          </div>
          <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
            <div class="service-item text-center p-4">
              <div class="service-icon mx-auto mb-3">💅</div>
              <h4 class="text-uppercase">Nail Art</h4>
              <p class="text-muted">Sentuhan cantik di ujung jarimu dengan kreasi nail art yang unik dan stylish.</p>
              <router-link to="/photography" class="btn-link text-uppercase text-decoration-none item-anchor">Explore</router-link>
            </div>
          </div>
          <div class="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
            <div class="service-item text-center p-4">
              <div class="service-icon mx-auto mb-3">💐</div>
              <h4 class="text-uppercase">Bouquet Flowers</h4>
              <p class="text-muted">Harum segar bunga pilihan untuk orang tersayang, dirangkai dengan seni dan cinta.</p>
              <router-link to="/bouquet" class="btn-link text-uppercase text-decoration-none item-anchor">Explore</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section py-5 text-center" data-aos="fade-up">
      <div class="container">
        <h2 class="display-6 mb-3">Siap Memulai?</h2>
        <p class="text-muted mb-4">Temukan vendor impianmu dan wujudkan momen spesialmu bersama Sigyn.</p>
        <router-link to="/photography" class="btn btn-dark btn-lg text-uppercase px-5 rounded-pill">
          Mulai Explore
        </router-link>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
.about-hero {
  height: 50vh;
  min-height: 350px;
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}
.letter-spacing {
  letter-spacing: 0.15em;
}
.logo-section img {
  filter: brightness(0.9);
}
.value-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bs-light);
  color: var(--bs-secondary);
}
.value-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}
.value-card:hover {
  background: var(--bs-light);
  transform: translateY(-4px);
}
.service-item {
  border-radius: 16px;
  background: #fff;
  transition: all 0.3s ease;
}
.service-item:hover {
  box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  transform: translateY(-4px);
}
.service-icon {
  font-size: 2.5rem;
}
</style>
