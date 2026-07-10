<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PortfolioModal, { type PortfolioForm } from '../components/PortfolioModal.vue'
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

interface Portfolio {
  id_portfolio: number
  id_vendor: number
  cover_url: string
  code: string
  title: string
  description: string | null
  location: string | null
  sort_order: number
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  vendor?: {
    business_name: string
  }
}

const portfolios = ref<Portfolio[]>([])
const vendors = ref<Array<{ id_vendor: number; business_name: string }>>([])
const packages = ref<any[]>([])
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedPortfolio = ref<Portfolio | null>(null)

async function fetchPortfolios() {
  try {
    const res = await fetch(`${apiUrl}/api/portfolios`)
    if (!res.ok) throw new Error('Failed to fetch portfolios')
    const json = await res.json()
    portfolios.value = json.data || []
  } catch (err) {
    console.error('Error fetching portfolios:', err)
  }
}

async function fetchVendors() {
  try {
    const res = await fetch(`${apiUrl}/api/vendors`)
    if (!res.ok) throw new Error('Failed to fetch vendors')
    const json = await res.json()
    vendors.value = (json.data || []).map((v: any) => ({
      id_vendor: v.id_vendor,
      vendor_code: v.vendor_code,
      business_name: v.business_name
    }))
  } catch (err) {
    console.error('Error fetching vendors:', err)
  }
}

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

onMounted(() => {
  fetchPortfolios()
  fetchVendors()
  fetchPackages()
})

function openAdd() {
  modalMode.value = 'add'
  selectedPortfolio.value = null
  modalVisible.value = true
}

function openEdit(p: Portfolio) {
  modalMode.value = 'edit'
  selectedPortfolio.value = p
  modalVisible.value = true
}

function openDetail(p: Portfolio) {
  modalMode.value = 'detail'
  selectedPortfolio.value = p
  modalVisible.value = true
}

async function handleSave(data: PortfolioForm) {
  if (modalMode.value === 'add') {
    try {
      const res = await fetch(`${apiUrl}/api/portfolios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_vendor: Number(data.id_vendor),
          id_package: data.id_package ? Number(data.id_package) : null,
          id_category: data.id_category ? Number(data.id_category) : null,
          cover_url: data.cover_url,
          title: data.title,
          description: data.description,
          location: data.location,
          sort_order: portfolios.value.length + 1,
        })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to create portfolio')
      }
      await fetchPortfolios()
      Toast.fire({
        icon: 'success',
        title: 'Portfolio item created successfully'
      })
    } catch (err: any) {
      console.error('Error creating portfolio:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to create portfolio'
      })
    }
  } else if (modalMode.value === 'edit' && selectedPortfolio.value) {
    try {
      const res = await fetch(`${apiUrl}/api/portfolios/${selectedPortfolio.value.id_portfolio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_package: data.id_package ? Number(data.id_package) : null,
          id_category: data.id_category ? Number(data.id_category) : null,
          cover_url: data.cover_url,
          title: data.title,
          description: data.description,
          location: data.location,
          sort_order: selectedPortfolio.value.sort_order,
        })
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to update portfolio')
      }
      await fetchPortfolios()
      Toast.fire({
        icon: 'success',
        title: 'Portfolio item updated successfully'
      })
    } catch (err: any) {
      console.error('Error updating portfolio:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to update portfolio'
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
      const res = await fetch(`${apiUrl}/api/portfolios/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.error?.message || 'Failed to delete portfolio')
      }
      await fetchPortfolios()
      Toast.fire({
        icon: 'success',
        title: 'Portfolio item has been deleted.'
      })
    } catch (err: any) {
      console.error('Error deleting portfolio:', err)
      Toast.fire({
        icon: 'error',
        title: err.message || 'Failed to delete portfolio'
      })
    }
  }
}

const search = ref('')
const currentPage = ref(1)
const perPage = ref(6) // 6 items per page fits a 3-column grid nicely

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let result = portfolios.value
  if (q) {
    result = result.filter(p =>
      (p.title?.toLowerCase() || '').includes(q) ||
      (p.vendor?.business_name?.toLowerCase() || '').includes(q) ||
      (p.location?.toLowerCase() || '').includes(q) ||
      (p.description?.toLowerCase() || '').includes(q)
    )
  }
  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filtered.value.slice(start, start + perPage.value)
})

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

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function onDragStart(index: number) {
  draggedIndex.value = index
}

function onDragEnter(index: number) {
  dragOverIndex.value = index
}

function onDragLeave() {
  dragOverIndex.value = null
}

async function onDrop(targetIndex: number) {
  dragOverIndex.value = null
  if (draggedIndex.value === null || draggedIndex.value === targetIndex) return

  // Reorder list locally
  const list = [...filtered.value]
  const [draggedItem] = list.splice(draggedIndex.value, 1)
  list.splice(targetIndex, 0, draggedItem)

  // Map new sort orders based on new index
  const updatedItems = list.map((item, idx) => ({
    id_portfolio: item.id_portfolio,
    sort_order: idx + 1
  }))

  // Apply locally to portfolios.value
  portfolios.value = portfolios.value.map(p => {
    const updated = updatedItems.find(u => u.id_portfolio === p.id_portfolio)
    if (updated) {
      return { ...p, sort_order: updated.sort_order }
    }
    return p
  }).sort((a, b) => a.sort_order - b.sort_order)

  draggedIndex.value = null

  // Save to database
  try {
    const res = await fetch(`${apiUrl}/api/portfolios/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updatedItems })
    })
    if (!res.ok) throw new Error('Failed to save catalog order')
    Toast.fire({
      icon: 'success',
      title: 'Catalog order updated successfully'
    })
  } catch (err: any) {
    console.error('Error saving catalog order:', err)
    Toast.fire({
      icon: 'error',
      title: 'Failed to save catalog order'
    })
  }
}

function getMediaUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${apiUrl}${url}`
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title">
      <h2>Portfolio Catalog</h2>
      <div class="clearfix"></div>
    </div>

    <div class="x_content">
      <!-- HEADER SEARCH & ADD -->
      <div class="row" style="margin-bottom: 24px;">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <button class="btn btn-success" @click="openAdd">
            <i class="fa fa-plus"></i> Add Catalog Product
          </button>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <div class="input-group" style="max-width: 300px; float: right; margin-bottom: 0;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search catalog..."
              v-model="search"
              @input="currentPage = 1"
            />
          </div>
        </div>
      </div>

      <!-- INFO TIP -->
      <div class="alert alert-info" role="alert" style="margin-bottom: 20px;">
        <i class="fa fa-info-circle"></i> <strong>Tips:</strong> Anda dapat mengurutkan katalog dengan cara menarik (*drag*) kartu produk lalu melepaskannya (*drop*) ke posisi yang diinginkan.
      </div>

      <!-- CATALOG PRODUCT GRID -->
      <div class="row">
        <div 
          v-for="(p, index) in paginated" 
          :key="p.id_portfolio" 
          class="col-md-4 col-sm-6 col-xs-12" 
          style="margin-bottom: 30px;"
          draggable="true"
          @dragstart="onDragStart((currentPage - 1) * perPage + index)"
          @dragover.prevent
          @dragenter="onDragEnter((currentPage - 1) * perPage + index)"
          @dragleave="onDragLeave"
          @drop="onDrop((currentPage - 1) * perPage + index)"
        >
          <div 
            class="portfolio-card"
            :class="{ 'drag-over': dragOverIndex === (currentPage - 1) * perPage + index }"
          >
            <!-- Image Wrapper -->
            <div class="portfolio-card-img-wrapper">
              <img :src="getMediaUrl(p.cover_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'" class="portfolio-card-img" alt="Portfolio Media" />
              <div class="portfolio-card-drag-handle">
                <i class="fa fa-arrows"></i>
              </div>
            </div>
            
            <!-- Card Body -->
            <div class="portfolio-card-body">
              <span class="portfolio-card-vendor">
                <i class="fa fa-shopping-bag"></i> {{ p.vendor?.business_name || 'General Vendor' }}
              </span>
              <h3 class="portfolio-card-title" :title="p.title || 'No Title'">
                {{ p.title || 'No Title' }}
              </h3>
              <p class="portfolio-card-desc">
                {{ p.description || 'No description provided for this catalog product.' }}
              </p>
              
              <!-- Meta Row -->
              <div class="portfolio-card-meta">
                <span class="portfolio-card-location">
                  <i class="fa fa-map-marker"></i> {{ p.location || 'Online' }}
                </span>

              </div>
            </div>
            
            <!-- Actions -->
            <div class="portfolio-card-actions">
              <button class="portfolio-btn detail" @click="openDetail(p)">
                <i class="fa fa-eye"></i> Detail
              </button>
              <button class="portfolio-btn edit" @click="openEdit(p)">
                <i class="fa fa-pencil"></i> Edit
              </button>
              <button class="portfolio-btn delete" @click="handleDelete(p.id_portfolio)">
                <i class="fa fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>

        <div v-if="paginated.length === 0" class="col-xs-12 text-center" style="padding: 40px 0;">
          <i class="fa fa-picture-o" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>
          <span style="color: #777; font-size: 15px;">No catalog products found.</span>
        </div>
      </div>

      <!-- PAGINATION -->
      <div class="row" style="margin-top: 15px;" v-if="filtered.length > 0">
        <div class="col-md-6 col-sm-6 col-xs-12">
          <p style="margin-top: 8px;">
            Showing {{ ((currentPage - 1) * perPage) + 1 }}
            to {{ Math.min(currentPage * perPage, filtered.length) }}
            of {{ filtered.length }} entries
          </p>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12">
          <nav style="float: right;">
            <ul class="pagination" style="margin: 0;">
              <li :class="{ disabled: currentPage === 1 }">
                <a href="#" @click.prevent="goPage(1)">&laquo;</a>
              </li>
              <li :class="{ disabled: currentPage === 1 }">
                <a href="#" @click.prevent="goPage(currentPage - 1)">&lsaquo;</a>
              </li>
              <li
                v-for="p in pageNumbers"
                :key="p"
                :class="{ active: p === currentPage }"
              >
                <a href="#" @click.prevent="goPage(p)">{{ p }}</a>
              </li>
              <li :class="{ disabled: currentPage === totalPages }">
                <a href="#" @click.prevent="goPage(currentPage + 1)">&rsaquo;</a>
              </li>
              <li :class="{ disabled: currentPage === totalPages }">
                <a href="#" @click.prevent="goPage(totalPages)">&raquo;</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <PortfolioModal
    :visible="modalVisible"
    :mode="modalMode"
    :portfolio="selectedPortfolio"
    :vendors="vendors"
    :packages="packages"
    @close="modalVisible = false"
    @save="handleSave"
  />
</template>

<style scoped>
/* Product Catalog Grid Layout styling */
.portfolio-card {
  background: #ffffff;
  border: 1px solid #e1e1e0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: grab;
}

.portfolio-card:active {
  cursor: grabbing;
}

.portfolio-card.drag-over {
  border: 2px dashed #8C907E !important;
  opacity: 0.7;
  transform: scale(0.98);
}

.portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
}

.portfolio-card-img-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.portfolio-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.portfolio-card:hover .portfolio-card-img {
  transform: scale(1.05);
}

.portfolio-card-drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.45);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: grab;
  z-index: 2;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.portfolio-card:hover .portfolio-card-drag-handle {
  opacity: 1;
}

.portfolio-card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.portfolio-card-vendor {
  font-size: 11px;
  color: #8C907E; /* Sage green Kaira branding color */
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 6px;
}

.portfolio-card-title {
  font-size: 17px;
  font-weight: 500;
  color: #111111;
  margin: 0 0 10px 0;
  line-height: 1.4;
  height: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portfolio-card-desc {
  font-size: 13px;
  color: #666666;
  line-height: 1.6;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 62px; /* Fixed height for consistent look */
}

.portfolio-card-meta {
  margin-top: auto;
  border-top: 1px solid #f1f1f0;
  padding-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #555555;
}

.portfolio-card-location i {
  color: #d9534f; /* Red map pin */
  margin-right: 4px;
}

.portfolio-card-actions {
  border-top: 1px solid #e1e1e0;
  background-color: #fafafa;
  display: flex;
  align-items: stretch;
  padding: 0;
}

.portfolio-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 6px;
  font-size: 11px;
  font-weight: 500;
  color: #555555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background-color 0.2s, color 0.2s;
  outline: none;
  margin: 0 !important;
  min-width: 0;
  height: 100%;
}

.portfolio-btn:not(:last-child) {
  border-right: 1px solid #e1e1e0;
}

.portfolio-btn:hover {
  background-color: #f1f1f0;
}

.portfolio-btn.detail:hover {
  color: #34495E;
}

.portfolio-btn.edit:hover {
  color: #3498DB;
}

.portfolio-btn.delete:hover {
  color: #d9534f;
}
</style>
