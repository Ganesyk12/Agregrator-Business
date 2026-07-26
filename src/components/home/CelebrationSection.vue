<script setup lang="ts">
defineProps<{
  selected: string | null
}>()

const emit = defineEmits<{
  select: [celebration: string | null]
}>()

interface Celebration {
  id: string
  name: string
  nameId: string
  description: string
  image: string
  count: string
}

const celebrations: Celebration[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    nameId: 'Pernikahan',
    description: 'Abadikan hari bahagia Anda dengan sentuhan kreatif dari vendor terbaik.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop',
    count: '124 inspirasi'
  },
  {
    id: 'graduation',
    name: 'Graduation',
    nameId: 'Wisuda',
    description: 'Rayakan pencapaian istimewa dengan foto dan rangkaian bunga spesial.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=800&fit=crop',
    count: '89 inspirasi'
  },
  {
    id: 'birthday',
    name: 'Birthday',
    nameId: 'Ulang Tahun',
    description: 'Momen spesial penuh kebahagiaan bersama orang-orang tercinta.',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=800&fit=crop',
    count: '156 inspirasi'
  },
  {
    id: 'engagement',
    name: 'Engagement',
    nameId: 'Tunangan',
    description: 'Awal dari perjalanan indah. Abadikan momen tunangan yang romantis.',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=800&fit=crop',
    count: '67 inspirasi'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    nameId: 'Anniversary',
    description: 'Rayakan cinta yang terus bertumbuh dengan momen tak terlupakan.',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=800&fit=crop',
    count: '43 inspirasi'
  },
  {
    id: 'formal',
    name: 'Formal',
    nameId: 'Formal',
    description: 'Acara formal dan resmi dengan konsep elegan dan profesional.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=800&fit=crop',
    count: '52 inspirasi'
  }
]
</script>

<template>
  <section class="celebration-section">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Discover</span>
        <h2 class="section-title">What Are You Celebrating Today?</h2>
        <p class="section-desc">Pilih momen spesial Anda, dan biarkan kami membantu mewujudkannya</p>
      </div>

      <div class="celebration-grid">
        <button
          class="celebration-card"
          :class="{ active: selected === null }"
          @click="emit('select', null)"
          data-aos="fade-up"
          data-aos-delay="0"
        >
          <div class="card-bg">
            <div class="card-bg-img" style="background-image: url('https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop')"></div>
          </div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <h3 class="card-title">All Celebrations</h3>
            <p class="card-desc">Temukan semua inspirasi dan vendor terbaik</p>
            <span class="card-cta">
              Explore All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </button>

        <button
          v-for="(c, i) in celebrations"
          :key="c.id"
          class="celebration-card"
          :class="{ active: selected === c.id }"
          @click="emit('select', c.id)"
          data-aos="fade-up"
          :data-aos-delay="(i + 1) * 100"
        >
          <div class="card-bg">
            <div class="card-bg-img" :style="{ backgroundImage: `url(${c.image})` }"></div>
          </div>
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="card-count">{{ c.count }}</div>
            <h3 class="card-title">{{ c.name }}</h3>
            <p class="card-desc">{{ c.description }}</p>
            <span class="card-cta">
              Explore Inspiration
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.celebration-section {
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

.celebration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.celebration-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  aspect-ratio: 3/4;
  cursor: pointer;
  border: 2px solid transparent;
  padding: 0;
  background: none;
  text-align: left;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
}

.celebration-card:first-child {
  aspect-ratio: 3/5;
}

.celebration-card:hover {
  transform: translateY(-8px);
}

.celebration-card.active {
  border-color: var(--bs-secondary, #B89C7B);
  box-shadow: 0 12px 40px rgba(184, 156, 123, 0.3);
  transform: translateY(-4px) scale(1.02);
}

.card-bg {
  position: absolute;
  inset: 0;
}

.card-bg-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.celebration-card:hover .card-bg-img {
  transform: scale(1.08);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.1) 0%,
    rgba(0,0,0,0.65) 100%
  );
  transition: opacity 0.4s ease;
}

.celebration-card:hover .card-overlay {
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.05) 0%,
    rgba(0,0,0,0.75) 100%
  );
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28px 24px;
  z-index: 2;
}

.card-count {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.card-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.4rem;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.15;
  font-weight: 400;
}

.card-desc {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 20px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.celebration-card:hover .card-cta,
.celebration-card.active .card-cta {
  opacity: 1;
  transform: translateY(0);
}

.card-cta svg {
  transition: transform 0.3s ease;
}

.celebration-card:hover .card-cta svg {
  transform: translateX(4px);
}

@media (max-width: 992px) {
  .celebration-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .celebration-card:first-child {
    aspect-ratio: 3/5;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .celebration-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .celebration-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .card-content {
    padding: 20px 16px;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>
