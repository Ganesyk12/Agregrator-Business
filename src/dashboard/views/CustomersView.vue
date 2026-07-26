<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Customer {
  id_user: number
  full_name: string
  email: string
  phone?: string
  total_orders: number
  total_spent: number
  last_order_date: string
}

const customers = ref<Customer[]>([])
const vendorId = computed(() => auth.user?.vendor_id)

onMounted(async () => {
  if (!vendorId.value) return
  try {
    const res = await fetch(`${apiUrl}/api/orders/vendor/${vendorId.value}`, { headers: auth.authHeaders() })
    if (!res.ok) return
    const json = await res.json()
    const orders = json.data || []
    const map = new Map<number, Customer>()
    for (const o of orders) {
      const uid = o.id_user
      if (!map.has(uid)) {
        map.set(uid, { id_user: uid, full_name: o.user?.full_name || 'Unknown', email: o.user?.email || '', total_orders: 0, total_spent: 0, last_order_date: '' })
      }
      const c = map.get(uid)!
      c.total_orders++
      c.total_spent += o.total_price
      if (!c.last_order_date || o.date_created > c.last_order_date) c.last_order_date = o.date_created
    }
    customers.value = Array.from(map.values()).sort((a, b) => b.total_orders - a.total_orders)
  } catch { /* ignore */ }
})

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return customers.value
  return customers.value.filter(c => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
})

const paginated = computed(() => {
  const s = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(s, s + perPage.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))

function goPage(p: number) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Customers</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12">
          <div class="input-group" style="max-width:250px;float:right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Search customers..." v-model="search" @input="currentPage=1" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr></thead>
          <tbody>
            <tr v-for="c in paginated" :key="c.id_user">
              <td>{{ c.full_name }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.total_orders }}</td>
              <td>{{ 'Rp ' + c.total_spent.toLocaleString('id-ID') }}</td>
              <td>{{ c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : '-' }}</td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="5" style="text-align:center;">No customers found.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-md-6"><p>Showing {{ filtered.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0 }} to {{ Math.min(currentPage * perPage, filtered.length) }} of {{ filtered.length }}</p></div>
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
