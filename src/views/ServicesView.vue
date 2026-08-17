<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const auth = useAuthStore()
const cart = useCartStore()
const router = useRouter()

interface Category {
  id_category: number
  category_name: string
}

interface PackageItem {
  id_package: number
  id_vendor: number
  name: string
  description: string
  price: number
  duration: string
  status: string
  vendor: { business_name: string }
  category: { category_name: string }
}

const categories = ref<Category[]>([])
const packages = ref<PackageItem[]>([])
const activeCategory = ref<number | null>(null)
const loading = ref(true)
const favoriteIds = ref<Set<number>>(new Set())

const filteredPackages = computed(() => {
  if (activeCategory.value === null) return packages.value
  return packages.value.filter(p =>
    p.category?.category_name === categories.value.find(c => c.id_category === activeCategory.value)?.category_name
  )
})

function formatPrice(price: number) {
  return 'Rp ' + price.toLocaleString('id-ID')
}

function goToBooking(pkg: any) {
  localStorage.setItem('sigyn_booking_config', JSON.stringify({
    vendorId: pkg.id_vendor,
    packageId: pkg.id_package,
    packageName: pkg.name,
    packagePrice: pkg.price,
  }))
  router.push('/booking')
}

async function fetchFavorites() {
  if (!auth.isLoggedIn) return
  try {
    const res = await auth.authFetch('/api/favorites')
    const json = await res.json()
    if (res.ok) {
      favoriteIds.value = new Set((json.data || []).map((f: any) => f.id_package))
    }
  } catch { /* fallback */ }
}

async function toggleFavorite(packageId: number) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  if (favoriteIds.value.has(packageId)) {
    const res = await auth.authFetch(`/api/favorites/${packageId}`, { method: 'DELETE' })
    if (res.ok) {
      const next = new Set(favoriteIds.value)
      next.delete(packageId)
      favoriteIds.value = next
      auth.refreshWishlistCount()
    }
  } else {
    const res = await auth.authFetch('/api/favorites', { method: 'POST', body: JSON.stringify({ id_package: packageId }) })
    if (res.ok) {
      const next = new Set(favoriteIds.value)
      next.add(packageId)
      favoriteIds.value = next
      auth.refreshWishlistCount()
    }
  }
}

async function addToCart(packageId: number) {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  await cart.addPackage(packageId)
}

onMounted(async () => {
  try {
    const [catRes, pkgRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/packages')
    ])
    if (catRes.ok) {
      const catJson = await catRes.json()
      categories.value = catJson.data || []
    }
    if (pkgRes.ok) {
      const pkgJson = await pkgRes.json()
      packages.value = (pkgJson.data || []).filter((p: PackageItem) => p.status !== 'deleted' && p.status !== 'inactive')
    }
  } catch {
    // fallback
  } finally {
    loading.value = false
  }
  await fetchFavorites()
})
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="page-header">
      <h1 class="page-title">Our Services</h1>
      <p class="page-subtitle">Choose from a wide range of wedding & event packages</p>
    </div>

    <section class="services-section pb-5">
      <div class="container">
        <div class="filter-buttons text-center mb-5">
          <button
            :class="['btn', 'filter-btn', activeCategory === null ? 'active' : '']"
            @click="activeCategory = null"
          >
            All
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id_category"
            :class="['btn', 'filter-btn', activeCategory === cat.id_category ? 'active' : '']"
            @click="activeCategory = cat.id_category"
          >
            {{ cat.category_name }}
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <p>Loading packages...</p>
        </div>

        <div v-else-if="filteredPackages.length === 0" class="loading-state">
          <p>No packages available in this category.</p>
        </div>

        <div v-else class="row g-4">
          <div
            v-for="pkg in filteredPackages"
            :key="pkg.id_package"
            class="col-lg-3 col-md-4 col-sm-6"
          >
            <div class="package-card">
              <button class="btn-wishlist" @click="toggleFavorite(pkg.id_package)" :title="favoriteIds.has(pkg.id_package) ? 'Remove from wishlist' : 'Add to wishlist'">
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="favoriteIds.has(pkg.id_package) ? '#e74c3c' : 'none'" :stroke="favoriteIds.has(pkg.id_package) ? '#e74c3c' : '#999'" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button class="btn-cart" @click="addToCart(pkg.id_package)" title="Add to cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </button>
              <div class="package-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <h5 class="package-name">{{ pkg.name }}</h5>
              <p class="package-vendor">{{ pkg.vendor?.business_name }}</p>
              <div class="package-meta">
                <span class="package-category">{{ pkg.category?.category_name }}</span>
                <span v-if="pkg.duration" class="package-duration">{{ pkg.duration }}</span>
              </div>
              <p class="package-description">{{ pkg.description }}</p>
              <p class="package-price">{{ formatPrice(pkg.price) }}</p>
              <div class="package-actions">
                <a :href="'/vendor/' + pkg.id_vendor" class="btn-detail">Lihat Detail</a>
                <a href="#" class="btn-checkout" @click.prevent="goToBooking(pkg)">Checkout</a>
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
  padding: 120px 20px 20px;
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

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.filter-btn {
  padding: 8px 24px;
  border: 2px solid #ddd;
  border-radius: 30px;
  background: transparent;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #333;
  color: #333;
}

.filter-btn.active {
  background: #333;
  border-color: #333;
  color: #fff;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #888;
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

.btn-wishlist {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  z-index: 2;
}

.btn-wishlist:hover {
  transform: scale(1.2);
}

.btn-cart {
  position: absolute;
  top: 12px;
  left: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  z-index: 2;
}
.btn-cart:hover {
  transform: scale(1.2);
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
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

.package-description {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 12px;
  flex-grow: 1;
  line-height: 1.5;
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
