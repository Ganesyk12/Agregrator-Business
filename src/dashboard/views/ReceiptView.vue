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
  total_amount: number
  requested_by: string | null
  released_by: string | null
  reviewed_by: string | null
}

const receipts = ref<Receipt[]>([])
const loading = ref(true)
const search = ref('')

async function fetchReceipts() {
  try {
    const res = await fetch(`${apiUrl}/api/payment-requests`)
    if (!res.ok) throw new Error('Failed to fetch receipts')
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

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  if (!d) return '-'
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
  <div class="card">
    <div class="card-header">
      <h5>Receipts <small class="text-muted">Kwitansi Ter-release</small></h5>
    </div>
    
    <div class="card-body">
      <!-- Search Panel -->
      <div class="row m-b-20">
        <div class="col-md-12">
          <div class="input-group">
            <span class="input-group-text"><i class="fa fa-search"></i></span>
            <input type="text" v-model="search" class="form-control" placeholder="Search by receipt number, RFP number, title, payment to, requester..." />
          </div>
        </div>
      </div>
      
      <!-- Table View -->
      <div class="table-responsive" v-if="!loading">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th class="text-center">Receipt Number</th>
              <th class="text-center">RFP Number</th>
              <th>Title</th>
              <th>Payment To</th>
              <th class="text-end">Amount</th>
              <th class="text-center">Released At</th>
              <th>Released By</th>
              <th>Requester</th>
              <th class="text-center" style="width:100px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id_request">
              <td class="text-center"><strong>{{ r.receipt_number }}</strong></td>
              <td class="text-center">{{ r.request_number }}</td>
              <td>{{ r.title }}</td>
              <td>{{ r.payment_to || '-' }}</td>
              <td class="text-end font-weight-bold text-c-blue">{{ formatCurrency(r.total_amount) }}</td>
              <td class="text-center">{{ formatDate(r.released_at) }}</td>
              <td>{{ r.released_by || '-' }}</td>
              <td>{{ r.requested_by || '-' }}</td>
              <td class="text-center" style="white-space:nowrap;">
                <button class="btn btn-info btn-xs" @click="viewDetail(r)" title="View Receipt">
                  <i class="fa fa-file-text"></i> View
                </button>
              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="9" class="text-center">No released receipts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Loading Indicator -->
      <div v-else class="text-center p-40">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
        <p class="m-t-10 text-muted">Loading receipts...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.m-b-20 {
  margin-bottom: 20px;
}
.p-40 {
  padding: 40px;
}
.m-t-10 {
  margin-top: 10px;
}
.font-weight-bold {
  font-weight: bold;
}
.text-c-blue {
  color: #4099ff;
}
@media (max-width: 767px) {
  .table td, .table th { font-size: 12px; padding: 8px 6px; }
}
</style>
