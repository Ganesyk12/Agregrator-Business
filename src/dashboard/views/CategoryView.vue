<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CategoryModal, { type CategoryForm } from '../components/CategoryModal.vue'
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

interface Category {
  id_category: number
  category_name: string
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
}

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedCategory = ref<Category | null>(null)
const categories = ref<Category[]>([])

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchCategories() {
  try {
    const res = await fetch(`${apiUrl}/api/categories`)
    const json = await res.json()
    if (!json.data) {
      categories.value = []
    } else {
      categories.value = json.data
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
    categories.value = []
  }
}

onMounted(() => {
  fetchCategories()
})

function openAdd() {
  selectedCategory.value = null
  modalMode.value = 'add'
  modalVisible.value = true
}

function openEdit(c: Category) {
  selectedCategory.value = { ...c }
  modalMode.value = 'edit'
  modalVisible.value = true
}

function openDetail(c: Category) {
  selectedCategory.value = { ...c }
  modalMode.value = 'detail'
  modalVisible.value = true
}

async function handleSave(data: CategoryForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: data.category_name,
        })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to create category')
      }
      await fetchCategories()
      Toast.fire({
        icon: 'success',
        title: 'Category created successfully'
      })
    } catch (err: any) {
      console.error('Error creating category:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to create category'
      })
    }
  } else if (modalMode.value === 'edit' && selectedCategory.value) {
    try {
      const res = await fetch(`${apiUrl}/api/categories/${selectedCategory.value.id_category}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: data.category_name,
        })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to update category')
      }
      await fetchCategories()
      Toast.fire({
        icon: 'success',
        title: 'Category updated successfully'
      })
    } catch (err: any) {
      console.error('Error updating category:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to update category'
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
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to delete category')
      }
      await fetchCategories()
      Toast.fire({
        icon: 'success',
        title: 'Category has been deleted.'
      })
    } catch (err: any) {
      console.error('Error deleting category:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to delete category'
      })
    }
  }
}

const search = ref('')
const sortColumn = ref<keyof Category>('category_name')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const perPage = ref(5)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = categories.value
  if (q) {
    result = result.filter(c =>
      (c.category_name?.toLowerCase() || '').includes(q) ||
      (c.status?.toLowerCase() || '').includes(q)
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

function setSort(col: keyof Category) {
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
  <div class="card">
    <div class="card-header">
      <h5>Categories Management</h5>
      
    </div>

    <div class="card-body">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add Category
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 250px; float: right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search categories..."
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
                  { key: 'category_name', label: 'Category Name' },
                  { key: 'status', label: 'Status' },
                  { key: 'user_modified', label: 'Modified By' },
                  { key: 'date_created', label: 'Created' },
                ] as { key: keyof Category; label: string }[])"
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
            <tr v-for="c in paginated" :key="c.id_category">
              <td>{{ c.category_name }}</td>
              <td>
                <span
                  :class="{
                    'label label-success': c.status === 'active',
                    'label label-danger': c.status === 'deleted' || c.status === 'inactive',
                  }"
                >{{ c.status }}</span>
              </td>
              <td>{{ c.user_modified || '-' }}</td>
              <td>{{ new Date(c.date_created).toLocaleDateString() }}</td>
              <td style="white-space: nowrap;">
                <button class="btn btn-primary" @click="openDetail(c)"><i class="fa fa-eye"></i></button>
                <button class="btn btn-info" @click="openEdit(c)"><i class="fa fa-pencil"></i></button>
                <button class="btn btn-danger" @click="handleDelete(c.id_category)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0">
              <td colspan="5" style="text-align: center;">No categories found.</td>
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

  <CategoryModal
    :visible="modalVisible"
    :mode="modalMode"
    :category="selectedCategory"
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
