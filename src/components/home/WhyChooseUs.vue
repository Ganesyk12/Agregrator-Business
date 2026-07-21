<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: 'shield',
    title: 'Trusted Vendors',
    description: 'Every vendor is verified before joining SIGYN. Kami kurasi setiap vendor untuk memastikan kualitas dan profesionalisme terbaik.'
  },
  {
    icon: 'search',
    title: 'Inspiration First',
    description: 'Find ideas before choosing vendors. Jelajahi ribuan inspirasi sebelum memutuskan vendor yang tepat untuk Anda.'
  },
  {
    icon: 'calendar',
    title: 'Easy Booking',
    description: 'Simple and intuitive booking experience. Booking dalam beberapa langkah mudah tanpa ribet.'
  },
  {
    icon: 'credit-card',
    title: 'Secure Payments',
    description: 'Transparent and secure payment process. Sistem pembayaran yang aman dan transparan untuk ketenangan pikiran Anda.'
  },
  {
    icon: 'star',
    title: 'Customer Reviews',
    description: 'Real reviews from verified bookings. Lihat pengalaman nyata dari pelanggan sebelumnya untuk membuat keputusan tepat.'
  },
  {
    icon: 'layout',
    title: 'Premium Experience',
    description: 'Modern interface designed for memorable celebrations. Nikmati pengalaman premium yang dirancang khusus untuk momen spesial Anda.'
  }
]

const iconPaths: Record<string, string> = {
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  calendar: 'M8 2v4M16 2v4M3 10h18M21 6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6z',
  'credit-card': 'M1 5a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5zm0 6h20M6 16h4',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  layout: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z'
}
</script>

<template>
  <section class="why-choose-sigyn">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Why Sigyn</span>
        <h2 class="section-title">Why Choose SIGYN</h2>
        <p class="section-desc">Kami hadir untuk membuat momen spesial Anda menjadi lebih berarti</p>
      </div>

      <div class="features-grid">
        <div
          v-for="(feature, i) in features"
          :key="i"
          class="feature-card"
          data-aos="fade-up"
          :data-aos-delay="i * 100"
        >
          <div class="feature-icon-wrapper">
            <div class="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="iconPaths[feature.icon]"/>
                <circle v-if="feature.icon === 'search'" cx="11" cy="11" r="8"/>
              </svg>
            </div>
          </div>
          <h4 class="feature-title">{{ feature.title }}</h4>
          <p class="feature-desc">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.why-choose-sigyn {
  padding: 100px 0;
  background: var(--bs-body-bg, #F7F4EF);
  position: relative;
}

.section-header {
  margin-bottom: 60px;
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
  font-size: 2.8rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 16px;
  line-height: 1.2;
}

.section-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 1.1rem;
  color: var(--bs-body-color, #5a5a5a);
  max-width: 500px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 36px 30px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--bs-primary, #DCCEB6), var(--bs-secondary, #B89C7B));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(184, 156, 123, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.feature-icon-wrapper {
  margin-bottom: 20px;
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--bs-light, #ECE6DD), #e0d5c5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
  transition: all 0.4s ease;
}

.feature-card:hover .feature-icon {
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  color: #fff;
  transform: scale(1.05);
}

.feature-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.2rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 12px;
  font-weight: 400;
}

.feature-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0;
  line-height: 1.7;
}

@media (max-width: 992px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .why-choose-sigyn {
    padding: 60px 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .feature-card {
    padding: 28px 24px;
  }
}
</style>
