<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const todaySales = ref(0)
const weekSales = ref(0)
const monthSales = ref(0)
const totalOrders = ref(0)
const productsSold = ref(0)
const productCount = ref(0)
const lowStockItems = ref(0)
const topProducts = ref<Array<{ name: string; sold: number; revenue: number }>>([])

const vendorId = auth.user?.vendor_id

onMounted(async () => {
  if (!vendorId) return
  try {
    const [orderRes, prodRes] = await Promise.all([
      fetch(`${apiUrl}/api/orders/vendor/${vendorId}`, { headers: auth.authHeaders() }),
      fetch(`${apiUrl}/api/products?vendorId=${vendorId}`),
    ])

    if (orderRes.ok) {
      const json = await orderRes.json()
      const orders = json.data || []
      totalOrders.value = orders.length
      const now = new Date()
      const todayStr = now.toDateString()
      const weekAgo = new Date(now.getTime() - 7 * 86400000)
      const monthAgo = new Date(now.getTime() - 30 * 86400000)

      const productSoldMap = new Map<string, { sold: number; revenue: number }>()

      for (const o of orders) {
        const d = new Date(o.date_created)
        if (o.status === 'delivered' || o.status === 'completed') {
          const price = Number(o.total_price || 0)
          if (d.toDateString() === todayStr) todaySales.value += price
          if (d >= weekAgo) weekSales.value += price
          if (d >= monthAgo) monthSales.value += price
        }
        for (const item of o.items || []) {
          productsSold.value += item.quantity || 0
          const name = item.product?.name || 'Unknown'
          if (!productSoldMap.has(name)) productSoldMap.set(name, { sold: 0, revenue: 0 })
          const entry = productSoldMap.get(name)!
          entry.sold += item.quantity || 0
          entry.revenue += Number(item.price || 0) * (item.quantity || 0)
        }
      }
      topProducts.value = Array.from(productSoldMap.entries())
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, 5)
        .map(([name, data]) => ({ name, ...data }))
    }

    if (prodRes.ok) {
      const json = await prodRes.json()
      const products = json.data || []
      productCount.value = products.length
      lowStockItems.value = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length
    }
  } catch { /* ignore */ }
})

const maxSoldValue = computed(() => {
  if (topProducts.value.length === 0) return 1
  return Math.max(...topProducts.value.map(p => p.sold), 1)
})

function formatCurrency(v: number) { 
  return 'Rp ' + v.toLocaleString('id-ID') 
}
</script>

<template>
  <!-- Financial Summary Row -->
  <div class="row">
    <div class="col-md-4">
      <div class="card bg-c-green order-card" style="margin-bottom:20px;">
        <div class="card-body">
          <h6 class="text-white">Today's Sales</h6>
          <h2 class="text-right text-white"><i class="fa fa-money card-icon"></i><span>{{ formatCurrency(todaySales) }}</span></h2>
          <p class="m-b-0 text-white" style="font-size: 12px; opacity: 0.85; margin-top: 10px;">Delivered & completed today</p>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card bg-c-blue order-card" style="margin-bottom:20px;">
        <div class="card-body">
          <h6 class="text-white">This Week's Sales</h6>
          <h2 class="text-right text-white"><i class="fa fa-line-chart card-icon"></i><span>{{ formatCurrency(weekSales) }}</span></h2>
          <p class="m-b-0 text-white" style="font-size: 12px; opacity: 0.85; margin-top: 10px;">Sales in the last 7 days</p>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card bg-c-yellow order-card" style="margin-bottom:20px;">
        <div class="card-body">
          <h6 class="text-white">This Month's Sales</h6>
          <h2 class="text-right text-white"><i class="fa fa-calendar card-icon"></i><span>{{ formatCurrency(monthSales) }}</span></h2>
          <p class="m-b-0 text-white" style="font-size: 12px; opacity: 0.85; margin-top: 10px;">Sales in the last 30 days</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Operational Summary Row -->
  <div class="row">
    <div class="col-md-6 col-xl-3">
      <div class="card">
        <div class="card-body" style="padding: 20px;">
          <div class="row align-items-center">
            <div class="col-auto"><i class="fa fa-shopping-bag text-c-blue" style="font-size: 2.2rem;"></i></div>
            <div class="col text-right">
              <h6 class="text-muted m-b-5">Products in Catalog</h6>
              <h3 class="m-b-0" style="font-weight: 700; color: #2c3e50;">{{ productCount }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-xl-3">
      <div class="card">
        <div class="card-body" style="padding: 20px;">
          <div class="row align-items-center">
            <div class="col-auto"><i class="fa fa-truck text-c-green" style="font-size: 2.2rem;"></i></div>
            <div class="col text-right">
              <h6 class="text-muted m-b-5">Orders Count</h6>
              <h3 class="m-b-0" style="font-weight: 700; color: #2c3e50;">{{ totalOrders }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-xl-3">
      <div class="card">
        <div class="card-body" style="padding: 20px;">
          <div class="row align-items-center">
            <div class="col-auto"><i class="fa fa-cube text-c-yellow" style="font-size: 2.2rem;"></i></div>
            <div class="col text-right">
              <h6 class="text-muted m-b-5">Products Sold (Qty)</h6>
              <h3 class="m-b-0" style="font-weight: 700; color: #2c3e50;">{{ productsSold }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6 col-xl-3">
      <div class="card">
        <div class="card-body" style="padding: 20px;">
          <div class="row align-items-center">
            <div class="col-auto"><i class="fa fa-exclamation-triangle" :class="lowStockItems > 0 ? 'text-c-red' : 'text-muted'" style="font-size: 2.2rem;"></i></div>
            <div class="col text-right">
              <h6 class="text-muted m-b-5">Low Stock Items</h6>
              <h3 class="m-b-0" :class="lowStockItems > 0 ? 'text-c-red' : ''" style="font-weight: 700;">{{ lowStockItems }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Products Table (ERP style) -->
  <div class="row" style="margin-top: 10px;">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <h5><i class="fa fa-trophy text-warning m-r-10"></i>Top Performing Products</h5>
          <span class="d-block m-t-5">Based on volume of items sold</span>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover table-bordered" style="margin-bottom: 0;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="width: 50px; text-align: center;">Rank</th>
                  <th>Product Name</th>
                  <th style="width: 150px; text-align: center;">Units Sold</th>
                  <th>Performance Bar</th>
                  <th style="width: 200px; text-align: right;">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, i) in topProducts" :key="p.name">
                  <td style="text-align: center; font-weight: bold; color: #7f8c8d;">{{ i + 1 }}</td>
                  <td><strong style="color: #2c3e50;">{{ p.name }}</strong></td>
                  <td style="text-align: center; font-weight: 600;">{{ p.sold }} items</td>
                  <td style="vertical-align: middle;">
                    <div class="progress" style="height: 8px; margin-bottom: 0; background-color: #e9ecef; border-radius: 4px;">
                      <div class="progress-bar bg-c-blue" role="progressbar" 
                           :style="{ width: ((p.sold / maxSoldValue) * 100) + '%' }" 
                           style="border-radius: 4px;"></div>
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 600; color: #27ae60;">{{ formatCurrency(p.revenue) }}</td>
                </tr>
                <tr v-if="topProducts.length === 0">
                  <td colspan="5" style="text-align: center; padding: 25px 0;" class="text-muted">No sales metrics recorded yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
