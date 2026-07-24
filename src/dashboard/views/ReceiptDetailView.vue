<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import sigynLogo from '@/assets/kaira/images/logosigyn.png'

const route = useRoute()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const receipt = ref<any>(null)
const companyInfo = ref<any>(null)
const loading = ref(true)
const showPrintPreview = ref(false)

async function fetchData() {
  try {
    const id = route.params.id
    const [receiptRes, companyRes] = await Promise.all([
      fetch(`${apiUrl}/api/payment-requests/${id}/receipt`),
      fetch(`${apiUrl}/api/company-info`),
    ])
    if (!receiptRes.ok) throw new Error('Receipt not found')
    const receiptJson = await receiptRes.json()
    receipt.value = receiptJson.data
    if (companyRes.ok) {
      const companyJson = await companyRes.json()
      companyInfo.value = companyJson.data
    }
  } catch (err) {
    console.error(err)
    receipt.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function totalAmount(items: any[]) {
  return items?.reduce((s: number, i: any) => s + Number(i.amount), 0) || 0
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function goBack() {
  router.push('/receipts')
}

function openPrintPreview() {
  showPrintPreview.value = true
}

function closePrintPreview() {
  showPrintPreview.value = false
}

function printReceipt() {
  window.print()
}
</script>

<template>
  <div class="row">
    <div class="col-md-12" v-if="loading">
      <div class="x_panel"><div class="x_content"><p style="text-align:center;padding:40px;">Loading receipt...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!receipt">
      <div class="x_panel">
        <div class="x_content">
          <p style="text-align:center;padding:40px;">Receipt not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to Receipts</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="x_panel">
        <div class="x_title">
          <h2>Receipt <small>Kwitansi Pembayaran</small></h2>
          <div class="clearfix"></div>
        </div>
        <div class="x_content">
          <!-- Receipt Content -->
          <section class="content invoice">
            <div class="row">
              <div class="col-xs-12 invoice-header">
                <h1>
                  <i class="fa fa-file-text-o"></i> {{ receipt.receipt_number }}
                </h1>
                <p class="invoice-date">{{ receipt.released_at ? formatDate(receipt.released_at) : '-' }}</p>
              </div>
            </div>

            <div class="row invoice-info">
              <div class="col-sm-4 invoice-col">
                <img :src="sigynLogo" alt="SIGYN" style="height:50px;width:auto;margin-bottom:8px;">
                <address>
                  {{ companyInfo?.address || 'Platform Vendor Management' }}<br>
                  <template v-if="companyInfo?.email">Email: {{ companyInfo.email }}<br></template>
                  <template v-if="companyInfo?.phone">Phone: {{ companyInfo.phone }}<br></template>
                  <template v-if="!companyInfo?.email && !companyInfo?.phone"></template>
                </address>
              </div>
              <div class="col-sm-4 invoice-col">
                <strong>Penerima</strong>
                <address>
                  <strong>{{ receipt.payment_to || receipt.requested_by || '-' }}</strong><br>
                </address>
              </div>
              <div class="col-sm-4 invoice-col">
                <b>Receipt Number: {{ receipt.receipt_number }}</b><br>
                <b>RFP Number:</b> {{ receipt.request_number }}<br>
                <b>Status:</b> <span class="label label-primary" style="text-transform:uppercase;">RELEASED</span><br>
                <b>Payment To:</b> {{ receipt.payment_to || '-' }}<br>
                <b>Payment Method:</b> {{ receipt.payment_method || '-' }}
              </div>
            </div>

            <div class="row">
              <div class="col-xs-12">
                <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th style="width:5%">No</th>
                      <th style="width:45%">Description</th>
                      <th style="width:10%">Qty</th>
                      <th style="width:20%">Unit Price</th>
                      <th style="width:20%">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in receipt.items" :key="item.id_item || idx">
                      <td>{{ idx + 1 }}</td>
                      <td><strong>{{ item.description }}</strong></td>
                      <td>{{ item.quantity || 1 }}</td>
                      <td>{{ formatCurrency(item.unit_price || item.amount) }}</td>
                      <td>{{ formatCurrency(item.amount) }}</td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <p v-if="receipt.notes" style="margin: 0 0 4px;">
              <strong>Notes:</strong> {{ receipt.notes }}
            </p>

            <div class="row">
              <div class="col-sm-6 col-xs-12">
                <p class="lead">Info Rekening</p>
                <p class="text-muted well well-sm no-shadow" style="margin-top:10px;">
                  <strong>Metode Pembayaran:</strong> {{ receipt.payment_method || '-' }}<br>
                  <strong>No. Rekening:</strong> {{ receipt.bank_account_number || '-' }}<br>
                  <strong>a.n.</strong> {{ receipt.payment_to || '-' }}
                </p>
                <p style="margin-top:10px; font-size:12px; color:#73879C;">
                  Kwitansi ini merupakan bukti pembayaran resmi yang telah direlease untuk <strong>{{ receipt.title }}</strong>.
                </p>
              </div>
              <div class="col-sm-6 col-xs-12">
                <p class="lead">Amount</p>
                <div class="table-responsive">
                  <table class="table">
                    <tbody>
                      <tr>
                        <th style="width:50%">Total Amount:</th>
                        <td>{{ formatCurrency(totalAmount(receipt.items)) }}</td>
                      </tr>
                      <tr>
                        <th>Receipt Status:</th>
                        <td><span class="label label-primary" style="text-transform:uppercase;">RELEASED</span></td>
                      </tr>
                      <tr>
                        <th>Released By:</th>
                        <td>{{ receipt.released_by || '-' }}</td>
                      </tr>
                      <tr>
                        <th>Released At:</th>
                        <td>{{ receipt.released_at ? formatDate(receipt.released_at) : '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="x_footer no-print">
          <button class="btn btn-default" @click="goBack"><i class="fa fa-arrow-left"></i> Back to Receipts</button>
          <button class="btn btn-primary pull-right" @click="openPrintPreview"><i class="fa fa-print"></i> Print Preview</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Print Preview Overlay -->
  <div v-if="showPrintPreview" class="print-preview-overlay" @click.self="closePrintPreview">
    <div class="print-preview-container">
      <div class="print-preview-toolbar no-print">
        <button class="btn btn-success" @click="printReceipt"><i class="fa fa-print"></i> Print</button>
        <button class="btn btn-default" @click="closePrintPreview"><i class="fa fa-times"></i> Close</button>
      </div>
      <div class="print-preview-page" id="print-area">
        <!-- Company letterhead -->
        <div class="print-header">
          <div class="print-header-left">
            <img :src="sigynLogo" alt="SIGYN" style="height:55px;width:auto;margin-bottom:4px;">
            <p>Official Receipt - Kwitansi Resmi</p>
          </div>
          <div class="print-header-right">
            <h1>{{ receipt.receipt_number }}</h1>
            <p>Date: {{ receipt.released_at ? formatDate(receipt.released_at) : '-' }}</p>
          </div>
        </div>

        <hr class="print-divider">

        <!-- Info rows -->
        <div class="print-info-row">
          <div class="print-info-block">
            <strong>Telah Terima Dari:</strong>
            <p>{{ companyInfo?.company_name || 'Agregrator Business' }}<br>
            {{ companyInfo?.email || '' }}<br>
            <span v-if="companyInfo?.phone">{{ companyInfo.phone }}</span></p>
          </div>
          <div class="print-info-block">
            <strong>Penerima:</strong>
            <p>{{ receipt.payment_to || receipt.requested_by || '-' }}</p>
          </div>
          <div class="print-info-block print-info-right">
            <p><strong>RFP Number:</strong> {{ receipt.request_number }}</p>
            <p><strong>Status:</strong> RELEASED</p>
            <p><strong>Payment To:</strong> {{ receipt.payment_to || '-' }}</p>
            <p v-if="receipt.payment_method"><strong>Method:</strong> {{ receipt.payment_method }}</p>
          </div>
        </div>

        <!-- Items table -->
        <table class="print-table">
          <thead>
            <tr>
              <th style="width:5%">No</th>
              <th style="width:45%">Deskripsi</th>
              <th style="width:10%">Qty</th>
              <th style="width:20%">Harga Satuan</th>
              <th style="width:20%">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in receipt.items" :key="item.id_item || idx">
              <td>{{ idx + 1 }}</td>
              <td><strong>{{ item.description }}</strong></td>
              <td>{{ item.quantity || 1 }}</td>
              <td style="text-align:right;">{{ formatCurrency(item.unit_price || item.amount) }}</td>
              <td style="text-align:right;">{{ formatCurrency(item.amount) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="receipt.notes" class="print-location">
          <strong>Notes:</strong> {{ receipt.notes }}
        </p>

        <!-- Totals + Stamp -->
        <div class="print-totals-row">
          <div class="print-stamp-wrap">
            <div class="print-stamp">
              <svg viewBox="0 0 200 200" class="stamp-svg">
                <defs>
                  <path id="stamp-arc-receipt" d="M 29 100 A 71 71 0 1 1 171 100" fill="none" />
                  <path id="stamp-arc-bottom-receipt" d="M 29 100 A 71 71 0 0 0 171 100" fill="none" />
                </defs>
                <circle cx="100" cy="100" r="88" fill="rgba(255,255,255,0.9)" stroke="#2c3e50" stroke-width="2.5" />
                <circle cx="100" cy="100" r="81" fill="none" stroke="#2c3e50" stroke-width="1" />
                <circle cx="100" cy="100" r="58" fill="none" stroke="#2c3e50" stroke-width="1" stroke-dasharray="3,3" />
                <text font-size="14" font-weight="900" fill="#2c3e50" letter-spacing="2" text-anchor="middle">
                  <textPath href="#stamp-arc-receipt" startOffset="50%">
                    {{ (companyInfo?.company_name || 'Agregrator Business') }}
                  </textPath>
                </text>
                <text x="100" y="95" font-size="20" font-weight="bold" fill="#2c3e50" text-anchor="middle" letter-spacing="3">
                  RELEASED
                </text>
                <text x="100" y="115" font-size="9" font-weight="bold" fill="#2c3e50" text-anchor="middle" letter-spacing="1">
                  KWITANSI
                </text>
                <text font-size="14" font-weight="900" fill="#2c3e50" letter-spacing="2" text-anchor="middle">
                  <textPath href="#stamp-arc-bottom-receipt" startOffset="50%">
                    {{ receipt.released_at ? formatDate(receipt.released_at) : '' }}
                  </textPath>
                </text>
                <line x1="31" y1="100" x2="169" y2="100" stroke="#2c3e50" stroke-width="1" />
              </svg>
            </div>
          </div>
          <div class="print-totals">
            <table>
              <tbody>
                <tr>
                  <th>Total Amount:</th>
                  <td>{{ formatCurrency(totalAmount(receipt.items)) }}</td>
                </tr>
                <tr>
                  <th>Released By:</th>
                  <td>{{ receipt.released_by || '-' }}</td>
                </tr>
                <tr v-if="receipt.payment_method">
                  <th>Payment Method:</th>
                  <td>{{ receipt.payment_method }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <hr class="print-divider">

        <div class="print-footer-text">
          <div class="print-footer-row">
            <div class="print-footer-left">
              <p>
                <strong>Rekening Tujuan:</strong><br>
                <template v-if="receipt.bank_account_number || receipt.payment_to">
                  Metode: {{ receipt.payment_method || '-' }}<br>
                  No. Rekening: {{ receipt.bank_account_number || '-' }}<br>
                  a.n. {{ receipt.payment_to || '-' }}
                </template>
                <template v-else>-</template>
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
            Kwitansi ini merupakan bukti pembayaran resmi untuk <strong>{{ receipt.title }}</strong>
            (RFP Number {{ receipt.request_number }}) yang telah direlease.
          </p>
          <p style="font-size:11px;margin-top:6px;">
            Untuk informasi lebih lanjut, silakan hubungi tim Finance kami melalui nomor telepon atau email yang tercantum di atas.
          </p>

          <div style="margin-top:20px; display:flex; justify-content:space-between; padding:0 20px;">
            <div style="text-align:center; width:180px;">
              <div style="font-weight:bold; margin-bottom:60px; font-size:13px;">Pemberi,</div>
              <div style="text-decoration:underline; font-weight:bold;">{{ companyInfo?.company_name || 'Agregrator Business' }}</div>
              <div style="font-size:11px; margin-top:2px;">{{ companyInfo?.address || '' }}</div>
            </div>
            <div style="text-align:center; width:180px;">
              <div style="font-weight:bold; margin-bottom:60px; font-size:13px;">Penerima,</div>
              <div style="text-decoration:underline; font-weight:bold;">{{ receipt.payment_to || receipt.requested_by || '-' }}</div>
            </div>
            <div style="text-align:center; width:180px;">
              <div style="font-weight:bold; margin-bottom:60px; font-size:13px;">Mengetahui,</div>
              <div style="text-decoration:underline; font-weight:bold;">{{ receipt.reviewed_by || receipt.released_by || '-' }}</div>
            </div>
          </div>

          <p class="print-thanks">{{ companyInfo?.footer_text || 'Terima kasih. Dokumen ini sah dan diproses secara elektronik.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ─── Receipt view styles ─── */
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

@media (max-width: 767px) {
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
