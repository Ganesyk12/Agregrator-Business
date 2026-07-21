<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const router = useRouter()
const auth = useAuthStore()

interface FavoritePackage {
  id_favorite: number
  id_user: number
  id_package: number
  date_created: string
  package: {
    id_package: number
    id_vendor: number
    name: string
    description: string
    price: number
    duration: string
    vendor: { id_vendor: number; business_name: string }
    category: { category_name: string }
  }
}

const favorites = ref<FavoritePackage[]>([])
const loading = ref(true)

function formatPrice(price: number) {
  return 'Rp ' + price.toLocaleString('id-ID')
}

async function removeFavorite(packageId: number) {
  try {
    const res = await auth.authFetch(`/api/favorites/${packageId}`, { method: 'DELETE' })
    if (res.ok) {
      favorites.value = favorites.value.filter(f => f.id_package !== packageId)
      auth.refreshWishlistCount()
    }
  } catch { /* fallback */ }
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const res = await auth.authFetch('/api/favorites')
    const json = await res.json()
    if (res.ok) favorites.value = json.data || []
  } catch { /* fallback */ }
  finally { loading.value = false }
})
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="page-header">
      <h1 class="page-title">My Wishlist</h1>
      <p class="page-subtitle">Your saved packages</p>
    </div>

    <section class="wishlist-section pb-5">
      <div class="container">
        <div v-if="loading" class="loading-state">Loading wishlist...</div>

        <div v-else-if="favorites.length === 0" class="loading-state">
          <p>You haven't saved any packages yet.</p>
          <a href="/services" class="btn-browse">Browse Services</a>
        </div>

        <div v-else class="row g-4">
          <div v-for="fav in favorites" :key="fav.id_favorite" class="col-lg-3 col-md-4 col-sm-6">
            <div class="package-card">
              <button class="btn-remove-fav" @click="removeFavorite(fav.id_package)" title="Remove from wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <div class="package-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h5 class="package-name">{{ fav.package.name }}</h5>
              <p class="package-vendor">{{ fav.package.vendor?.business_name }}</p>
              <div class="package-meta">
                <span class="package-category">{{ fav.package.category?.category_name }}</span>
                <span v-if="fav.package.duration" class="package-duration">{{ fav.package.duration }}</span>
              </div>
              <p class="package-price">{{ formatPrice(fav.package.price) }}</p>
              <div class="package-actions">
                <a :href="'/vendor/' + fav.package.vendor?.id_vendor" class="btn-detail">Lihat Detail</a>
                <a :href="'/booking?vendorId=' + fav.package.id_vendor + '&packageId=' + fav.package.id_package + '&packageName=' + encodeURIComponent(fav.package.name) + '&packagePrice=' + fav.package.price" class="btn-checkout">Checkout</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
  padding: 40px 20px 20px;
}
.page-title {
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.page-subtitle {
  color: #666;
  font-size: 1rem;
}
.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
}
.btn-browse {
  display: inline-block;
  margin-top: 16px;
  padding: 12px 28px;
  background: #333;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
.package-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}
.btn-remove-fav {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
}
.btn-remove-fav:hover {
  transform: scale(1.2);
}
.package-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #888;
}
.package-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.package-vendor {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 12px;
}
.package-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 12px;
}
.package-category,
.package-duration {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 20px;
  background: #e8e8e8;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.package-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px;
}
.package-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}
.btn-detail,
.btn-checkout {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
}
.btn-detail {
  border: 1.5px solid #333;
  color: #333;
  background: transparent;
}
.btn-detail:hover {
  background: #333;
  color: #fff;
}
.btn-checkout {
  border: 1.5px solid #333;
  background: #333;
  color: #fff;
}
.btn-checkout:hover {
  background: #555;
  border-color: #555;
}
</style>
