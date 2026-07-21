<script setup lang="ts">
import { ref, computed } from 'vue'

interface Inspiration {
  id: number
  image: string
  occasion: string
  style: string
  caption: string
  budget: string
  saved: boolean
  height: 'tall' | 'short' | 'medium'
  vendorRefs: {
    photography?: string
    mua?: string
    bouquet?: string
  }
}

const props = defineProps<{
  celebrationFilter: string | null
}>()

const inspirations = ref<Inspiration[]>([
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=900&fit=crop',
    occasion: 'Wedding',
    style: 'Classic Elegance',
    caption: 'Pernikahan klasik dengan sentuhan emas yang timeless',
    budget: 'Rp 15-25 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Alexandra Studio', mua: 'Glamour Beauty', bouquet: 'Bloom & Petal' }
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=700&fit=crop',
    occasion: 'Graduation',
    style: 'Modern Fresh',
    caption: 'Momen wisuda dengan gaya preppy modern dan vibrant',
    budget: 'Rp 3-8 Juta',
    saved: false,
    height: 'medium',
    vendorRefs: { photography: 'Capture Studio', bouquet: 'Bunga Indah Florist' }
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=800&fit=crop',
    occasion: 'Birthday',
    style: 'Pastel Dream',
    caption: 'Ultah manis dengan dekorasi pastel dan bunga segar',
    budget: 'Rp 5-10 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Lensa Abadi', bouquet: 'Wonderful Blooms' }
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1464693195488-9ae77abf4e32?w=600&h=600&fit=crop',
    occasion: 'Engagement',
    style: 'Romantic Glow',
    caption: 'Sesi foto tunangan dengan golden hour yang magis',
    budget: 'Rp 8-15 Juta',
    saved: false,
    height: 'short',
    vendorRefs: { photography: 'Sunset Lens', mua: 'Perfect Look Studio' }
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=850&fit=crop',
    occasion: 'Anniversary',
    style: 'Timeless Love',
    caption: 'Rayakan cinta dengan foto anniversary yang intimate',
    budget: 'Rp 5-12 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Alexandra Studio', bouquet: 'Bloom & Petal' }
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=750&fit=crop',
    occasion: 'Wedding',
    style: 'Garden Romance',
    caption: 'Pernikahan taman dengan nuansa rustic dan natural',
    budget: 'Rp 20-35 Juta',
    saved: false,
    height: 'medium',
    vendorRefs: { photography: 'Sunset Lens', mua: 'Glamour Beauty', bouquet: 'Bloom & Petal' }
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=650&fit=crop',
    occasion: 'Graduation',
    style: 'Bold & Bright',
    caption: 'Wisuda dengan statement bouquet dan foto kreatif',
    budget: 'Rp 2-6 Juta',
    saved: false,
    height: 'short',
    vendorRefs: { photography: 'Capture Studio', bouquet: 'Bunga Indah Florist' }
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=900&fit=crop',
    occasion: 'Engagement',
    style: 'Cinematic',
    caption: 'Foto pre-wedding dengan konsep cinematic ala film',
    budget: 'Rp 10-20 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Lensa Abadi', mua: 'Perfect Look Studio', bouquet: 'Wonderful Blooms' }
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1540573133985-87b1da6d5268?w=600&h=700&fit=crop',
    occasion: 'Birthday',
    style: 'Luxury Gold',
    caption: 'Pesta ulang tahun mewah dengan tema gold dan glamor',
    budget: 'Rp 10-25 Juta',
    saved: false,
    height: 'medium',
    vendorRefs: { photography: 'Alexandra Studio', bouquet: 'Bloom & Petal' }
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918ea45?w=600&h=800&fit=crop',
    occasion: 'Wedding',
    style: 'Minimalist Chic',
    caption: 'Pernikahan minimalis dengan detail yang elegan',
    budget: 'Rp 12-18 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Sunset Lens', mua: 'Glamour Beauty', bouquet: 'Bloom & Petal' }
  },
  {
    id: 11,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=600&fit=crop',
    occasion: 'Birthday',
    style: 'Fun & Colorful',
    caption: 'Pesta ulang tahun penuh warna untuk si kecil',
    budget: 'Rp 3-8 Juta',
    saved: false,
    height: 'short',
    vendorRefs: { photography: 'Lensa Abadi', bouquet: 'Bunga Indah Florist' }
  },
  {
    id: 12,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=850&fit=crop',
    occasion: 'Graduation',
    style: 'Elegant Classic',
    caption: 'Momen wisuda dengan gaya elegan yang timeless',
    budget: 'Rp 2-5 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Capture Studio', bouquet: 'Wonderful Blooms' }
  },
  {
    id: 13,
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=700&fit=crop',
    occasion: 'Anniversary',
    style: 'Romantic Dinner',
    caption: 'Makan malam romantis dengan dekorasi spesial',
    budget: 'Rp 3-7 Juta',
    saved: false,
    height: 'medium',
    vendorRefs: { photography: 'Alexandra Studio', bouquet: 'Bloom & Petal' }
  },
  {
    id: 14,
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=750&fit=crop',
    occasion: 'Wedding',
    style: 'Beach Boho',
    caption: 'Pernikahan pantai dengan nuansa boho yang santai',
    budget: 'Rp 18-30 Juta',
    saved: false,
    height: 'medium',
    vendorRefs: { photography: 'Sunset Lens', mua: 'Perfect Look Studio', bouquet: 'Wonderful Blooms' }
  },
  {
    id: 15,
    image: 'https://images.unsplash.com/photo-1559650656-5d1d361ad10e?w=600&h=900&fit=crop',
    occasion: 'Engagement',
    style: 'Fairytale',
    caption: 'Tunangan dengan konsep dongeng yang romantis',
    budget: 'Rp 8-18 Juta',
    saved: false,
    height: 'tall',
    vendorRefs: { photography: 'Lensa Abadi', mua: 'Glamour Beauty', bouquet: 'Bloom & Petal' }
  },
])

const filteredInspirations = computed(() => {
  if (!props.celebrationFilter) return inspirations.value
  return inspirations.value.filter(i => i.occasion.toLowerCase() === props.celebrationFilter!.toLowerCase())
})

function getGridClass(height: string) {
  if (height === 'tall') return 'grid-tall'
  if (height === 'short') return 'grid-short'
  return 'grid-medium'
}

function toggleSave(id: number) {
  const idx = inspirations.value.findIndex(i => i.id === id)
  if (idx !== -1) inspirations.value[idx].saved = !inspirations.value[idx].saved
}

</script>

<template>
  <section class="inspiration-section">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Inspiration</span>
        <h2 class="section-title">Trending Inspirations</h2>
        <p class="section-desc">Temukan gaya dan konsep yang sesuai dengan momen spesial Anda</p>
      </div>

      <div class="inspiration-grid" data-aos="fade-up" data-aos-delay="100">
        <div
          v-for="item in filteredInspirations"
          :key="item.id"
          class="inspiration-card"
          :class="[getGridClass(item.height)]"
        >
          <div class="card-image">
            <img :src="item.image" :alt="item.caption" loading="lazy" />
            <div class="card-image-overlay"></div>

            <div class="card-tags">
              <span class="tag occasion-tag">{{ item.occasion }}</span>
              <span class="tag style-tag">{{ item.style }}</span>
            </div>

            <button
              class="save-btn"
              :class="{ saved: item.saved }"
              @click.stop="toggleSave(item.id)"
              :title="item.saved ? 'Saved' : 'Save'"
            >
              <svg v-if="!item.saved" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>

          <div class="card-body">
            <p class="card-caption">{{ item.caption }}</p>
            <div class="card-footer-info">
              <span class="card-budget" v-if="item.budget">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h6a2 2 0 0 1 0 4H8"/>
                </svg>
                {{ item.budget }}
              </span>
              <router-link
                :to="`/portfolio/${item.id}`"
                class="card-link"
              >
                View Vendors
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-5" data-aos="fade-up">
        <router-link to="/photography" class="btn-explore-more">
          Explore More Inspirations
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inspiration-section {
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

.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 10px;
  gap: 20px;
}

.inspiration-card {
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  break-inside: avoid;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.inspiration-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
}

.grid-tall {
  grid-row-end: span 16;
}

.grid-medium {
  grid-row-end: span 12;
}

.grid-short {
  grid-row-end: span 10;
}

.card-image {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.grid-tall .card-image { aspect-ratio: 3/4; }
.grid-medium .card-image { aspect-ratio: 4/3; }
.grid-short .card-image { aspect-ratio: 1/1; }

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.inspiration-card:hover .card-image img {
  transform: scale(1.06);
}

.card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.5) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.inspiration-card:hover .card-image-overlay {
  opacity: 1;
}

.card-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  z-index: 2;
}

.tag {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.occasion-tag {
  background: rgba(184, 156, 123, 0.9);
  color: #fff;
  backdrop-filter: blur(4px);
}

.style-tag {
  background: rgba(255, 255, 255, 0.85);
  color: var(--bs-black, #2a2a2a);
  backdrop-filter: blur(4px);
}

.save-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: var(--bs-black, #2a2a2a);
}

.inspiration-card:hover .save-btn {
  opacity: 1;
  transform: translateY(0);
}

.save-btn:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.save-btn.saved {
  opacity: 1;
  transform: translateY(0);
  background: #f97316;
  color: #fff;
}

.card-body {
  padding: 16px 18px 18px;
}

.card-caption {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 12px;
  line-height: 1.4;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-budget {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.75rem;
  color: var(--bs-body-color, #5a5a5a);
  font-weight: 500;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-secondary, #B89C7B);
  text-decoration: none;
  transition: all 0.3s ease;
}

.card-link:hover {
  gap: 8px;
  color: var(--bs-black, #2a2a2a);
}

.btn-explore-more {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--bs-black, #2a2a2a);
  text-decoration: none;
  padding: 14px 36px;
  border: 2px solid var(--bs-black, #2a2a2a);
  border-radius: 999px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-explore-more:hover {
  background: var(--bs-black, #2a2a2a);
  color: #fff;
  gap: 14px;
}

@media (max-width: 992px) {
  .inspiration-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .inspiration-section {
    padding: 60px 0;
  }

  .inspiration-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .grid-tall,
  .grid-medium,
  .grid-short {
    grid-row-end: span 10;
  }

  .card-body {
    padding: 12px 14px 14px;
  }
}
</style>
