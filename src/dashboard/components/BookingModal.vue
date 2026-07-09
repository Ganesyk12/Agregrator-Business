<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface BookingForm {
  id_user: number
  id_vendor: number
  id_package: number
  event_date: string
  event_location: string
  total_price: number
  dp_amount: number
  status: string
  notes: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  booking?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: BookingForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const users = ref<any[]>([])
const vendors = ref<any[]>([])
const packages = ref<any[]>([])
const locations = ref<string[]>([])

async function fetchLocations() {
  try {
    const res = await fetch(`${apiUrl}/api/locations`)
    if (res.ok) {
      const json = await res.json()
      locations.value = json.data || []
    }
  } catch (err) {
    console.error('Error fetching locations:', err)
  }
}

const form = ref<BookingForm>({
  id_user: 0,
  id_vendor: 0,
  id_package: 0,
  event_date: '',
  event_location: '',
  total_price: 0,
  dp_amount: 0,
  status: 'pending',
  notes: '',
})

// Load master data
async function fetchMasterData() {
  try {
    const [resUsers, resVendors, resPackages] = await Promise.all([
      fetch(`${apiUrl}/api/users`),
      fetch(`${apiUrl}/api/vendors`),
      fetch(`${apiUrl}/api/packages`),
    ])

    const [jsonUsers, jsonVendors, jsonPackages] = await Promise.all([
      resUsers.json(),
      resVendors.json(),
      resPackages.json(),
    ])

    // Filter customers who have 'eUser-Customer' role
    users.value = (jsonUsers.data || []).map((u: any) => ({
      id_user: u.id_user,
      email: u.email,
      full_name: u.full_name,
      user_roles: u.user_roles,
    }))

    vendors.value = jsonVendors.data || []
    packages.value = jsonPackages.data || []
  } catch (err) {
    console.error('Error fetching master data:', err)
  }
}

// Filter users to display only customers
const customerOptions = computed(() => {
  return users.value.filter((u: any) => 
    u.user_roles?.some((ur: any) => ur.role?.role_code === 'eUser-Customer')
  )
})

// Filter packages based on selected vendor
const filteredPackages = computed(() => {
  if (!form.value.id_vendor) return []
  return packages.value.filter(p => p.id_vendor === form.value.id_vendor)
})

// Auto-fill price when package changes
watch(() => form.value.id_package, (newPkgId) => {
  if (props.mode === 'add' && newPkgId) {
    const pkg = packages.value.find(p => p.id_package === newPkgId)
    if (pkg) {
      form.value.total_price = pkg.price
    }
  }
})

// Reset package selection if vendor changes
watch(() => form.value.id_vendor, (_, oldVendorId) => {
  if (props.mode === 'add' && oldVendorId !== undefined && oldVendorId !== 0) {
    form.value.id_package = 0
    form.value.total_price = 0
  }
})

watch(() => props.visible, async (val) => {
  if (val) {
    await Promise.all([fetchMasterData(), fetchLocations()])
    if (props.mode === 'add') {
      form.value = {
        id_user: customerOptions.value[0]?.id_user ?? 0,
        id_vendor: vendors.value[0]?.id_vendor ?? 0,
        id_package: 0,
        event_date: '',
        event_location: '',
        total_price: 0,
        dp_amount: 0,
        status: 'pending',
        notes: '',
      }
    } else if (props.booking) {
      // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDate = ''
      if (props.booking.event_date) {
        const d = new Date(props.booking.event_date)
        formattedDate = d.toISOString().slice(0, 16)
      }

      form.value = {
        id_user: props.booking.id_user,
        id_vendor: props.booking.id_vendor,
        id_package: props.booking.id_package,
        event_date: formattedDate,
        event_location: props.booking.event_location || '',
        total_price: props.booking.total_price,
        dp_amount: props.booking.dp_amount || 0,
        status: props.booking.status,
        notes: props.booking.notes || '',
      }
    }
  }
})

// Format Currency
function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function save() {
  if (!form.value.id_user || !form.value.id_vendor || !form.value.id_package || !form.value.event_date) return
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
            <template v-if="mode === 'add'">Create Booking</template>
            <template v-else-if="mode === 'edit'">Edit Booking</template>
            <template v-else>Booking Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && booking">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Customer Name</label>
                    <input class="form-control" :value="booking.customer?.full_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Vendor</label>
                    <input class="form-control" :value="booking.vendor?.business_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Package</label>
                    <input class="form-control" :value="booking.package?.name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Event Date</label>
                    <input class="form-control" :value="new Date(booking.event_date).toLocaleString()" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Total Price</label>
                    <input class="form-control" :value="formatCurrency(booking.total_price)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">DP Amount</label>
                    <input class="form-control" :value="formatCurrency(booking.dp_amount)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <input class="form-control" :value="booking.status" readonly style="text-transform: uppercase;" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Notes</label>
                    <textarea class="form-control" :value="booking.notes || '-'" readonly rows="3"></textarea>
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
                    <label class="control-label" style="font-weight: bold;">Customer (eUser-Customer) *</label>
                    <select v-model="form.id_user" class="form-control" required :disabled="mode === 'edit'">
                      <option v-for="c in customerOptions" :key="c.id_user" :value="c.id_user">
                        {{ c.full_name }} ({{ c.email }})
                      </option>
                      <option v-if="customerOptions.length === 0" disabled>No customers available</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Vendor *</label>
                    <select v-model="form.id_vendor" class="form-control" required :disabled="mode === 'edit'">
                      <option v-for="v in vendors" :key="v.id_vendor" :value="v.id_vendor">
                        {{ v.business_name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Package *</label>
                    <select v-model="form.id_package" class="form-control" required :disabled="mode === 'edit' || !form.id_vendor">
                      <option value="0" disabled>Select package</option>
                      <option v-for="p in filteredPackages" :key="p.id_package" :value="p.id_package">
                        {{ p.name }} ({{ formatCurrency(p.price) }})
                      </option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Event Date *</label>
                    <input type="datetime-local" v-model="form.event_date" class="form-control" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Total Price *</label>
                    <input type="number" v-model.number="form.total_price" class="form-control" required placeholder="Price" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">DP Amount</label>
                    <input type="number" v-model.number="form.dp_amount" class="form-control" placeholder="DP Amount" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Status</label>
                    <select v-model="form.status" class="form-control" required>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Event Location</label>
                    <select v-model="form.event_location" class="form-control">
                      <option value="">Select Location</option>
                      <option v-for="loc in locations" :key="loc" :value="loc">
                        {{ loc }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Notes</label>
                    <textarea v-model="form.notes" class="form-control" placeholder="Additional notes..." rows="3"></textarea>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.id_user || !form.id_vendor || !form.id_package || !form.event_date">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
