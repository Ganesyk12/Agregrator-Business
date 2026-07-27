<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isAdmin = computed(() => auth.user?.roles?.some(r => ['eUser-Admin', 'eUser-SuperAdmin'].includes(r.role_code)))
const isVendor = computed(() => auth.user?.roles?.some(r => r.role_code === 'eUser-Vendor'))
const isProductVendor = computed(() => auth.isProductVendor)

const displayName = computed(() => auth.user?.full_name || 'Admin')
const appName = import.meta.env.VITE_APP_NAME || 'Agregrator Business'

// Product Vendor stats
const productCount = ref(0)
const orderCount = ref(0)
const todaySales = ref(0)
const weekSales = ref(0)
const monthSales = ref(0)
const productsSold = ref(0)
const lowStockCount = ref(0)
const pendingOrders = ref(0)

// Service Vendor stats
const vendorProductsCount = ref(0)
const vendorOrdersCount = ref(0)
const vendorPackagesCount = ref(0)
const vendorPortfoliosCount = ref(0)
const vendorBookingsCount = ref(0)

onMounted(async () => {
  if (isProductVendor.value) {
    await fetchProductVendorStats()
  } else if (isVendor.value && !isAdmin.value) {
    await fetchServiceVendorStats()
  }
})

async function fetchProductVendorStats() {
  const vendorId = auth.user!.vendor_id
  if (!vendorId) return
  try {
    const [prodRes, orderRes] = await Promise.all([
      fetch(`${apiUrl}/api/products?vendorId=${vendorId}`),
      fetch(`${apiUrl}/api/orders/vendor/${vendorId}`, { headers: auth.authHeaders() }),
    ])

    if (prodRes.ok) { const d = await prodRes.json(); const products = d.data || []; productCount.value = products.length; lowStockCount.value = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length }

    if (orderRes.ok) {
      const d = await orderRes.json(); const orders = d.data || []; orderCount.value = orders.length; pendingOrders.value = orders.filter((o: any) => o.status === 'pending').length
      const now = new Date(); const todayStr = now.toDateString(); const weekAgo = new Date(now.getTime() - 7 * 86400000); const monthAgo = new Date(now.getTime() - 30 * 86400000)
      for (const o of orders) {
        if (o.status === 'delivered' || o.status === 'completed') {
          const d = new Date(o.date_created)
          if (d.toDateString() === todayStr) todaySales.value += o.total_price
          if (d >= weekAgo) weekSales.value += o.total_price
          if (d >= monthAgo) monthSales.value += o.total_price
        }
        for (const item of o.items || []) productsSold.value += item.quantity || 0
      }
    }
  } catch { /* ignore */ }
}

async function fetchServiceVendorStats() {
  const vendorId = auth.user!.vendor_id
  if (!vendorId) return
  try {
    const [prodRes, orderRes, pkgRes, portRes, bookRes] = await Promise.all([
      fetch(`${apiUrl}/api/products?vendorId=${vendorId}`),
      fetch(`${apiUrl}/api/orders/vendor/${vendorId}`, { headers: auth.authHeaders() }),
      fetch(`${apiUrl}/api/packages?vendorId=${vendorId}`),
      fetch(`${apiUrl}/api/portfolios?vendorId=${vendorId}`),
      fetch(`${apiUrl}/api/bookings?vendorId=${vendorId}`),
    ])
    if (prodRes.ok) { const d = await prodRes.json(); vendorProductsCount.value = (d.data || []).length }
    if (orderRes.ok) { const d = await orderRes.json(); vendorOrdersCount.value = (d.data || []).length }
    if (pkgRes.ok) { const d = await pkgRes.json(); vendorPackagesCount.value = (d.data || []).length }
    if (portRes.ok) { const d = await portRes.json(); vendorPortfoliosCount.value = (d.data || []).length }
    if (bookRes.ok) { const d = await bookRes.json(); vendorBookingsCount.value = (d.data || []).length }
  } catch { /* ignore */ }
}
</script>

<template>
  <!-- Product Vendor Dashboard -->
  <template v-if="isProductVendor">
    <div class="x_panel">
      <div class="x_title"><h2>Dashboard — {{ auth.user?.vendor_name || 'My Store' }}</h2><div class="clearfix"></div></div>
      <div class="x_content">
        <div class="row tile_count">
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-shopping-bag"></i> Products</span>
            <div class="count">{{ productCount }}</div>
            <span class="count_bottom"><i :class="lowStockCount > 0 ? 'red' : 'green'">{{ lowStockCount }}</i> low stock items</span>
          </div>
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-truck"></i> Orders</span>
            <div class="count green">{{ orderCount }}</div>
            <span class="count_bottom"><i class="red">{{ pendingOrders }}</i> pending</span>
          </div>
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-money"></i> Today's Sales</span>
            <div class="count">{{ 'Rp ' + todaySales.toLocaleString('id-ID') }}</div>
          </div>
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-cube"></i> Products Sold</span>
            <div class="count">{{ productsSold }}</div>
          </div>
        </div>
        <div class="row tile_count">
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-money"></i> This Week</span>
            <div class="count">{{ 'Rp ' + weekSales.toLocaleString('id-ID') }}</div>
          </div>
          <div class="tile_stats_count col-md-3 col-sm-6">
            <span class="count_top"><i class="fa fa-money"></i> This Month</span>
            <div class="count">{{ 'Rp ' + monthSales.toLocaleString('id-ID') }}</div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Service Vendor Dashboard -->
  <template v-else-if="isVendor && !isAdmin">
    <div class="row tile_count">
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-shopping-bag"></i> My Products</span>
        <div class="count">{{ vendorProductsCount }}</div>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-truck"></i> My Orders</span>
        <div class="count">{{ vendorOrdersCount }}</div>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-cube"></i> My Packages</span>
        <div class="count">{{ vendorPackagesCount }}</div>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-picture-o"></i> My Portfolios</span>
        <div class="count">{{ vendorPortfoliosCount }}</div>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-calendar"></i> My Bookings</span>
        <div class="count">{{ vendorBookingsCount }}</div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="x_panel">
          <div class="x_title"><h2>Welcome, {{ auth.user?.vendor_name || auth.user?.full_name }}!</h2><div class="clearfix"></div></div>
          <div class="x_content"><p>Manage your business from the sidebar menu. Use <strong>My Profile</strong> to update your business information, photo, and Instagram link.</p></div>
        </div>
      </div>
    </div>
  </template>

  <!-- Admin Dashboard -->
  <template v-else>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header">
            <h5>Dashboard</h5>
          </div>
          <div class="card-body">
            <div class="welcome-section text-center" style="padding: 80px 20px;">
              <h1 style="font-size: 36px; margin-bottom: 20px; color: #73879C;">
                Selamat Datang, {{ displayName }}!
              </h1>
              <p style="font-size: 18px; color: #999; max-width: 600px; margin: 0 auto; line-height: 1.8;">
                Selamat datang di panel administrasi {{ appName }}. 
                Silakan gunakan menu navigasi di sebelah kiri untuk mengelola data dan pengaturan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
