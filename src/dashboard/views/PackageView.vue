<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PackageModal, { type PackageForm } from '../components/PackageModal.vue'
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

interface Package {
  id_package: number
  id_vendor: number
  name: string
  description: string | null
  price: number
  duration: string | null
  whats_included: string | null
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  vendor?: {
    business_name: string
  }
}

const packages = ref<Package[]>([])
const vendors = ref<Array<{ id_vendor: number; business_name: string }>>([])
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchPackages() {
  try {
    const res = await fetch(`${apiUrl}/api/packages`)
    if (!res.ok) throw new Error('Failed to fetch packages')
    const json = await res.json()
    packages.value = json.data || []
  } catch (err) {
    console.error('Error fetching packages:', err)
  }
}

async function fetchVendors() {
  try {
    const res = await fetch(`${apiUrl}/api/vendors`)
    if (!res.ok) throw new Error('Failed to fetch vendors')
    const json = await res.json()
    // Make sure we only map vendors that are valid
    vendors.value = (json.data || []).map((v: any) => ({
      id_vendor: v.id_vendor,
      business_name: v.business_name
    }))
  } catch (err) {
    console.error('Error fetching vendors:', err)
  }
}

onMounted(() => {
  fetchPackages()
  fetchVendors()
})

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedPackage = ref<Package | null>(null)

function openAdd() {
  modalMode.value = 'add'
  selectedPackage.value = null
  modalVisible.value = true
}

function openEdit(pkg: Package) {
  modalMode.value = 'edit'
  selectedPackage.value = pkg
  modalVisible.value = true
}

function openDetail(pkg: Package) {
  modalMode.value = 'detail'
  selectedPackage.value = pkg
  modalVisible.value = true
}

async function handleSave(data: PackageForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/packages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_vendor: Number(data.id_vendor),
          name: data.name,
          price: Number(data.price),
          description: data.description,
          duration: data.duration,
          whats_included: data.whats_included,
        })
      })
      if (!res.ok) throw new Error('Failed to create package')
      await fetchPackages()
      Toast.fire({
        icon: 'success',
        title: 'Package created successfully'
      })
    } catch (err) {
      console.error('Error creating package:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to create package'
      })
    }
  } else if (modalMode.value === 'edit' && selectedPackage.value) {
    try {
      const res = await fetch(`${apiUrl}/api/packages/${selectedPackage.value.id_package}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          price: Number(data.price),
          description: data.description,
          duration: data.duration,
          whats_included: data.whats_included,
          status: data.status,
        })
      })
      if (!res.ok) throw new Error('Failed to update package')
      await fetchPackages()
      Toast.fire({
        icon: 'success',
        title: 'Package updated successfully'
      })
    } catch (err) {
      console.error('Error updating package:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update package'
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
      const res = await fetch(`${apiUrl}/api/packages/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete package')
      await fetchPackages()
      Toast.fire({
        icon: 'success',
        title: 'Package has been deleted.'
      })
    } catch (err) {
      console.error('Error deleting package:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete package.'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof Package>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = packages.value
  if (q) {
    result = result.filter(p =>
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.vendor?.business_name?.toLowerCase() || '').includes(q) ||
      (p.description?.toLowerCase() || '').includes(q) ||
      (p.duration?.toLowerCase() || '').includes(q) ||
      (p.status?.toLowerCase() || '').includes(q) ||
      String(p.price).includes(q)
    )
  }
  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'vendor') {
      va = (a.vendor?.business_name || '').toLowerCase()
      vb = (b.vendor?.business_name || '').toLowerCase()
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

function setSort(col: keyof Package) {
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
      <h2>Packages Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add Package
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search packages..."
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
                  { key: 'name', label: 'Package Name' },
                  { key: 'vendor', label: 'Vendor' },
                  { key: 'price', label: 'Price' },
                  { key: 'duration', label: 'Duration' },
                  { key: 'status', label: 'Status' },
                  { key: 'user_modified', label: 'Modified By' },
                  { key: 'date_created', label: 'Created' },
                ] as { key: any; label: string }[])"
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
            <tr v-for="p in paginated" :key="p.id_package">
              <td>{{ p.name }}</td>
              <td>{{ p.vendor?.business_name || '-' }}</td>
              <td>{{ formatCurrency(p.price) }}</td>
              <td>{{ p.duration || '-' }}</td>
              <td>
                <span
                  :class="{
                    'label label-success': p.status === 'active',
                    'label label-danger': p.status === 'inactive',
                  }"
                >{{ p.status }}</span>
              </td>
              <td>{{ p.user_modified || '-' }}</td>
              <td>{{ new Date(p.date_created).toLocaleDateString() }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary" @click="openDetail(p)"><i class="fa fa-eye"></i></button>
                <button class="btn btn-info" @click="openEdit(p)"><i class="fa fa-pencil"></i></button>
                <button class="btn btn-danger" @click="handleDelete(p.id_package)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="8" style="text-align: center;">No packages found.</td>
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

  <PackageModal
    :visible="modalVisible"
    :mode="modalMode"
    :pkg="selectedPackage"
    :vendors="vendors"
    @close="modalVisible = false"
    @save="handleSave"
  />
</template>

<style scoped>
.table-wrap th {
  background: #f5f7fa;
}
.table-wrap td {
  vertical-align: middle;
}
</style>
