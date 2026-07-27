<script setup lang="ts">
const benefits = [
  {
    icon: 'image',
    title: 'Showcase Your Portfolio',
    desc: 'Tampilkan karya terbaik Anda dan biarkan calon klien terpesona.'
  },
  {
    icon: 'calendar',
    title: 'Receive Online Bookings',
    desc: 'Terima pemesanan secara online dengan sistem booking otomatis.'
  },
  {
    icon: 'users',
    title: 'Reach More Customers',
    desc: 'Jangkau lebih banyak pelanggan potensial di seluruh Indonesia.'
  },
  {
    icon: 'shield',
    title: 'Build Customer Trust',
    desc: 'Tingkatkan kepercayaan dengan profil vendor yang profesional.'
  },
  {
    icon: 'grid',
    title: 'Professional Dashboard',
    desc: 'Kelola bisnis Anda dengan dashboard yang mudah digunakan.'
  },
  {
    icon: 'check-circle',
    title: 'Easy Booking Management',
    desc: 'Atur jadwal, konfirmasi booking, dan kelola pesanan dengan mudah.'
  },
  {
    icon: 'credit-card',
    title: 'Secure Payments',
    desc: 'Nikmati sistem pembayaran yang aman dan transparan.'
  }
]

const iconPaths: Record<string, string> = {
  image: 'M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3zM12 15a3 3 0 100-6 3 3 0 000 6z',
  calendar: 'M8 2v4M16 2v4M3 10h18M21 6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6z',
  users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  grid: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z',
  'check-circle': 'M22 12a10 10 0 11-20 0 10 10 0 0120 0zM9 12l2 2 4-4',
  'credit-card': 'M1 5a2 2 0 012-2h18a2 2 0 012 2v14a2 2 0 01-2 2H3a2 2 0 01-2-2V5zm0 6h20M6 16h4'
}
</script>

<template>
  <section class="partner-section">
    <div class="container">
      <div class="partner-wrapper" data-aos="fade-up">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <div class="partner-content">
              <span class="section-label">Join Us</span>
              <h2 class="section-title">Grow Your Creative Business<br>With SIGYN</h2>
              <p class="section-desc">
                Bergabunglah dengan platform kreatif terkemuka dan hubungkan bisnis Anda dengan ribuan calon pelanggan yang mencari layanan berkualitas.
              </p>

              <div class="benefits-grid">
                <div
                  v-for="(benefit, i) in benefits"
                  :key="i"
                  class="benefit-item"
                >
                  <div class="benefit-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path :d="iconPaths[benefit.icon]"/>
                    </svg>
                  </div>
                  <div class="benefit-text">
                    <strong>{{ benefit.title }}</strong>
                    <p>{{ benefit.desc }}</p>
                  </div>
                </div>
              </div>

              <router-link to="/partner" class="btn-partner">
                Become a Partner
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="partner-visual" data-aos="fade-left" data-aos-delay="200">
              <div class="visual-card card-1">
                <div class="visual-img" style="background-image: url('https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=800&fit=crop')"></div>
                <div class="visual-label">Photographers</div>
              </div>
              <div class="visual-card card-2">
                <div class="visual-img" style="background-image: url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=800&fit=crop')"></div>
                <div class="visual-label">Makeup Artists</div>
              </div>
              <div class="visual-card card-3">
                <div class="visual-img" style="background-image: url('https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=800&fit=crop')"></div>
                <div class="visual-label">Bouquet Vendors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.partner-section {
  padding: 100px 0;
  background: var(--bs-body-bg, #F7F4EF);
  position: relative;
  overflow: hidden;
}

.partner-wrapper {
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 32px;
  padding: 80px 70px;
  position: relative;
  overflow: hidden;
}

.partner-wrapper::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(184,156,123,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.section-label {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  margin-bottom: 16px;
}

.section-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 2.6rem;
  color: #fff;
  margin: 0 0 20px;
  line-height: 1.2;
}

.section-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 1.05rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 40px;
  line-height: 1.7;
  max-width: 520px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.benefit-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(184, 156, 123, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
}

.benefit-text strong {
  display: block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 2px;
}

.benefit-text p {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  color: rgba(255,255,255,0.55);
  margin: 0;
  line-height: 1.4;
}

.btn-partner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  padding: 16px 40px;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 8px 30px rgba(184, 156, 123, 0.3);
}

.btn-partner:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.45);
  gap: 14px;
  color: #fff;
}

.partner-visual {
  position: relative;
  min-height: 500px;
}

.visual-card {
  position: absolute;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.3);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.visual-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.visual-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.visual-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
}

.card-1 {
  width: 220px;
  height: 280px;
  top: 0;
  right: 60px;
  z-index: 3;
}

.card-2 {
  width: 180px;
  height: 240px;
  top: 140px;
  right: 0;
  z-index: 2;
}

.card-3 {
  width: 200px;
  height: 260px;
  top: 200px;
  right: 100px;
  z-index: 1;
}

@media (max-width: 992px) {
  .partner-wrapper {
    padding: 50px 30px;
  }

  .section-title {
    font-size: 2rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .card-1 { width: 180px; height: 230px; right: 40px; }
  .card-2 { width: 150px; height: 200px; top: 100px; right: 0; }
  .card-3 { width: 160px; height: 210px; top: 160px; right: 70px; }
}

@media (max-width: 576px) {
  .partner-section {
    padding: 60px 0;
  }

  .partner-wrapper {
    padding: 40px 24px;
    border-radius: 24px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .partner-visual {
    min-height: 350px;
    margin-top: 30px;
  }

  .card-1 { width: 160px; height: 200px; right: 30px; }
  .card-2 { width: 130px; height: 170px; top: 80px; right: 0; }
  .card-3 { width: 140px; height: 180px; top: 140px; right: 55px; }
}
</style>
