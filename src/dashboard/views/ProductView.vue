<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ProductModal, { type ProductForm } from '../components/ProductModal.vue'
import ProductWizard from '../components/wizard/ProductWizard.vue'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })
const auth = useAuthStore()

interface Product {
  id_product: number; id_vendor: number; name: string; description: string | null
  price: number; stock: number; status: string; estimated_delivery: string | null
  date_created: string; date_modified: string
  vendor?: { business_name: string }
  labels?: string; type_name?: string | null; size_name?: string | null
  images?: Array<{ image_url: string }>
  variants?: Array<{ name: string; price_adjust: number; stock: number }>
  addons?: Array<{ name: string; price: number }>
}

const products = ref<Product[]>([])
const vendors = ref<Array<{ id_vendor: number; business_name: string; vendor_code: string }>>([])
const occasions = ref<Array<{ id_occasion: number; name: string }>>([])
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const vendorId = computed(() => auth.user?.vendor_id)

async function fetchProducts() {
  try {
    let url = `${apiUrl}/api/products`
    if (vendorId.value) url += `?vendorId=${vendorId.value}`
    const res = await fetch(url)
    if (!res.ok) throw new Error()
    const json = await res.json()
    products.value = json.data || []
  } catch (err) { console.error(err) }
}

async function fetchVendors() {
  try {
    const res = await fetch(`${apiUrl}/api/vendors`)
    if (!res.ok) throw new Error()
    const json = await res.json()
    vendors.value = (json.data || []).map((v: any) => ({ id_vendor: v.id_vendor, business_name: v.business_name, vendor_code: v.vendor_code }))
  } catch (err) { console.error(err) }
}

async function fetchLookups() {
  try {
    const occRes = await fetch(`${apiUrl}/api/products/occasions`)
    if (occRes.ok) occasions.value = (await occRes.json()).data || []
  } catch (err) { console.error(err) }
}

onMounted(() => { fetchProducts(); fetchVendors(); fetchLookups() })

const modalVisible = ref(false)
const wizardVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedProduct = ref<Product | null>(null)

function openAdd() { wizardVisible.value = true }
function openEdit(p: Product) { modalMode.value = 'edit'; selectedProduct.value = p; modalVisible.value = true }
function openDetail(p: Product) { modalMode.value = 'detail'; selectedProduct.value = p; modalVisible.value = true }

async function handleSave(data: ProductForm) {
  const body: any = {
    id_vendor: vendorId.value || Number(data.id_vendor),
    occasion_ids: data.occasion_ids,
    type_name: data.type_name || null,
    size_name: data.size_name || null,
    name: data.name,
    price: Number(data.price),
    stock: Number(data.stock),
    description: data.description,
    estimated_delivery: data.estimated_delivery,
    delivery_info: data.delivery_info,
    images: data.images.map(img => ({ image_url: img.image_url, caption: img.caption })),
    variants: data.variants.map(v => ({ name: v.name, price_adjust: Number(v.price_adjust), stock: Number(v.stock) })),
    addons: data.addons.map(a => ({ name: a.name, price: Number(a.price), description: a.description })),
  }

  try {
    if (modalMode.value === 'add') {
      const res = await fetch(`${apiUrl}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'Failed to create') }
      Toast.fire({ icon: 'success', title: 'Product created' })
    } else if (modalMode.value === 'edit' && selectedProduct.value) {
      const res = await fetch(`${apiUrl}/api/products/${selectedProduct.value.id_product}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'Failed to update') }
      Toast.fire({ icon: 'success', title: 'Product updated' })
    }
    await fetchProducts()
  } catch (err: any) { Toast.fire({ icon: 'error', title: err.message }) }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' })
  if (!result.isConfirmed) return
  try {
    const res = await fetch(`${apiUrl}/api/products/${id}`, { method: 'DELETE' })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'Failed to delete') }
    await fetchProducts()
    Toast.fire({ icon: 'success', title: 'Product deleted' })
  } catch (err: any) { Toast.fire({ icon: 'error', title: err.message }) }
}

const search = ref('')
const currentPage = ref(1)
const perPage = ref(10)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let r = products.value
  if (q) r = r.filter(p => (p.name || '').toLowerCase().includes(q) || (p.vendor?.business_name || '').toLowerCase().includes(q) || (p.labels || '').toLowerCase().includes(q))
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => { const s = (currentPage.value - 1) * perPage.value; return filtered.value.slice(s, s + perPage.value) })
function goPage(page: number) { if (page >= 1 && page <= totalPages.value) currentPage.value = page }
const visiblePages = computed(() => {
  const t = totalPages.value, c = currentPage.value
  const pages: number[] = []
  let s = Math.max(1, c - 2), e = Math.min(t, c + 2)
  if (e - s < 4) { if (s === 1) e = Math.min(t, s + 4); else s = Math.max(1, e - 4) }
  for (let i = s; i <= e; i++) pages.push(i)
  return pages
})

function formatCurrency(value: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) }
</script>

<template>
  <div class="x_panel">
    <div class="x_title" style="display:flex; align-items:center; justify-content:space-between;">
      <h2 style="margin: 0; float: none; display: inline-block;">Product Management</h2>
      <button class="btn btn-success" @click="openAdd" style="margin: 0;">
        <i class="fa fa-plus"></i> Add Product
      </button>
    </div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12">
          <div class="input-group" style="max-width:250px; float:right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Search products..." v-model="search" @input="currentPage=1" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Product Name</th><th>Vendor</th><th>Occasion</th><th>Type</th><th>Size</th><th>Price</th><th>Stock</th><th>Status</th><th style="width:120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginated" :key="p.id_product">
              <td>{{ p.name }}</td>
              <td>{{ p.vendor?.business_name || '-' }}</td>
              <td>
                <span v-if="p.labels" class="label label-primary" style="margin-right:2px;" v-for="lbl in (p.labels || '').split(',').filter(Boolean)" :key="lbl">{{ lbl.charAt(0).toUpperCase()+lbl.slice(1) }}</span>
                <span v-else>-</span>
              </td>
              <td>{{ p.type_name || '-' }}</td>
              <td>{{ p.size_name || '-' }}</td>
              <td>{{ formatCurrency(p.price) }}</td>
              <td>{{ p.stock }}</td>
              <td><span :class="'label label-' + (p.status === 'active' ? 'success' : 'danger')">{{ p.status }}</span></td>
              <td style="white-space:nowrap;">
                <button class="btn btn-primary" @click="openDetail(p)"><i class="fa fa-eye"></i></button>
                <button class="btn btn-info" @click="openEdit(p)"><i class="fa fa-pencil"></i></button>
                <button class="btn btn-danger" @click="handleDelete(p.id_product)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="9" style="text-align:center;">No products found.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-md-6"><p>Showing {{ filtered.length > 0 ? ((currentPage - 1) * perPage) + 1 : 0 }} to {{ Math.min(currentPage * perPage, filtered.length) }} of {{ filtered.length }} entries</p></div>
        <div class="col-md-6"><nav style="float:right;"><ul class="pagination" style="margin:0;">
          <li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(1)">&laquo;</a></li>
          <li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(currentPage-1)">&lsaquo;</a></li>
          <li v-for="p in visiblePages" :key="p" :class="{active:p===currentPage}"><a @click.prevent="goPage(p)">{{ p }}</a></li>
          <li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(currentPage+1)">&rsaquo;</a></li>
          <li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(totalPages)">&raquo;</a></li>
        </ul></nav></div>
      </div>
    </div>
  </div>
  <ProductModal :visible="modalVisible" :mode="modalMode" :product="selectedProduct" :vendors="vendors" :occasions="occasions" @close="modalVisible=false" @save="handleSave" />
  <ProductWizard v-if="wizardVisible" @close="wizardVisible=false" @saved="wizardVisible=false; fetchProducts()" />
</template>
