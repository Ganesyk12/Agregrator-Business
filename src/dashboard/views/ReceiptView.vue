<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Receipt {
  id_request: number
  request_number: string
  receipt_number: string
  title: string
  status: string
  released_at: string
  payment_to: string | null
  payment_method: string | null
  amount: number
  requested_by: string | null
  released_by: string | null
  reviewed_by: string | null
  items?: { amount: number }[]
}

const receipts = ref<Receipt[]>([])
const loading = ref(true)
const search = ref('')
const filterReleaser = ref('')

async function fetchReceipts() {
  try {
    const res = await fetch(`${apiUrl}/api/payment-requests`)
    if (!res.ok) throw new Error('Failed')
    const json = await res.json()
    const all = (json.data || []) as Receipt[]
    receipts.value = all.filter((r: any) => r.status === 'released')
  } catch (err) {
    console.error(err)
    receipts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchReceipts)

function totalAmount(items: any[]) {
  return items?.reduce((s: number, i: any) => s + Number(i.amount), 0) || 0
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function viewDetail(r: Receipt) {
  router.push(`/receipts/${r.id_request}`)
}

const filtered = computed(() => {
  let result = receipts.value
  const q = search.value.toLowerCase()
  if (q) {
    result = result.filter(r =>
      (r.receipt_number || '').toLowerCase().includes(q) ||
      (r.request_number || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.payment_to || '').toLowerCase().includes(q) ||
      (r.requested_by || '').toLowerCase().includes(q)
    )
  }
  return result
})
</script>

<template>
  <div class="x_panel">
    <div class="x_title">
      <h2>Receipts <small>Kwitansi Ter-release</small></h2>
      <div class="clearfix"></div>
    </div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12">
          <div class="input-group">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" v-model="search" class="form-control" placeholder="Search by receipt#, RFP#, title, payment to, requested by..." />
          </div>
        </div>
      </div>
      <div class="table-responsive" v-if="!loading">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Receipt Number</th>
              <th>RFP Number</th>
              <th>Title</th>
              <th>Payment To</th>
              <th>Amount</th>
              <th>Released At</th>
              <th>Released By</th>
              <th>Requester</th>
              <th style="width:100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id_request">
              <td><strong>{{ r.receipt_number }}</strong></td>
              <td>{{ r.request_number }}</td>
              <td>{{ r.title }}</td>
              <td>{{ r.payment_to || '-' }}</td>
              <td>{{ formatCurrency(totalAmount(r.items)) }}</td>
              <td>{{ formatDate(r.released_at) }}</td>
              <td>{{ r.released_by || '-' }}</td>
              <td>{{ r.requested_by || '-' }}</td>
              <td style="white-space:nowrap;">
                <button class="btn btn-info btn-xs" @click="viewDetail(r)" title="View Receipt"><i class="fa fa-file-text"></i> View</button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="9" style="text-align:center;">No released receipts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align:center;padding:40px;">Loading...</div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .table td, .table th { font-size: 12px; padding: 6px 4px; }
  .btn-xs { padding: 2px 6px; font-size: 11px; }
}
</style>
