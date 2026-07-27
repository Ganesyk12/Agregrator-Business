<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import RevenueChart from '@/dashboard/components/RevenueChart.vue'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const bookings = ref<any[]>([])
const requests = ref<any[]>([])

async function fetchData() {
  try {
    const [bookingsRes, requestsRes] = await Promise.all([
      fetch(`${apiUrl}/api/bookings`),
      fetch(`${apiUrl}/api/payment-requests`)
    ])
    
    if (bookingsRes.ok) {
      const bData = await bookingsRes.json()
      bookings.value = bData.data || []
    }
    
    if (requestsRes.ok) {
      const rData = await requestsRes.json()
      requests.value = rData.data || []
    }
  } catch (err) {
    console.error('Error fetching dashboard summary data:', err)
  }
}

onMounted(() => {
  fetchData()
})

// Calculations:
// 1. Total Amount: total amount dari semua booking
const totalBookingAmount = computed(() => {
  return bookings.value.reduce((sum, b) => sum + (b.total_price || 0), 0)
})

// 2. Paid RFP: total amount RFP yang sudah selesai (status 'released' atau 'paid')
const totalPaidRfp = computed(() => {
  return requests.value
    .filter(r => r.status === 'released' || r.status === 'paid')
    .reduce((sum, r) => sum + (r.total_amount || 0), 0)
})

// 3. Outstanding: total outstanding RFP
const totalOutstanding = computed(() => {
  return requests.value.reduce((sum, r) => sum + (r.outstanding || 0), 0)
})

// 4. Total RFP Created: total RFP yang dibuat
const totalRfpCount = computed(() => {
  return requests.value.length
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}
</script>

<template>
  <!-- Summary Stat Cards -->
  <div class="row">
    <!-- Total Booking Amount -->
    <div class="col-xl-3 col-md-6 col-sm-12 m-b-30">
      <div class="card card-event h-100 mb-0">
        <div class="card-body">
          <div class="row align-items-center justify-content-between">
            <div class="col">
              <h4 class="m-0 text-truncate" :title="formatCurrency(totalBookingAmount)">{{ formatCurrency(totalBookingAmount) }}</h4>
              <sub class="text-muted f-14">Total Amount Booking</sub>
            </div>
            <div class="col-auto">
              <i class="fa fa-money text-c-blue f-24"></i>
            </div>
          </div>
          <div class="m-t-15">
            <sub class="text-muted">Total dari semua booking</sub>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Paid RFP -->
    <div class="col-xl-3 col-md-6 col-sm-12 m-b-30">
      <div class="card card-event h-100 mb-0">
        <div class="card-body">
          <div class="row align-items-center justify-content-between">
            <div class="col">
              <h4 class="m-0 text-c-green text-truncate" :title="formatCurrency(totalPaidRfp)">{{ formatCurrency(totalPaidRfp) }}</h4>
              <sub class="text-muted f-14">Paid RFP</sub>
            </div>
            <div class="col-auto">
              <i class="fa fa-check-circle text-c-green f-24"></i>
            </div>
          </div>
          <div class="m-t-15">
            <sub class="text-muted">Total RFP yang selesai</sub>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Outstanding -->
    <div class="col-xl-3 col-md-6 col-sm-12 m-b-30">
      <div class="card card-event h-100 mb-0">
        <div class="card-body">
          <div class="row align-items-center justify-content-between">
            <div class="col">
              <h4 class="m-0 text-truncate" :title="formatCurrency(totalOutstanding)">{{ formatCurrency(totalOutstanding) }}</h4>
              <sub class="text-muted f-14">Outstanding</sub>
            </div>
            <div class="col-auto">
              <i class="fa fa-clock-o text-c-yellow f-24"></i>
            </div>
          </div>
          <div class="m-t-15">
            <sub class="text-muted">Total sisa outstanding</sub>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Total RFP Created -->
    <div class="col-xl-3 col-md-6 col-sm-12 m-b-30">
      <div class="card card-event h-100 mb-0">
        <div class="card-body">
          <div class="row align-items-center justify-content-between">
            <div class="col">
              <h4 class="m-0 text-c-red">{{ totalRfpCount }}</h4>
              <sub class="text-muted f-14">Total RFP</sub>
            </div>
            <div class="col-auto">
              <i class="fa fa-file-text text-c-red f-24"></i>
            </div>
          </div>
          <div class="m-t-15">
            <sub class="text-muted">Total RFP yang dibuat</sub>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Chart Overview -->
  <div class="row">
    <div class="col-md-12 col-sm-12 col-xs-12">
      <div class="card">
        <div class="card-header">
          <h5>Revenue Overview <small class="text-muted">Monthly revenue graph</small></h5>
        </div>
        <div class="card-body">
          <div style="height: 300px; padding: 10px 0;">
            <RevenueChart />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling limits to ensure alignment compatibility */
.m-b-30 {
  margin-bottom: 30px;
}
.m-t-15 {
  margin-top: 15px;
}
.f-14 {
  font-size: 14px;
}
.f-24 {
  font-size: 24px;
}
.text-c-blue {
  color: #4099ff;
}
.text-c-green {
  color: #2ed8b6;
}
.text-c-yellow {
  color: #ffb64d;
}
.text-c-red {
  color: #ff5370;
}
.bg-c-blue {
  background-color: #4099ff;
}
.bg-c-green {
  background-color: #2ed8b6;
}
.bg-c-yellow {
  background-color: #ffb64d;
}
.bg-c-red {
  background-color: #ff5370;
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
