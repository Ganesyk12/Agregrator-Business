<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const auth = useAuthStore()

interface OrderItem {
  id_order_item: number
  product?: { name: string; images?: { image_url: string }[] }
  quantity: number
  price: number
  size_name?: string | null
  variant_name?: string | null
  options?: any[]
  extras?: any[]
  greeting_card?: string | null
  greeting_message?: string | null
  subtotal?: number | null
}

interface Order {
  id_order: number
  order_number?: string | null
  id_user: number
  id_vendor: number
  total_price: number
  status: string
  payment_status?: string
  fulfillment_status?: string
  delivery_fee?: number
  service_fee?: number
  delivery_info: string | null
  notes: string | null
  recipient_name?: string | null
  recipient_phone?: string | null
  delivery_address?: string | null
  delivery_city?: string | null
  delivery_province?: string | null
  delivery_postal_code?: string | null
  delivery_notes?: string | null
  delivery_date?: string | null
  delivery_time?: string | null
  date_created: string
  user?: { full_name: string; email: string; phone?: string | null }
  vendor?: { business_name: string }
  items?: OrderItem[]
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  confirmed: 'Confirmed',
}

const statusColors: Record<string, string> = {
  pending: 'warning',
  paid: 'info',
  processing: 'primary',
  packed: 'info',
  ready_for_delivery: 'warning',
  shipped: 'primary',
  delivered: 'success',
  completed: 'success',
  cancelled: 'danger',
  confirmed: 'info',
}

const orders = ref<Order[]>([])
const vendorId = computed(() => auth.user?.vendor_id)
const isProductVendor = computed(() => auth.isProductVendor)
const detail = ref<Order | null>(null)

const FULFILLMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
}

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
  if (q) {
    r = r.filter(o =>
      (o.user?.full_name || '').toLowerCase().includes(q) ||
      (o.order_number || String(o.id_order)).toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      (o.recipient_name || '').toLowerCase().includes(q)
    )
  }
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => { const s = (currentPage.value - 1) * perPage.value; return filtered.value.slice(s, s + perPage.value) })
function goPage(p: number) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }

function formatCurrency(v: number) { return 'Rp ' + (v || 0).toLocaleString('id-ID') }
function na(v: any) { return (v === null || v === undefined || v === '' || v === 0) ? 'Not Available' : v }

function formatOptions(item: OrderItem) {
  if (item.options?.length) {
    return item.options.map((o: any) => `${o.groupName}: ${o.valueName}`).join(', ')
  }
  return ''
}

function formatExtras(item: OrderItem) {
  if (item.extras?.length) {
    return item.extras.map((e: any) => e.name).join(', ')
  }
  return ''
}

function itemSubtotal(item: OrderItem) {
  if (typeof item.subtotal === 'number' && item.subtotal) return item.subtotal
  return item.price * item.quantity
}

async function updateStatus(orderId: number, status: string) {
  try {
    const res = await auth.authFetch(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    if (res.ok) await fetchOrders()
  } catch (err) { console.error(err) }
}

async function updateFulfillment(orderId: number, fstatus: string) {
  try {
    const res = await auth.authFetch(`/api/orders/${orderId}/fulfillment`, { method: 'PATCH', body: JSON.stringify({ fulfillment_status: fstatus }) })
    if (res.ok) await fetchOrders()
  } catch (err) { console.error(err) }
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return 'Not Available' }
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
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Recipient</th>
              <th>Product Summary</th>
              <th>Delivery Date</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Grand Total</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in paginated" :key="o.id_order">
              <td>{{ o.order_number || ('#' + o.id_order) }}</td>
              <td>
                {{ o.user?.full_name || '-' }}<br>
                <small>{{ o.user?.email || '' }}</small><br>
                <small v-if="o.user?.phone">{{ o.user.phone }}</small>
              </td>
              <td>
                <template v-if="o.recipient_name || o.recipient_phone">
                  {{ o.recipient_name || 'Not Available' }}<br>
                  <small>{{ o.recipient_phone || '' }}</small>
                </template>
                <span v-else>Not Available</span>
              </td>
              <td>
                <div v-for="item in o.items || []" :key="item.id_order_item" style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <img :src="item.product?.images?.[0]?.image_url || ''" style="width:36px;height:36px;object-fit:cover;border-radius:4px;" />
                  <div>
                    <div>{{ item.product?.name }} <span style="color:#888;">x{{ item.quantity }}</span></div>
                    <small style="color:#888;">
                      <span v-if="item.size_name">{{ item.size_name }}{{ item.variant_name || item.options?.length ? ' · ' : '' }}</span>
                      <span v-if="item.variant_name">{{ item.variant_name }} · </span>
                      <span v-if="item.options?.length">{{ formatOptions(item) }} · </span>
                      <span v-if="item.greeting_card">Greeting: {{ item.greeting_card }}</span>
                    </small>
                  </div>
                </div>
              </td>
              <td>{{ o.delivery_date ? formatDate(o.delivery_date) : 'Not Available' }}<small v-if="o.delivery_time" style="display:block;color:#888;">{{ o.delivery_time }}</small></td>
              <td><span :class="'label label-' + (statusColors[o.payment_status || 'pending'] || 'default')">{{ statusLabels[o.payment_status || 'pending'] || na(o.payment_status) }}</span></td>
              <td><span :class="'label label-' + (statusColors[o.fulfillment_status || 'pending'] || 'default')">{{ (FULFILLMENT_LABELS[o.fulfillment_status || 'pending'] || na(o.fulfillment_status)) }}</span></td>
              <td><strong>{{ formatCurrency(o.total_price) }}</strong></td>
              <td>{{ new Date(o.date_created).toLocaleDateString() }}</td>
              <td style="white-space:nowrap;">
                <button class="btn btn-sm btn-info" @click="detail = o">View Detail</button>
                <select class="form-control" style="width:auto;display:inline-block;margin-top:4px;" :value="o.status" @change="updateStatus(o.id_order, ($event.target as HTMLSelectElement).value)">
                  <option v-for="s in availableStatuses" :key="s" :value="s">{{ statusLabels[s] || s }}</option>
                </select>
              </td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="10" style="text-align:center;">No orders found.</td></tr>
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

    <!-- Detail Modal -->
    <div v-if="detail" class="modal" style="display:block;" @click.self="detail = null">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header" style="align-items:center;">
            <h5 class="modal-title">Order Detail — {{ detail.order_number || ('#' + detail.id_order) }}</h5>
            <button type="button" class="close" @click="detail = null" style="background:none;border:none;font-size:1.5rem;line-height:1;">&times;</button>
          </div>
          <div class="modal-body">
            <!-- Customer -->
            <h6 class="detail-head">Customer Information</h6>
            <table class="table table-sm table-bordered">
              <tbody>
                <tr><th style="width:200px;">Customer Name</th><td>{{ detail.user?.full_name || 'Not Available' }}</td></tr>
                <tr><th>Email</th><td>{{ detail.user?.email || 'Not Available' }}</td></tr>
                <tr><th>Phone</th><td>{{ detail.user?.phone || 'Not Available' }}</td></tr>
              </tbody>
            </table>

            <!-- Recipient -->
            <h6 class="detail-head">Recipient Information</h6>
            <table class="table table-sm table-bordered">
              <tbody>
                <tr><th style="width:200px;">Recipient Name</th><td>{{ na(detail.recipient_name) }}</td></tr>
                <tr><th>Recipient Phone</th><td>{{ na(detail.recipient_phone) }}</td></tr>
              </tbody>
            </table>

            <!-- Delivery -->
            <h6 class="detail-head">Delivery Information</h6>
            <table class="table table-sm table-bordered">
              <tbody>
                <tr><th style="width:200px;">Full Address</th><td>{{ na(detail.delivery_address) }}</td></tr>
                <tr><th>City</th><td>{{ na(detail.delivery_city) }}</td></tr>
                <tr><th>Province</th><td>{{ na(detail.delivery_province) }}</td></tr>
                <tr><th>Postal Code</th><td>{{ na(detail.delivery_postal_code) }}</td></tr>
                <tr><th>Delivery Notes</th><td>{{ na(detail.delivery_notes) }}</td></tr>
                <tr><th>Preferred Delivery Date</th><td>{{ detail.delivery_date ? formatDate(detail.delivery_date) : 'Not Available' }}</td></tr>
                <tr><th>Preferred Delivery Time</th><td>{{ na(detail.delivery_time) }}</td></tr>
              </tbody>
            </table>

            <!-- Products -->
            <h6 class="detail-head">Product Information</h6>
            <table class="table table-sm table-bordered">
              <thead><tr><th>Image</th><th>Product</th><th>Variant</th><th>Size</th><th>Options</th><th>Greeting</th><th>Extras</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                <tr v-for="item in detail.items || []" :key="item.id_order_item">
                  <td><img :src="item.product?.images?.[0]?.image_url" style="width:48px;height:48px;object-fit:cover;border-radius:4px;" /></td>
                  <td>{{ item.product?.name || 'Not Available' }}</td>
                  <td>{{ na(item.variant_name) }}</td>
                  <td>{{ na(item.size_name) }}</td>
                  <td>{{ item.options?.length ? formatOptions(item) : 'Not Available' }}</td>
                  <td>
                    <div>{{ na(item.greeting_card) }}</div>
                    <div v-if="item.greeting_message" style="color:#888;font-style:italic;">"{{ item.greeting_message }}"</div>
                  </td>
                  <td>{{ item.extras?.length ? formatExtras(item) : 'Not Available' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(itemSubtotal(item)) }}</td>
                </tr>
              </tbody>
            </table>

            <div class="row" style="justify-content:flex-end;">
              <div class="col-md-4">
                <table class="table table-sm table-bordered">
                  <tbody>
                    <tr><th>Subtotal</th><td>{{ formatCurrency(detail.total_price - (detail.delivery_fee || 0) - (detail.service_fee || 0)) }}</td></tr>
                    <tr><th>Delivery Fee</th><td>{{ formatCurrency(detail.delivery_fee || 0) }}</td></tr>
                    <tr><th>Service Fee</th><td>{{ formatCurrency(detail.service_fee || 0) }}</td></tr>
                    <tr><th>Grand Total</th><td><strong>{{ formatCurrency(detail.total_price) }}</strong></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="row" style="margin-top:8px;">
              <div class="col-md-6">
                <label class="form-label">Fulfillment Status</label>
                <select class="form-select" :value="detail.fulfillment_status || 'pending'" @change="detail.fulfillment_status = ($event.target as HTMLSelectElement).value; updateFulfillment(detail.id_order, ($event.target as HTMLSelectElement).value)">
                  <option v-for="(label, key) in FULFILLMENT_LABELS" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.detail-head { margin-top: 16px; font-weight: 700; }
.modal { background: rgba(0,0,0,0.5); }
</style>