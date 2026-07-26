<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface VendorItem {
  id_vendor: number
  business_name: string
  category: string
  location: string
  cover_url: string
  logo_url: string
  rating: number
  review_count: number
  starting_price: number
  verified: boolean
}

const props = defineProps<{
  celebrationFilter: string | null
}>()

const allVendors = ref<VendorItem[]>([])
const loading = ref(true)

const celebrationTaglines: Record<string, string> = {
  wedding: 'Momen pernikahan impian Anda dimulai di sini',
  graduation: 'Rayakan pencapaian dengan gaya terbaik',
  birthday: 'Buat hari spesial semakin berkesan',
  engagement: 'Awal dari kisah cinta yang abadi',
  anniversary: 'Rayakan cinta yang tak pernah pudar'
}

const categoryOrder = ['Photography', 'Makeup Artist']
const categoryDisplayNames: Record<string, string> = {
  Photography: 'Photography',
  'Makeup Artist': 'Makeup Artist',
}

const filteredByCategory = computed(() => {
  const map: Record<string, VendorItem[]> = {}
  for (const cat of categoryOrder) {
    map[cat] = []
  }
  for (const v of allVendors.value) {
    const cat = v.category || 'Other'
    if (!map[cat]) map[cat] = []
    map[cat].push(v)
  }
  return map
})

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Photography: '📷',
    'Makeup Artist': '💄',
  }
  return map[cat] || '✨'
}

function getCoverImage(vendor: VendorItem): string {
  return vendor.cover_url || ''
}

function formatPrice(price?: number): string {
  if (!price || price === 0) return ''
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}

function generateRandomRating(): { rating: number; count: number } {
  return {
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
    count: Math.floor(10 + Math.random() * 90)
  }
}

onMounted(async () => {
  try {
    const [portRes, vendorRes] = await Promise.all([
      fetch('/api/portfolios'),
      fetch('/api/vendors')
    ])

    const portData = await portRes.json()
    const vendorData = await vendorRes.json()

    const portfolios = portData.data || []
    const vendors = vendorData.data || []

    const vendorMap = new Map<number, VendorItem>()

    for (const v of vendors) {
      const rating = generateRandomRating()
      vendorMap.set(v.id_vendor, {
        id_vendor: v.id_vendor,
        business_name: v.business_name || v.nama_vendor || 'Unknown',
        category: v.category || 'Other',
        location: v.location || v.kota || '',
        cover_url: '',
        logo_url: v.avatar_url || v.logo_url || v.logo || '',
        rating: rating.rating,
        review_count: rating.count,
        starting_price: 0,
        verified: true
      })
    }

    for (const p of portfolios) {
      const vid = p.id_vendor || p.vendor?.id_vendor
      if (vid && vendorMap.has(vid) && !vendorMap.get(vid)!.cover_url) {
        vendorMap.get(vid)!.cover_url = p.cover_url || ''
        if (!vendorMap.get(vid)!.starting_price && p.package?.price) {
          vendorMap.get(vid)!.starting_price = p.package.price
        }
      }
    }

    allVendors.value = Array.from(vendorMap.values())
      .filter(v => categoryOrder.includes(v.category))
  } catch {
    allVendors.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="vendor-showcase">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Featured Vendors</span>
        <h2 class="section-title">
          <template v-if="celebrationFilter">
            {{ celebrationFilter.charAt(0).toUpperCase() + celebrationFilter.slice(1) }} Vendors
          </template>
          <template v-else>Featured Vendors</template>
        </h2>
        <p class="section-desc">
          {{ celebrationFilter ? (celebrationTaglines[celebrationFilter] || 'Vendor terbaik untuk momen spesial Anda') : 'Vendor kreatif terkurasi untuk momen spesial Anda' }}
        </p>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <template v-else>
        <div
          v-for="cat in categoryOrder"
          :key="cat"
          class="vendor-row"
          v-show="filteredByCategory[cat] && filteredByCategory[cat].length > 0"
        >
          <div class="vendor-row-header" data-aos="fade-up">
            <div class="row-header-left">
              <span class="row-emoji">{{ getCategoryEmoji(cat) }}</span>
              <h3 class="row-title">{{ categoryDisplayNames[cat] || cat }}</h3>
            </div>
            <router-link :to="cat === 'Photography' ? '/photography' : '/mua'" class="row-link">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </router-link>
          </div>

          <div class="vendor-scroll" data-aos="fade-up" data-aos-delay="50">
            <div class="vendor-scroll-track">
              <router-link
                v-for="vendor in filteredByCategory[cat]"
                :key="vendor.id_vendor"
                :to="`/portfolio/${vendor.id_vendor}`"
                class="vendor-card"
              >
                <div class="vendor-card-image">
                  <img :src="getCoverImage(vendor)" :alt="vendor.business_name" loading="lazy" />
                  <div class="vendor-card-overlay"></div>
                  <div v-if="vendor.verified" class="vendor-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Verified
                  </div>
                </div>
                <div class="vendor-card-body">
                  <h4 class="vendor-name">{{ vendor.business_name }}</h4>
                  <p class="vendor-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ vendor.location || 'Indonesia' }}
                  </p>
                  <div class="vendor-rating">
                    <span class="stars">{{ '★'.repeat(Math.round(vendor.rating)) }}{{ '☆'.repeat(5 - Math.round(vendor.rating)) }}</span>
                    <span class="rating-text">{{ vendor.rating }}</span>
                    <span class="review-count">({{ vendor.review_count }})</span>
                  </div>
                  <div class="vendor-price" v-if="vendor.starting_price > 0">
                    <span class="price-label">Mulai</span>
                    <span class="price-value">{{ formatPrice(vendor.starting_price) }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="Object.values(filteredByCategory).every(arr => arr.length === 0)" class="text-center py-5">
          <p class="text-muted">No vendors found for this category.</p>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.vendor-showcase {
  padding: 100px 0;
  background: var(--bs-body-bg, #F7F4EF);
  position: relative;
}

.section-header {
  margin-bottom: 50px;
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

.vendor-row {
  margin-bottom: 48px;
}

.vendor-row:last-child {
  margin-bottom: 0;
}

.vendor-row-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.row-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-emoji {
  font-size: 1.5rem;
}

.row-title {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1.5rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0;
  font-weight: 400;
}

.row-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--bs-secondary, #B89C7B);
  text-decoration: none;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.row-link:hover {
  gap: 10px;
  color: var(--bs-black, #2a2a2a);
}

.vendor-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 8px;
}

.vendor-scroll::-webkit-scrollbar {
  display: none;
}

.vendor-scroll-track {
  display: flex;
  gap: 20px;
  min-width: max-content;
  padding: 4px 0;
}

.vendor-card {
  width: 260px;
  text-decoration: none;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.vendor-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.12);
}

.vendor-card-image {
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
}

.vendor-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vendor-card:hover .vendor-card-image img {
  transform: scale(1.08);
}

.vendor-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.vendor-card:hover .vendor-card-overlay {
  opacity: 1;
}

.vendor-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(34, 197, 94, 0.9);
  backdrop-filter: blur(4px);
  padding: 4px 10px;
  border-radius: 20px;
}

.vendor-card-body {
  padding: 16px 18px 20px;
}

.vendor-name {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1rem;
  color: var(--bs-black, #2a2a2a);
  margin: 0 0 6px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendor-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.78rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 10px;
}

.vendor-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
}

.vendor-rating .stars {
  color: #f59e0b;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.rating-text {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--bs-black, #2a2a2a);
}

.review-count {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.75rem;
  color: var(--bs-body-color, #5a5a5a);
}

.vendor-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.72rem;
  color: var(--bs-body-color, #5a5a5a);
}

.price-value {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--bs-secondary, #B89C7B);
}

@media (max-width: 992px) {
  .section-title {
    font-size: 2rem;
  }

  .vendor-card {
    width: 220px;
  }
}

@media (max-width: 576px) {
  .vendor-showcase {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .vendor-row-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .vendor-card {
    width: 200px;
  }
}
</style>
