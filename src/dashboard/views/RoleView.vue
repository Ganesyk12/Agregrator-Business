<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import RoleModal, { type RoleForm } from '../components/RoleModal.vue'
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

interface Role {
  id_role: number
  role_code: string
  name: string
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
}

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedRole = ref<Role | null>(null)
const roles = ref<Role[]>([])

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchRoles() {
  try {
    const res = await fetch(`${apiUrl}/api/roles`)
    const json = await res.json()
    if (!json.data) {
      roles.value = []
    } else {
      roles.value = json.data
    }
  } catch (err) {
    console.error('Error fetching roles:', err)
    roles.value = []
  }
}

onMounted(() => {
  fetchRoles()
})

function openAdd() {
  selectedRole.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openEdit(r: Role) {
  selectedRole.value = { ...r }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(r: Role) {
  selectedRole.value = { ...r }
  modalMode.value = 'detail'
  modalVisible.value = true
}

async function handleSave(data: RoleForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_code: data.role_code,
          name: data.name,
        })
      })
      if (!res.ok) throw new Error('Failed to create role')
      await fetchRoles()
      Toast.fire({
        icon: 'success',
        title: 'Role created successfully'
      })
    } catch (err) {
      console.error('Error creating role:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to create role'
      })
    }
  } else if (modalMode.value === 'edit' && selectedRole.value) {
    try {
      const res = await fetch(`${apiUrl}/api/roles/${selectedRole.value.role_code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
        })
      })
      if (!res.ok) throw new Error('Failed to update role')
      await fetchRoles()
      Toast.fire({
        icon: 'success',
        title: 'Role updated successfully'
      })
    } catch (err) {
      console.error('Error updating role:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update role'
      })
    }
  }
  modalVisible.value = false
}

async function handleDelete(code: string) {
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
      const res = await fetch(`${apiUrl}/api/roles/${code}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deleted' }),
      })
      if (!res.ok) throw new Error('Failed to delete role')
      await fetchRoles()
      Toast.fire({
        icon: 'success',
        title: 'Role has been deleted.'
      })
    } catch (err) {
      console.error('Error deleting role:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete role.'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof Role>('role_code')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = roles.value
  if (q) {
    result = result.filter(r =>
      (r.role_code?.toLowerCase() || '').includes(q) ||
      (r.name?.toLowerCase() || '').includes(q) ||
      (r.status?.toLowerCase() || '').includes(q)
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

function setSort(col: keyof Role) {
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
      <h2>Roles Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add Role
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search roles..."
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
                { key: 'role_code', label: 'Role Code' },
                { key: 'name', label: 'Name' },
                { key: 'status', label: 'Status' },
                { key: 'user_created', label: 'Created By' },
                { key: 'user_modified', label: 'Modified By' },
                { key: 'date_created', label: 'Created' },
              ] as { key: keyof Role; label: string }[])"
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
           <tr v-for="r in paginated" :key="r.role_code">
            <td>{{ r.role_code }}</td>
            <td>{{ r.name }}</td>
            <td>
              <span
                :class="{
                  'label label-success': r.status === 'active',
                  'label label-danger': r.status === 'deleted',
                }"
              >{{ r.status }}</span>
            </td>
            <td>{{ r.user_created || '-' }}</td>
            <td>{{ r.user_modified || '-' }}</td>
            <td>{{ new Date(r.date_created).toLocaleDateString() }}</td>
            <td style="white-space: nowrap;">
              <button class="btn btn-primary" @click="openDetail(r)"><i class="fa fa-eye"></i></button>
              <button class="btn btn-info" @click="openEdit(r)"><i class="fa fa-pencil"></i></button>
              <button class="btn btn-danger" @click="handleDelete(r.role_code)"><i class="fa fa-trash"></i></button>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td colspan="7" style="text-align: center;">No roles found.</td>
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

  <RoleModal
    :visible="modalVisible"
    :mode="modalMode"
    :role="selectedRole"
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
