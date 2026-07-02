<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface PackageForm {
  id_vendor: number
  name: string
  description: string
  price: number
  duration: string
  whats_included: string
  status: string
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  pkg?: any
  vendors: Array<{ id_vendor: number; business_name: string }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: PackageForm]
}>()

const statuses = ['active', 'inactive']

const form = ref<PackageForm>({
  id_vendor: 0,
  name: '',
  description: '',
  price: 0,
  duration: '',
  whats_included: '',
  status: 'active',
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = {
        id_vendor: props.vendors[0]?.id_vendor ?? 0,
        name: '',
        description: '',
        price: 0,
        duration: '',
        whats_included: '',
        status: 'active',
      }
    } else if (props.pkg) {
      form.value = {
        id_vendor: props.pkg.id_vendor,
        name: props.pkg.name,
        description: props.pkg.description || '',
        price: props.pkg.price,
        duration: props.pkg.duration || '',
        whats_included: props.pkg.whats_included || '',
        status: props.pkg.status,
      }
    }
  }
})

const displayPrice = computed({
  get() {
    if (form.value.price === undefined || form.value.price === null || form.value.price === 0) return ''
    return form.value.price.toLocaleString('id-ID')
  },
  set(val: string) {
    const cleanVal = val.replace(/\D/g, '')
    form.value.price = cleanVal ? parseInt(cleanVal, 10) : 0
  }
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function save() {
  if (!form.value.name || !form.value.id_vendor || form.value.price === undefined) return
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
            <template v-if="mode === 'add'">Add Package</template>
            <template v-else-if="mode === 'edit'">Edit Package</template>
            <template v-else>Package Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && pkg">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Package Name</label>
                    <input class="form-control" :value="pkg.name" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Vendor</label>
                    <input class="form-control" :value="pkg.vendor?.business_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Price</label>
                    <input class="form-control" :value="formatCurrency(pkg.price)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Duration</label>
                    <input class="form-control" :value="pkg.duration || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <input class="form-control" :value="pkg.status" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">What's Included</label>
                    <textarea class="form-control" :value="pkg.whats_included || '-'" readonly rows="3" style="resize: none;"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" :value="pkg.description || '-'" readonly rows="3" style="resize: none;"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Modified By</label>
                    <input class="form-control" :value="pkg.user_modified || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Created</label>
                    <input class="form-control" :value="pkg.date_created ? new Date(pkg.date_created).toLocaleDateString() : '-'" readonly />
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
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Package Name *</label>
                    <input v-model="form.name" class="form-control" placeholder="Package name" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Vendor *</label>
                    <select v-model="form.id_vendor" class="form-control" required>
                      <option v-for="vendor in vendors" :key="vendor.id_vendor" :value="vendor.id_vendor">
                        {{ vendor.business_name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Price *</label>
                    <input v-model="displayPrice" class="form-control" placeholder="Price" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Duration</label>
                    <input v-model="form.duration" class="form-control" placeholder="e.g. 2 Hours, 1 Day" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Status</label>
                    <select v-model="form.status" class="form-control">
                      <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">What's Included</label>
                    <textarea v-model="form.whats_included" class="form-control" placeholder="Describe inclusions (e.g. Album, Videography)" rows="3" style="resize: none;"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea v-model="form.description" class="form-control" placeholder="General description of the package" rows="3" style="resize: none;"></textarea>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.name || !form.id_vendor || form.price === undefined">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
