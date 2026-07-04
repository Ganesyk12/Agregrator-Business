<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserRoleModal, { type UserRoleForm } from '../components/UserRoleModal.vue'
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

interface UserRole {
  iduser_role: number
  email: string
  role_code: string
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  user?: {
    id_user: number
    email: string
    full_name: string
  }
  role?: {
    id_role: number
    role_code: string
    name: string
  }
}

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedUserRole = ref<UserRole | null>(null)
const userRoles = ref<UserRole[]>([])

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchUserRoles() {
  try {
    const res = await fetch(`${apiUrl}/api/user-roles`)
    const json = await res.json()
    userRoles.value = json.data || []
  } catch (err) {
    console.error('Error fetching user roles:', err)
    userRoles.value = []
  }
}

onMounted(() => {
  fetchUserRoles()
})

function openAdd() {
  selectedUserRole.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openEdit(ur: UserRole) {
  selectedUserRole.value = { ...ur }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(ur: UserRole) {
  selectedUserRole.value = { ...ur }
  modalMode.value = 'detail'
  modalVisible.value = true
}

async function handleSave(data: UserRoleForm) {
  if (modalMode.value === 'add') {
    let success = true
    for (const rc of data.role_codes) {
      try {
        const res = await fetch(`${apiUrl}/api/user-roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email, role_code: rc })
        })
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}))
          throw new Error(errBody?.error?.message || `Failed to assign role ${rc}`)
        }
      } catch (err) {
        console.error(`Error assigning role ${rc}:`, err)
        success = false
      }
    }
    if (success) {
      await fetchUserRoles()
      Toast.fire({
        icon: 'success',
        title: 'Roles assigned successfully'
      })
    } else {
      Toast.fire({
        icon: 'error',
        title: 'Failed to assign some roles'
      })
    }
  } else if (modalMode.value === 'edit' && selectedUserRole.value) {
    try {
      const res = await fetch(`${apiUrl}/api/user-roles/${selectedUserRole.value.iduser_role}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_code: data.role_codes[0],
        })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to update user role')
      }
      await fetchUserRoles()
      Toast.fire({
        icon: 'success',
        title: 'User role updated successfully'
      })
    } catch (err) {
      console.error('Error updating user role:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update user role'
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
      const res = await fetch(`${apiUrl}/api/user-roles/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to delete user role')
      }
      await fetchUserRoles()
      Toast.fire({
        icon: 'success',
        title: 'User role has been deleted.'
      })
    } catch (err) {
      console.error('Error deleting user role:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete user role'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof UserRole | 'role_name' | 'user_name'>('email')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = userRoles.value
  if (q) {
    result = result.filter(ur =>
      (ur.email?.toLowerCase() || '').includes(q) ||
      (ur.role_code?.toLowerCase() || '').includes(q) ||
      (ur.role?.name?.toLowerCase() || '').includes(q) ||
      (ur.status?.toLowerCase() || '').includes(q)
    )
  }
  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'role_name') {
      va = (a.role?.name || a.role_code || '').toLowerCase()
      vb = (b.role?.name || b.role_code || '').toLowerCase()
    } else if (col === 'user_name') {
      va = (a.user?.full_name || a.email || '').toLowerCase()
      vb = (b.user?.full_name || b.email || '').toLowerCase()
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
    sortColumn.value = col as keyof UserRole | 'role_name' | 'user_name'
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
      <h2>User Roles Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Assign Role
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search user roles..."
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
                { key: 'user_name', label: 'User' },
                { key: 'email', label: 'Email' },
                { key: 'role_name', label: 'Role' },
                { key: 'role_code', label: 'Role Code' },
                { key: 'status', label: 'Status' },
                { key: 'user_created', label: 'Created By' },
                { key: 'date_created', label: 'Created' },
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
           <tr v-for="ur in paginated" :key="ur.iduser_role">
            <td>{{ ur.user?.full_name || ur.email }}</td>
            <td>{{ ur.email }}</td>
            <td>{{ ur.role?.name || ur.role_code }}</td>
            <td>{{ ur.role_code }}</td>
            <td>
              <span
                :class="{
                  'label label-success': ur.status === 'active',
                  'label label-danger': ur.status === 'inactive',
                }"
              >{{ ur.status }}</span>
            </td>
            <td>{{ ur.user_created || '-' }}</td>
            <td>{{ new Date(ur.date_created).toLocaleDateString() }}</td>
            <td style="white-space: nowrap;">
              <button class="btn btn-primary" @click="openDetail(ur)"><i class="fa fa-eye"></i></button>
              <button class="btn btn-info" @click="openEdit(ur)"><i class="fa fa-pencil"></i></button>
              <button class="btn btn-danger" @click="handleDelete(ur.iduser_role)"><i class="fa fa-trash"></i></button>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td colspan="8" style="text-align: center;">No user roles found.</td>
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

  <UserRoleModal
    :visible="modalVisible"
    :mode="modalMode"
    :userRole="selectedUserRole"
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
