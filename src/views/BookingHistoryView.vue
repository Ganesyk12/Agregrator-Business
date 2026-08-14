<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const auth = useAuthStore()
const router = useRouter()
const bookings = ref<any[]>([])
const orders = ref<any[]>([])
const loading = ref(true)
const selectedBooking = ref<any>(null)
const companyInfo = ref<any>(null)
const showPrintPreview = ref(false)

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}
const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function invoiceNumber(p: any) {
  const d = p.paid_at || p.date_created
  const year = new Date(d).getFullYear()
  return `INV-${year}-${String(p.id_payment).padStart(4, '0')}`
}

function latestPayment(booking: any) {
  return booking.payments?.length ? booking.payments[0] : null
}

const historyList = computed(() => {
  const bList = bookings.value.map(b => ({
    ...b,
    isBooking: true,
    keyId: `booking-${b.id_booking}`,
    date: b.date_created,
    displayId: b.booking_number ? b.booking_number : `#${b.id_booking}`,
    typeLabel: 'Booking Jasa',
  }))
  
  const oList = orders.value
    .filter(o => !o.id_booking)
    .map(o => ({
      ...o,
      isBooking: false,
      keyId: `order-${o.id_order}`,
      date: o.date_created,
      displayId: `#${o.order_number || o.id_order}`,
      typeLabel: 'Order Produk',
    }))
    
  return [...bList, ...oList].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const services = computed<any[]>(() => {
  const b = selectedBooking.value
  if (!b) return []
  
  if (b.isBooking === false) {
    return b.items?.map((item: any) => ({
      name: `${item.product?.name} (Product x${item.quantity})`,
      price: item.price * item.quantity,
      description: [
        item.size_name ? `Size: ${item.size_name}` : null,
        item.options && item.options.length ? `Options: ${item.options.map((o: any) => `${o.groupName}: ${o.valueName}`).join(', ')}` : null,
        item.extras && item.extras.length ? `Extras: ${item.extras.map((e: any) => e.name).join(', ')}` : null,
        item.greeting_message ? `Card: "${item.greeting_message}"` : null
      ].filter(Boolean).join(' | ') || '-',
      duration: '-',
      vendorName: b.vendor?.business_name || '-',
    })) || []
  }

  const packageItems = b.booking_packages?.map((bp: any) => ({
    name: bp.package?.name,
    price: bp.package?.price,
    description: bp.package?.description,
    duration: bp.package?.duration,
    vendorName: bp.package?.vendor?.business_name || '-',
  })) || []

  const productItems: any[] = []
  if (b.orders && Array.isArray(b.orders)) {
    for (const order of b.orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          productItems.push({
            name: `${item.product?.name} (Product x${item.quantity})`,
            price: item.price * item.quantity,
            description: [
              item.size_name ? `Size: ${item.size_name}` : null,
              item.options && item.options.length ? `Options: ${item.options.map((o: any) => `${o.groupName}: ${o.valueName}`).join(', ')}` : null,
              item.extras && item.extras.length ? `Extras: ${item.extras.map((e: any) => e.name).join(', ')}` : null,
              item.greeting_message ? `Card: "${item.greeting_message}"` : null
            ].filter(Boolean).join(' | ') || '-',
            duration: '-',
            vendorName: order.vendor?.business_name || '-',
          })
        }
      }
    }
  }

  return [...packageItems, ...productItems]
})

function openDetail(b: any) {
  selectedBooking.value = b
}

function closeDetail() {
  selectedBooking.value = null
  showPrintPreview.value = false
}

function openPrintPreview(b: any) {
  selectedBooking.value = b
  showPrintPreview.value = true
}

function closePrintPreview() {
  showPrintPreview.value = false
  selectedBooking.value = null
}

function printInvoice() {
  window.print()
}

onMounted(async () => {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }
  try {
    const [bookRes, orderRes, companyRes] = await Promise.all([
      auth.authFetch('/api/bookings/user/me'),
      auth.authFetch('/api/orders'),
      fetch('/api/company-info'),
    ])
    const bookJson = await bookRes.json()
    if (bookRes.ok) bookings.value = bookJson.data || []
    const orderJson = await orderRes.json()
    if (orderRes.ok) orders.value = orderJson.data || []
    const companyJson = await companyRes.json()
    if (companyRes.ok) companyInfo.value = companyJson.data
  } catch { /* fallback */ } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <Navbar class="no-print" />
    <SearchPopup class="no-print" />
    <CartOffcanvas class="no-print" />

    <div class="container booking-history-page py-5">
      <h2 class="mb-4 fw-bold">Transaction History</h2>

      <div v-if="loading" class="text-center py-5">
        <p class="text-muted">Loading history...</p>
      </div>

      <div v-else-if="historyList.length === 0" class="text-center py-5">
        <p class="text-muted">No transactions found.</p>
        <a href="/services" class="btn btn-dark mt-2">Browse Services</a>
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Type</th>
              <th>Transaction #</th>
              <th>Status</th>
              <th>Date</th>
              <th>Total</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in historyList" :key="item.keyId">
              <td>
                <span class="badge" :class="item.isBooking ? 'bg-secondary' : 'bg-primary'">
                  {{ item.typeLabel }}
                </span>
              </td>
              <td class="fw-semibold">{{ item.displayId }}</td>
              <td>
                <span class="badge-status" :style="{ background: item.isBooking ? (statusColors[item.status] || '#999') : '#f59e0b' }">
                  {{ item.isBooking ? (statusLabels[item.status] || item.status) : item.status }}
                </span>
              </td>
              <td>
                {{ item.isBooking ? (item.event_date ? formatDate(item.event_date) : '-') : formatDate(item.date) }}
              </td>
              <td class="fw-semibold">{{ formatPrice(item.total_price) }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-dark me-1" @click="openDetail(item)">Detail</button>
                <button v-if="item.isBooking && latestPayment(item)" class="btn btn-sm btn-dark" @click="openPrintPreview(item)">Print Invoice</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Footer class="no-print" />

    <!-- Detail Modal -->
    <div v-if="selectedBooking && !showPrintPreview" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-detail">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold m-0">{{ selectedBooking.isBooking ? (selectedBooking.booking_number || ('Booking #' + selectedBooking.id_booking)) : ('Order #' + (selectedBooking.order_number || selectedBooking.id_order)) }}</h4>
          <button class="btn-close-modal" @click="closeDetail">&times;</button>
        </div>
        <div class="row g-3">
          <template v-if="selectedBooking.isBooking">
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Status</p>
              <span class="badge-status" :style="{ background: statusColors[selectedBooking.status] || '#999' }">{{ statusLabels[selectedBooking.status] || selectedBooking.status }}</span>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Total Price</p>
              <p class="fw-bold fs-5 m-0">{{ formatPrice(selectedBooking.total_price) }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Event Date</p>
              <p class="m-0">{{ selectedBooking.event_date ? formatDate(selectedBooking.event_date) : '-' }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Event Location</p>
              <p class="m-0">{{ selectedBooking.event_location || '-' }}</p>
            </div>
            <div v-if="selectedBooking.notes" class="col-12">
              <p class="mb-1 text-muted small">Notes</p>
              <p class="m-0">{{ selectedBooking.notes }}</p>
            </div>
            <div class="col-12">
              <p class="mb-1 text-muted small">Customer</p>
              <p class="m-0">{{ selectedBooking.customer?.full_name }} ({{ selectedBooking.customer?.email }})</p>
            </div>
            <div class="col-12">
              <p class="mb-1 text-muted small">Packages</p>
              <div v-for="bp in selectedBooking.booking_packages" :key="bp.id_booking_package" class="border rounded p-2 mb-2">
                <div class="d-flex justify-content-between">
                  <strong>{{ bp.package?.name }}</strong>
                  <span>{{ formatPrice(bp.package?.price) }}</span>
                </div>
                <small class="text-muted">{{ bp.package?.vendor?.business_name }} — {{ bp.package?.duration || '-' }}</small>
              </div>
            </div>
            <div v-if="selectedBooking.orders && selectedBooking.orders.length > 0" class="col-12">
              <p class="mb-1 text-muted small">Products (Bouquet / Flowers)</p>
              <div v-for="order in selectedBooking.orders" :key="order.id_order" class="mb-3">
                <div v-for="item in order.items" :key="item.id_order_item" class="border rounded p-2 mb-2">
                  <div class="d-flex justify-content-between">
                    <strong>{{ item.product?.name }} <span class="text-muted">x{{ item.quantity }}</span></strong>
                    <span>{{ formatPrice(item.price * item.quantity) }}</span>
                  </div>
                  <div class="d-flex justify-content-between text-muted small">
                    <span>{{ order.vendor?.business_name }}</span>
                    <span v-if="item.size_name">Size: {{ item.size_name }}</span>
                  </div>
                  <div v-if="item.options && Array.isArray(item.options) && item.options.length > 0" class="text-muted small mt-1">
                    <span v-for="opt in item.options" :key="opt.groupName" class="me-2">
                      • {{ opt.groupName }}: {{ opt.valueName }}
                    </span>
                  </div>
                  <div v-if="item.extras && Array.isArray(item.extras) && item.extras.length > 0" class="text-muted small mt-1">
                    <span v-for="ex in item.extras" :key="ex.id" class="me-2">
                      + {{ ex.name }} ({{ formatPrice(ex.price) }})
                    </span>
                  </div>
                  <div v-if="item.greeting_message" class="text-muted small mt-1 border-top pt-1">
                    <strong>Greeting Card [{{ item.greeting_card || 'Default' }}]:</strong> "{{ item.greeting_message }}"
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Status</p>
              <span class="badge-status bg-warning text-dark">{{ selectedBooking.status }}</span>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Total Price</p>
              <p class="fw-bold fs-5 m-0">{{ formatPrice(selectedBooking.total_price) }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Order Date</p>
              <p class="m-0">{{ formatDate(selectedBooking.date_created) }}</p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted small">Vendor</p>
              <p class="m-0">{{ selectedBooking.vendor?.business_name || '-' }}</p>
            </div>
            <div class="col-12" v-if="selectedBooking.delivery_info">
              <p class="mb-1 text-muted small">Delivery Info</p>
              <p class="m-0">{{ selectedBooking.delivery_info }}</p>
            </div>
            <div class="col-12" v-if="selectedBooking.notes">
              <p class="mb-1 text-muted small">Notes</p>
              <p class="m-0">{{ selectedBooking.notes }}</p>
            </div>
            <div class="col-12">
              <p class="mb-1 text-muted small">Items</p>
              <div v-for="item in selectedBooking.items" :key="item.id_order_item" class="border rounded p-2 mb-2">
                <div class="d-flex justify-content-between">
                  <strong>{{ item.product?.name }} <span class="text-muted">x{{ item.quantity }}</span></strong>
                  <span>{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
                <div class="text-muted small">
                  <span v-if="item.size_name" class="me-2">Size: {{ item.size_name }}</span>
                  <span v-if="item.variant_name" class="me-2">Variant: {{ item.variant_name }}</span>
                </div>
                <div v-if="item.options && Array.isArray(item.options) && item.options.length > 0" class="text-muted small mt-1">
                  <span v-for="opt in item.options" :key="opt.groupName" class="me-2">
                    • {{ opt.groupName }}: {{ opt.valueName }}
                  </span>
                </div>
                <div v-if="item.extras && Array.isArray(item.extras) && item.extras.length > 0" class="text-muted small mt-1">
                  <span v-for="ex in item.extras" :key="ex.id" class="me-2">
                    + {{ ex.name }} ({{ formatPrice(ex.price) }})
                  </span>
                </div>
                <div v-if="item.greeting_message" class="text-muted small mt-1 border-top pt-1">
                  <strong>Greeting Card [{{ item.greeting_card || 'Default' }}]:</strong> "{{ item.greeting_message }}"
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Print Preview Overlay (same style as dashboard) -->
    <div v-if="showPrintPreview && selectedBooking" class="print-preview-overlay" @click.self="closePrintPreview">
      <div class="print-preview-container">
        <div class="print-preview-toolbar no-print">
          <button class="btn btn-success" @click="printInvoice"><i class="fa fa-print"></i> Print</button>
          <button class="btn btn-default" @click="closePrintPreview"><i class="fa fa-times"></i> Close</button>
        </div>
        <div class="print-preview-page" id="print-area">
          <div class="print-header">
            <div class="print-header-left">
              <h2>{{ companyInfo?.company_name || 'Agregrator Business' }}</h2>
              <p>Platform Vendor Management</p>
            </div>
            <div class="print-header-right">
              <h1>{{ invoiceNumber(latestPayment(selectedBooking)) }}</h1>
              <p>Date: {{ formatDate(latestPayment(selectedBooking).paid_at || latestPayment(selectedBooking).date_created) }}</p>
            </div>
          </div>

          <hr class="print-divider">

          <div class="print-info-row">
            <div class="print-info-block">
              <strong>Bill To:</strong>
              <p>{{ selectedBooking.customer?.full_name || '-' }}<br>{{ selectedBooking.customer?.email || '-' }}</p>
            </div>
            <div class="print-info-block">
              <strong>From:</strong>
              <p>{{ companyInfo?.company_name || 'Agregrator Business' }}<br>{{ companyInfo?.email || '' }}<span v-if="companyInfo?.phone"><br>{{ companyInfo.phone }}</span></p>
            </div>
            <div class="print-info-block print-info-right">
              <p><strong>Status:</strong> {{ selectedBooking.status?.toUpperCase() }}</p>
              <p><strong>Payment Type:</strong> {{ latestPayment(selectedBooking)?.payment_type?.toUpperCase() || '-' }}</p>
              <p><strong>Event:</strong> {{ selectedBooking.event_date ? formatDate(selectedBooking.event_date) : '-' }}</p>
            </div>
          </div>

          <table class="print-table">
            <thead>
              <tr>
                <th style="width:5%">No</th>
                <th style="width:20%">Service</th>
                <th style="width:25%">Description</th>
                <th style="width:12%">Duration</th>
                <th style="width:18%">Vendor</th>
                <th style="width:20%">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(svc, i) in services" :key="i">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ svc.name }}</strong></td>
                <td>{{ svc.description || '-' }}</td>
                <td>{{ svc.duration || '-' }}</td>
                <td>{{ svc.vendorName }}</td>
                <td style="text-align:right;">{{ formatPrice(svc.price) }}</td>
              </tr>
            </tbody>
          </table>

          <p v-if="selectedBooking.event_location" class="print-location"><strong>Location:</strong> {{ selectedBooking.event_location }}</p>
          <p v-if="selectedBooking.notes" class="print-location"><strong>Notes:</strong> {{ selectedBooking.notes }}</p>

          <div class="print-totals-row">
            <div class="print-stamp-wrap">
              <div class="print-stamp">
                <svg viewBox="0 0 200 200" class="stamp-svg">
                  <defs>
                    <path id="stamp-arc" d="M 29 100 A 71 71 0 1 1 171 100" fill="none" />
                    <path id="stamp-arc-bottom" d="M 29 100 A 71 71 0 0 0 171 100" fill="none" />
                  </defs>
                  <circle cx="100" cy="100" r="88" fill="rgba(255,255,255,0.9)" stroke="#c0392b" stroke-width="2.5" />
                  <circle cx="100" cy="100" r="81" fill="none" stroke="#c0392b" stroke-width="1" />
                  <circle cx="100" cy="100" r="58" fill="none" stroke="#c0392b" stroke-width="1" stroke-dasharray="3,3" />
                  <text font-size="14" font-weight="900" fill="#c0392b" letter-spacing="2" text-anchor="middle">
                    <textPath href="#stamp-arc" startOffset="50%">{{ companyInfo?.company_name || 'Agregrator Business' }}</textPath>
                  </text>
                  <text x="100" y="90" font-size="22" font-weight="bold" fill="#c0392b" text-anchor="middle" letter-spacing="3">INVOICE</text>
                  <text x="100" y="112" font-size="10" font-weight="bold" fill="#c0392b" text-anchor="middle" letter-spacing="1.5">PAID</text>
                  <text font-size="14" font-weight="900" fill="#c0392b" letter-spacing="2" text-anchor="middle">
                    <textPath href="#stamp-arc-bottom" startOffset="50%">{{ latestPayment(selectedBooking).paid_at ? formatDate(latestPayment(selectedBooking).paid_at) : formatDate(latestPayment(selectedBooking).date_created) }}</textPath>
                  </text>
                  <line x1="31" y1="100" x2="169" y2="100" stroke="#c0392b" stroke-width="1" />
                </svg>
              </div>
            </div>
            <div class="print-totals">
              <table>
                <tbody>
                  <tr>
                    <th>Total Harga Paket:</th>
                    <td>{{ formatPrice(selectedBooking.total_price) }}</td>
                  </tr>
                  <tr>
                    <th>Dibayar:</th>
                    <td>{{ formatPrice(latestPayment(selectedBooking)?.amount || 0) }}</td>
                  </tr>
                  <tr>
                    <th>Sisa Pembayaran:</th>
                    <td>{{ formatPrice(selectedBooking.total_price - (latestPayment(selectedBooking)?.amount || 0)) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr class="print-divider">

          <div class="print-footer-text">
            <div class="print-footer-row">
              <div class="print-footer-left">
                <p v-if="companyInfo?.bank_name">
                  <strong>Informasi Rekening Bank:</strong><br>
                  {{ companyInfo.bank_name }} — {{ companyInfo.bank_account }}<br>
                  a.n. {{ companyInfo.bank_holder }}
                </p>
              </div>
              <div class="print-footer-right">
                <p v-if="companyInfo?.address">
                  <strong>{{ companyInfo.company_name }}</strong><br>
                  {{ companyInfo.address }}<br>
                  <template v-if="companyInfo.phone">Telp: {{ companyInfo.phone }}<br></template>
                  <template v-if="companyInfo.email">Email: {{ companyInfo.email }}</template>
                </p>
              </div>
            </div>
            <hr class="print-divider-light">
            <p class="print-thanks">Terima kasih telah menggunakan layanan kami!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-history-page {
  padding-top: 120px !important;
}
.badge-status {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  text-transform: capitalize;
}

/* Modal overlay for detail */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-detail {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.btn-close-modal {
  background: none;
  border: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #666;
}
.btn-close-modal:hover { color: #000; }

/* Print preview overlay (same as dashboard) */
.print-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 10000;
  overflow-y: auto;
  padding: 20px;
}
.print-preview-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}
.print-preview-toolbar {
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  border-radius: 8px 8px 0 0;
  display: flex;
  gap: 8px;
}
.print-preview-toolbar .btn { padding: 6px 16px; font-size: 13px; }

/* Print page styling */
.print-preview-page {
  padding: 40px 50px;
}
.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.print-header-left h2 { margin: 0; font-size: 22px; font-weight: 700; color: #222; }
.print-header-left p { margin: 2px 0 0; font-size: 12px; color: #888; }
.print-header-right { text-align: right; }
.print-header-right h1 { margin: 0; font-size: 20px; font-weight: 700; color: #c0392b; }
.print-header-right p { margin: 2px 0 0; font-size: 12px; color: #888; }
.print-divider { border: none; border-top: 2px solid #222; margin: 16px 0; }
.print-divider-light { border: none; border-top: 1px solid #ddd; margin: 12px 0; }

.print-info-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}
.print-info-block { flex: 1; font-size: 13px; line-height: 1.6; }
.print-info-block strong { display: block; margin-bottom: 4px; }
.print-info-block p { margin: 0; }
.print-info-right { text-align: right; }

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.print-table th, .print-table td {
  border: 1px solid #ddd;
  padding: 8px 10px;
  text-align: left;
  font-size: 13px;
}
.print-table th { background: #f5f5f5; font-weight: 600; }
.print-location { font-size: 13px; margin: 4px 0; }

.print-totals-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 16px;
}
.print-stamp-wrap { flex: 0 0 160px; }
.print-stamp { width: 140px; height: 140px; }
.stamp-svg { width: 100%; height: 100%; }
.print-totals { flex: 1; }
.print-totals table { width: 100%; border-collapse: collapse; }
.print-totals td, .print-totals th {
  border: none;
  padding: 4px 8px;
  font-size: 14px;
  text-align: right;
}
.print-totals th { font-weight: 600; text-align: left; }

.print-footer-text { font-size: 12px; color: #555; }
.print-footer-row { display: flex; justify-content: space-between; gap: 30px; }
.print-footer-left, .print-footer-right { flex: 1; }
.print-footer-left p, .print-footer-right p { margin: 0; line-height: 1.5; }
.print-thanks { text-align: center; margin: 16px 0 0; font-size: 14px; font-weight: 600; color: #222; }

/* Print media query */
@media print {
  body * { visibility: hidden; }
  .print-preview-page, .print-preview-page * { visibility: visible; }
  .print-preview-page { position: fixed; left: 0; top: 0; width: 100%; padding: 30px 40px; background: #fff; }
  #print-area, #print-area * { visibility: visible !important; }
  #print-area {
    position: fixed !important;
    inset: 0;
    width: 100%;
    padding: 30px 40px;
    background: #fff;
    z-index: 99999;
  }

  /* Hide overlay chrome */
  .print-preview-overlay {
    background: none !important;
    padding: 0 !important;
    position: static !important;
  }
  .print-preview-container {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: none !important;
  }
  .print-preview-toolbar {
    display: none !important;
  }
}
</style>

<!-- Global print styles: non-scoped agar Navbar/Footer bisa di-hide saat print -->
<style>
@media print {
  /* Sembunyikan semua elemen app */
  body * { visibility: hidden !important; }

  /* Tampilkan hanya konten invoice */
  #print-area,
  #print-area * { visibility: visible !important; }

  #print-area {
    position: fixed !important;
    inset: 0;
    width: 100%;
    padding: 30px 40px;
    background: #fff !important;
    z-index: 99999;
  }

  /* Sembunyikan chrome overlay */
  .print-preview-overlay {
    background: none !important;
    padding: 0 !important;
  }
  .print-preview-container {
    box-shadow: none !important;
    border-radius: 0 !important;
  }
  .print-preview-toolbar,
  .no-print,
  nav, header, footer {
    display: none !important;
    visibility: hidden !important;
  }
}
</style>