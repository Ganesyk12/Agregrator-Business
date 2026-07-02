<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserModal, { type UserForm } from '../components/UserModal.vue'
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

interface User {
  id_user: number
  email: string
  full_name: string
  phone: string | null
  role_code: string
  is_active: boolean
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  role?: {
    id_role: number
    role_code: string
    name: string
  }
}

const users = ref<User[]>([])
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchUsers() {
  try {
    const res = await fetch(`${apiUrl}/api/users`)
    if (!res.ok) throw new Error('Failed to fetch users')
    const json = await res.json()
    users.value = json.data || []
  } catch (err) {
    console.error('Error fetching users:', err)
  }
}

onMounted(() => {
  fetchUsers()
})

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedUser = ref<User | null>(null)

function openAdd() {
  modalMode.value = 'add'
  selectedUser.value = null
  modalVisible.value = true
}

function openEdit(u: User) {
  modalMode.value = 'edit'
  selectedUser.value = u
  modalVisible.value = true
}

function openDetail(u: User) {
  modalMode.value = 'detail'
  selectedUser.value = u
  modalVisible.value = true
}

async function handleSave(data: UserForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password || undefined,
          full_name: data.full_name,
          role_code: data.role_code,
          phone: data.phone || undefined,
        })
      })
      if (!res.ok) throw new Error('Failed to create user')
      await fetchUsers()
      Toast.fire({
        icon: 'success',
        title: 'User created successfully'
      })
    } catch (err) {
      console.error('Error creating user:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to create user'
      })
    }
  } else if (modalMode.value === 'edit' && selectedUser.value) {
    try {
      const res = await fetch(`${apiUrl}/api/users/${selectedUser.value.id_user}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          full_name: data.full_name,
          role_code: data.role_code,
          phone: data.phone || null,
          status: data.status,
          is_active: data.is_active,
        })
      })
      if (!res.ok) throw new Error('Failed to update user')
      await fetchUsers()
      Toast.fire({
        icon: 'success',
        title: 'User updated successfully'
      })
    } catch (err) {
      console.error('Error updating user:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to update user'
      })
    }
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this! If this user is a vendor, their vendor profile will also be deleted.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      await fetchUsers()
      Toast.fire({
        icon: 'success',
        title: 'User has been deleted.'
      })
    } catch (err) {
      console.error('Error deleting user:', err)
      Toast.fire({
        icon: 'error',
        title: 'Failed to delete user.'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof User>('full_name')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = users.value
  if (q) {
    result = result.filter(u =>
      (u.full_name?.toLowerCase() || '').includes(q) ||
      (u.email?.toLowerCase() || '').includes(q) ||
      (u.phone?.toLowerCase() || '').includes(q) ||
      (u.role?.name?.toLowerCase() || u.role_code?.toLowerCase() || '').includes(q) ||
      (u.status?.toLowerCase() || '').includes(q)
    )
  }
  const col = sortColumn.value
  const dir = sortDirection.value
  result = [...result].sort((a, b) => {
    let va = ''
    let vb = ''
    if (col === 'role') {
      va = (a.role?.name || a.role_code || '').toLowerCase()
      vb = (b.role?.name || b.role_code || '').toLowerCase()
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

function setSort(col: keyof User) {
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
      <h2>Users Management</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add User
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search users..."
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
                  { key: 'full_name', label: 'Full Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'role', label: 'Role' },
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
            <tr v-for="u in paginated" :key="u.id_user">
              <td>{{ u.full_name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone || '-' }}</td>
              <td>{{ u.role?.name || u.role_code }}</td>
              <td>
                <span
                  :class="{
                    'label label-success': u.status === 'active',
                    'label label-danger': u.status === 'inactive',
                  }"
                >{{ u.status }}</span>
              </td>
              <td>{{ u.user_modified || '-' }}</td>
              <td>{{ new Date(u.date_created).toLocaleDateString() }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary" @click="openDetail(u)"><i class="fa fa-eye"></i></button>
                <button class="btn btn-info" @click="openEdit(u)"><i class="fa fa-pencil"></i></button>
                <button class="btn btn-danger" @click="handleDelete(u.id_user)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="8" style="text-align: center;">No users found.</td>
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

  <UserModal
    :visible="modalVisible"
    :mode="modalMode"
    :user="selectedUser"
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
