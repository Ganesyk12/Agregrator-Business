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
    if (orderRes.ok) { 
      const d = await orderRes.json(); 
      const orders = d.data || []; 
      orderCount.value = orders.length; 
      totalRevenue.value = orders.filter((o: any) => o.status === 'delivered' || o.status === 'completed').reduce((s: number, o: any) => s + Number(o.total_price || 0), 0) 
    }
  } catch { /* ignore */ }
})

function formatCurrency(v: number) { 
  return 'Rp ' + v.toLocaleString('id-ID') 
}
</script>

<template>
  <div class="row">
    <!-- Store Info Card -->
    <div class="col-md-12">
      <div class="card">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto text-center">
              <div style="width:90px; height:90px; border-radius:50%; overflow:hidden; background:#eee; display:flex; align-items:center; justify-content:center; border: 3px solid #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.12);">
                <img v-if="store.avatar" :src="store.avatar" style="width:100%; height:100%; object-fit:cover;" />
                <i v-else class="fa fa-store" style="font-size:2.5rem; color:#ccc;"></i>
              </div>
            </div>
            <div class="col">
              <h3 style="margin: 0 0 6px; font-weight: 700; color: #2c3e50;">{{ store.name }}</h3>
              <span class="badge bg-c-blue text-white" style="font-size: 13px; padding: 6px 12px; border-radius: 4px;">{{ store.category || 'Vendor Store' }}</span>
            </div>
            <div class="col-auto">
              <button class="btn btn-outline-primary btn-sm" @click="router.push('/store-settings')">
                <i class="fa fa-cog"></i> Store Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- KPI Statistic Cards -->
  <div class="row">
    <div class="col-md-6 col-xl-3">
      <div class="card bg-c-blue order-card">
        <div class="card-body">
          <h6 class="text-white">Active Products</h6>
          <h2 class="text-right text-white"><i class="fa fa-shopping-bag card-icon"></i><span>{{ productCount }}</span></h2>
          <p class="m-b-0" style="margin-top: 15px;">
            <a class="text-white" href="#" @click.prevent="router.push('/products')" style="text-decoration:none;">
              Manage Products <i class="fa fa-arrow-circle-right m-l-5"></i>
            </a>
          </p>
        </div>
      </div>
    </div>
    
    <div class="col-md-6 col-xl-3">
      <div class="card bg-c-green order-card">
        <div class="card-body">
          <h6 class="text-white">Total Orders</h6>
          <h2 class="text-right text-white"><i class="fa fa-truck card-icon"></i><span>{{ orderCount }}</span></h2>
          <p class="m-b-0" style="margin-top: 15px;">
            <a class="text-white" href="#" @click.prevent="router.push('/orders')" style="text-decoration:none;">
              View Orders <i class="fa fa-arrow-circle-right m-l-5"></i>
            </a>
          </p>
        </div>
      </div>
    </div>
    
    <div class="col-md-6 col-xl-3">
      <div class="card bg-c-yellow order-card">
        <div class="card-body">
          <h6 class="text-white">Revenue</h6>
          <h2 class="text-right text-white"><i class="fa fa-money card-icon"></i><span>{{ formatCurrency(totalRevenue) }}</span></h2>
          <p class="m-b-0 text-white" style="margin-top: 15px; font-size: 13px; font-weight: 500; opacity: 0.95;">
            <i class="fa fa-check-circle"></i> Completed & Delivered
          </p>
        </div>
      </div>
    </div>
    
    <div class="col-md-6 col-xl-3">
      <div class="card bg-c-red order-card">
        <div class="card-body">
          <h6 class="text-white">Reviews Received</h6>
          <h2 class="text-right text-white"><i class="fa fa-star card-icon"></i><span>{{ reviewCount }}</span></h2>
          <p class="m-b-0" style="margin-top: 15px;">
            <a class="text-white" href="#" @click.prevent="router.push('/reviews')" style="text-decoration:none;">
              View Reviews <i class="fa fa-arrow-circle-right m-l-5"></i>
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>

</template>
