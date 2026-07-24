<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface PaymentRequest {
  id_request: number
  request_number: string
  title: string
  description: string | null
  request_date: string
  requested_by: string
  payment_method: string | null
  bank_account_number: string | null
  payment_to: string | null
  status: string
  items?: {
    id_item: number
    description: string
    quantity: number
    unit_price: number
    amount: number
    notes: string | null
  }[]
}

const requests = ref<PaymentRequest[]>([])
const search = ref('')
const sortColumn = ref<string>('request_date')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(10)

async function fetchRequests() {
  try {
    const res = await fetch(`${apiUrl}/api/payment-requests`)
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    requests.value = (json.data || []).filter((r: PaymentRequest) => r.status === 'pending')
  } catch (err) {
    console.error('Error fetching:', err)
    requests.value = []
  }
}

onMounted(() => { fetchRequests() })

function openDetail(r: PaymentRequest) {
  router.push(`/incoming-requests/${r.id_request}`)
}

function totalAmount(items: any[]) {
  if (!items?.length) return 0
  return items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
}

const filtered = computed(() => {
  let result = requests.value
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
  result = [...result].sort((a: any, b: any) => {
    let va = ''
    let vb = ''
    if (col === 'total_amount') {
      va = String(totalAmount(a.items))
      vb = String(totalAmount(b.items))
    } else if (col === 'requested_by') {
      va = (a.requested_by || '').toLowerCase()
      vb = (b.requested_by || '').toLowerCase()
    } else {
      va = String(a[col] ?? '').toLowerCase()
      vb = String(b[col] ?? '').toLowerCase()
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
    sortColumn.value = col
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
</script>

<template>
  <div class="x_panel">
    <div class="x_title">
      <h2>Incoming Request</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
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
              <th @click="setSort('title')" style="cursor: pointer; user-select: none;">Description <i v-if="sortColumn === 'title'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('payment_to')" style="cursor: pointer; user-select: none;">Payment To <i v-if="sortColumn === 'payment_to'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('total_amount')" style="cursor: pointer; user-select: none;">Amount <i v-if="sortColumn === 'total_amount'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('requested_by')" style="cursor: pointer; user-select: none;">Requested By <i v-if="sortColumn === 'requested_by'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th @click="setSort('request_date')" style="cursor: pointer; user-select: none;">Date <i v-if="sortColumn === 'request_date'" :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color: #ccc;"></i></th>
              <th style="width: 80px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginated" :key="r.id_request">
              <td><strong>{{ r.request_number }}</strong></td>
              <td>{{ r.title }}</td>
              <td>{{ r.payment_to || '-' }}</td>
              <td>{{ formatCurrency(totalAmount(r.items)) }}</td>
              <td>{{ r.requested_by || '-' }}</td>
              <td>{{ new Date(r.request_date).toLocaleDateString('id-ID') }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary btn-xs" @click="openDetail(r)" title="View Detail"><i class="fa fa-eye"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="7" style="text-align: center;">No incoming requests found.</td>
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
</template>

<style scoped>
.input-group-addon { background: #fff; border-right: none; }
.input-group-addon + .form-control { border-left: none; }
.table > thead > tr > th { white-space: nowrap; }
.table-wrap { overflow-x: auto; width: 100%; }
</style>
