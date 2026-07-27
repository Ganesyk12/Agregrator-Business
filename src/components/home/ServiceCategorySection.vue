<script setup lang="ts">
interface Service {
  id: number
  icon: string
  title: string
  nameId: string
  description: string
  link: string
  gradient: string
  image: string
}

const services: Service[] = [
  {
    id: 1,
    icon: 'camera',
    title: 'Photography',
    nameId: 'Fotografi Profesional',
    description: 'Capture unforgettable memories. Abadikan setiap momen berharga dengan fotografer profesional terbaik.',
    link: '/explore',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=1000&fit=crop'
  },
  {
    id: 2,
    icon: 'brush',
    title: 'Makeup Artist',
    nameId: 'Tata Rias Profesional',
    description: 'Professional artists for your special moments. Tampil memukau dengan sentuhan makeup artist berpengalaman.',
    link: '/explore',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop'
  },
  {
    id: 3,
    icon: 'flower',
    title: 'Bouquet Flowers',
    nameId: 'Rangkaian Bunga Indah',
    description: 'Beautiful handcrafted bouquets. Harum segar bunga pilihan, dirangkai dengan seni dan cinta.',
    link: '/explore',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=1000&fit=crop'
  }
]

const comingSoonServices = [
  {
    title: 'Nail Art',
    description: 'Sentuhan cantik di ujung jarimu dengan kreasi nail art yang unik dan stylish.',
    icon: 'sparkles'
  }
]

const iconSvg: Record<string, string> = {
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  brush: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M17 11.5c-1.5 2-5 3.5-5 3.5s-3.5-1.5-5-3.5',
  flower: 'M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 7v14 M9 10.5c-2.5 0-4.5 1.5-4.5 4 0 1 .5 2 1.5 2.5L12 20l6-3c1-.5 1.5-1.5 1.5-2.5 0-2.5-2-4-4.5-4 M7 14c-1.5 0-3 1-3 3 M17 14c1.5 0 3 1 3 3',
  sparkles: 'M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z M7 16l-1 3 3-1 M17 16l1 3-3-1 M12 18v3'
}
</script>

<template>
  <section class="browse-services">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Our Services</span>
        <h2 class="section-title">Browse Services</h2>
        <p class="section-desc">Pilih layanan kreatif yang Anda butuhkan untuk momen spesial Anda</p>
      </div>

      <div class="services-grid">
        <div
          v-for="service in services"
          :key="service.id"
          class="service-card-wrapper"
          data-aos="fade-up"
          :data-aos-delay="service.id * 150"
        >
          <router-link :to="service.link" class="service-card">
            <div class="card-visual">
              <div class="card-image" :style="{ backgroundImage: `url(${service.image})` }"></div>
              <div class="card-image-overlay"></div>
              <div class="card-icon-wrapper" :style="{ background: service.gradient }">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="iconSvg[service.icon]"/>
                </svg>
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ service.title }}</h3>
              <p class="card-nameId">{{ service.nameId }}</p>
              <p class="card-desc">{{ service.description }}</p>
              <span class="card-cta">
                Explore {{ service.title }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </router-link>
        </div>
      </div>

      <div class="coming-soon-section" data-aos="fade-up" data-aos-delay="300">
        <div class="coming-soon-wrapper">
          <span class="coming-soon-label">More Creative Services Coming Soon</span>
          <div class="coming-soon-items">
            <div
              v-for="cs in comingSoonServices"
              :key="cs.title"
              class="coming-soon-item"
            >
              <div class="cs-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path :d="iconSvg[cs.icon]"/>
                </svg>
              </div>
              <div class="cs-text">
                <strong>{{ cs.title }}</strong>
                <p>{{ cs.description }}</p>
              </div>
              <span class="cs-badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.browse-services {
  padding: 100px 0;
  background: #fff;
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

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.service-card-wrapper {
  perspective: 1000px;
}

.service-card {
  display: block;
  text-decoration: none;
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 20px rgba(0,0,0,0.06);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 100%;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}

.card-visual {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.service-card:hover .card-image {
  transform: scale(1.08);
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
}

.card-icon-wrapper {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 2;
}

.card-body {
  padding: 24px 24px 28px;
}

.card-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.4rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 4px;
  font-weight: 400;
}

.card-nameId {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  color: var(--bs-secondary, #B89C7B);
  margin: 0 0 12px;
  font-weight: 500;
}

.card-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 20px;
  line-height: 1.6;
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bs-secondary, #B89C7B);
  text-decoration: none;
  transition: all 0.3s ease;
}

.service-card:hover .card-cta {
  gap: 12px;
  color: var(--bs-black, #2a2a2a);
}

.card-cta svg {
  transition: transform 0.3s ease;
}

.service-card:hover .card-cta svg {
  transform: translateX(4px);
}

.coming-soon-section {
  margin-top: 60px;
}

.coming-soon-wrapper {
  background: var(--bs-light, #ECE6DD);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.coming-soon-label {
  display: block;
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.3rem;
  color: var(--bs-black, #2a2a2a);
  margin-bottom: 24px;
}

.coming-soon-items {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.coming-soon-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  text-align: left;
}

.cs-icon {
  width: 44px;
  height: 44px;
  background: var(--bs-light, #ECE6DD);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bs-secondary, #B89C7B);
  flex-shrink: 0;
}

.cs-text strong {
  display: block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  color: var(--bs-black, #2a2a2a);
}

.cs-text p {
  font-size: 0.78rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 2px 0 0;
}

.cs-badge {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bs-secondary, #B89C7B);
  background: rgba(184, 156, 123, 0.1);
  padding: 4px 14px;
  border-radius: 20px;
  flex-shrink: 0;
}

@media (max-width: 992px) {
  .services-grid {
    grid-template-columns: 1fr 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .coming-soon-items {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 576px) {
  .browse-services {
    padding: 60px 0;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .card-body {
    padding: 18px 18px 22px;
  }

  .coming-soon-wrapper {
    padding: 30px 20px;
  }
}
</style>
