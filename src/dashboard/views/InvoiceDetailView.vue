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
      <div class="card"><div class="card-body"><p style="text-align:center;padding:40px;">Loading invoice...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!payment">
      <div class="card">
        <div class="card-body">
          <p style="text-align:center;padding:40px;">Invoice not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to Payments</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="card">
        <div class="card-header">
          <h5>Invoice <small>Kwitansi Pembayaran</small></h5>
          
        </div>
        <div class="card-body">
          <!-- Invoice Content -->
          <section class="content invoice">
            <!-- title row -->
            <div class="row align-items-center m-b-20">
              <div class="col-sm-6 text-start text-sm-left">
                <h2 class="m-0" style="color: #3f4d67; font-weight: bold;">
                  <i class="fa fa-file-text-o text-c-blue"></i> Kwitansi Pembayaran
                </h2>
              </div>
              <div class="col-sm-6 text-end text-sm-right text-right">
                <h3 class="m-0 text-c-blue" style="font-weight: bold;">{{ invoiceNumber(payment) }}</h3>
                <p class="invoice-date m-0 m-t-5">{{ formatDate(payment.paid_at || payment.date_created) }}</p>
              </div>
            </div>

            <!-- info row -->
            <div class="row invoice-info m-b-20">
              <!-- Company/Issuer Info -->
              <div class="col-sm-4 m-b-20">
                <div class="card h-100 mb-0 shadow-sm border">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-building text-c-blue"></i> Pengirim (Issuer)</h6>
                  </div>
                  <div class="card-body p-3">
                    <strong>{{ companyInfo?.company_name || 'Agregrator Business' }}</strong>
                    <address class="m-t-10 m-b-0" style="font-size: 13px; line-height: 1.6;">
                      {{ companyInfo?.address || 'Platform Vendor Management' }}<br>
                      <template v-if="companyInfo?.email">Email: {{ companyInfo.email }}<br></template>
                      <template v-if="companyInfo?.phone">Phone: {{ companyInfo.phone }}<br></template>
                    </address>
                  </div>
                </div>
              </div>

              <!-- Customer Info -->
              <div class="col-sm-4 m-b-20">
                <div class="card h-100 mb-0 shadow-sm border">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-user text-c-green"></i> Pelanggan (Customer)</h6>
                  </div>
                  <div class="card-body p-3">
                    <strong>{{ payment.booking?.customer?.full_name || '-' }}</strong>
                    <address class="m-t-10 m-b-0" style="font-size: 13px; line-height: 1.6;">
                      Email: {{ payment.booking?.customer?.email || '-' }}<br>
                      <template v-if="payment.booking?.customer?.phone">Phone: {{ payment.booking?.customer?.phone }}</template>
                    </address>
                  </div>
                </div>
              </div>

              <!-- Invoice Metadata -->
              <div class="col-sm-4 m-b-20">
                <div class="card h-100 mb-0 shadow-sm border">
                  <div class="card-header bg-light py-2 px-3">
                    <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-file-text-o text-c-yellow"></i> Rincian Invoice</h6>
                  </div>
                  <div class="card-body p-3">
                    <dl class="row m-b-0" style="font-size: 13px; line-height: 1.6;">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Invoice No</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ invoiceNumber(payment) }}</dd>

                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Payment Type</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ payment.payment_type?.toUpperCase() || '-' }}</dd>

                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Status</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">
                        <span :class="'label ' + (payment.status==='paid'||payment.status==='released'?'label-success':'label-warning')" style="text-transform:uppercase; font-size: 10px; padding: 2px 6px;">{{ payment.status }}</span>
                      </dd>

                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Booking ID</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">#{{ payment.id_booking }}</dd>

                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Event Date</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ payment.booking?.event_date ? formatDate(payment.booking.event_date) : '-' }}</dd>

                      <template v-if="payment.payment_term">
                        <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Payment Term</dt>
                        <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ payment.payment_term.term_name }}</dd>
                      </template>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table row -->
            <div class="row">
              <div class="col-12">
                <div class="table-responsive">
                <table class="table table-striped table-bordered w-100">
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
              <div class="col-sm-6 col-xs-12">
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
              <div class="col-sm-6 col-xs-12">
                <p class="lead">Amount</p>
                <div class="table-responsive">
                  <table class="table">
                    <tbody>
                      <tr>
                        <th style="width:50%" class="text-start">Total Harga Paket:</th>
                        <td class="text-end font-weight-bold text-c-blue">{{ formatCurrency(payment.booking?.total_price || 0) }}</td>
                      </tr>
                      <tr v-if="payment.payment_type === 'dp'">
                        <th class="text-start">DP Dibayar:</th>
                        <td class="text-end font-weight-bold text-c-green">{{ formatCurrency(payment.amount) }}</td>
                      </tr>
                      <tr v-if="payment.payment_type === 'dp'">
                        <th class="text-start">Sisa Pembayaran:</th>
                        <td class="text-end font-weight-bold text-c-red">{{ formatCurrency((payment.booking?.total_price || 0) - payment.amount) }}</td>
                      </tr>
                      <tr v-else>
                        <th class="text-start">Jumlah Dibayar:</th>
                        <td class="text-end font-weight-bold text-c-blue">{{ formatCurrency(payment.amount) }}</td>
                      </tr>
                      <tr>
                        <th class="text-start">Status Pembayaran:</th>
                        <td class="text-end"><span :class="'label ' + (payment.status==='paid'||payment.status==='released'?'label-success':'label-warning')" style="text-transform:uppercase;">{{ payment.status === 'paid' || payment.status === 'released' ? 'DIBAYARKAN' : payment.status }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="x_footer">
          <button class="btn btn-default" @click="goBack"><i class="fa fa-arrow-left"></i> Back to Invoices</button>
          <button class="btn btn-primary pull-right" @click="openPrintPreview"><i class="fa fa-print"></i> Print Preview</button>
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
            <h5>Agregrator Business</h5>
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

@media screen and (max-width: 767px) {
  .invoice-header h1 { font-size: 20px; }
  .invoice-info .col-sm-4 { margin-bottom: 12px; }
  .table td, .table th { font-size: 12px; padding: 6px 4px; }
  .print-preview-page { padding: 15px; }
  .print-info-row { flex-direction: column; gap: 12px; }
  .print-totals-row { flex-direction: column; gap: 15px; }
  .print-totals table { width: 100%; }
  .print-footer-row { flex-direction: column; gap: 12px; }
}

</style>

<style>
/* ─── Print media (global — not scoped) ─── */
@page {
  size: A4;
  margin: 15mm;
}

@media print {
  /* Hide sidebar, topnav, dashboard footer, print toolbars, and background elements */
  .pcoded-navbar,
  .pcoded-header,
  .dashboard-footer,
  .no-print,
  .x_footer {
    display: none !important;
  }
  
  /* Hide the main card view when the print preview is active to prevent duplicates */
  .row:has(~ .print-preview-overlay) {
    display: none !important;
  }
  
  /* Reset offset margins for main wrappers */
  .pcoded-main-container {
    margin-left: 0 !important;
    margin-top: 0 !important;
    padding: 0 !important;
    min-height: auto !important;
    background: transparent !important;
  }

  .pcoded-content,
  .main-body,
  .page-wrapper {
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
  }

  /* Reset html/body backgrounds */
  html, body {
    background: #fff !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* Keep printed content visible */
  #print-area,
  #print-area * {
    visibility: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #print-area {
    position: static !important;
    width: 100% !important;
    page-break-after: avoid;
    page-break-inside: avoid;
  }

  /* Style print-preview-overlay and make it full-width */
  .print-preview-overlay {
    position: static !important;
    display: block !important;
    background: none !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    width: 100% !important;
    z-index: auto !important;
    opacity: 1 !important;
  }

  .print-preview-container {
    max-width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
  }

  .print-preview-container .card {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    margin-bottom: 0 !important;
  }

  .print-preview-container .card-header {
    background: transparent !important;
    border-bottom: none !important;
    padding: 0 0 5px 0 !important;
  }

  .print-preview-container .card-body {
    padding: 0 !important;
  }

  .print-preview-page {
    padding: 0 !important;
    background: #fff !important;
  }

  .print-table {
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: avoid;
  }

  .print-totals {
    page-break-inside: avoid;
  }

  .print-footer-text {
    page-break-inside: avoid;
  }

  .print-divider {
    border-top-color: #2c3e50 !important;
  }

  .print-table th {
    background: #2c3e50 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-table tbody tr:nth-child(even) {
    background: #f9f9f9 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .print-header-left h2,
  .print-header-right h1 {
    color: #2c3e50 !important;
  }
}
</style>
