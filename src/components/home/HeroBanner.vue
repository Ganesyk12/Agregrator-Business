<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import defaultImage from '@/assets/default/nothing.png'

gsap.registerPlugin(ScrollTrigger)

const router = useRouter()

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
const loading = ref(true)
const activeIndex = ref(0)
const mouseX = ref(0)
const mouseY = ref(0)
const heroRef = ref<HTMLElement | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null
let pollId: ReturnType<typeof setInterval> | null = null
let ctx: gsap.Context | null = null
async function fetchPortfolios() {
  try {
    const res = await fetch('/api/portfolios')
    const json = await res.json()
    const items: PortfolioItem[] = json.data || []

    if (!Array.isArray(items) || items.length === 0) {
      portfolios.value = []
      return
    }

    const featured = items.filter(p => p.label === 'Featured')
    const others = items.filter(p => p.label !== 'Featured')

    if (featured.length >= 4) {
      portfolios.value = featured.slice(0, 7)
    } else if (items.length > 0) {
      portfolios.value = [...featured, ...others]
    }
  } catch {
    portfolios.value = []
  } finally {
    loading.value = false
  }
}

const allCards = computed(() => {
  const items = portfolios.value
  const total = items.length
  return items.map((item, index) => {
    let offset = index - activeIndex.value
    if (offset < -3) offset += total
    if (offset > 3) offset -= total
    return { ...item, offset }
  })
})

function cardStyle(offset: number) {
  const abs = Math.abs(offset)
  const scale = offset === 0 ? 1.2 : abs === 1 ? 0.85 : 0.65
  const gap = 160
  const x = offset * gap
  const y = abs * 10
  const rotateY = -offset * 8
  const visible = abs <= 2
  const opacity = visible ? (offset === 0 ? 1 : abs === 1 ? 0.7 : 0.35) : 0
  const blur = visible ? (offset === 0 ? 0 : abs === 1 ? 2 : 5) : 12

  return {
    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
    opacity,
    filter: `blur(${blur}px)`,
    zIndex: 10 - abs,
    pointerEvents: visible ? 'auto' as const : 'none' as const,
  }
}

function advanceSlide() {
  if (portfolios.value.length > 0) {
    activeIndex.value = (activeIndex.value + 1) % portfolios.value.length
  }
}

function formatPrice(price?: number): string {
  if (!price || price === 0) return 'Hubungi'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}

function displayCategory(cat: { category_name?: string } | null | undefined, vendorCat: string): string {
  if (cat?.category_name) return cat.category_name
  return vendorCat || 'Kreatif'
}

onMounted(async () => {
  // GSAP intro animation for text and gradient spheres
  ctx = gsap.context(() => {
    gsap.from('.hero-tagline', {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out',
    })

    gsap.from('.hero-headline', {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: 0.2,
      ease: 'power3.out',
    })

    gsap.from('.hero-description', {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.4,
      ease: 'power3.out',
    })

    gsap.from('.hero-actions', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.6,
      ease: 'power3.out',
    })

    gsap.from('.trust-badge', {
      opacity: 0,
      y: 15,
      stagger: 0.15,
      duration: 0.8,
      delay: 0.8,
      ease: 'power3.out',
    })

    // Float animation for background gradient spheres
    gsap.to('.sphere-1', {
      x: 30,
      y: -20,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    gsap.to('.sphere-2', {
      x: -40,
      y: 30,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, heroRef.value || undefined)

  await fetchPortfolios()
  intervalId = setInterval(advanceSlide, 4000)
  pollId = setInterval(fetchPortfolios, 30000)

  // Wait for Vue to render the cards
  await nextTick()

  if (portfolios.value.length > 0 && ctx) {
    ctx.add(() => {
      gsap.from('.card-wrapper', {
        opacity: 0,
        scale: 0.8,
        x: 100,
        stagger: 0.1,
        duration: 1.2,
        ease: 'back.out(1.2)',
      })
    })
  }

  // Recalculate ScrollTrigger positions for all elements on the page
  ScrollTrigger.refresh()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (pollId) clearInterval(pollId)
  if (ctx) ctx.revert()
})

function goToPortfolio(id: number) {
  router.push(`/portfolio/${id}`)
}

function goToVendor(id: number) {
  router.push(`/vendor/${id}`)
}

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 8
  mouseY.value = ((e.clientY - rect.top) / rect.height - 0.5) * 8
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}
</script>

<template>
  <section ref="heroRef" class="hero-premium position-relative overflow-hidden" @mousemove="handleMouseMove">
    <div class="hero-bg">
      <div class="gradient-sphere sphere-1" />
      <div class="gradient-sphere sphere-2" />
      <div class="grid-dots" />
    </div>

    <div class="hero-layout">
      <div class="hero-left">
        <div class="hero-text">
          <span class="hero-tagline">Sigyn — Where Art Meets Every Occasion</span>
          <h1 class="hero-headline">
            Discover Creativity.<br>
            <span class="text-gradient">Book Exceptional Talent.</span>
          </h1>
          <p class="hero-description">
            Explore thousands of curated creative portfolios from trusted vendors.
            From photography to makeup artists, flower bouquets, nail art and event
            decoration — find inspiration and book instantly.
          </p>
          <div class="hero-actions">
            <router-link to="/explore" class="btn btn-primary btn-lg rounded-pill px-4">
              Explore Portfolio
            </router-link>
            <router-link to="/partner" class="btn btn-outline-dark btn-lg rounded-pill px-4">
              Become a Vendor
            </router-link>
          </div>
          <div class="trust-badges">
            <span class="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              Trusted Vendors
            </span>
            <span class="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              Secure Booking
            </span>
            <span class="trust-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
              Verified Reviews
            </span>
          </div>
        </div>
      </div>

      <div class="hero-right">
        <div v-if="loading" class="d-flex align-items-center justify-content-center h-100">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else class="cards-viewport">
            <div
              v-for="card in allCards"
              :key="card.id_portfolio"
              class="card-wrapper"
              :class="{ 'card-hidden': Math.abs(card.offset) > 2 }"
              :data-offset="card.offset"
              :style="cardStyle(card.offset)"
              @click="goToPortfolio(card.id_portfolio)"
            >
              <div class="portfolio-card">
              <div class="card-image-wrap">
                <img
                  :src="card.cover_url || defaultImage"
                  :alt="card.vendor?.business_name || card.title"
                  class="card-img"
                  :style="card.offset === 0 ? { transform: `translate(${mouseX}px, ${mouseY}px) scale(1.1)` } : {}"
                  loading="lazy"
                  @error="onImgError"
                />
                <div class="card-price-badge" v-if="card.offset === 0 && card.package?.price">
                  <span>Mulai</span>
                  <strong>{{ formatPrice(card.package.price) }}</strong>
                </div>
              </div>
              <div v-if="card.offset === 0" class="card-info">
                <div class="card-category-tag">{{ displayCategory(card.category, card.vendor?.category) }}</div>
                <h3 class="vendor-name">{{ card.vendor?.business_name || card.title }}</h3>
                <div class="vendor-rating">
                  <span class="stars">★★★★★</span>
                  <span class="rating-text">5.0</span>
                </div>
                <button class="btn-book" @click.stop="goToVendor(card.vendor?.id_vendor)">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-premium {
  position: relative;
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
}

.sphere-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #f97316, #fb923c);
  top: -150px;
  right: -100px;
}

.sphere-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #8b5cf6, #a78bfa);
  bottom: -100px;
  left: -100px;
}

.grid-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

.hero-layout {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-left {
  flex: 0 0 40%;
  max-width: 40%;
}

.hero-right {
  flex: 0 0 55%;
  max-width: 55%;
  position: relative;
  min-height: 500px;
}

.hero-text {
  padding: 40px 0;
}

.hero-tagline {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #f97316;
  margin-bottom: 24px;
}

.hero-headline {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #0f0f0f;
  margin-bottom: 20px;
  letter-spacing: -0.03em;
}

.hero-headline .text-gradient {
  background: linear-gradient(135deg, #f97316, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 1.1rem;
  line-height: 1.7;
  color: #6b7280;
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.hero-actions .btn-primary {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  color: #fff;
  font-weight: 600;
  padding: 12px 32px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35);
}

.hero-actions .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(249, 115, 22, 0.45);
}

.hero-actions .btn-outline-dark {
  border: 2px solid #0f0f0f;
  color: #0f0f0f;
  font-weight: 600;
  padding: 12px 32px;
  transition: all 0.3s ease;
}

.hero-actions .btn-outline-dark:hover {
  background: #0f0f0f;
  color: #fff;
  transform: translateY(-2px);
}

.trust-badges {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.trust-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.trust-badge svg {
  color: #22c55e;
  flex-shrink: 0;
}

.cards-viewport {
  position: relative;
  width: 100%;
  height: 520px;
}

.card-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity, filter;
}

.portfolio-card {
  width: 240px;
  border-radius: 24px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
  position: relative;
}

.card-wrapper[data-offset="0"] .portfolio-card {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.card-wrapper[data-offset="0"]:hover .portfolio-card {
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  transform: translateY(-8px);
}

.card-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 133.33%;
  overflow: hidden;
  background: #f3f4f6;
}

.card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.card-wrapper[data-offset="0"] .card-img {
  transform: scale(1.05);
}

.card-wrapper[data-offset="0"]:hover .card-img {
  transform: scale(1.15);
}

.card-price-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 6px 12px;
  border-radius: 10px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.3;
}

.card-price-badge strong {
  display: block;
  font-size: 0.85rem;
}

.card-info {
  padding: 14px 16px 18px;
  text-align: center;
}

.card-category-tag {
  display: inline-block;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #f97316;
  margin-bottom: 4px;
}

.vendor-name {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 0.95rem;
  font-weight: 400;
  color: #0f0f0f;
  margin: 0 0 4px;
}

.vendor-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
}

.stars {
  color: #f59e0b;
  font-size: 0.85rem;
  letter-spacing: 2px;
}

.rating-text {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.btn-book {
  display: inline-block;
  padding: 8px 24px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
}

.btn-book:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
}

@media (max-width: 1199px) {
  .hero-layout {
    padding: 0 40px;
    gap: 40px;
  }

  .hero-headline {
    font-size: 2.8rem;
  }

  .portfolio-card {
    width: 200px;
  }

  .cards-viewport {
    height: 440px;
  }

  .hero-right {
    min-height: 420px;
  }
}

@media (max-width: 991px) {
  .hero-layout {
    flex-direction: column;
    padding: 100px 40px 60px;
    gap: 50px;
  }

  .hero-left,
  .hero-right {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .hero-left {
    text-align: center;
  }

  .hero-description {
    margin: 0 auto 32px;
  }

  .hero-actions {
    justify-content: center;
  }

  .trust-badges {
    justify-content: center;
  }

  .hero-headline {
    font-size: 2.5rem;
  }

  .portfolio-card {
    width: 200px;
  }

  .cards-viewport {
    height: 420px;
  }

  .hero-right {
    min-height: 400px;
  }

  .card-wrapper[data-offset="2"],
  .card-wrapper[data-offset="-2"] {
    display: none;
  }
}

@media (max-width: 767px) {
  .hero-layout {
    padding: 80px 24px 40px;
  }

  .hero-headline {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions .btn-lg {
    font-size: 0.9rem;
    padding: 10px 24px;
  }

  .trust-badges {
    gap: 16px;
  }

  .trust-badge {
    font-size: 0.8rem;
  }

  .portfolio-card {
    width: 180px;
  }

  .cards-viewport {
    height: 380px;
  }

  .hero-right {
    min-height: 360px;
  }

  .card-wrapper[data-offset="1"],
  .card-wrapper[data-offset="-1"] {
    display: none;
  }
}
</style>
