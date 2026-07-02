<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VendorModal, { type VendorForm } from '../components/VendorModal.vue'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

interface Vendor {
  id_vendor: number
  business_name: string
  description: string
  category: string
  location: string
  status: string
  verified_at: string | null
  user_modified: string | null
  date_created: string
}

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedVendor = ref<Vendor | null>(null)
const vendors = ref<Vendor[]>([])

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchVendors() {
  try {
    const res = await fetch(`${apiUrl}/api/vendors`)
    const json = await res.json()
    // Handle return null jika blm ada data
    if (!json.data) {
      vendors.value = []
    } else {
      vendors.value = json.data
    }
  } catch (err) {
    console.error('Error fetching vendors:', err)
    vendors.value = []
  }
}

onMounted(() => {
  fetchVendors()
})

function openAdd() {
  selectedVendor.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openEdit(v: Vendor) {
  selectedVendor.value = { ...v }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(v: Vendor) {
  selectedVendor.value = { ...v }
  modalMode.value = 'detail'
  modalVisible.value = true
}

async function handleSave(data: VendorForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: data.business_name,
          description: data.description,
          category: data.category,
          location: data.location,
        })
      })
      if (!res.ok) throw new Error('Failed to create vendor')
      await fetchVendors()
      Toast.fire({
        icon: 'success',
        title: 'Vendor created successfully'
      })
    } catch (err) {
      console.error('Error creating vendor:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to create vendor'
      })
    }
  } else if (modalMode.value === 'edit' && selectedVendor.value) {
    try {
      const res = await fetch(`${apiUrl}/api/vendors/${selectedVendor.value.id_vendor}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: data.business_name,
          description: data.description,
          category: data.category,
          location: data.location,
          status: data.status,
        })
      })
      if (!res.ok) throw new Error('Failed to update vendor')
      await fetchVendors()
      Toast.fire({
        icon: 'success',
        title: 'Vendor updated successfully'
      })
    } catch (err) {
      console.error('Error updating vendor:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update vendor'
      })
    }
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${apiUrl}/api/vendors/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete vendor')
      await fetchVendors()
      Toast.fire({
        icon: 'success',
        title: 'Vendor has been deleted.'
      })
    } catch (err) {
      console.error('Error deleting vendor:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete vendor.'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof Vendor>('id_vendor')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = vendors.value
  if (q) {
    result = result.filter(v =>
      (v.business_name?.toLowerCase() || '').includes(q) ||
      (v.description?.toLowerCase() || '').includes(q) ||
      (v.category?.toLowerCase() || '').includes(q) ||
      (v.location?.toLowerCase() || '').includes(q) ||
      (v.status?.toLowerCase() || '').includes(q)
    )
  }
  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    const va = String(a[col] ?? '').toLowerCase()
    const vb = String(b[col] ?? '').toLowerCase()
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})

function setSort(col: keyof Vendor) {
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
</script>

<template>
  <div class="x_panel">
    <div class="x_title">
      <h2>Vendors Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add Vendor
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search vendors..."
              v-model="search"
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
                { key: 'business_name', label: 'Business Name' },
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category' },
                { key: 'location', label: 'Location' },
                { key: 'verified_at', label: 'Verified At' },
                { key: 'status', label: 'Status' },
                { key: 'user_modified', label: 'Modified By' },
                { key: 'date_created', label: 'Created' },
              ] as { key: keyof Vendor; label: string }[])"
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
           <tr v-for="v in paginated" :key="v.id_vendor">
            <td>{{ v.business_name }}</td>
            <td>{{ v.description || '-' }}</td>
            <td>{{ v.category }}</td>
            <td>{{ v.location || '-' }}</td>
            <td>{{ v.verified_at ? new Date(v.verified_at).toLocaleDateString() : '-' }}</td>
            <td>
              <span
                :class="{
                  'label label-success': v.status === 'approved',
                  'label label-warning': v.status === 'pending',
                  'label label-danger': v.status === 'rejected',
                }"
              >{{ v.status }}</span>
            </td>
            <td>{{ v.user_modified || '-' }}</td>
            <td>{{ new Date(v.date_created).toLocaleDateString() }}</td>
            <td style="white-space: nowrap;">
              <button class="btn btn-primary" @click="openDetail(v)"><i class="fa fa-eye"></i></button>
              <button class="btn btn-info" @click="openEdit(v)"><i class="fa fa-pencil"></i></button>
              <button class="btn btn-danger" @click="handleDelete(v.id_vendor)"><i class="fa fa-trash"></i></button>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td colspan="9" style="text-align: center;">No vendors found.</td>
          </tr>
        </tbody>
      </table>
      </div>

      <div class="row">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <p>
            Showing {{ ((currentPage - 1) * perPage) + 1 }}
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

  <VendorModal
    :visible="modalVisible"
    :mode="modalMode"
    :vendor="selectedVendor"
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
