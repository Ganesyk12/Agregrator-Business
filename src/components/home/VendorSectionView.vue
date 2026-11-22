<script setup lang="ts">
import { ref, onMounted } from 'vue'
import defaultImage from '@/assets/default/nothing.png'

interface VendorItem {
  id_vendor: number
  business_name: string
  category: string
  location: string
  logo_url: string
  verified: boolean
}

const allVendors = ref<VendorItem[]>([])
const loading = ref(true)

async function fetchData() {
  loading.value = true
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
      vendorMap.set(v.id_vendor, {
        id_vendor: v.id_vendor,
        business_name: v.business_name || v.nama_vendor || 'Unknown',
        category: v.category || 'Other',
        location: v.location || v.kota || '',
        logo_url: v.avatar_url || v.logo_url || v.logo || '',
        verified: true
      })
    }

    allVendors.value = Array.from(vendorMap.values())
  } catch {
    allVendors.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

function getLogoImage(vendor: VendorItem): string {
  return vendor.logo_url || defaultImage
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}
</script>

<template>
  <section class="vendor-section">
    <div class="container">
      <div class="section-header text-center" data-aos="fade-up">
        <span class="section-label">Vendors</span>
        <h2 class="section-title">Explore All Vendors</h2>
        <p class="section-desc">Temukan vendor terbaik untuk momen spesial Anda</p>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <template v-else>
        <div class="vendor-scroll-wrapper">
          <div class="vendor-scroll-track">
            <div
              v-for="vendor in allVendors"
              :key="vendor.id_vendor"
              class="vendor-card"
            >
              <router-link :to="`/vendor/${vendor.id_vendor}`" class="vendor-card-link">
                <div class="vendor-card-top">
                  <div class="vendor-avatar">
                    <img :src="getLogoImage(vendor)" :alt="vendor.business_name" loading="lazy" @error="onImgError" />
                  </div>
                  <div v-if="vendor.verified" class="verified-badge">
                    Verified
                  </div>
                  <div class="vendor-info">
                    <h4 class="vendor-name">{{ vendor.business_name }}</h4>
                    <p class="vendor-location">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {{ vendor.location || 'Indonesia' }}
                    </p>
                    <span class="vendor-category">{{ vendor.category }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.vendor-section {
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

.vendor-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  -ms-overflow-style: none;
  padding-bottom: 12px;
}

.vendor-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.vendor-scroll-wrapper::-webkit-scrollbar-track {
  background: #f5f1ea;
  border-radius: 3px;
}

.vendor-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #d4cfc3;
  border-radius: 3px;
}

.vendor-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #B89C7B;
}

.vendor-scroll-track {
  display: flex;
  gap: 24px;
  min-width: max-content;
  padding: 0 16px 4px;
}

.vendor-card {
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.vendor-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(0,0,0,0.12);
}

.vendor-card-link {
  display: flex;
  flex-direction: column;
  padding: 20px;
  text-decoration: none;
  color: var(--bs-black, #2a2a2a);
}

.vendor-card-top {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px 20px;
}

.verified-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(34, 197, 94, 0.95);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.vendor-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 16px;
  background: #f5f1ea;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vendor-info {
  text-align: center;
  width: 100%;
}

.vendor-name {
  font-family: var(--heading-font, 'Marcellus', serif);
  font-size: 1rem;
  margin: 0 0 8px auto;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.vendor-location {
  font-family: var(--bs-body-font-family, 'Jost', sans-serif);
  font-size: 0.75rem;
  color: var(--bs-body-color, #5a5a5a);
  margin: 0 0 6px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

.vendor-category {
  display: inline-block;
  margin: 0 auto;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bs-secondary, #B89C7B);
  background: rgba(184, 156, 123, 0.12);
  padding: 4px 10px;
  border-radius: 999px;
}

@media (max-width: 992px) {
  .vendor-card {
    width: 240px;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .vendor-section {
    padding: 60px 0;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .vendor-scroll-wrapper {
    padding-left: 0;
    padding-right: 0;
  }

  .vendor-scroll-track {
    padding-left: 0;
    padding-right: 0;
  }

  .vendor-card {
    width: 200px;
    padding: 16px;
  }

  .vendor-avatar {
    width: 64px;
    height: 64px;
  }
}
</style>