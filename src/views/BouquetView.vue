<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'
import PinterestGallery from '@/components/layout/PinterestGallery.vue'

interface GalleryItem {
  url: string
  alt?: string
  to: string
}

const products = ref<any[]>([])
const images = ref<GalleryItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/products')
    const json = await res.json()
    if (res.ok) {
      products.value = (json.data || []).filter(
        (p: any) =>
          p.status === 'active' && p.vendor?.category === 'Bouquet Flowers'
      )
      images.value = products.value.map((p: any) => ({
        url: p.images?.[0]?.image_url || 'https://placehold.co/400x400?text=Flower',
        alt: p.name,
        to: '/product/' + p.id_product,
      }))
    }
  } catch {
    products.value = []
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
      <h1 class="gallery-title">Portfolio</h1>
      <p class="gallery-subtitle">Explore all bouquet products from our vendors</p>
    </div>

    <div v-if="loading" class="loading-state">
      <p>Loading products...</p>
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