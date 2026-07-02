<script setup lang="ts">
import { ref, watch } from 'vue'

export interface VendorForm {
  business_name: string
  description: string
  category: string
  location: string
  status: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  vendor: VendorForm & { id_vendor?: number; verified_at?: string | null; user_modified?: string | null; date_created?: string } | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: VendorForm]
}>()

const categories = ['mua', 'fotografer', 'wo', 'catering', 'dekorasi', 'venue', 'hiburan', 'transportasi']
const statuses = ['pending', 'approved', 'rejected']

const form = ref<VendorForm>({
  business_name: '',
  description: '',
  category: '',
  location: '',
  status: 'pending',
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = { business_name: '', description: '', category: '', location: '', status: 'pending' }
    } else if (props.vendor) {
      form.value = {
        business_name: props.vendor.business_name,
        description: props.vendor.description,
        category: props.vendor.category,
        location: props.vendor.location,
        status: props.vendor.status,
      }
    }
  }
})

function save() {
  if (!form.value.business_name || !form.value.category) return
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
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <input class="form-control" :value="vendor.status" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" :value="vendor.description || '-'" readonly rows="4" style="resize: none;"></textarea>
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
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Location</label>
                    <input class="form-control" v-model="form.location" placeholder="City / Region" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" v-model="form.description" placeholder="Description" rows="4" style="resize: none;"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <select class="form-control" v-model="form.status">
                      <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
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
