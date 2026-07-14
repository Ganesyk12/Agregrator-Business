<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface CommissionForm {
  id_booking: number
  id_vendor: number
  percentage: number
  amount: number
  status: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  commission?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: CommissionForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const bookings = ref<any[]>([])

const form = ref<CommissionForm>({
  id_booking: 0,
  id_vendor: 0,
  percentage: 0,
  amount: 0,
  status: 'pending',
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

const vendorOptions = computed(() => {
  const selected = bookings.value.find(b => b.id_booking === form.value.id_booking)
  if (!selected?.booking_packages) return []
  const map = new Map<number, string>()
  for (const bp of selected.booking_packages) {
    if (bp.package.vendor) {
      map.set(bp.package.vendor.id_vendor, bp.package.vendor.business_name)
    }
  }
  return Array.from(map, ([id_vendor, business_name]) => ({ id_vendor, business_name }))
})

watch(() => form.value.id_booking, () => {
  const vendors = vendorOptions.value
  if (vendors.length === 1) {
    form.value.id_vendor = vendors[0].id_vendor
  } else {
    form.value.id_vendor = 0
  }
})

watch(() => props.visible, async (val) => {
  if (val) {
    await fetchBookings()
    if (props.mode === 'add') {
      form.value = {
        id_booking: bookings.value[0]?.id_booking ?? 0,
        id_vendor: 0,
        percentage: 0,
        amount: 0,
        status: 'pending',
      }
    } else if (props.commission) {
      form.value = {
        id_booking: props.commission.id_booking,
        id_vendor: props.commission.id_vendor,
        percentage: props.commission.percentage,
        amount: props.commission.amount,
        status: props.commission.status,
      }
    }
  }
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function save() {
  if (!form.value.id_booking || !form.value.id_vendor || !form.value.percentage || !form.value.amount) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Create Commission</template>
            <template v-else-if="mode === 'edit'">Edit Commission</template>
            <template v-else>Commission Detail</template>
          </h4>
        </div>
        <div class="modal-body">
          <template v-if="mode === 'detail' && commission">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Booking ID</label>
                    <input class="form-control" :value="commission.id_booking" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Customer</label>
                    <input class="form-control" :value="commission.booking?.customer?.full_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Vendor</label>
                    <input class="form-control" :value="commission.vendor?.business_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Package</label>
                    <input class="form-control" :value="commission.booking?.booking_packages?.map((bp: any) => bp.package.name).join(', ') || '-'" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Total Price</label>
                    <input class="form-control" :value="formatCurrency(commission.booking?.total_price || 0)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Percentage</label>
                    <input class="form-control" :value="commission.percentage + '%'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Commission Amount</label>
                    <input class="form-control" :value="formatCurrency(commission.amount)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <input class="form-control" :value="commission.status" readonly style="text-transform: uppercase;" />
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <form @submit.prevent="save" class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Booking *</label>
                    <select v-model="form.id_booking" class="form-control" required :disabled="mode === 'edit'">
                      <option v-for="b in bookings" :key="b.id_booking" :value="b.id_booking">
                        #{{ b.id_booking }} - {{ b.customer?.full_name || 'N/A' }} / {{ b.booking_packages?.map((bp:any) => bp.package.vendor?.business_name).filter(Boolean).join(', ') || 'N/A' }}
                      </option>
                      <option v-if="bookings.length === 0" disabled>No bookings available</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Vendor *</label>
                    <select v-model="form.id_vendor" class="form-control" required>
                      <option v-for="v in vendorOptions" :key="v.id_vendor" :value="v.id_vendor">
                        {{ v.business_name }}
                      </option>
                      <option v-if="vendorOptions.length === 0" disabled>Select a booking first</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Percentage (%) *</label>
                    <input type="number" v-model.number="form.percentage" class="form-control" required placeholder="e.g. 10" min="0" max="100" step="0.01" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Commission Amount *</label>
                    <input type="number" v-model.number="form.amount" class="form-control" required placeholder="Calculated amount" min="0" step="0.01" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <select v-model="form.status" class="form-control" required>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.id_booking || !form.id_vendor || !form.percentage || !form.amount">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
