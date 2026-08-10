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
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-blue">
              <i class="fa fa-shopping-bag"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Products</span>
              <div class="stat-value">{{ productCount }}</div>
              <span class="stat-desc">
                <span :class="lowStockCount > 0 ? 'badge-red' : 'badge-green'">
                  {{ lowStockCount }} low stock
                </span>
              </span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-green">
              <i class="fa fa-truck"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Orders</span>
              <div class="stat-value">{{ orderCount }}</div>
              <span class="stat-desc">
                <span class="badge-red" v-if="pendingOrders > 0">{{ pendingOrders }} pending</span>
                <span class="badge-green" v-else>All clear</span>
              </span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-orange">
              <i class="fa fa-money"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Today's Sales</span>
              <div class="stat-value">{{ 'Rp ' + todaySales.toLocaleString('id-ID') }}</div>
              <span class="stat-desc">Delivered/Completed</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-purple">
              <i class="fa fa-cube"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">Products Sold</span>
              <div class="stat-value">{{ productsSold }}</div>
              <span class="stat-desc">Total quantities</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-teal">
              <i class="fa fa-money"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">This Week</span>
              <div class="stat-value">{{ 'Rp ' + weekSales.toLocaleString('id-ID') }}</div>
              <span class="stat-desc">Last 7 days</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrapper icon-pink">
              <i class="fa fa-money"></i>
            </div>
            <div class="stat-info">
              <span class="stat-label">This Month</span>
              <div class="stat-value">{{ 'Rp ' + monthSales.toLocaleString('id-ID') }}</div>
              <span class="stat-desc">Last 30 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Service Vendor Dashboard -->
  <template v-else-if="isVendor && !isAdmin">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper icon-blue">
          <i class="fa fa-shopping-bag"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Products</span>
          <div class="stat-value">{{ vendorProductsCount }}</div>
          <span class="stat-desc">Active listings</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper icon-green">
          <i class="fa fa-truck"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Orders</span>
          <div class="stat-value">{{ vendorOrdersCount }}</div>
          <span class="stat-desc">Customer orders</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper icon-orange">
          <i class="fa fa-cube"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Packages</span>
          <div class="stat-value">{{ vendorPackagesCount }}</div>
          <span class="stat-desc">Service packages</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper icon-purple">
          <i class="fa fa-picture-o"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Portfolios</span>
          <div class="stat-value">{{ vendorPortfoliosCount }}</div>
          <span class="stat-desc">Inspiration items</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrapper icon-teal">
          <i class="fa fa-calendar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">My Bookings</span>
          <div class="stat-value">{{ vendorBookingsCount }}</div>
          <span class="stat-desc">Scheduled bookings</span>
        </div>
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

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #eef2f6;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.icon-blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.icon-green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.icon-purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.icon-orange { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.icon-pink { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
.icon-teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.stat-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.badge-green {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-red {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}
</style>
