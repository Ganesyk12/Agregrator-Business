<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Swal from 'sweetalert2'
import CommissionModal, { type CommissionForm } from '../components/CommissionModal.vue'

interface Commission {
  id_commission: number
  id_booking: number
  id_vendor: number
  percentage: number
  amount: number
  status: string
  date_created: string
  vendor?: { id_vendor: number; business_name: string }
  booking?: {
    total_price: number
    customer?: { full_name: string }
    booking_packages?: { package: { name: string; vendor: { id_vendor: number; business_name: string } } }[]
  }
}

const items = ref<Commission[]>([])
const search = ref('')
const sortColumn = ref<keyof Commission | 'customer_name' | 'vendor_name' | 'package_name'>('date_created')
const sortDirection = ref<'asc' | 'desc'>('desc')
const currentPage = ref(1)
const perPage = ref(5)
const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail'>('add')
const selectedItem = ref<Commission | null>(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true })

async function fetchData() {
  try {
    const res = await fetch(`${apiUrl}/api/commissions`)
    if (!res.ok) throw new Error('Failed to fetch')
    const json = await res.json()
    items.value = json.data || []
  } catch (err) {
    console.error(err)
    items.value = []
  }
}

onMounted(fetchData)

function openAdd() { selectedItem.value = null; modalMode.value = 'add'; modalVisible.value = true }
function openEdit(d: Commission) { selectedItem.value = { ...d }; modalMode.value = 'edit'; modalVisible.value = true }
function openDetail(d: Commission) { selectedItem.value = { ...d }; modalMode.value = 'detail'; modalVisible.value = true }

async function handleSave(data: CommissionForm) {
  try {
    if (modalMode.value === 'add') {
      const res = await fetch(`${apiUrl}/api/commissions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || 'Failed') }
    } else if (modalMode.value === 'edit' && selectedItem.value) {
      const res = await fetch(`${apiUrl}/api/commissions/${selectedItem.value.id_commission}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || 'Failed') }
    }
    await fetchData()
    Toast.fire({ icon: 'success', title: modalMode.value === 'add' ? 'Commission created' : 'Commission updated' })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
  modalVisible.value = false
}

async function handleDelete(id: number) {
  const result = await Swal.fire({ title: 'Are you sure?', text: 'This will soft-delete the commission.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' })
  if (!result.isConfirmed) return
  try {
    const res = await fetch(`${apiUrl}/api/commissions/${id}`, { method: 'DELETE' })
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || 'Failed') }
    await fetchData()
    Toast.fire({ icon: 'success', title: 'Commission deleted' })
  } catch (err: any) { Toast.fire({ icon: 'error', title: err.message }) }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  let r = items.value
  if (q) r = r.filter(d =>
    (d.booking?.customer?.full_name || '').toLowerCase().includes(q) ||
    (d.vendor?.business_name || '').toLowerCase().includes(q) ||
    (d.booking?.booking_packages?.map(bp=>bp.package.name).join(', ') || '').toLowerCase().includes(q) ||
    d.status.toLowerCase().includes(q)
  )
  const col = sortColumn.value; const dir = sortDirection.value
  r = [...r].sort((a, b) => {
    let va = '', vb = ''
    if (col === 'customer_name') { va = (a.booking?.customer?.full_name || '').toLowerCase(); vb = (b.booking?.customer?.full_name || '').toLowerCase() }
    else if (col === 'vendor_name') { va = (a.vendor?.business_name || '').toLowerCase(); vb = (b.vendor?.business_name || '').toLowerCase() }
    else if (col === 'package_name') { va = (a.booking?.booking_packages?.map(bp=>bp.package.name).join(', ') || '').toLowerCase(); vb = (b.booking?.booking_packages?.map(bp=>bp.package.name).join(', ') || '').toLowerCase() }
    else { va = String(a[col as keyof Commission] ?? '').toLowerCase(); vb = String(b[col as keyof Commission] ?? '').toLowerCase() }
    return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
  return r
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
const paginated = computed(() => { const s = (currentPage.value - 1) * perPage.value; return filtered.value.slice(s, s + perPage.value) })
function setSort(col: string) { if (sortColumn.value === col) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'; else { sortColumn.value = col as any; sortDirection.value = 'asc' } currentPage.value = 1 }
function goPage(p: number) { if (p >= 1 && p <= totalPages.value) currentPage.value = p }
const pageNumbers = computed(() => { const t = totalPages.value, c = currentPage.value, pages: number[] = []; let s = Math.max(1, c - 2), e = Math.min(t, c + 2); if (e - s < 4) { if (s === 1) e = Math.min(t, s + 4); else s = Math.max(1, e - 4) } for (let i = s; i <= e; i++) pages.push(i); return pages })
function formatCurrency(v: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v) }
</script>

<template>
  <div class="card">
    <div class="card-header"><h5>Commissions Management</h5></div>
    <div class="card-body">
      <div class="row" style="margin-bottom: 12px;">
        <div class="col-md-6"><button class="btn btn-success" @click="openAdd"><i class="fa fa-plus"></i> Create Commission</button></div>
        <div class="col-md-6"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input type="text" v-model="search" class="form-control" placeholder="Search..." /></div></div>
      </div>
      <div class="table-responsive table-wrap">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th v-for="col in ([{key:'customer_name',label:'Customer'},{key:'vendor_name',label:'Vendor'},{key:'package_name',label:'Package'},{key:'percentage',label:'Percentage'},{key:'amount',label:'Amount'},{key:'status',label:'Status'}] as {key:string;label:string}[])" :key="col.key" @click="setSort(col.key)" style="cursor:pointer;user-select:none;">{{ col.label }}<i v-if="sortColumn===col.key" :class="sortDirection==='asc'?'fa fa-sort-asc':'fa fa-sort-desc'"></i><i v-else class="fa fa-sort" style="color:#ccc;"></i></th>
              <th style="width:120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in paginated" :key="d.id_commission">
              <td>{{ d.booking?.customer?.full_name || '-' }}</td>
              <td>{{ d.vendor?.business_name || '-' }}</td>
              <td>{{ d.booking?.booking_packages?.map(bp=>bp.package.name).join(', ') || '-' }}</td>
              <td>{{ d.percentage }}%</td>
              <td>{{ formatCurrency(d.amount) }}</td>
              <td><span :class="{'label label-success':d.status==='paid','label label-warning':d.status==='pending','label label-danger':d.status==='cancelled'}" style="font-size:13px;text-transform:uppercase;">{{ d.status }}</span></td>
              <td style="white-space:nowrap;"><button class="btn btn-primary" @click="openDetail(d)"><i class="fa fa-eye"></i></button><button class="btn btn-info" @click="openEdit(d)"><i class="fa fa-pencil"></i></button><button class="btn btn-danger" @click="handleDelete(d.id_commission)"><i class="fa fa-trash"></i></button></td>
            </tr>
            <tr v-if="paginated.length===0"><td colspan="7" style="text-align:center;">No commissions found.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="row">
        <div class="col-md-6"><p>Showing {{ filtered.length>0?((currentPage-1)*perPage)+1:0 }} to {{ Math.min(currentPage*perPage,filtered.length) }} of {{ filtered.length }} entries</p></div>
        <div class="col-md-6"><nav style="float:right;"><ul class="pagination" style="margin:0;"><li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(1)">&laquo;</a></li><li :class="{disabled:currentPage===1}"><a @click.prevent="goPage(currentPage-1)">&lsaquo;</a></li><li v-for="p in pageNumbers" :key="p" :class="{active:p===currentPage}"><a @click.prevent="goPage(p)">{{ p }}</a></li><li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(currentPage+1)">&rsaquo;</a></li><li :class="{disabled:currentPage===totalPages}"><a @click.prevent="goPage(totalPages)">&raquo;</a></li></ul></nav></div>
      </div>
    </div>
  </div>
  <CommissionModal :visible="modalVisible" :mode="modalMode" :commission="selectedItem" @close="modalVisible=false" @save="handleSave" />
</template>

<style scoped>
.input-group-addon { background:#fff; border-right:none; }
.input-group-addon + .form-control { border-left:none; }
.table > thead > tr > th { white-space:nowrap; }
.table-wrap { overflow-x:auto; width:100%; }
</style>
