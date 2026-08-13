<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import PinterestGallery from '@/components/layout/PinterestGallery.vue'

interface GalleryItem {
  url: string
  id_portfolio: number
  alt?: string
}

const images = ref<GalleryItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/portfolios')
    const json = await res.json()
    if (res.ok) {
      const allPortfolios = json.data || []
      images.value = allPortfolios
        .filter((p: any) => p.vendor?.category === 'Makeup Artist')
        .map((p: any) => ({
          url: p.cover_url,
          id_portfolio: p.id_portfolio,
          alt: p.title,
        }))
    }
  } catch {
    // fallback
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="gallery-header">
      <h1 class="gallery-title">MUA</h1>
      <p class="gallery-subtitle">Makeup artistry inspirations</p>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading portfolios...</p>
    </div>

    <PinterestGallery v-else :images="images" />

    <Footer />
  </div>
</template>

<style scoped>
.gallery-header {
  text-align: center;
  padding: 120px 20px 20px;
}
.gallery-title {
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.gallery-subtitle {
  color: #666;
  font-size: 1rem;
}
.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
}
</style>
