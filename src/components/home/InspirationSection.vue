<script setup lang="ts">
import { ref, watch } from 'vue'

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

const inspirations = ref<Inspiration[]>([])
const loading = ref(true)

async function fetchInspirations() {
  loading.value = true
  try {
    const params = props.celebrationFilter ? `?label=${props.celebrationFilter}` : ''
    const res = await fetch(`/api/portfolios${params}`)
    const json = await res.json()
    const items = json.data || []
    inspirations.value = items.map((p: any) => ({
      id: p.id_portfolio,
      image: p.cover_url,
      occasion: p.label || p.title || 'Creative',
      style: p.vendor?.category || 'Creative',
      caption: p.title || p.description || '',
      budget: p.package?.price ? `Rp ${p.package.price.toLocaleString('id-ID')}` : '',
      saved: false,
      height: (['tall', 'medium', 'short'] as const)[Math.floor(Math.random() * 3)],
      vendorRefs: {
        photography: p.vendor?.category === 'Photography' ? p.vendor.business_name : undefined,
        mua: p.vendor?.category === 'Makeup Artist' ? p.vendor.business_name : undefined,
        bouquet: p.vendor?.category === 'Bouquet Flowers' ? p.vendor.business_name : undefined,
      }
    }))
  } catch {
    // API unavailable
  } finally {
    loading.value = false
  }
}

watch(() => props.celebrationFilter, () => {
  fetchInspirations()
}, { immediate: true })

function getGridClass(height: string) {
  if (height === 'tall') return 'grid-tall'
  if (height === 'short') return 'grid-short'
  return 'grid-medium'
}

import { useRouter } from 'vue-router'

const router = useRouter()

function toggleSave(id: number) {
  const idx = inspirations.value.findIndex(i => i.id === id)
  if (idx !== -1) inspirations.value[idx].saved = !inspirations.value[idx].saved
}

function goToInspiration(id: number) {
  router.push(`/inspiration/${id}`)
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

      <div v-if="loading" class="text-center py-5">
        <p class="text-muted">Loading inspirations...</p>
      </div>

      <div v-else-if="inspirations.length === 0" class="text-center py-5">
        <p class="text-muted">No inspirations found for this celebration.</p>
      </div>

      <div v-else class="inspiration-grid" data-aos="fade-up" data-aos-delay="100">
        <div
          v-for="item in inspirations"
          :key="item.id"
          class="inspiration-card"
          :class="[getGridClass(item.height)]"
          @click="goToInspiration(item.id)"
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
                :to="`/inspiration/${item.id}`"
                class="card-link"
              >
                View Details
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-5" data-aos="fade-up">
        <router-link to="/inspiration" class="btn-explore-more">
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
