<script setup lang="ts">
import { ref, watch } from 'vue'

export interface VendorForm {
  id_user: number | ''
  business_name: string
  description: string
  category: string
  location: string
}

interface UserOption {
  id_user: number
  email: string
  full_name: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  vendor: any | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: VendorForm]
}>()

const categories = ['mua', 'fotografer', 'wo', 'catering', 'dekorasi', 'venue', 'hiburan', 'transportasi']
const locations = ref<string[]>([])
const users = ref<UserOption[]>([])

const form = ref<VendorForm>({
  id_user: '',
  business_name: '',
  description: '',
  category: '',
  location: '',
})

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function fetchLocations() {
  try {
    const res = await fetch(`${apiUrl}/api/locations`)
    if (!res.ok) throw new Error('Failed to fetch locations')
    const json = await res.json()
    locations.value = json.data || []
  } catch (err) {
    console.error('Error fetching locations:', err)
    locations.value = []
  }
}

async function fetchUsers() {
  try {
    const res = await fetch(`${apiUrl}/api/users`)
    if (!res.ok) throw new Error('Failed to fetch users')
    const json = await res.json()
    // Filter users who have the role 'eUser-Vendor'
    users.value = (json.data || [])
      .filter((u: any) => u.user_roles?.some((ur: any) => ur.role?.role_code === 'eUser-Vendor'))
      .map((u: any) => ({
        id_user: u.id_user,
        email: u.email,
        full_name: u.full_name,
      }))
  } catch (err) {
    console.error('Error fetching users:', err)
    users.value = []
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await Promise.all([fetchUsers(), fetchLocations()])
    if (props.mode === 'add') {
      form.value = { id_user: '', business_name: '', description: '', category: '', location: '' }
    } else if (props.vendor) {
      if (props.vendor.location && !locations.value.includes(props.vendor.location)) {
        locations.value.push(props.vendor.location)
      }
      form.value = {
        id_user: props.vendor.id_user || '',
        business_name: props.vendor.business_name,
        description: props.vendor.description || '',
        category: props.vendor.category,
        location: props.vendor.location || '',
      }
    }
  }
})

function save() {
  if (!form.value.id_user || !form.value.business_name || !form.value.category) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Add Vendor</template>
            <template v-else-if="mode === 'edit'">Edit Vendor</template>
            <template v-else>Vendor Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <template v-if="mode === 'detail' && vendor">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Owner (User)</label>
                    <input class="form-control" :value="vendor.user ? `${vendor.user.full_name} (${vendor.user.email})` : vendor.id_user" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Business Name</label>
                    <input class="form-control" :value="vendor.business_name" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category</label>
                    <input class="form-control" :value="vendor.category" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Location</label>
                    <input class="form-control" :value="vendor.location || '-'" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" :value="vendor.description || '-'" readonly rows="4"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Verified At</label>
                    <input class="form-control" :value="vendor.verified_at ? new Date(vendor.verified_at).toLocaleDateString() : '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Modified By</label>
                    <input class="form-control" :value="vendor.user_modified || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Created</label>
                    <input class="form-control" :value="vendor.date_created ? new Date(vendor.date_created).toLocaleDateString() : '-'" readonly />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">
                      Owner (User) <span v-if="mode === 'add'" class="text-danger">*</span>
                    </label>
                    <select v-if="mode === 'add'" class="form-control" v-model="form.id_user">
                      <option value="" disabled>Select owner user</option>
                      <option v-for="u in users" :key="u.id_user" :value="u.id_user">
                        {{ u.full_name }} ({{ u.email }})
                      </option>
                    </select>
                    <input v-else class="form-control" :value="vendor?.user ? `${vendor.user.full_name} (${vendor.user.email})` : form.id_user" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Business Name <span class="text-danger">*</span></label>
                    <input class="form-control" v-model="form.business_name" placeholder="Business name" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category <span class="text-danger">*</span></label>
                    <select class="form-control" v-model="form.category">
                      <option value="" disabled>Select category</option>
                      <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Location</label>
                    <select class="form-control" v-model="form.location">
                      <option value="">Select location</option>
                      <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" v-model="form.description" placeholder="Description" rows="4"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>
