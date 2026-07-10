<script setup lang="ts">
import { ref, watch } from 'vue'

export interface PayoutForm {
  id_vendor: number
  id_booking: number
  amount: number
  status: string
  paid_at: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  payout?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: PayoutForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const bookings = ref<any[]>([])
const vendors = ref<any[]>([])

const form = ref<PayoutForm>({
  id_vendor: 0,
  id_booking: 0,
  amount: 0,
  status: 'pending',
  paid_at: '',
})

async function fetchMaster() {
  try {
    const [resB, resV] = await Promise.all([
      fetch(`${apiUrl}/api/bookings`),
      fetch(`${apiUrl}/api/vendors`),
    ])
    if (resB.ok) { const j = await resB.json(); bookings.value = j.data || [] }
    if (resV.ok) { const j = await resV.json(); vendors.value = j.data || [] }
  } catch (err) { console.error(err) }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await fetchMaster()
    if (props.mode === 'add') {
      form.value = { id_vendor: vendors.value[0]?.id_vendor ?? 0, id_booking: bookings.value[0]?.id_booking ?? 0, amount: 0, status: 'pending', paid_at: '' }
    } else if (props.payout) {
      let paidAt = ''
      if (props.payout.paid_at) { const d = new Date(props.payout.paid_at); paidAt = d.toISOString().slice(0, 16) }
      form.value = { id_vendor: props.payout.id_vendor, id_booking: props.payout.id_booking, amount: props.payout.amount, status: props.payout.status, paid_at: paidAt }
    }
  }
})

function formatCurrency(v: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v) }
function save() { if (!form.value.id_vendor || !form.value.id_booking || !form.value.amount) return; emit('save', { ...form.value }) }
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display:block;background:rgba(0,0,0,0.5);z-index:1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title"><template v-if="mode==='add'">Create Payout</template><template v-else-if="mode==='edit'">Edit Payout</template><template v-else>Payout Detail</template></h4>
        </div>
        <div class="modal-body">
          <template v-if="mode==='detail' && payout">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Payout ID</label><input class="form-control" :value="payout.id_payout" readonly /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Vendor</label><input class="form-control" :value="payout.vendor?.business_name || '-'" readonly /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Customer</label><input class="form-control" :value="payout.booking?.customer?.full_name || '-'" readonly /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Package</label><input class="form-control" :value="payout.booking?.booking_packages?.map((bp: any) => bp.package.name).join(', ') || '-'" readonly /></div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Amount</label><input class="form-control" :value="formatCurrency(payout.amount)" readonly /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Status</label><input class="form-control" :value="payout.status" readonly style="text-transform:uppercase;" /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Paid At</label><input class="form-control" :value="payout.paid_at?new Date(payout.paid_at).toLocaleString():'-'" readonly /></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Booking ID</label><input class="form-control" :value="'#'+payout.id_booking" readonly /></div>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <form @submit.prevent="save" class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Vendor *</label><select v-model="form.id_vendor" class="form-control" required><option v-for="v in vendors" :key="v.id_vendor" :value="v.id_vendor">{{ v.business_name }}</option></select></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Booking *</label><select v-model="form.id_booking" class="form-control" required><option v-for="b in bookings" :key="b.id_booking" :value="b.id_booking">#{{ b.id_booking }} - {{ b.customer?.full_name||'N/A' }}</option></select></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Amount *</label><input type="number" v-model.number="form.amount" class="form-control" required min="0" /></div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Status</label><select v-model="form.status" class="form-control" required><option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></div>
                  <div class="form-group" style="text-align:left;"><label class="control-label" style="font-weight:bold;">Paid At</label><input type="datetime-local" v-model="form.paid_at" class="form-control" /></div>
                </div>
              </div>
            </form>
          </template>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode!=='detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.id_vendor||!form.id_booking||!form.amount">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>
