<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

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
  whats_included: string
  status: string
  vendor: { business_name: string; location?: string }
  category: { category_name: string }
}

const categories = ref<Category[]>([])
const packages = ref<PackageItem[]>([])
const activeCategory = ref<number | null>(null)
const loading = ref(true)

const filteredPackages = computed(() => {
  if (activeCategory.value === null) return packages.value
  return packages.value.filter(p => p.category?.category_name === categories.value.find(c => c.id_category === activeCategory.value)?.category_name)
})

function formatPrice(price: number) {
  return 'Rp ' + price.toLocaleString('id-ID')
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
})
</script>

<template>
  <section class="package-section py-5">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 class="text-uppercase section-title mb-0">Our Services</h4>
          <p class="text-muted mb-0">Choose from a wide range of wedding & event packages</p>
        </div>
        <a href="/services" class="btn-link">View All Services</a>
      </div>

      <div class="filter-buttons text-center mb-4">
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

      <div v-if="loading" class="text-center py-5">
        <p class="text-muted">Loading packages...</p>
      </div>

      <div v-else-if="filteredPackages.length === 0" class="text-center py-5">
        <p class="text-muted">No packages available in this category.</p>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="pkg in filteredPackages"
          :key="pkg.id_package"
          class="col-lg-3 col-md-4 col-sm-6"
        >
          <div class="package-card">
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
              <a :href="'/booking?vendorId=' + pkg.id_vendor + '&packageId=' + pkg.id_package + '&packageName=' + encodeURIComponent(pkg.name) + '&packagePrice=' + pkg.price" class="btn-checkout">Checkout</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  font-size: 1.5rem;
  letter-spacing: 2px;
  margin-bottom: 8px;
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
