<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
          if (d.toDateString() === todayStr) todaySales.value += o.total_price
          if (d >= weekAgo) weekSales.value += o.total_price
          if (d >= monthAgo) monthSales.value += o.total_price
        }
        for (const item of o.items || []) {
          productsSold.value += item.quantity || 0
          const name = item.product?.name || 'Unknown'
          if (!productSoldMap.has(name)) productSoldMap.set(name, { sold: 0, revenue: 0 })
          const entry = productSoldMap.get(name)!
          entry.sold += item.quantity || 0
          entry.revenue += item.price * (item.quantity || 0)
        }
      }
      topProducts.value = Array.from(productSoldMap.entries()).sort((a, b) => b[1].sold - a[1].sold).slice(0, 5).map(([name, data]) => ({ name, ...data }))
    }

    if (prodRes.ok) {
      const json = await prodRes.json()
      const products = json.data || []
      productCount.value = products.length
      lowStockItems.value = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length
    }
  } catch { /* ignore */ }
})

function formatCurrency(v: number) { return 'Rp ' + v.toLocaleString('id-ID') }
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Analytics</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row tile_count">
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-money"></i> Today's Sales</span>
          <div class="count green">{{ formatCurrency(todaySales) }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-money"></i> This Week</span>
          <div class="count">{{ formatCurrency(weekSales) }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-money"></i> This Month</span>
          <div class="count">{{ formatCurrency(monthSales) }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-shopping-bag"></i> Products</span>
          <div class="count">{{ productCount }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-truck"></i> Orders</span>
          <div class="count">{{ totalOrders }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-cube"></i> Products Sold</span>
          <div class="count">{{ productsSold }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-exclamation-triangle"></i> Low Stock</span>
          <div class="count" :class="lowStockItems > 0 ? 'red' : ''">{{ lowStockItems }}</div>
        </div>
      </div>

      <div v-if="topProducts.length > 0" class="row">
        <div class="col-md-12">
          <div class="x_panel" style="margin-top:20px;">
            <div class="x_title"><h2>Top Products</h2><div class="clearfix"></div></div>
            <div class="x_content">
              <table class="table table-striped">
                <thead><tr><th>#</th><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  <tr v-for="(p, i) in topProducts" :key="p.name">
                    <td>{{ i + 1 }}</td>
                    <td>{{ p.name }}</td>
                    <td>{{ p.sold }}</td>
                    <td>{{ formatCurrency(p.revenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
