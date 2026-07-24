<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface PaymentForm {
  id_booking: number
  id_term: number | null
  amount: number
  payment_type: string
  status: string
  payment_proof_url: string
  paid_at: string
  released_at: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  payment?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: PaymentForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const bookings = ref<any[]>([])
const terms = ref<any[]>([])

const form = ref<PaymentForm>({
  id_booking: 0,
  id_term: null,
  amount: 0,
  payment_type: 'dp',
  status: 'pending',
  payment_proof_url: '',
  paid_at: '',
  released_at: '',
})

async function fetchBookings() {
  try {
    const res = await fetch(`${apiUrl}/api/bookings`)
    if (res.ok) {
      const json = await res.json()
      bookings.value = json.data || []
    }
  } catch (err) {
    console.error('Error fetching bookings:', err)
  }
}

async function fetchTerms(bookingId: number) {
  if (!bookingId) { terms.value = []; return }
  try {
    const res = await fetch(`${apiUrl}/api/payment-terms/bookings/${bookingId}`)
    if (res.ok) {
      const json = await res.json()
      terms.value = json.data || []
    } else {
      terms.value = []
    }
  } catch { terms.value = [] }
}

watch(() => form.value.id_booking, async (val) => {
  if (val && props.mode !== 'edit') {
    await fetchTerms(val)
    const unpaid = terms.value.filter((t: any) => t.status !== 'paid')
    if (unpaid.length > 0) {
      form.value.id_term = unpaid[0].id_term
      form.value.amount = unpaid[0].amount
    }
  }
})

watch(() => props.visible, async (val) => {
  if (val) {
    await fetchBookings()
    if (props.mode === 'add') {
      form.value = {
        id_booking: bookings.value[0]?.id_booking ?? 0,
        id_term: null,
        amount: 0,
        payment_type: 'dp',
        status: 'pending',
        payment_proof_url: '',
        paid_at: '',
        released_at: '',
      }
      if (form.value.id_booking) await fetchTerms(form.value.id_booking)
    } else if (props.payment) {
      let paidAt = ''
      let releasedAt = ''
      if (props.payment.paid_at) {
        const d = new Date(props.payment.paid_at)
        paidAt = d.toISOString().slice(0, 16)
      }
      if (props.payment.released_at) {
        const d = new Date(props.payment.released_at)
        releasedAt = d.toISOString().slice(0, 16)
      }

      form.value = {
        id_booking: props.payment.id_booking,
        id_term: props.payment.id_term || null,
        amount: props.payment.amount,
        payment_type: props.payment.payment_type,
        status: props.payment.status,
        payment_proof_url: props.payment.payment_proof_url || '',
        paid_at: paidAt,
        released_at: releasedAt,
      }
      if (form.value.id_booking) await fetchTerms(form.value.id_booking)
    }
  }
})

const selectedBooking = computed(() => {
  return bookings.value.find(b => b.id_booking === form.value.id_booking)
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function onTermChange() {
  const selected = terms.value.find((t: any) => t.id_term === form.value.id_term)
  if (selected) {
    form.value.amount = selected.amount
    const remaining = selected.amount - (selected.paid_amount || 0)
    if (remaining > 0 && remaining < selected.amount) {
      form.value.amount = remaining
    }
  }
}

function save() {
  if (!form.value.id_booking || !form.value.amount || !form.value.payment_type) return
  emit('save', { ...form.value, id_term: form.value.id_term || null })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Create Payment</template>
            <template v-else-if="mode === 'edit'">Edit Payment</template>
            <template v-else>Payment Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && payment">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Booking ID</label>
                    <input class="form-control" :value="payment.id_booking" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Customer</label>
                    <input class="form-control" :value="payment.booking?.customer?.full_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Vendor</label>
                    <input class="form-control" :value="payment.booking?.booking_packages?.map((bp: any) => bp.package.vendor?.business_name).filter(Boolean).join(', ') || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Package</label>
                    <input class="form-control" :value="payment.booking?.booking_packages?.map((bp: any) => bp.package.name).join(', ') || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Amount</label>
                    <input class="form-control" :value="formatCurrency(payment.amount)" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Type</label>
                    <input class="form-control" :value="payment.payment_type" readonly style="text-transform: uppercase;" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <input class="form-control" :value="payment.status" readonly style="text-transform: uppercase;" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Paid At</label>
                    <input class="form-control" :value="payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Released At</label>
                    <input class="form-control" :value="payment.released_at ? new Date(payment.released_at).toLocaleString() : '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Proof URL</label>
                    <a v-if="payment.payment_proof_url" :href="payment.payment_proof_url" target="_blank" class="form-control" style="color: #337ab7;">
                      {{ payment.payment_proof_url }}
                    </a>
                    <input v-else class="form-control" value="-" readonly />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ADD/EDIT FORM VIEW -->
          <template v-else>
            <form @submit.prevent="save" class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Booking *</label>
                    <select v-model="form.id_booking" class="form-control" required>
                      <option v-for="b in bookings" :key="b.id_booking" :value="b.id_booking">
                        #{{ b.id_booking }} - {{ b.customer?.full_name || 'N/A' }} / {{ b.booking_packages?.map((bp:any) => bp.package.vendor?.business_name).filter(Boolean).join(', ') || 'N/A' }}
                      </option>
                      <option v-if="bookings.length === 0" disabled>No bookings available</option>
                    </select>
                    <small v-if="selectedBooking" class="form-text text-muted">
                      Vendor: {{ selectedBooking.booking_packages?.map((bp: any) => bp.package.vendor?.business_name).filter(Boolean).join(', ') || '-' }} |
                      Package: {{ selectedBooking.booking_packages?.map((bp: any) => bp.package.name).join(', ') || '-' }} |
                      Total: {{ formatCurrency(selectedBooking.total_price) }} |
                      DP: {{ formatCurrency(selectedBooking.dp_amount) }}
                    </small>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Term / Milestone</label>
                    <select v-model="form.id_term" class="form-control" @change="onTermChange">
                      <option :value="null">— No specific term —</option>
                      <option v-for="t in terms" :key="t.id_term" :value="t.id_term" :disabled="t.status === 'paid'">
                        {{ t.term_name }} - {{ formatCurrency(t.amount) }}
                        <template v-if="t.status === 'paid'">(Paid)</template>
                        <template v-else-if="t.status === 'partial'">(Partial: {{ formatCurrency(t.paid_amount) }})</template>
                      </option>
                    </select>
                    <small v-if="form.id_term" class="form-text text-muted">
                      Selected: {{ terms.find((t:any) => t.id_term === form.id_term)?.term_name || '-' }}
                    </small>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Amount *</label>
                    <input type="number" v-model.number="form.amount" class="form-control" required placeholder="Payment amount" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Type *</label>
                    <select v-model="form.payment_type" class="form-control" required>
                      <option value="dp">DP (Down Payment)</option>
                      <option value="full">Full Payment</option>
                      <option value="installment">Installment</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <select v-model="form.status" class="form-control" required>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="released">Released</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Proof URL</label>
                    <input type="url" v-model="form.payment_proof_url" class="form-control" placeholder="URL to payment proof" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Paid At</label>
                    <input type="datetime-local" v-model="form.paid_at" class="form-control" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Released At</label>
                    <input type="datetime-local" v-model="form.released_at" class="form-control" />
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.id_booking || !form.amount || !form.payment_type">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
