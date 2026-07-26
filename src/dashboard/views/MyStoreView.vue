<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const productCount = ref(0)
const orderCount = ref(0)
const reviewCount = ref(0)
const totalRevenue = ref(0)

const store = computed(() => ({
  name: auth.user?.vendor_name || 'My Store',
  category: auth.user?.vendor_category || '',
  avatar: auth.user?.vendor_avatar || null,
}))

onMounted(async () => {
  const vendorId = auth.user?.vendor_id
  if (!vendorId) return
  try {
    const [prodRes, orderRes] = await Promise.all([
      fetch(`${apiUrl}/api/products?vendorId=${vendorId}`),
      fetch(`${apiUrl}/api/orders/vendor/${vendorId}`, { headers: auth.authHeaders() }),
    ])
    if (prodRes.ok) { const d = await prodRes.json(); productCount.value = (d.data || []).length }
    if (orderRes.ok) { const d = await orderRes.json(); const orders = d.data || []; orderCount.value = orders.length; totalRevenue.value = orders.filter((o: any) => o.status === 'delivered' || o.status === 'completed').reduce((s: number, o: any) => s + o.total_price, 0) }
  } catch { /* ignore */ }
})
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>My Store</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row">
        <div class="col-md-12 text-center" style="padding:30px 0;">
          <div style="width:100px;height:100px;border-radius:50%;margin:0 auto 16px;overflow:hidden;background:#eee;display:flex;align-items:center;justify-content:center;">
            <img v-if="store.avatar" :src="store.avatar" style="width:100%;height:100%;object-fit:cover;" />
            <i v-else class="fa fa-store" style="font-size:2.5rem;color:#ccc;"></i>
          </div>
          <h3 style="margin:0 0 4px;">{{ store.name }}</h3>
          <p style="color:#888;">{{ store.category }}</p>
        </div>
      </div>

      <div class="row tile_count">
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-shopping-bag"></i> Products</span>
          <div class="count">{{ productCount }}</div>
          <a class="count_bottom" href="#" @click.prevent="router.push('/products')">Manage Products</a>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-truck"></i> Orders</span>
          <div class="count">{{ orderCount }}</div>
          <a class="count_bottom" href="#" @click.prevent="router.push('/orders')">View Orders</a>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-money"></i> Revenue</span>
          <div class="count">{{ 'Rp ' + totalRevenue.toLocaleString('id-ID') }}</div>
        </div>
        <div class="tile_stats_count col-md-3 col-sm-6">
          <span class="count_top"><i class="fa fa-star"></i> Reviews</span>
          <div class="count">{{ reviewCount }}</div>
          <a class="count_bottom" href="#" @click.prevent="router.push('/reviews')">View Reviews</a>
        </div>
      </div>

      <div class="row" style="margin-top:20px;">
        <div class="col-md-12">
          <div class="alert alert-info">
            <i class="fa fa-info-circle"></i> This is your store overview. Use the sidebar to manage your products, orders, and store settings.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
