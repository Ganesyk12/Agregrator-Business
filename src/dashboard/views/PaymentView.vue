<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import PaymentModal, { type PaymentForm } from '../components/PaymentModal.vue'

const router = useRouter()

interface Payment {
  id_payment: number
  id_booking: number
  amount: number
  payment_type: string
  status: string
  payment_proof_url: string | null
  paid_at: string | null
  released_at: string | null
  date_created: string
  booking?: {
    id_booking: number
    total_price: number
    dp_amount: number
    customer?: {
      full_name: string
      email: string
    }
    booking_packages?: {
      package: {
        name: string
        price: number
        vendor: { id_vendor: number; business_name: string }
      }
    }[]
  }
}

const payments = ref<Payment[]>([])
const search = ref('')
const sortColumn = ref<keyof Payment | 'customer_name' | 'vendor_name' | 'package_name'>('date_created')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(5)

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedPayment = ref<Payment | null>(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})

async function fetchPayments() {
  try {
    const res = await fetch(`${apiUrl}/api/payments`)
    if (!res.ok) throw new Error('Failed to fetch payments')
    const json = await res.json()
    payments.value = json.data || []
  } catch (err) {
    console.error('Error fetching payments:', err)
    payments.value = []
  }
}

onMounted(() => {
  fetchPayments()
})

function openAdd() {
  selectedPayment.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openEdit(p: Payment) {
  selectedPayment.value = { ...p }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(p: Payment) {
  selectedPayment.value = { ...p }
  modalMode.value = 'detail'
  modalVisible.value = true
}

async function handleSave(data: PaymentForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to create payment')
      }
      await fetchPayments()
      Toast.fire({
        icon: 'success',
        title: 'Payment created successfully'
      })
    } catch (err: any) {
      console.error('Error creating payment:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to create payment'
      })
    }
  } else if (modalMode.value === 'edit' && selectedPayment.value) {
    try {
      const res = await fetch(`${apiUrl}/api/payments/${selectedPayment.value.id_payment}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to update payment')
      }
      await fetchPayments()
      Toast.fire({
        icon: 'success',
        title: 'Payment updated successfully'
      })
    } catch (err: any) {
      console.error('Error updating payment:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to update payment'
      })
    }
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This will soft-delete the payment.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${apiUrl}/api/payments/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to delete payment')
      }
      await fetchPayments()
      Toast.fire({
        icon: 'success',
        title: 'Payment deleted successfully.'
      })
    } catch (err: any) {
      console.error('Error deleting payment:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to delete payment'
      })
    }
  }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = payments.value
  if (q) {
      result = result.filter(p =>
      (p.booking?.customer?.full_name?.toLowerCase() || '').includes(q) ||
      (p.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ')?.toLowerCase() || '').includes(q) ||
      (p.booking?.booking_packages?.map(bp => bp.package.name).join(', ')?.toLowerCase() || '').includes(q) ||
      (p.payment_type?.toLowerCase() || '').includes(q) ||
      (p.status?.toLowerCase() || '').includes(q)
    )
  }

  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'customer_name') {
      va = (a.booking?.customer?.full_name || '').toLowerCase()
      vb = (b.booking?.customer?.full_name || '').toLowerCase()
    } else if (col === 'vendor_name') {
      va = (a.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ') || '').toLowerCase()
      vb = (b.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ') || '').toLowerCase()
    } else if (col === 'package_name') {
      va = (a.booking?.booking_packages?.map(bp => bp.package.name).join(', ') || '').toLowerCase()
      vb = (b.booking?.booking_packages?.map(bp => bp.package.name).join(', ') || '').toLowerCase()
    } else {
      va = String(a[col as keyof Payment] ?? '').toLowerCase()
      vb = String(b[col as keyof Payment] ?? '').toLowerCase()
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
</script>

<template>
  <div class="x_panel">
    <div class="x_title">
      <h2>Payments Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Create Payment
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="margin: 0;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              v-model="search"
              class="form-control"
              placeholder="Search by customer, vendor, package, type, status..."
            />
          </div>
        </div>
      </div>

      <div class="table-responsive table-wrap">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th
                v-for="col in ([
                  { key: 'id_payment', label: 'ID' },
                  { key: 'customer_name', label: 'Customer' },
                  { key: 'vendor_name', label: 'Vendor' },
                  { key: 'package_name', label: 'Package' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'payment_type', label: 'Type' },
                  { key: 'status', label: 'Status' },
                  { key: 'paid_at', label: 'Paid At' },
                ] as { key: string; label: string }[])"
                :key="col.key"
                @click="setSort(col.key)"
                style="cursor: pointer; user-select: none;"
              >
                {{ col.label }}
                <i
                  v-if="sortColumn === col.key"
                  :class="sortDirection === 'asc' ? 'fa fa-sort-asc' : 'fa fa-sort-desc'"
                ></i>
                <i v-else class="fa fa-sort" style="color: #ccc;"></i>
              </th>
              <th style="width: 120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginated" :key="p.id_payment">
              <td>{{ p.id_payment }}</td>
              <td>{{ p.booking?.customer?.full_name || '-' }}</td>
              <td>{{ p.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ') || '-' }}</td>
              <td>{{ p.booking?.booking_packages?.map(bp => bp.package.name).join(', ') || '-' }}</td>
              <td>{{ formatCurrency(p.amount) }}</td>
              <td>
                <span
                  :class="{
                    'label label-primary': p.payment_type === 'dp',
                    'label label-success': p.payment_type === 'full',
                    'label label-info': p.payment_type === 'installment',
                  }"
                  style="font-size: 13px; text-transform: uppercase;"
                >{{ p.payment_type }}</span>
              </td>
              <td>
                <span
                  :class="{
                    'label label-success': p.status === 'paid' || p.status === 'released',
                    'label label-warning': p.status === 'pending',
                    'label label-danger': p.status === 'cancelled',
                  }"
                  style="font-size: 13px; text-transform: uppercase;"
                >{{ p.status }}</span>
              </td>
              <td>{{ p.paid_at ? new Date(p.paid_at).toLocaleDateString('id-ID') : '-' }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary" @click="openDetail(p)"><i class="fa fa-eye"></i></button>
                <button class="btn btn-info" @click="openEdit(p)"><i class="fa fa-pencil"></i></button>
                <button class="btn btn-success" @click="router.push('/invoices/' + p.id_payment)"><i class="fa fa-file-text-o"></i></button>
                <button class="btn btn-danger" @click="handleDelete(p.id_payment)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="9" style="text-align: center;">No payments found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <p>
            Showing {{ filtered.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0 }}
            to {{ Math.min(currentPage * perPage, filtered.length) }}
            of {{ filtered.length }} entries
          </p>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <nav style="float: right;">
            <ul class="pagination" style="margin: 0;">
              <li :class="{ disabled: currentPage === 1 }">
                <a @click.prevent="goPage(1)">&laquo;</a>
              </li>
              <li :class="{ disabled: currentPage === 1 }">
                <a @click.prevent="goPage(currentPage - 1)">&lsaquo;</a>
              </li>
              <li
                v-for="p in pageNumbers"
                :key="p"
                :class="{ active: p === currentPage }"
              >
                <a @click.prevent="goPage(p)">{{ p }}</a>
              </li>
              <li :class="{ disabled: currentPage === totalPages }">
                <a @click.prevent="goPage(currentPage + 1)">&rsaquo;</a>
              </li>
              <li :class="{ disabled: currentPage === totalPages }">
                <a @click.prevent="goPage(totalPages)">&raquo;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <PaymentModal
    :visible="modalVisible"
    :mode="modalMode"
    :payment="selectedPayment"
    @close="modalVisible = false"
    @save="handleSave"
  />
</template>

<style scoped>
.input-group-addon {
  background: #fff;
  border-right: none;
}
.input-group-addon + .form-control {
  border-left: none;
}
.table > thead > tr > th {
  white-space: nowrap;
}
.table-wrap {
  overflow-x: auto;
  width: 100%;
}
</style>
