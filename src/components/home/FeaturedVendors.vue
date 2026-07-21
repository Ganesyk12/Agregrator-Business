<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface PortfolioImage {
  image_url: string
  caption?: string
  sort_order: number
}

interface PortfolioItem {
  id_portfolio: number
  cover_url: string
  title: string
  label?: string
  description?: string
  location?: string
  sort_order: number
  vendor: {
    id_vendor: number
    business_name: string
    category: string
    location: string
    description?: string
    _count: {
      portfolios: number
      reviews: number
    }
  }
  package?: {
    name: string
    price: number
  } | null
  category?: {
    category_name: string
  } | null
  images: PortfolioImage[]
}

const portfolios = ref<PortfolioItem[]>([])
const activeIndex = ref(0)
const loading = ref(true)
const mouseX = ref(0)
const mouseY = ref(0)
const sectionRef = ref<HTMLElement | null>(null)
const vendorGallery = ref<string[]>([])
const vendorGalleryLoading = ref(false)
const interactionPaused = ref(false)
const backgroundKey = ref(0)

let autoPlayId: ReturnType<typeof setInterval> | null = null
let resumeId: ReturnType<typeof setTimeout> | null = null
let pollId: ReturnType<typeof setInterval> | null = null

const totalItems = computed(() => Math.max(portfolios.value.length, 1))
const activePortfolio = computed(() => portfolios.value[activeIndex.value] || portfolios.value[0])

const inactiveCards = computed(() => {
  const items: Array<PortfolioItem & { position: number }> = []
  const total = portfolios.value.length
  if (total <= 1) return items
  for (let i = 1; i < Math.min(total, 4); i++) {
    const idx = (activeIndex.value + i) % total
    items.push({ ...portfolios.value[idx], position: i })
  }
  return items
})

const categoryNames: Record<string, string> = {
  Fotografi: 'Photography',
  Videografi: 'Videography',
  'Tata Rias': 'Makeup Artist',
  Dekorasi: 'Event Decoration',
  Katering: 'Catering',
}

const categoryDemoMap: Record<string, string> = {
  Photography: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&h=900&fit=crop',
  'Makeup Artist': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=900&fit=crop',
  'Nail Art': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=900&fit=crop',
  Florist: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&h=900&fit=crop',
  'Event Decoration': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=900&fit=crop',
  Videography: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=900&fit=crop',
  Catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=900&fit=crop',
}

function mapCategory(raw: string): string {
  return categoryNames[raw] || raw
}

function getDemoImage(category: string): string {
  const cat = mapCategory(category)
  return categoryDemoMap[cat] || `https://picsum.photos/seed/${cat.toLowerCase().replace(/\s+/g, '')}/800/900`
}

function generateDemoData(): PortfolioItem[] {
  const demos: Array<{ vendor: string; category: string; title: string; location: string; price: number; desc: string }> = [
    { vendor: 'Alexandra Studio', category: 'Photography', title: 'Wedding Moments', location: 'Jakarta', price: 2500000, desc: 'Abadikan setiap momen berharga dengan sentuhan artistik.' },
    { vendor: 'Glamour Beauty', category: 'Makeup Artist', title: 'Bridal Elegance', location: 'Bandung', price: 1500000, desc: 'Tampil memukau di hari spesial Anda.' },
    { vendor: 'Bloom & Petal', category: 'Florist', title: 'Eternal Beauty', location: 'Surabaya', price: 750000, desc: 'Rangkaian bunga segar dengan desain eksklusif.' },
    { vendor: 'Nail Artistry', category: 'Nail Art', title: 'Artistic Touch', location: 'Jakarta', price: 500000, desc: 'Seni di ujung jari Anda.' },
    { vendor: 'Elegant Decor', category: 'Event Decoration', title: 'Grand Affair', location: 'Yogyakarta', price: 5000000, desc: 'Dekorasi mewah untuk acara istimewa.' },
  ]
  return demos.map((d, i) => ({
    id_portfolio: 1000 + i,
    cover_url: getDemoImage(d.category),
    title: d.title,
    label: 'Featured',
    description: d.desc,
    location: d.location,
    sort_order: i,
    vendor: {
      id_vendor: 100 + i,
      business_name: d.vendor,
      category: d.category,
      location: d.location,
      description: d.desc,
      _count: { portfolios: 3, reviews: 24 + i * 8 },
    },
    package: { name: 'Paket ' + d.category, price: d.price },
    category: { category_name: d.category },
    images: [
      { image_url: getDemoImage(d.category), caption: '', sort_order: 0 },
      { image_url: getDemoImage('Videography'), caption: '', sort_order: 1 },
      { image_url: getDemoImage('Event Decoration'), caption: '', sort_order: 2 },
    ],
  }))
}

async function fetchVendorGallery(vendorId: number) {
  vendorGalleryLoading.value = true
  try {
    const res = await fetch(`/api/portfolios/vendor/${vendorId}`)
    const json = await res.json()
    const items: PortfolioItem[] = json.data || []
    const allImgs: string[] = []
    if (Array.isArray(items)) {
      items.forEach(p => {
        allImgs.push(p.cover_url)
        if (p.images) p.images.forEach(img => allImgs.push(img.image_url))
      })
    }
    vendorGallery.value = [...new Set(allImgs)].slice(0, 3)
  } catch {
    const current = activePortfolio.value
    const imgs: string[] = [current.cover_url]
    if (current.images) current.images.forEach(i => imgs.push(i.image_url))
    vendorGallery.value = [...new Set(imgs)].slice(0, 3)
  } finally {
    vendorGalleryLoading.value = false
  }
}

async function fetchPortfolios() {
  try {
    const res = await fetch('/api/portfolios')
    const json = await res.json()
    const items: PortfolioItem[] = json.data || []

    if (!Array.isArray(items) || items.length === 0) {
      portfolios.value = generateDemoData()
      return
    }

    const featured = items.filter(p => p.label === 'Featured')
    const others = items.filter(p => p.label !== 'Featured')

    if (featured.length >= 4) {
      portfolios.value = featured
    } else if (items.length > 0) {
      const need = 4 - featured.length
      const combined = [...featured, ...others.slice(0, need)]
      if (combined.length < 4) {
        const fill = generateDemoData().slice(0, 4 - combined.length)
        portfolios.value = [...combined, ...fill]
      } else {
        portfolios.value = combined
      }
    } else {
      portfolios.value = generateDemoData()
    }
  } catch {
    portfolios.value = generateDemoData()
  } finally {
    loading.value = false
  }
}

function advanceSlide() {
  if (portfolios.value.length > 0) {
    activeIndex.value = (activeIndex.value + 1) % portfolios.value.length
    backgroundKey.value++
  }
}

function selectCard(index: number) {
  if (index === activeIndex.value) return
  activeIndex.value = index
  backgroundKey.value++
  interactionPaused.value = true
  if (resumeId) clearTimeout(resumeId)
  resumeId = setTimeout(() => { interactionPaused.value = false }, 10000)
}

function formatPrice(price?: number): string {
  if (!price || price === 0) return ''
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}

function displayCategory(cat: { category_name?: string } | null | undefined, vendorCat: string): string {
  if (cat?.category_name) return mapCategory(cat.category_name)
  return mapCategory(vendorCat) || 'Kreatif'
}

function handleMouseMove(e: MouseEvent) {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 6
  mouseY.value = ((e.clientY - rect.top) / rect.height - 0.5) * 6
}

function changeCoverImage(url: string) {
  const p = portfolios.value[activeIndex.value]
  if (p) p.cover_url = url
  backgroundKey.value++
}

watch(activePortfolio, (p) => {
  if (p?.vendor?.id_vendor) fetchVendorGallery(p.vendor.id_vendor)
}, { immediate: false })

onMounted(async () => {
  await fetchPortfolios()
  if (portfolios.value[0]?.vendor?.id_vendor) {
    await fetchVendorGallery(portfolios.value[0].vendor.id_vendor)
  }
  if (!autoPlayId) {
    autoPlayId = setInterval(() => {
      if (!interactionPaused.value) advanceSlide()
    }, 5000)
  }
  pollId = setInterval(fetchPortfolios, 30000)
})

onUnmounted(() => {
  if (autoPlayId) clearInterval(autoPlayId)
  if (resumeId) clearTimeout(resumeId)
  if (pollId) clearInterval(pollId)
})
</script>

<template>
  <section ref="sectionRef" class="featured-showcase" @mousemove="handleMouseMove">
    <div v-if="loading" class="d-flex align-items-center justify-content-center h-100">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <template v-else-if="portfolios.length > 0">
      <div class="showcase-bg">
        <div
          :key="backgroundKey"
          class="bg-image"
          :style="{ backgroundImage: `url(${activePortfolio.cover_url})` }"
        />
        <div class="bg-overlay" />
        <div
          class="bg-parallax"
          :style="{
            transform: `translate(${mouseX}px, ${mouseY}px)`,
          }"
        />
      </div>

      <div class="showcase-content">
        <div class="showcase-header" data-aos="fade-down">
          <span class="section-label">Featured Portfolio</span>
          <h2 class="section-title">Karya Terkurasi Pilihan</h2>
        </div>

        <div class="showcase-main">
          <div class="inactive-cards">
            <div
              v-for="card in inactiveCards"
              :key="card.id_portfolio"
              class="preview-card"
              :style="{
                transform: `translateX(${(card.position - 1) * -30}px) translateY(${mouseY * 0.5}px)`,
                zIndex: 5 - card.position,
              }"
              @click="selectCard((activeIndex + card.position) % totalItems)"
            >
              <div class="preview-img-wrap">
                <img :src="card.cover_url" :alt="card.vendor?.business_name" loading="lazy" />
                <div class="preview-overlay">
                  <span class="preview-name">{{ card.vendor?.business_name }}</span>
                  <span class="preview-cat">{{ displayCategory(card.category, card.vendor?.category) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="active-card-wrapper">
            <div
              class="active-card"
              :style="{
                transform: `perspective(1200px) rotateY(${mouseX * 0.5}deg) rotateX(${mouseY * -0.5}deg)`,
              }"
            >
              <div class="active-card-image">
                <img :src="activePortfolio.cover_url" :alt="activePortfolio.title" />
                <div class="card-gradient" />

                <div class="active-card-content">
                  <span class="card-category">{{ displayCategory(activePortfolio.category, activePortfolio.vendor?.category) }}</span>
                  <h2 class="card-title">{{ activePortfolio.title }}</h2>
                  <p class="card-vendor">by {{ activePortfolio.vendor?.business_name }}</p>

                  <div class="card-rating">
                    <span class="stars">★★★★★</span>
                    <span class="score">
                      {{ (activePortfolio.vendor?._count?.reviews ? Math.min(5, Math.max(3, (activePortfolio.vendor._count.reviews % 3) + 3)) : 5).toFixed(1) }}
                    </span>
                    <span class="reviews">{{ activePortfolio.vendor?._count?.reviews || 0 }} Reviews</span>
                  </div>

                  <div class="card-location" v-if="activePortfolio.location || activePortfolio.vendor?.location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ activePortfolio.location || activePortfolio.vendor?.location }}
                  </div>

                  <div class="card-price" v-if="activePortfolio.package?.price">
                    <span class="price-label">Mulai dari</span>
                    <span class="price-value">{{ formatPrice(activePortfolio.package.price) }}</span>
                  </div>

                  <div class="card-actions">
                    <router-link :to="`/portfolio/${activePortfolio.id_portfolio}`" class="btn-primary-card">
                      View Portfolio
                    </router-link>
                    <router-link :to="`/booking?vendor=${activePortfolio.vendor?.id_vendor}`" class="btn-secondary-card">
                      Book Now
                    </router-link>
                  </div>
                </div>

                <div class="stack-previews" v-if="vendorGallery.length > 0 && !vendorGalleryLoading">
                  <div
                    v-for="(imgUrl, si) in vendorGallery"
                    :key="si"
                    class="stack-thumb"
                    :style="{ zIndex: 10 - si, transform: `rotate(${(si - 1) * 4}deg) translateY(${(si - 1) * -3}px)` }"
                    @click.stop="changeCoverImage(imgUrl)"
                  >
                    <img :src="imgUrl" alt="Gallery preview" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.featured-showcase {
  position: relative;
  min-height: 90vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  background: #0f0f0f;
}

.showcase-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  inset: -20px;
  background-size: cover;
  background-position: center;
  filter: blur(12px);
  animation: kenBurns 12s ease-in-out infinite alternate;
}

@keyframes kenBurns {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 15, 15, 0.85) 40%, rgba(15, 15, 15, 0.55) 100%);
}

.bg-parallax {
  position: absolute;
  inset: 0;
  transition: transform 0.15s ease-out;
}

.showcase-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 60px;
}

.showcase-header {
  margin-bottom: 50px;
}

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #f97316;
  margin-bottom: 12px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -0.02em;
}

.showcase-main {
  display: flex;
  align-items: center;
  gap: 40px;
  min-height: 500px;
}

.inactive-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.preview-card {
  width: 200px;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.preview-card:hover {
  transform: translateX(10px) scale(1.05) !important;
  z-index: 10 !important;
}

.preview-img-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 3/4;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.4s ease;
}

.preview-card:hover .preview-img-wrap {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

.preview-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.preview-card:hover .preview-img-wrap img {
  transform: scale(1.1);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.8));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.preview-card:hover .preview-overlay {
  opacity: 1;
}

.preview-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
}

.preview-cat {
  font-size: 0.7rem;
  color: #f97316;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.active-card-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  padding-right: 20px;
}

.active-card {
  width: 480px;
  transition: transform 0.15s ease-out;
}

.active-card-image {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  aspect-ratio: 4/5;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  animation: floatCard 4s ease-in-out infinite;
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.active-card-image > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.6s ease;
}

.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 25%, rgba(0, 0, 0, 0.85) 100%);
}

.active-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  z-index: 2;
}

.card-category {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: #f97316;
  text-transform: uppercase;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 12px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.card-vendor {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-rating .stars {
  color: #f59e0b;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.card-rating .score {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fff;
}

.card-rating .reviews {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.card-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 14px;
}

.card-location svg {
  flex-shrink: 0;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 18px;
}

.price-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.price-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-primary-card {
  display: inline-block;
  padding: 10px 28px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35);
}

.btn-primary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(249, 115, 22, 0.45);
  color: #fff;
}

.btn-secondary-card {
  display: inline-block;
  padding: 10px 28px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-secondary-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  color: #fff;
}

.stack-previews {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 0;
  z-index: 3;
}

.stack-thumb {
  width: 56px;
  height: 70px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-left: -20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.stack-thumb:first-child {
  margin-left: 0;
}

.stack-thumb:hover {
  transform: scale(1.15) rotate(0deg) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 20 !important;
  border-color: #f97316;
}

.stack-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1199px) {
  .active-card {
    width: 400px;
  }

  .preview-card {
    width: 160px;
  }

  .showcase-content {
    padding: 60px 40px;
  }

  .card-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 991px) {
  .inactive-cards {
    display: none;
  }

  .active-card-wrapper {
    justify-content: center;
    padding-right: 0;
  }

  .active-card {
    width: 380px;
  }

  .showcase-content {
    padding: 40px 24px;
  }

  .section-title {
    font-size: 2rem;
  }

  .card-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 767px) {
  .active-card {
    width: 100%;
    max-width: 350px;
  }

  .showcase-header {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .active-card-content {
    padding: 20px;
  }

  .card-actions {
    flex-direction: column;
  }

  .stack-thumb {
    width: 44px;
    height: 56px;
  }
}
</style>
