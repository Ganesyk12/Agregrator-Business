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

    <!-- Detail Modal Redesigned with Teleport -->
    <Teleport to="body">
      <div v-if="detail" class="order-detail-modal-overlay" @click.self="detail = null">
        <div class="order-detail-modal-container">
          <!-- Header -->
          <div class="order-detail-modal-header">
            <div class="header-title-section">
              <span class="order-number-tag">{{ detail.order_number || ('#' + detail.id_order) }}</span>
              <h5 class="m-0 font-weight-bold" style="color: #3f4d67;">Order Details</h5>
            </div>
            <button type="button" class="order-detail-modal-close-btn" @click="detail = null">&times;</button>
          </div>

          <!-- Body -->
          <div class="order-detail-modal-body">
            
            <!-- Section 1: Customer, Recipient, and Delivery Grid -->
            <div class="row g-3 m-b-20">
              <!-- Customer Info -->
              <div class="col-md-4">
                <div class="card h-100 border shadow-sm mb-0">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-user text-c-blue m-r-10"></i>Customer Information</h6>
                  </div>
                  <div class="card-body p-3">
                    <div class="info-item mb-2">
                      <small class="text-muted d-block">Name</small>
                      <span class="font-weight-bold">{{ detail.user?.full_name || 'Not Available' }}</span>
                    </div>
                    <div class="info-item mb-2">
                      <small class="text-muted d-block">Email</small>
                      <span>{{ detail.user?.email || 'Not Available' }}</span>
                    </div>
                    <div class="info-item">
                      <small class="text-muted d-block">Phone</small>
                      <span>{{ detail.user?.phone || 'Not Available' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recipient Info -->
              <div class="col-md-4">
                <div class="card h-100 border shadow-sm mb-0">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-heart text-c-red m-r-10"></i>Recipient Information</h6>
                  </div>
                  <div class="card-body p-3">
                    <div class="info-item mb-2">
                      <small class="text-muted d-block">Recipient Name</small>
                      <span class="font-weight-bold">{{ na(detail.recipient_name) }}</span>
                    </div>
                    <div class="info-item">
                      <small class="text-muted d-block">Recipient Phone</small>
                      <span>{{ na(detail.recipient_phone) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Delivery Schedule -->
              <div class="col-md-4">
                <div class="card h-100 border shadow-sm mb-0">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-truck text-c-green m-r-10"></i>Delivery Schedule</h6>
                  </div>
                  <div class="card-body p-3">
                    <div class="info-item mb-2">
                      <small class="text-muted d-block">Preferred Delivery Date</small>
                      <span class="font-weight-bold">{{ detail.delivery_date ? formatDate(detail.delivery_date) : 'Not Available' }}</span>
                    </div>
                    <div class="info-item mb-2">
                      <small class="text-muted d-block">Preferred Delivery Time</small>
                      <span>{{ na(detail.delivery_time) }}</span>
                    </div>
                    <div class="info-item">
                      <small class="text-muted d-block">Delivery Notes</small>
                      <span class="text-muted" style="font-size: 13px;">{{ na(detail.delivery_notes) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Full Address Card -->
            <div class="card border shadow-sm m-b-20">
              <div class="card-header bg-light py-2 px-3">
                <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-map-marker text-c-yellow m-r-10"></i>Delivery Address</h6>
              </div>
              <div class="card-body p-3">
                <p class="mb-2"><strong>Address:</strong> {{ na(detail.delivery_address) }}</p>
                <div class="row g-2" style="font-size: 13px;">
                  <div class="col-sm-4"><strong>City:</strong> {{ na(detail.delivery_city) }}</div>
                  <div class="col-sm-4"><strong>Province:</strong> {{ na(detail.delivery_province) }}</div>
                  <div class="col-sm-4"><strong>Postal Code:</strong> {{ na(detail.delivery_postal_code) }}</div>
                </div>
              </div>
            </div>

            <!-- Section 3: Product Information (Modern list instead of squished table) -->
            <div class="card border shadow-sm m-b-20">
              <div class="card-header bg-light py-2 px-3">
                <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-shopping-bag text-c-blue m-r-10"></i>Product Items</h6>
              </div>
              <div class="card-body p-0">
                <div class="order-items-list">
                  <div v-for="item in detail.items || []" :key="item.id_order_item" class="order-item-row p-3 border-bottom d-flex align-items-start justify-content-between gap-3 flex-wrap flex-sm-nowrap">
                    <div class="d-flex align-items-start gap-3">
                      <div class="item-img-container">
                        <img :src="item.product?.images?.[0]?.image_url || ''" class="item-img" />
                      </div>
                      <div class="item-details">
                        <h6 class="mb-1 font-weight-bold" style="color: #3f4d67; font-size: 14px;">{{ item.product?.name || 'Not Available' }}</h6>
                        
                        <!-- Product Meta Badges -->
                        <div class="d-flex flex-wrap gap-1 mb-2">
                          <span v-if="item.variant_name" class="badge bg-light text-dark border">Variant: {{ item.variant_name }}</span>
                          <span v-if="item.size_name" class="badge bg-light text-dark border">Size: {{ item.size_name }}</span>
                          <span v-if="item.options?.length" v-for="opt in item.options" :key="opt.valueName" class="badge bg-light text-dark border">{{ opt.groupName }}: {{ opt.valueName }}</span>
                        </div>

                        <!-- Extras -->
                        <div v-if="item.extras?.length" class="mb-2" style="font-size: 12px;">
                          <span class="text-muted mr-1">Extras:</span>
                          <span v-for="ex in item.extras" :key="ex.name" class="badge bg-soft-info text-info border border-info border-opacity-25 mr-1" style="font-size: 11px;">{{ ex.name }}</span>
                        </div>

                        <!-- Greeting Card -->
                        <div v-if="item.greeting_card || item.greeting_message" class="greeting-card-box p-2 bg-light border rounded mt-2">
                          <div style="font-size: 12px; font-weight: 600;"><i class="fa fa-envelope-o text-c-blue mr-1"></i> Greeting Card ({{ item.greeting_card || 'Standard' }})</div>
                          <p v-if="item.greeting_message" class="mb-0 text-muted italic" style="font-size: 12px;">"{{ item.greeting_message }}"</p>
                        </div>
                      </div>
                    </div>

                    <!-- Price / Qty Column -->
                    <div class="text-end text-sm-end ms-auto ms-sm-0" style="min-width: 140px;">
                      <div class="item-price">{{ formatCurrency(item.price) }} <span class="text-muted" style="font-size: 12px;">x{{ item.quantity }}</span></div>
                      <div class="item-subtotal font-weight-bold text-c-blue mt-1" style="font-size: 14px;">{{ formatCurrency(itemSubtotal(item)) }}</div>
                    </div>
                  </div>
                  <div v-if="!detail.items || detail.items.length === 0" class="p-4 text-center text-muted">
                    No items in this order.
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 4: General Notes (if any) -->
            <div v-if="detail.notes" class="card border border-warning bg-soft-warning m-b-20">
              <div class="card-body p-3">
                <h6 class="m-0 font-weight-bold text-warning mb-1"><i class="fa fa-sticky-note-o m-r-10"></i>Order Notes</h6>
                <p class="mb-0" style="font-size: 13px; line-height: 1.5; color: #666;">{{ detail.notes }}</p>
              </div>
            </div>

            <!-- Section 5: Pricing Breakdown & Fulfillment controls -->
            <div class="row align-items-end g-3">
              <!-- Fulfillment controls -->
              <div class="col-md-7">
                <div class="card border shadow-sm mb-0">
                  <div class="card-body p-3">
                    <label class="form-label font-weight-bold text-muted" style="display:block; margin-bottom:8px;"><i class="fa fa-tasks text-c-green m-r-10"></i>Fulfillment Status</label>
                    <select class="form-select border" :value="detail.fulfillment_status || 'pending'" @change="detail.fulfillment_status = ($event.target as HTMLSelectElement).value; updateFulfillment(detail.id_order, ($event.target as HTMLSelectElement).value)">
                      <option v-for="(label, key) in FULFILLMENT_LABELS" :key="key" :value="key">{{ label }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Pricing Table -->
              <div class="col-md-5">
                <div class="card border shadow-sm mb-0 bg-light">
                  <div class="card-body p-3" style="font-size: 13px;">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Subtotal</span>
                      <span>{{ formatCurrency(detail.total_price - (detail.delivery_fee || 0) - (detail.service_fee || 0)) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Delivery Fee</span>
                      <span>{{ formatCurrency(detail.delivery_fee || 0) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted">Service Fee</span>
                      <span>{{ formatCurrency(detail.service_fee || 0) }}</span>
                    </div>
                    <hr class="my-2 border-secondary border-opacity-25" style="border: 0; border-top: 1px solid #dee2e6; margin: 8px 0;">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="font-weight-bold" style="color: #3f4d67; font-size: 14px;">Grand Total</span>
                      <span class="font-weight-bold text-c-blue" style="font-size: 18px;">{{ formatCurrency(detail.total_price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style>
.detail-head { margin-top: 16px; font-weight: 700; }

.order-detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1060;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.order-detail-modal-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalEnter 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.order-detail-modal-header {
  padding: 14px 20px;
  border-bottom: 1px solid #eef2f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
}

.header-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-number-tag {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 700;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
}

.order-detail-modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.order-detail-modal-close-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.order-detail-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.order-items-list {
  background: #fff;
}

.order-item-row:last-child {
  border-bottom: none !important;
}

.item-img-container {
  width: 64px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.greeting-card-box {
  border-left: 3px solid #0ea5e9 !important;
}

/* Color palettes & helper extensions */
.bg-soft-warning {
  background-color: #fffbeb !important;
}
.bg-soft-info {
  background-color: #f0f9ff !important;
}
.bg-soft-success {
  background-color: #f0fdf4 !important;
}

.mr-1 {
  margin-right: 4px;
}

.m-r-10 {
  margin-right: 10px;
}

.m-b-20 {
  margin-bottom: 20px;
}

.italic {
  font-style: italic;
}
</style>