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
      <div class="card"><div class="card-body"><p style="text-align:center;padding:40px;">Loading receipt...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!receipt">
      <div class="card">
        <div class="card-body">
          <p style="text-align:center;padding:40px;">Receipt not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to Receipts</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="card">
        <div class="card-header">
          <h4>Receipt Kwitansi Pembayaran</h4>
          
        </div>
        <div class="card-body">
          <!-- Receipt Content -->
          <section class="content invoice">
            <div class="row align-items-center m-b-20">
              <div class="col-sm-6 text-start text-sm-left">
              </div>
              <div class="col-sm-6 text-end text-sm-right text-right">
                <h3 class="m-0 text-c-blue" style="font-weight: bold;">{{ receipt.receipt_number }}</h3>
                <p class="invoice-date m-0 m-t-5">{{ receipt.released_at ? formatDate(receipt.released_at) : '-' }}</p>
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
                <dl class="row m-b-0" style="font-size: 13px; line-height: 1.6;">
                  <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Receipt No</dt>
                  <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ receipt.receipt_number }}</dd>

                  <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">RFP No</dt>
                  <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ receipt.request_number }}</dd>

                  <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Status</dt>
                  <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">
                    <span class="label label-primary" style="text-transform:uppercase; font-size: 10px; padding: 2px 6px;">RELEASED</span>
                  </dd>

                  <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Payment To</dt>
                  <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ receipt.payment_to || '-' }}</dd>

                  <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 4px;">Method</dt>
                  <dd class="col-sm-7 text-start" style="margin-bottom: 4px;">{{ receipt.payment_method || '-' }}</dd>
                </dl>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <div class="table-responsive">
                <table class="table table-striped table-bordered w-100" style="width: 100% !important;">
                  <thead>
                    <tr>
                      <th class="text-center" style="width:5%">No</th>
                      <th style="width:45%">Description</th>
                      <th class="text-center" style="width:10%">Qty</th>
                      <th class="text-end" style="width:20%">Unit Price</th>
                      <th class="text-end" style="width:20%">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, idx) in receipt.items" :key="item.id_item || idx">
                      <td class="text-center">{{ Number(idx) + 1 }}</td>
                      <td><strong>{{ item.description }}</strong></td>
                      <td class="text-center">{{ item.quantity || 1 }}</td>
                      <td class="text-end">{{ formatCurrency(item.unit_price || item.amount) }}</td>
                      <td class="text-end font-weight-bold text-c-blue">{{ formatCurrency(item.amount) }}</td>
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
                        <th style="width:50%" class="text-start">Total Amount:</th>
                        <td class="text-end font-weight-bold text-c-blue">{{ formatCurrency(totalAmount(receipt.items)) }}</td>
                      </tr>
                      <tr>
                        <th class="text-start">Receipt Status:</th>
                        <td class="text-end"><span class="label label-primary" style="text-transform:uppercase;">RELEASED</span></td>
                      </tr>
                      <tr>
                        <th class="text-start">Released By:</th>
                        <td class="text-end">{{ receipt.released_by || '-' }}</td>
                      </tr>
                      <tr>
                        <th class="text-start">Released At:</th>
                        <td class="text-end">{{ receipt.released_at ? formatDate(receipt.released_at) : '-' }}</td>
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
              <td>{{ Number(idx) + 1 }}</td>
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
