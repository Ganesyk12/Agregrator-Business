<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Invoice {
  id_payment: number
  id_booking: number
  amount: number
  payment_type: string
  status: string
  paid_at: string | null
  date_created: string
  payment_term?: { id_term: number; term_name: string; term_order: number }
  booking?: {
    total_price: number
    customer?: { full_name: string }
    booking_packages?: { package: { name: string; vendor: { business_name: string } } }[]
  }
}

const items = ref<Invoice[]>([])
const search = ref('')
const loading = ref(true)

async function fetchData() {
  try {
    const res = await fetch(`${apiUrl}/api/payments`)
    if (!res.ok) throw new Error('Failed')
    const json = await res.json()
    items.value = json.data || []
  } catch (err) {
    console.error(err)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function invoiceNumber(p: Invoice) {
  const d = p.paid_at || p.date_created
  const year = new Date(d).getFullYear()
  return `INV-${year}-${String(p.id_payment).padStart(4, '0')}`
}

function formatCurrency(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return items.value.filter(p =>
    invoiceNumber(p).toLowerCase().includes(q) ||
    (p.booking?.customer?.full_name || '').toLowerCase().includes(q) ||
    (p.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ') || '').toLowerCase().includes(q) ||
    (p.payment_term?.term_name || '').toLowerCase().includes(q) ||
    p.status.toLowerCase().includes(q)
  )
})
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Invoices <small>Kwitansi Pembayaran</small></h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span><input type="text" v-model="search" class="form-control" placeholder="Search by invoice#, customer, vendor..." /></div></div>
      </div>
      <div class="table-responsive" v-if="!loading">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Package</th>
              <th>Type</th>
              <th>Term</th>
              <th>Amount</th>
              <th>Status</th>
              <th style="width:80px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id_payment">
              <td>{{ invoiceNumber(p) }}</td>
              <td>{{ formatDate(p.paid_at || p.date_created) }}</td>
              <td>{{ p.booking?.customer?.full_name || '-' }}</td>
              <td>{{ p.booking?.booking_packages?.map(bp => bp.package.vendor?.business_name).join(', ') || '-' }}</td>
              <td>{{ p.booking?.booking_packages?.map(bp => bp.package.name).join(', ') || '-' }}</td>
              <td><span :class="'label '+(p.payment_type==='dp'?'label-primary':p.payment_type==='full'?'label-success':'label-info')" style="text-transform:uppercase;">{{ p.payment_type }}</span></td>
              <td>{{ p.payment_term?.term_name || '-' }}</td>
              <td>{{ formatCurrency(p.amount) }}</td>
              <td><span :class="'label '+(p.status==='paid'||p.status==='released'?'label-success':'label-warning')" style="text-transform:uppercase;">{{ p.status }}</span></td>
              <td><button class="btn btn-success btn-sm" @click="router.push('/invoices/'+p.id_payment)"><i class="fa fa-file-text-o"></i> View</button></td>
            </tr>
            <tr v-if="filtered.length===0"><td colspan="10" style="text-align:center;">No invoices found.</td></tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align:center;padding:40px;">Loading invoices...</div>
    </div>
  </div>
</template>
