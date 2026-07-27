<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const auth = useAuthStore()

interface Product {
  id_product: number; name: string; stock: number; price: number; status: string
  vendor?: { business_name: string }
  labels?: string
  type_name?: string | null
  size_name?: string | null
  variants?: Array<{ name: string; stock: number }>
}

const products = ref<Product[]>([])
const vendorId = computed(() => auth.user?.vendor_id)

async function fetchProducts() {
  try {
    let url = `${apiUrl}/api/products`
    if (vendorId.value) url += `?vendorId=${vendorId.value}`
    const res = await fetch(url)
    if (!res.ok) throw new Error()
    const json = await res.json()
    products.value = json.data || []
  } catch (err) { console.error(err) }
}

onMounted(fetchProducts)

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)
const stockFilter = ref<'all' | 'low' | 'out'>('all')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let r = products.value
  if (q) r = r.filter(p => p.name.toLowerCase().includes(q) || (p.vendor?.business_name || '').toLowerCase().includes(q))
  if (stockFilter.value === 'low') r = r.filter(p => { const t = getTotalStock(p); return t > 0 && t <= 5 })
  if (stockFilter.value === 'out') r = r.filter(p => getTotalStock(p) === 0)
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => { const s = (currentPage.value - 1) * perPage.value; return filtered.value.slice(s, s + perPage.value) })
function goPage(p: number) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }

const lowStockCount = computed(() => products.value.filter(p => { const t = getTotalStock(p); return t > 0 && t <= 5 }).length)
const outOfStockCount = computed(() => products.value.filter(p => getTotalStock(p) === 0).length)

function formatCurrency(v: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v) }

function getTotalStock(p: Product) {
  const variantStock = (p.variants || []).reduce((sum, v) => sum + v.stock, 0)
  return p.stock + variantStock
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Inventory</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="alert alert-info" v-if="lowStockCount > 0 || outOfStockCount > 0">
        <i class="fa fa-exclamation-triangle"></i>
        <span v-if="lowStockCount > 0"><strong>{{ lowStockCount }}</strong> product(s) low on stock.</span>
        <span v-if="outOfStockCount > 0"> <strong>{{ outOfStockCount }}</strong> product(s) out of stock.</span>
      </div>

      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-8">
          <div class="btn-group">
            <button :class="'btn btn-' + (stockFilter === 'all' ? 'primary' : 'default')" @click="stockFilter='all';currentPage=1">All</button>
            <button :class="'btn btn-' + (stockFilter === 'low' ? 'warning' : 'default')" @click="stockFilter='low';currentPage=1">Low Stock</button>
            <button :class="'btn btn-' + (stockFilter === 'out' ? 'danger' : 'default')" @click="stockFilter='out';currentPage=1">Out of Stock</button>
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group" style="max-width:250px;float:right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Search inventory..." v-model="search" @input="currentPage=1" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead><tr><th>Product</th><th>Vendor</th><th>Base Stock</th><th>Variant Stock</th><th>Total</th><th>Price</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="p in paginated" :key="p.id_product" :class="{'danger': getTotalStock(p) === 0, 'warning': getTotalStock(p) > 0 && getTotalStock(p) <= 5}">
              <td>{{ p.name }}</td>
              <td>{{ p.vendor?.business_name || '-' }}</td>
              <td>{{ p.stock }}</td>
              <td>{{ (p.variants || []).reduce((s, v) => s + v.stock, 0) }}</td>
              <td><strong>{{ getTotalStock(p) }}</strong></td>
              <td>{{ formatCurrency(p.price) }}</td>
              <td>
                <span v-if="getTotalStock(p) === 0" class="label label-danger">Out of Stock</span>
                <span v-else-if="getTotalStock(p) <= 5" class="label label-warning">Low Stock</span>
                <span v-else class="label label-success">In Stock</span>
              </td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="7" style="text-align:center;">No inventory items found.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-md-6"><p>Showing {{ filtered.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0 }} to {{ Math.min(currentPage * perPage, filtered.length) }} of {{ filtered.length }} entries</p></div>
        <div class="col-md-6"><nav style="float:right;"><ul class="pagination" style="margin:0;">
          <li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(1)">&laquo;</a></li>
          <li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(currentPage-1)">&lsaquo;</a></li>
          <li v-for="p in Array.from({length:totalPages},(_,i)=>i+1).filter(p=>Math.abs(p-currentPage)<=2||p===1||p===totalPages)" :key="p" :class="{active:p===currentPage}"><a @click.prevent="goPage(p)">{{ p }}</a></li>
          <li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(currentPage+1)">&rsaquo;</a></li>
          <li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(totalPages)">&raquo;</a></li>
        </ul></nav></div>
      </div>
    </div>
  </div>
</template>
