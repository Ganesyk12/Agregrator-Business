<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const auth = useAuthStore()

interface OrderItem {
  id_order_item: number
  product?: { name: string }
  quantity: number
  price: number
}

interface Order {
  id_order: number; id_user: number; id_vendor: number; total_price: number
  status: string; delivery_info: string | null; notes: string | null
  date_created: string
  user?: { full_name: string; email: string }
  vendor?: { business_name: string }
  items?: OrderItem[]
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  pending: 'warning',
  paid: 'info',
  processing: 'primary',
  packed: 'info',
  ready_for_delivery: 'warning',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
}

const orders = ref<Order[]>([])
const vendorId = computed(() => auth.user?.vendor_id)
const isProductVendor = computed(() => auth.isProductVendor)

const availableStatuses = computed(() => {
  if (isProductVendor.value) {
    return ['pending', 'paid', 'processing', 'packed', 'ready_for_delivery', 'completed', 'cancelled']
  }
  return ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
})

async function fetchOrders() {
  try {
    let url = `${apiUrl}/api/orders`
    if (vendorId.value) url = `${apiUrl}/api/orders/vendor/${vendorId.value}`
    const res = await fetch(url, { headers: auth.authHeaders() })
    if (!res.ok) throw new Error()
    const json = await res.json()
    orders.value = json.data || []
  } catch (err) { console.error(err) }
}

onMounted(fetchOrders)

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let r = orders.value
  if (q) r = r.filter(o => (o.user?.full_name || '').toLowerCase().includes(q) || o.status.toLowerCase().includes(q))
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => { const s = (currentPage.value - 1) * perPage.value; return filtered.value.slice(s, s + perPage.value) })
function goPage(p: number) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }

function formatCurrency(v: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v) }

async function updateStatus(orderId: number, status: string) {
  try {
    const res = await auth.authFetch(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    if (res.ok) await fetchOrders()
  } catch (err) { console.error(err) }
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Orders</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12">
          <div class="input-group" style="max-width:250px; float:right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Search orders..." v-model="search" @input="currentPage=1" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead><tr><th>No</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="o in paginated" :key="o.id_order">
              <td>{{ o.id_order }}</td>
              <td>{{ o.user?.full_name || '-' }}<br><small>{{ o.user?.email }}</small></td>
              <td>
                <span v-for="item in o.items || []" :key="item.id_order_item" style="display:block;">
                  {{ item.product?.name }} x{{ item.quantity }} @ {{ formatCurrency(item.price) }}
                </span>
              </td>
              <td><strong>{{ formatCurrency(o.total_price) }}</strong></td>
              <td><span :class="'label label-' + (statusColors[o.status] || 'default')">{{ statusLabels[o.status] || o.status }}</span></td>
              <td>{{ new Date(o.date_created).toLocaleDateString() }}</td>
              <td>
                <select class="form-control" style="width:auto;display:inline-block;" :value="o.status" @change="updateStatus(o.id_order, ($event.target as HTMLSelectElement).value)">
                  <option v-for="s in availableStatuses" :key="s" :value="s">{{ statusLabels[s] || s }}</option>
                </select>
              </td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="7" style="text-align:center;">No orders found.</td></tr>
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
