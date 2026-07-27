<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface Review {
  id_review: number
  id_user: number
  id_vendor: number
  rating: number
  comment: string | null
  date_created: string
  user?: { full_name: string; email: string }
  booking?: { id_booking: number }
}

const reviews = ref<Review[]>([])
const vendorId = computed(() => auth.user?.vendor_id)

onMounted(async () => {
  if (!vendorId.value) return
  try {
    const res = await fetch(`${apiUrl}/api/reviews?vendorId=${vendorId.value}`)
    if (!res.ok) return
    const json = await res.json()
    reviews.value = json.data || []
  } catch { /* ignore */ }
})

const search = ref('')
const paginated = computed(() => {
  const q = search.value.toLowerCase()
  let r = reviews.value
  if (q) r = r.filter(rv => (rv.user?.full_name || '').toLowerCase().includes(q) || (rv.comment || '').toLowerCase().includes(q))
  return r
})

function renderStars(rating: number) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Reviews</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12">
          <div class="input-group" style="max-width:250px;float:right;">
            <span class="input-group-addon"><i class="fa fa-search"></i></span>
            <input type="text" class="form-control" placeholder="Search reviews..." v-model="search" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead><tr><th>Customer</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="r in paginated" :key="r.id_review">
              <td>{{ r.user?.full_name || '-' }}</td>
              <td><span style="color:#f0ad4e;">{{ renderStars(r.rating) }}</span></td>
              <td>{{ r.comment || '-' }}</td>
              <td>{{ new Date(r.date_created).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="paginated.length === 0"><td colspan="4" style="text-align:center;">No reviews yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
