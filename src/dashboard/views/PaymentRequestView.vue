<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import PaymentRequestModal, { type PaymentRequestForm } from '../components/PaymentRequestModal.vue'

const router = useRouter()

interface PaymentRequest {
  id_request: number
  request_number: string
  title: string
  description: string | null
  request_date: string
  notes: string | null
  payment_method: string | null
  bank_account_number: string | null
  payment_to: string | null
  status: string
  total_amount: number
  outstanding: number
  reviewed_at: string | null
  approval_notes: string | null
  receipt_number: string | null
  released_by: string | null
  released_at: string | null
  requested_by: string | null
  reviewed_by: string | null
  items?: {
    id_item: number
    description: string
    quantity: number
    unit_price: number
    amount: number
    notes: string | null
  }[]
  transactions?: any[]
}

const requests = ref<PaymentRequest[]>([])
const search = ref('')
const sortColumn = ref<keyof PaymentRequest | 'total_amount' | 'requested_by'>('request_date')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(10)
const filterStatus = ref('')

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const selectedRequest = ref<PaymentRequest | null>(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

function getUser() {
  try {
    const raw = localStorage.getItem('sigyn_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function fetchRequests() {
  try {
    const res = await fetch(`${apiUrl}/api/payment-requests`)
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    requests.value = json.data || []
  } catch (err) {
    console.error('Error fetching:', err)
    requests.value = []
  }
}

onMounted(() => { fetchRequests() })

function openAdd() {
  selectedRequest.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openDetail(r: PaymentRequest) {
  router.push(`/payment-requests/${r.id_request}`)
}

function openEdit(r: PaymentRequest) {
  selectedRequest.value = { ...r, items: r.items }
  modalMode.value = 'edit'
  modalVisible.value = true
}

async function uploadFile(requestNumber: string, file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${apiUrl}/api/upload/payment-proof?request_number=${encodeURIComponent(requestNumber)}`, { method: 'POST', body: fd })
  if (!res.ok) return null
  const json = await res.json()
  return json.url
}

async function handleSave(data: PaymentRequestForm) {
  const user = getUser()
  const body: Record<string, any> = {
    title: data.title,
    description: data.description,
    payment_method: data.payment_method,
    bank_account_number: data.bank_account_number,
    payment_to: data.payment_to,
    reference_number: data.reference_number,
    requested_by: user?.email,
    user_created: user?.email || 'SYSTEM',
    status: data.status,
    items: data.items,
  }

  try {
    const method = modalMode.value === 'add' ? 'POST' : 'PUT'
    const url = modalMode.value === 'add'
      ? `${apiUrl}/api/payment-requests`
      : `${apiUrl}/api/payment-requests/${selectedRequest.value?.id_request}`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || `Failed to ${modalMode.value === 'add' ? 'create' : 'update'}`)
    }

    const json = await res.json()
    const requestNumber = json.data?.request_number

    if (data.attachment_file && requestNumber) {
      const proofUrl = await uploadFile(requestNumber, data.attachment_file)
      if (proofUrl && data.status === 'pending') {
        await fetch(`${apiUrl}/api/payment-requests/${json.data.id_request}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_type: 'submitted', description: 'Payment request submitted', payment_proof_url: proofUrl, created_by: user?.email || 'SYSTEM' }),
        })
      }
    }

    await fetchRequests()
    Toast.fire({ icon: 'success', title: `Payment request ${modalMode.value === 'add' ? 'created' : 'updated'}` })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete the payment request.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  })
  if (!result.isConfirmed) return

  try {
    const res = await fetch(`${apiUrl}/api/payment-requests/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to delete')
    }
    await fetchRequests()
    Toast.fire({ icon: 'success', title: 'Payment request deleted' })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
}



const filtered = computed(() => {
  let result = requests.value
  if (filterStatus.value) {
    result = result.filter(r => r.status === filterStatus.value)
  }
  const q = search.value.toLowerCase()
  if (q) {
    result = result.filter(r =>
      (r.request_number?.toLowerCase() || '').includes(q) ||
      (r.title?.toLowerCase() || '').includes(q) ||
      (r.requested_by?.toLowerCase() || '').includes(q) ||
      (r.payment_to?.toLowerCase() || '').includes(q) ||
      ((r.items && r.items.some(i => (i.description?.toLowerCase() || '').includes(q))) ?? false)
    )
  }

  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'total_amount') {
      va = String(a.total_amount || 0)
      vb = String(b.total_amount || 0)
    } else if (col === 'requested_by') {
      va = (a.requested_by || '').toLowerCase()
      vb = (b.requested_by || '').toLowerCase()
    } else {
      va = String(a[col as keyof PaymentRequest] ?? '').toLowerCase()
      vb = String(b[col as keyof PaymentRequest] ?? '').toLowerCase()
    }
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})

function setSort(col: string) {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = col as any
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

function goPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = { draft: 'Draft', pending: 'Pending', approved: 'Approved', rejected: 'Rejected', revision: 'Revision', released: 'Released' }
  return map[s] || s
}
const statusClass = (s: string) => {
  const map: Record<string, string> = { draft: 'label-default', pending: 'label-warning', approved: 'label-success', rejected: 'label-danger', revision: 'label-info', released: 'label-primary' }
  return map[s] || 'label-default'
}
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h5>Request for Payment</h5>
      
    </div>

    <div class="card-body">
      <div class="row" style="margin-bottom: 12px; overflow: hidden;">
        <div class="col-md-4 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd"><i class="fa fa-plus"></i> New Request</button>
        </div>
        <div class="col-md-4 col-sm-6 col-xs-12">
          <select v-model="filterStatus" class="form-control" @change="currentPage = 1">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revision">Revision</option>
            <option value="released">Released</option>
          </select>
        </div>
        <div class="col-md-4 col-sm-6 col-xs-12">
          <div class="input-group" style="margin: 0;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" v-model="search" class="form-control" placeholder="Search by number, title, payment to..." />
          </div>
        </div>
      </div>

      <div class="table-responsive table-wrap">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th @click="setSort('request_number')" style="cursor: pointer; user-select: none;">Request Number <i v-if="sortColumn === 'request_number'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('title')" style="cursor: pointer; user-select: none;">Title <i v-if="sortColumn === 'title'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('payment_to')" style="cursor: pointer; user-select: none;">Payment To <i v-if="sortColumn === 'payment_to'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('payment_method')" style="cursor: pointer; user-select: none;">Method <i v-if="sortColumn === 'payment_method'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('total_amount')" style="cursor: pointer; user-select: none;">Amount <i v-if="sortColumn === 'total_amount'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('status')" style="cursor: pointer; user-select: none;">Status <i v-if="sortColumn === 'status'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th>Receipt Number</th>
              <th @click="setSort('requested_by')" style="cursor: pointer; user-select: none;">Requested By <i v-if="sortColumn === 'requested_by'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('request_date')" style="cursor: pointer; user-select: none;">Date <i v-if="sortColumn === 'request_date'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th style="width: 180px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginated" :key="r.id_request">
              <td><strong>{{ r.request_number }}</strong></td>
              <td>{{ r.title }}</td>
              <td>{{ r.payment_to || '-' }}</td>
              <td>{{ r.payment_method || '-' }}</td>
              <td>{{ formatCurrency(r.total_amount) }}</td>
              <td><span :class="'label ' + statusClass(r.status)" style="font-size: 12px;">{{ statusLabel(r.status) }}</span></td>
              <td>{{ r.receipt_number || '-' }}</td>
              <td>{{ r.requested_by || '-' }}</td>
              <td>{{ new Date(r.request_date).toLocaleDateString('id-ID') }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary btn-xs" @click="openDetail(r)" title="View"><i class="fa fa-eye"></i></button>
                <button v-if="r.status === 'draft'" class="btn btn-info btn-xs" @click="openEdit(r)" title="Edit"><i class="fa fa-pencil"></i></button>
                <button v-if="r.status === 'draft'" class="btn btn-danger btn-xs" @click="handleDelete(r.id_request)" title="Delete"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="10" style="text-align: center;">No payment requests found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <p>Showing {{ filtered.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0 }} to {{ Math.min(currentPage * perPage, filtered.length) }} of {{ filtered.length }} entries</p>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <nav style="float: right;">
            <ul class="pagination" style="margin: 0;">
              <li :class="{ disabled: currentPage === 1 }"><a @click.prevent="goPage(1)">&laquo;</a></li>
              <li :class="{ disabled: currentPage === 1 }"><a @click.prevent="goPage(currentPage - 1)">&lsaquo;</a></li>
              <li v-for="p in pageNumbers" :key="p" :class="{ active: p === currentPage }"><a @click.prevent="goPage(p)">{{ p }}</a></li>
              <li :class="{ disabled: currentPage === totalPages }"><a @click.prevent="goPage(currentPage + 1)">&rsaquo;</a></li>
              <li :class="{ disabled: currentPage === totalPages }"><a @click.prevent="goPage(totalPages)">&raquo;</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <PaymentRequestModal
    :visible="modalVisible"
    :mode="modalMode"
    :request="selectedRequest"
    @close="modalVisible = false; fetchRequests()"
    @save="handleSave"
  />
</template>

<style scoped>
.input-group-addon { background: #fff; border-right: none; }
.input-group-addon + .form-control { border-left: none; }
.table > thead > tr > th { white-space: nowrap; }
.table-wrap { overflow-x: auto; width: 100%; }

@media (max-width: 767px) {
  .table td, .table th { font-size: 12px; padding: 6px 4px; }
  .btn-xs { padding: 2px 6px; font-size: 11px; }
}
</style>
