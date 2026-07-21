<script setup lang="ts">
interface Step {
  number: string
  title: string
  description: string
  illustration: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Discover Inspiration',
    description: 'Jelajahi ribuan inspirasi dari berbagai konsep dan gaya. Temukan tema yang sesuai dengan momen spesial Anda.',
    illustration: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop'
  },
  {
    number: '02',
    title: 'Choose Your Favorite Vendor',
    description: 'Pilih vendor kreatif terbaik yang sesuai dengan gaya dan anggaran Anda. Lihat portofolio dan ulasan nyata.',
    illustration: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&h=300&fit=crop'
  },
  {
    number: '03',
    title: 'Customize Your Package',
    description: 'Sesuaikan paket dengan kebutuhan Anda. Tambahkan layanan ekstra untuk membuat momen semakin spesial.',
    illustration: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&h=300&fit=crop'
  },
  {
    number: '04',
    title: 'Book With Confidence',
    description: 'Booking dengan mudah dan aman. Nikmati momen spesial Anda tanpa khawatir.',
    illustration: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=300&fit=crop'
  }
]
</script>

<template>
  <section class="how-sigyn-works">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">How It Works</span>
        <h2 class="section-title">How SIGYN Works</h2>
        <p class="section-desc">Empat langkah mudah mewujudkan momen impian Anda</p>
      </div>

      <div class="steps-timeline">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="step-item"
          data-aos="fade-up"
          :data-aos-delay="i * 150"
        >
          <div class="step-illustration">
            <div class="step-img-wrapper">
              <img :src="step.illustration" :alt="step.title" loading="lazy" />
            </div>
            <div class="step-number-badge">{{ step.number }}</div>
          </div>
          <div class="step-content">
            <h4 class="step-title">{{ step.title }}</h4>
            <p class="step-desc">{{ step.description }}</p>
          </div>
          <div v-if="i < steps.length - 1" class="step-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bs-secondary, #B89C7B)" stroke-width="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-sigyn-works {
  padding: 100px 0;
  background: #fff;
  position: relative;
}

.section-header {
  margin-bottom: 70px;
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

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.steps-timeline::before {
  content: '';
  position: absolute;
  left: 100px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--bs-primary, #DCCEB6), var(--bs-secondary, #B89C7B), var(--bs-primary, #DCCEB6));
  opacity: 0.3;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  padding: 20px 0;
}

.step-illustration {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
}

.step-img-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: var(--bs-light, #ECE6DD);
}

.step-item:hover .step-img-wrapper {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.2);
}

.step-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.step-item:hover .step-img-wrapper img {
  transform: scale(1.1);
}

.step-number-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--bs-secondary, #B89C7B), #a08060);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 4px 12px rgba(184, 156, 123, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.3rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 8px;
  font-weight: 400;
}

.step-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.95rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0;
  line-height: 1.6;
  max-width: 450px;
}

.step-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
}

@media (max-width: 768px) {
  .steps-timeline::before {
    left: 40px;
  }

  .step-item {
    gap: 24px;
    padding: 16px 0;
  }

  .step-img-wrapper {
    width: 70px;
    height: 70px;
  }

  .step-arrow {
    display: none;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .how-sigyn-works {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .step-content {
    min-width: 0;
  }

  .step-title {
    font-size: 1.1rem;
  }

  .step-desc {
    font-size: 0.85rem;
  }
}
</style>
