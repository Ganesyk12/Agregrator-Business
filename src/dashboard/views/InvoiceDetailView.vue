<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const payment = ref<any>(null)
const companyInfo = ref<any>(null)
const loading = ref(true)
const showPrintPreview = ref(false)

async function fetchPayment() {
  try {
    const id = route.params.paymentId
    const res = await fetch(`${apiUrl}/api/payments/${id}`)
    if (!res.ok) throw new Error('Payment not found')
    const json = await res.json()
    payment.value = json.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchCompanyInfo() {
  try {
    const res = await fetch(`${apiUrl}/api/company-info`)
    const json = await res.json()
    companyInfo.value = json.data
  } catch { /* ignore */ }
}

onMounted(() => {
  fetchPayment()
  fetchCompanyInfo()
})

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function invoiceNumber(p: any) {
  const d = p.paid_at || p.date_created
  const year = new Date(d).getFullYear()
  return `INV-${year}-${String(p.id_payment).padStart(4, '0')}`
}

interface ServiceItem {
  name: string
  price: number
  description: string | null
  duration: string | null
  vendorName: string
}

const services = computed<ServiceItem[]>(() => {
  const p = payment.value
  if (!p) return []
  return p.booking?.booking_packages?.map((bp: any) => ({
    name: bp.package.name,
    price: bp.package.price,
    description: bp.package.description,
    duration: bp.package.duration,
    vendorName: bp.package.vendor?.business_name || '-',
  })) || []
})

function goBack() {
  router.push('/payments')
}

function openPrintPreview() {
  showPrintPreview.value = true
}

function closePrintPreview() {
  showPrintPreview.value = false
}

function printInvoice() {
  window.print()
}
</script>

<template>
  <div class="row">
    <div class="col-md-12" v-if="loading">
      <div class="x_panel"><div class="x_content"><p style="text-align:center;padding:40px;">Loading invoice...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!payment">
      <div class="x_panel">
        <div class="x_content">
          <p style="text-align:center;padding:40px;">Invoice not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to Payments</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="x_panel">
        <div class="x_title">
          <h2>Invoice <small>Kwitansi Pembayaran</small></h2>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <!-- Action Buttons — outside invoice area -->
          <div class="row no-print" style="margin-bottom:15px;">
            <div class="col-xs-12">
              <button class="btn btn-default" @click="goBack"><i class="fa fa-arrow-left"></i> Back</button>
              <button class="btn btn-primary pull-right" @click="openPrintPreview"><i class="fa fa-print"></i> Print Preview</button>
            </div>
          </div>

          <!-- Invoice Content -->
          <section class="content invoice">
            <!-- title row -->
            <div class="row">
              <div class="col-xs-12 invoice-header">
                <h1>
                  <i class="fa fa-file-text-o"></i> {{ invoiceNumber(payment) }}
                </h1>
                <p class="invoice-date">{{ formatDate(payment.paid_at || payment.date_created) }}</p>
              </div>
            </div>

            <!-- info row -->
            <div class="row invoice-info">
              <div class="col-sm-4 invoice-col">
                <strong>{{ companyInfo?.company_name || 'Agregrator Business' }}</strong>
                <address>
                  {{ companyInfo?.address || 'Platform Vendor Management' }}<br>
                  <template v-if="companyInfo?.email">Email: {{ companyInfo.email }}<br></template>
                  <template v-if="companyInfo?.phone">Phone: {{ companyInfo.phone }}<br></template>
                  <template v-if="!companyInfo?.email && !companyInfo?.phone">Platform Vendor Management</template>
                </address>
              </div>
              <div class="col-sm-4 invoice-col">
                <strong>Customer</strong>
                <address>
                  <strong>{{ payment.booking?.customer?.full_name || '-' }}</strong><br>
                  Email: {{ payment.booking?.customer?.email || '-' }}<br>
                  <template v-if="payment.booking?.customer?.phone">Phone: {{ payment.booking?.customer?.phone }}</template>
                </address>
              </div>
              <div class="col-sm-4 invoice-col">
                <b>Invoice #{{ invoiceNumber(payment) }}</b><br>
                <b>Payment Type:</b> {{ payment.payment_type?.toUpperCase() || '-' }}<br>
                <b>Status:</b> <span :class="'label ' + (payment.status==='paid'||payment.status==='released'?'label-success':'label-warning')" style="text-transform:uppercase;">{{ payment.status }}</span><br>
                <b>Booking ID:</b> #{{ payment.id_booking }}<br>
                <b>Event:</b> {{ payment.booking?.event_date ? formatDate(payment.booking.event_date) : '-' }}
              </div>
            </div>

            <!-- Table row -->
            <div class="row">
              <div class="col-xs-12 table">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th style="width:5%">No</th>
                      <th style="width:18%">Service</th>
                      <th style="width:18%">Vendor</th>
                      <th style="width:30%">Description</th>
                      <th style="width:12%">Duration</th>
                      <th style="width:17%">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(svc, i) in services" :key="i">
                      <td>{{ i + 1 }}</td>
                      <td><strong>{{ svc.name }}</strong></td>
                      <td>{{ svc.vendorName }}</td>
                      <td>{{ svc.description || '-' }}</td>
                      <td>{{ svc.duration || '-' }}</td>
                      <td>{{ formatCurrency(svc.price) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Event info summary -->
            <p v-if="payment.booking?.event_location" style="margin: 0 0 4px;">
              <strong>Location:</strong> {{ payment.booking.event_location }}
            </p>
            <p v-if="payment.booking?.notes" style="margin: 0 0 4px;">
              <strong>Catatan Booking:</strong> {{ payment.booking.notes }}
            </p>

            <!-- Payment summary -->
            <div class="row">
              <div class="col-xs-6">
                <p class="lead">Info Pembayaran</p>
                <p class="text-muted well well-sm no-shadow" style="margin-top:10px;">
                  <template v-if="companyInfo?.bank_name">
                    <strong>Transfer Bank:</strong><br>
                    {{ companyInfo.bank_name }} — {{ companyInfo.bank_account }}<br>
                    a.n. {{ companyInfo.bank_holder }}<br><br>
                  </template>
                  Invoice ini merupakan bukti pembayaran <strong>{{ payment.payment_type === 'dp' ? 'Uang Muka (DP)' : payment.payment_type === 'full' ? 'Pelunasan' : 'Cicilan' }}</strong> untuk layanan yang dipesan.<br><br>
                  Untuk informasi lebih lanjut mengenai layanan, silakan hubungi tim Customer Service kami melalui nomor telepon atau email yang tercantum di atas.
                </p>
              </div>
              <div class="col-xs-6">
                <p class="lead">Amount</p>
                <div class="table-responsive">
                  <table class="table">
                    <tbody>
                      <tr>
                        <th style="width:50%">Total Harga Paket:</th>
                        <td>{{ formatCurrency(payment.booking?.total_price || 0) }}</td>
                      </tr>
                      <tr v-if="payment.payment_type === 'dp'">
                        <th>DP Dibayar:</th>
                        <td>{{ formatCurrency(payment.amount) }}</td>
                      </tr>
                      <tr v-if="payment.payment_type === 'dp'">
                        <th>Sisa Pembayaran:</th>
                        <td>{{ formatCurrency((payment.booking?.total_price || 0) - payment.amount) }}</td>
                      </tr>
                      <tr v-else>
                        <th>Jumlah Dibayar:</th>
                        <td>{{ formatCurrency(payment.amount) }}</td>
                      </tr>
                      <tr>
                        <th>Status Pembayaran:</th>
                        <td><span :class="'label ' + (payment.status==='paid'||payment.status==='released'?'label-success':'label-warning')" style="text-transform:uppercase;">{{ payment.status === 'paid' || payment.status === 'released' ? 'DIBAYARKAN' : payment.status }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <!-- Print Preview Overlay -->
  <div v-if="showPrintPreview" class="print-preview-overlay" @click.self="closePrintPreview">
    <div class="print-preview-container">
      <div class="print-preview-toolbar no-print">
        <button class="btn btn-success" @click="printInvoice"><i class="fa fa-print"></i> Print</button>
        <button class="btn btn-default" @click="closePrintPreview"><i class="fa fa-times"></i> Close</button>
      </div>
      <div class="print-preview-page" id="print-area">
        <!-- Company letterhead -->
        <div class="print-header">
          <div class="print-header-left">
            <h2>Agregrator Business</h2>
            <p>Platform Vendor Management</p>
          </div>
          <div class="print-header-right">
            <h1>{{ invoiceNumber(payment) }}</h1>
            <p>Date: {{ formatDate(payment.paid_at || payment.date_created) }}</p>
          </div>
        </div>

        <hr class="print-divider">

        <!-- Bill to / Invoice info -->
        <div class="print-info-row">
          <div class="print-info-block">
            <strong>Bill To:</strong>
            <p>{{ payment.booking?.customer?.full_name || '-' }}<br>
            {{ payment.booking?.customer?.email || '-' }}<br>
            <span v-if="payment.booking?.customer?.phone">{{ payment.booking?.customer?.phone }}</span></p>
          </div>
          <div class="print-info-block">
            <strong>From:</strong>
            <p>{{ companyInfo?.company_name || 'Agregrator Business' }}<br>
            {{ companyInfo?.email || '' }}<br>
            <span v-if="companyInfo?.phone">{{ companyInfo.phone }}</span></p>
          </div>
          <div class="print-info-block print-info-right">
            <p><strong>Payment Type:</strong> {{ payment.payment_type?.toUpperCase() || '-' }}</p>
            <p><strong>Status:</strong> {{ payment.status === 'paid' || payment.status === 'released' ? 'DIBAYARKAN' : payment.status?.toUpperCase() }}</p>
            <p><strong>Event:</strong> {{ payment.booking?.event_date ? formatDate(payment.booking.event_date) : '-' }}</p>
          </div>
        </div>

        <!-- Services table -->
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
              <td style="text-align:right;">{{ formatCurrency(svc.price) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="payment.booking?.event_location" class="print-location">
          <strong>Location:</strong> {{ payment.booking.event_location }}
        </p>

        <p v-if="payment.booking?.notes" class="print-location">
          <strong>Catatan Booking:</strong> {{ payment.booking.notes }}
        </p>

        <!-- Totals + Stamp -->
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
                  <textPath href="#stamp-arc" startOffset="50%">
                    {{ (companyInfo?.company_name || 'Agregrator Business') }}
                  </textPath>
                </text>
                <text x="100" y="90" font-size="22" font-weight="bold" fill="#c0392b" text-anchor="middle" letter-spacing="3">
                  {{ payment.payment_type === 'dp' ? 'DP' : payment.payment_type === 'full' ? 'DIBAYARKAN' : 'CICILAN' }}
                </text>
                <text x="100" y="112" font-size="10" font-weight="bold" fill="#c0392b" text-anchor="middle" letter-spacing="1.5">
                  {{ payment.status === 'released' ? 'RELEASED' : payment.status === 'paid' ? 'PAID' : '' }}
                </text>
                <text font-size="14" font-weight="900" fill="#c0392b" letter-spacing="2" text-anchor="middle">
                  <textPath href="#stamp-arc-bottom" startOffset="50%">
                    {{ payment.paid_at ? formatDate(payment.paid_at) : payment.date_created ? formatDate(payment.date_created) : '' }}
                  </textPath>
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
                  <td>{{ formatCurrency(payment.booking?.total_price || 0) }}</td>
                </tr>
                <tr v-if="payment.payment_type === 'dp'">
                  <th>DP Dibayar:</th>
                  <td>{{ formatCurrency(payment.amount) }}</td>
                </tr>
                <tr v-if="payment.payment_type === 'dp'">
                  <th>Sisa Pembayaran:</th>
                  <td>{{ formatCurrency((payment.booking?.total_price || 0) - payment.amount) }}</td>
                </tr>
                <tr v-else>
                  <th>Jumlah Dibayar:</th>
                  <td>{{ formatCurrency(payment.amount) }}</td>
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
          <p>
            Invoice ini merupakan bukti pembayaran <strong>{{ payment.payment_type === 'dp' ? 'Uang Muka (DP)' : payment.payment_type === 'full' ? 'Pelunasan' : 'Cicilan' }}</strong>
            untuk layanan yang dipesan.
          </p>
          <p style="font-size:11px;margin-top:6px;">
            Untuk informasi lebih lanjut mengenai layanan, silakan hubungi tim Customer Service kami melalui nomor telepon atau email yang tercantum di atas.
          </p>
          <p class="print-thanks">{{ companyInfo?.footer_text || 'Terima kasih telah menggunakan layanan kami.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Invoice view styles ─── */
.invoice-header h1 {
  font-size: 26px;
  margin: 0 0 2px;
}

.invoice-header .invoice-date {
  font-size: 13px;
  color: #888;
  margin: 0 0 15px;
}

.invoice-info address {
  margin-bottom: 0;
}

/* ─── Print preview overlay ─── */
.print-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  overflow-y: auto;
  padding: 30px 20px;
}

.print-preview-container {
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.print-preview-toolbar {
  padding: 12px 20px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  text-align: right;
}

.print-preview-toolbar .btn {
  margin-left: 8px;
}

.print-preview-page {
  padding: 30px 35px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

/* ─── Print preview interior styles ─── */
.print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.print-header-left h2 {
  margin: 0;
  font-size: 22px;
  color: #2c3e50;
}

.print-header-left p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #888;
}

.print-header-right {
  text-align: right;
}

.print-header-right h1 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.print-header-right p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #888;
}

.print-divider {
  border: none;
  border-top: 2px solid #2c3e50;
  margin: 12px 0;
}

.print-info-row {
  display: flex;
  gap: 30px;
  margin-bottom: 18px;
}

.print-info-block {
  flex: 1;
}

.print-info-block:first-child {
  flex: 2;
}

.print-info-block:nth-child(2) {
  flex: 1.5;
}

.print-info-block strong {
  font-size: 12px;
  color: #555;
  text-transform: uppercase;
}

.print-info-block p {
  margin: 4px 0;
  font-size: 13px;
}

.print-info-right p {
  margin: 0;
  line-height: 1.8;
  font-size: 12px;
}

.print-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.print-table th {
  background: #2c3e50;
  color: #fff;
  padding: 8px 10px;
  font-size: 12px;
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.print-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.print-table tbody tr:nth-child(even) {
  background: #f9f9f9;
}

.print-location {
  margin: 6px 0 14px;
  font-size: 12px;
  color: #555;
}

.print-totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.print-totals {
  display: flex;
  justify-content: flex-end;
}

.print-totals table {
  width: 320px;
}

.print-totals th,
.print-totals td {
  padding: 5px 10px;
  font-size: 13px;
}

.print-totals td {
  text-align: right;
}

.print-totals tr:last-child th,
.print-totals tr:last-child td {
  font-weight: bold;
  border-top: 2px solid #333;
}

.print-footer-text {
  font-size: 12px;
  color: #555;
}

.print-footer-row {
  display: flex;
  gap: 30px;
  margin-bottom: 8px;
}

.print-footer-left,
.print-footer-right {
  flex: 1;
}

.print-footer-left p,
.print-footer-right p {
  margin: 0;
  line-height: 1.6;
}

.print-divider-light {
  border: none;
  border-top: 1px solid #ccc;
  margin: 8px 0;
}

.print-thanks {
  margin-top: 12px;
  font-style: italic;
  color: #888;
  text-align: center;
}

.print-stamp-wrap {
  display: flex;
  justify-content: flex-start;
}

.print-stamp {
  width: 145px;
  height: 145px;
  transform: rotate(-6deg);
}

.stamp-svg {
  width: 100%;
  height: 100%;
}

</style>

<style>
/* ─── Print media (global — not scoped) ─── */
@page {
  size: A4;
  margin: 0;
}

@media print {
  html, body {
    height: 100%;
    overflow: hidden;
  }

  body * {
    visibility: hidden;
  }
  #print-area,
  #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  .no-print {
    display: none !important;
  }

  .print-preview-overlay {
    position: static !important;
    background: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .print-preview-container {
    max-width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .print-preview-page {
    padding: 10mm 15mm !important;
  }

  .print-table {
    page-break-inside: avoid;
  }

  .print-totals {
    page-break-inside: avoid;
  }

  .print-footer-text {
    page-break-inside: avoid;
  }

  .print-divider {
    border-top-color: #000 !important;
  }

  .print-table th {
    background: #333 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-table tbody tr:nth-child(even) {
    background: #f5f5f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-header-left h2,
  .print-header-right h1 {
    color: #000 !important;
  }

  .print-stamp {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
