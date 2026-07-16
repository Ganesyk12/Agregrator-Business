<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface BookingForm {
  id_user: number
  package_ids: number[]
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
  package_ids: [],
  event_date: '',
  event_location: '',
  total_price: 0,
  dp_amount: 0,
  status: 'pending',
  notes: '',
})

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

const customerOptions = computed(() => {
  return users.value.filter((u: any) =>
    u.user_roles?.some((ur: any) => ur.role?.role_code === 'eUser-Customer')
  )
})

const packagesByVendor = computed(() => {
  const map: Record<number, { vendor: any; items: any[] }> = {}
  for (const pkg of packages.value) {
    const vid = pkg.id_vendor
    if (!map[vid]) {
      map[vid] = {
        vendor: vendors.value.find((v: any) => v.id_vendor === vid),
        items: [],
      }
    }
    map[vid].items.push(pkg)
  }
  return map
})

watch(() => form.value.package_ids, (ids) => {
  if (props.mode === 'add') {
    form.value.total_price = ids.reduce((sum, id) => {
      const pkg = packages.value.find(p => p.id_package === id)
      return sum + (pkg?.price || 0)
    }, 0)
  }
})

function togglePackage(id: number) {
  const idx = form.value.package_ids.indexOf(id)
  if (idx === -1) {
    form.value.package_ids.push(id)
  } else {
    form.value.package_ids.splice(idx, 1)
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await Promise.all([fetchMasterData(), fetchLocations()])
    if (props.mode === 'add') {
      form.value = {
        id_user: customerOptions.value[0]?.id_user ?? 0,
        package_ids: [],
        event_date: '',
        event_location: '',
        total_price: 0,
        dp_amount: 0,
        status: 'pending',
        notes: '',
      }
    } else if (props.booking) {
      let formattedDate = ''
      if (props.booking.event_date) {
        const d = new Date(props.booking.event_date)
        formattedDate = d.toISOString().slice(0, 16)
      }

      form.value = {
        id_user: props.booking.id_user,
        package_ids: props.booking.booking_packages?.map((bp: any) => bp.package.id_package) || [],
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function save() {
  if (!form.value.id_user || !form.value.package_ids.length || !form.value.event_date) return
  emit('save', { ...form.value })
}

function getVendorName(vendorId: number) {
  const v = vendors.value.find((v: any) => v.id_vendor === vendorId)
  return v?.business_name || 'Unknown'
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title" style="color: #fff;">
            <template v-if="mode === 'add'">Create Booking</template>
            <template v-else-if="mode === 'edit'">Edit Booking</template>
            <template v-else>Booking Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <template v-if="mode === 'detail' && booking">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Customer Name</label>
                    <input class="form-control" :value="booking.customer?.full_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Packages</label>
                    <div class="form-control" style="height: auto; min-height: 34px; background: #eee;">
                      <span v-if="!booking.booking_packages?.length">-</span>
                      <ul v-else style="margin: 0; padding-left: 18px;">
                        <li v-for="bp in booking.booking_packages" :key="bp.package.id_package">
                          {{ bp.package.name }} ({{ formatCurrency(bp.package.price) }})
                          <span style="color:#888;"> — {{ bp.package.vendor?.business_name }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Event Date</label>
                    <input class="form-control" :value="new Date(booking.event_date).toLocaleString()" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Location</label>
                    <input class="form-control" :value="booking.event_location || '-'" readonly />
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
                    <label class="control-label" style="font-weight: bold;">Packages *</label>
                    <div class="well well-sm" style="margin-bottom: 0; max-height: 240px; overflow-y: auto;">
                      <template v-for="(group, vid) in packagesByVendor" :key="vid">
                        <div style="font-weight: bold; margin: 6px 0 3px; color: #2c3e50;">
                          {{ group.vendor?.business_name || 'Unknown Vendor' }}
                        </div>
                        <div v-for="p in group.items" :key="p.id_package" class="checkbox" style="margin: 0 0 4px 12px;">
                          <label style="font-weight: normal;">
                            <input
                              type="checkbox"
                              :checked="form.package_ids.includes(p.id_package)"
                              @change="togglePackage(p.id_package)"
                            />
                            {{ p.name }} ({{ formatCurrency(p.price) }})
                          </label>
                        </div>
                      </template>
                      <div v-if="!Object.keys(packagesByVendor).length" style="color: #999;">No packages available</div>
                    </div>
                    <small style="color: #999;">Select one or more packages from any vendor</small>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Event Date *</label>
                    <input type="datetime-local" v-model="form.event_date" class="form-control" required />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Total Price *</label>
                    <input type="number" v-model.number="form.total_price" class="form-control" required placeholder="Auto-calculated" />
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
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.id_user || !form.package_ids.length || !form.event_date">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkbox input[type="checkbox"] {
  position: static;
  opacity: 1;
  width: auto;
  height: auto;
  margin-right: 6px;
  margin-left: 0;
  vertical-align: middle;
  display: inline-block;
  pointer-events: auto;
}
.checkbox label {
  display: inline-flex;
  align-items: center;
  padding-left: 0;
  min-height: auto;
}
.checkbox label::before,
.checkbox label::after {
  display: none !important;
  content: none !important;
}
</style>
