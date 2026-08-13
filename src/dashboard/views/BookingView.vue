<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import BookingModal, { type BookingForm } from '../components/BookingModal.vue'

const auth = useAuthStore()

interface Booking {
  id_booking: number
  id_user: number
  event_date: string
  event_location: string | null
  total_price: number
  dp_amount: number
  status: string
  notes: string | null
  date_created: string
  customer?: {
    full_name: string
    email: string
  }
  booking_packages?: {
    package: {
      id_package: number
      name: string
      price: number
      vendor: { id_vendor: number; business_name: string }
    }
  }[]
}

const bookings = ref<Booking[]>([])
const search = ref('')
const sortColumn = ref<keyof Booking | 'customer_name' | 'vendor_name' | 'package_name'>('date_created')

const userRoles = ref<string[]>([])
function loadRoles() {
  if (auth.user?.roles) {
    userRoles.value = auth.user.roles.map((r: any) => r.role_code)
  }
}
loadRoles()
const isSuperAdmin = computed(() => userRoles.value.includes('eUser-SuperAdmin'))
const vendorId = computed(() => auth.user?.vendor_id)
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(5)

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedBooking = ref<Booking | null>(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
})

async function fetchBookings() {
  try {
    let url = `${apiUrl}/api/bookings`
    if (vendorId.value) url += `?vendorId=${vendorId.value}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch bookings')
    const json = await res.json()
    bookings.value = json.data || []
  } catch (err) {
    console.error('Error fetching bookings:', err)
    bookings.value = []
  }
}

onMounted(() => {
  fetchBookings()
})

function openEdit(b: Booking) {
  selectedBooking.value = { ...b }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(b: Booking) {
  selectedBooking.value = { ...b }
  modalMode.value = 'detail'
  modalVisible.value = true
}

function getVendorNames(b: Booking): string {
  const names = new Set<string>()
  b.booking_packages?.forEach(bp => {
    if (bp.package.vendor?.business_name) names.add(bp.package.vendor.business_name)
  })
  return [...names].join(', ') || '-'
}

async function handleSave(data: BookingForm) {
  const body = {
    id_user: data.id_user,
    package_ids: data.package_ids,
    event_date: data.event_date,
    event_location: data.event_location,
    total_price: data.total_price,
    dp_amount: data.dp_amount,
    status: data.status,
    notes: data.notes,
  }

  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to create booking')
      }
      await fetchBookings()
      Toast.fire({
        icon: 'success',
        title: 'Booking created successfully'
      })
    } catch (err: any) {
      console.error('Error creating booking:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to create booking'
      })
    }
  } else if (modalMode.value === 'edit' && selectedBooking.value) {
    try {
      const res = await fetch(`${apiUrl}/api/bookings/${selectedBooking.value.id_booking}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to update booking')
      }
      await fetchBookings()
      Toast.fire({
        icon: 'success',
        title: 'Booking updated successfully'
      })
    } catch (err: any) {
      console.error('Error updating booking:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to update booking'
      })
    }
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "This will soft-delete the booking.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${apiUrl}/api/bookings/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to delete booking')
      }
      await fetchBookings()
      Toast.fire({
        icon: 'success',
        title: 'Booking deleted successfully.'
      })
    } catch (err: any) {
      console.error('Error deleting booking:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to delete booking'
      })
    }
  }
}

// Sorting and Filtering
const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = bookings.value
  if (q) {
    result = result.filter(b =>
      (b.customer?.full_name?.toLowerCase() || '').includes(q) ||
      b.booking_packages?.some(bp => bp.package.vendor?.business_name?.toLowerCase()?.includes(q)) ||
      (b.booking_packages?.map(bp => bp.package.name).join(', ')?.toLowerCase() || '').includes(q) ||
      (b.status?.toLowerCase() || '').includes(q) ||
      (b.event_location?.toLowerCase() || '').includes(q)
    )
  }

  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'customer_name') {
      va = (a.customer?.full_name || '').toLowerCase()
      vb = (b.customer?.full_name || '').toLowerCase()
    } else if (col === 'vendor_name') {
      va = getVendorNames(a).toLowerCase()
      vb = getVendorNames(b).toLowerCase()
    } else if (col === 'package_name') {
      va = (a.booking_packages?.map(bp => bp.package.name).join(', ') || '').toLowerCase()
      vb = (b.booking_packages?.map(bp => bp.package.name).join(', ') || '').toLowerCase()
    } else {
      va = String(a[col as keyof Booking] ?? '').toLowerCase()
      vb = String(b[col as keyof Booking] ?? '').toLowerCase()
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
  <div class="card">
    <div class="card-header">
      <h5>Bookings Management</h5>
      
    </div>

    <div class="card-body">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <!-- <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Create Booking
          </button> -->
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="margin: 0;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              v-model="search"
              class="form-control"
              placeholder="Search by customer, vendor, package, status..."
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
                  { key: 'customer_name', label: 'Customer' },
                  { key: 'vendor_name', label: 'Vendor' },
                  { key: 'package_name', label: 'Package' },
                  { key: 'event_date', label: 'Event Date' },
                  { key: 'total_price', label: 'Total Price' },
                  { key: 'dp_amount', label: 'DP Amount' },
                  { key: 'status', label: 'Status' },
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
            <tr v-for="b in paginated" :key="b.id_booking">
              <td>{{ b.customer?.full_name || '-' }}</td>
              <td>{{ getVendorNames(b) }}</td>
              <td>{{ b.booking_packages?.map(bp => bp.package.name).join(', ') || '-' }}</td>
              <td>{{ new Date(b.event_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) }}</td>
              <td>{{ formatCurrency(b.total_price) }}</td>
              <td>{{ formatCurrency(b.dp_amount) }}</td>
              <td>
                <span
                  :class="{
                    'label label-success': b.status === 'completed',
                    'label label-info': b.status === 'confirmed',
                    'label label-warning': b.status === 'pending',
                    'label label-danger': b.status === 'cancelled',
                  }"
                  style="font-size: 13px; text-transform: uppercase;"
                >{{ b.status }}</span>
              </td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary" @click="openDetail(b)"><i class="fa fa-eye"></i></button>
                <button v-if="isSuperAdmin" class="btn btn-info" @click="openEdit(b)"><i class="fa fa-pencil"></i></button>
                <button v-if="isSuperAdmin" class="btn btn-danger" @click="handleDelete(b.id_booking)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="8" style="text-align: center;">No bookings found.</td>
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

  <BookingModal
    :visible="modalVisible"
    :mode="modalMode"
    :booking="selectedBooking"
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
