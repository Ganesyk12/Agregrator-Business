<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import DoughnutChart from '@/dashboard/components/DoughnutChart.vue'
import RevenueChart from '@/dashboard/components/RevenueChart.vue'

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isAdmin = computed(() => auth.user?.roles?.some(r => ['eUser-Admin', 'eUser-SuperAdmin'].includes(r.role_code)))
const isVendor = computed(() => auth.user?.roles?.some(r => r.role_code === 'eUser-Vendor'))
const isProductVendor = computed(() => auth.isProductVendor)

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
    <div class="row tile_count">
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-building"></i> Total Vendors</span>
        <div class="count">250</div>
        <span class="count_bottom"><i class="green">4% </i> From last Week</span>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-cube"></i> Total Packages</span>
        <div class="count">1,230</div>
        <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>3% </i> From last Week</span>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-calendar"></i> Total Bookings</span>
        <div class="count green">567</div>
        <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-users"></i> Total Users</span>
        <div class="count">2,315</div>
        <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
      </div>
      <div class="tile_stats_count">
        <span class="count_top"><i class="fa fa-star"></i> Reviews</span>
        <div class="count">7,325</div>
        <span class="count_bottom"><i class="green"><i class="fa fa-sort-asc"></i>34% </i> From last Week</span>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="x_panel">
          <div class="x_title"><h2>Revenue Overview <small>Monthly revenue graph</small></h2><div class="clearfix"></div></div>
          <div class="x_content"><div style="height:300px;padding:10px 0;"><RevenueChart /></div></div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-4 col-sm-4 col-xs-12">
        <div class="x_panel tile fixed_height_320">
          <div class="x_title"><h2>Top Vendors</h2><ul class="nav navbar-right panel_toolbox"><li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></li></ul><div class="clearfix"></div></div>
          <div class="x_content">
            <div class="widget_summary" v-for="(v,i) in ['Vendor A', 'Vendor B', 'Vendor C']" :key="v">
              <div class="w_left w_25"><span>{{ v }}</span></div>
              <div class="w_center w_55"><div class="progress"><div class="progress-bar bg-green" role="progressbar" :style="'width:' + [85,65,45][i] + '%'"></div></div></div>
              <div class="w_right w_20"><span>{{ [85,65,45][i] }}</span></div>
              <div class="clearfix"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4 col-sm-4 col-xs-12">
        <div class="x_panel tile fixed_height_320 overflow_hidden">
          <div class="x_title"><h2>Booking Status</h2><ul class="nav navbar-right panel_toolbox"><li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></li></ul><div class="clearfix"></div></div>
          <div class="x_content"><table style="width:100%"><tbody><tr><td><DoughnutChart /></td><td><table class="tile_info"><tbody><tr><td><p><i class="fa fa-square blue"></i>Pending</p></td><td>30%</td></tr><tr><td><p><i class="fa fa-square green"></i>Confirmed</p></td><td>45%</td></tr><tr><td><p><i class="fa fa-square purple"></i>Completed</p></td><td>15%</td></tr><tr><td><p><i class="fa fa-square red"></i>Cancelled</p></td><td>10%</td></tr></tbody></table></td></tr></tbody></table></div>
        </div>
      </div>
      <div class="col-md-4 col-sm-4 col-xs-12">
        <div class="x_panel tile fixed_height_320">
          <div class="x_title"><h2>Quick Actions</h2><ul class="nav navbar-right panel_toolbox"><li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></li></ul><div class="clearfix"></div></div>
          <div class="x_content"><div class="dashboard-widget-content"><ul class="quick-list"><li><i class="fa fa-building"></i><a href="#"> Add Vendor</a></li><li><i class="fa fa-cube"></i><a href="#"> Add Package</a></li><li><i class="fa fa-users"></i><a href="#"> Manage Users</a></li><li><i class="fa fa-credit-card"></i><a href="#"> View Payments</a></li><li><i class="fa fa-bar-chart"></i><a href="#"> Reports</a></li></ul></div></div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="x_panel">
          <div class="x_title"><h2>Recent Bookings</h2><ul class="nav navbar-right panel_toolbox"><li><a class="collapse-link"><i class="fa fa-chevron-up"></i></a></li></ul><div class="clearfix"></div></div>
          <div class="x_content"><table class="table table-striped"><thead><tr><th>#</th><th>Customer</th><th>Vendor</th><th>Package</th><th>Status</th><th>Amount</th></tr></thead><tbody><tr><td>1</td><td>John Doe</td><td>Vendor A</td><td>Premium Package</td><td><span class="label label-success">Completed</span></td><td>Rp 5,000,000</td></tr><tr><td>2</td><td>Jane Smith</td><td>Vendor B</td><td>Basic Package</td><td><span class="label label-warning">Pending</span></td><td>Rp 1,500,000</td></tr><tr><td>3</td><td>Bob Johnson</td><td>Vendor C</td><td>Standard Package</td><td><span class="label label-info">Confirmed</span></td><td>Rp 3,000,000</td></tr><tr><td>4</td><td>Alice Brown</td><td>Vendor A</td><td>Enterprise Package</td><td><span class="label label-danger">Cancelled</span></td><td>Rp 10,000,000</td></tr><tr><td>5</td><td>Charlie Wilson</td><td>Vendor B</td><td>Premium Package</td><td><span class="label label-success">Completed</span></td><td>Rp 5,000,000</td></tr></tbody></table></div>
        </div>
      </div>
    </div>
  </template>
</template>
