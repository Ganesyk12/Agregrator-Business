<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface ExtraForm {
  id_extra?: number
  name: string
  price: number
  icon: string
  description: string
}

export interface PackageForm {
  id_vendor: number
  id_category: number | null
  name: string
  description: string
  price: number
  duration: string
  whats_included: string
  extras: ExtraForm[]
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  pkg?: any
  vendors: Array<{ id_vendor: number; business_name: string }>
  categories: Array<{ id_category: number; category_name: string }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: PackageForm]
}>()

const form = ref<PackageForm>({
  id_vendor: 0,
  id_category: null,
  name: '',
  description: '',
  price: 0,
  duration: '',
  whats_included: '',
  extras: [],
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = {
        id_vendor: props.vendors[0]?.id_vendor ?? 0,
        id_category: null,
        name: '',
        description: '',
        price: 0,
        duration: '',
        whats_included: '',
        extras: [],
      }
    } else if (props.pkg) {
      form.value = {
        id_vendor: props.pkg.id_vendor,
        id_category: props.pkg.id_category || null,
        name: props.pkg.name,
        description: props.pkg.description || '',
        price: props.pkg.price,
        duration: props.pkg.duration || '',
        whats_included: props.pkg.whats_included || '',
        extras: (props.pkg.extras || []).map((e: any) => ({
          id_extra: e.id_extra,
          name: e.name,
          price: e.price,
          icon: e.icon || '',
          description: e.description || '',
        })),
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

function addExtra() {
  form.value.extras.push({ name: '', price: 0, icon: '', description: '' })
}

function removeExtra(index: number) {
  form.value.extras.splice(index, 1)
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
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category</label>
                    <input class="form-control" :value="pkg.category?.category_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Price</label>
                    <input class="form-control" :value="formatCurrency(pkg.price)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Duration</label>
                    <input class="form-control" :value="pkg.duration || '-'" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">What's Included</label>
                    <textarea class="form-control" :value="pkg.whats_included || '-'" readonly rows="4"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea class="form-control" :value="pkg.description || '-'" readonly rows="5"></textarea>
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

              <!-- Detail: Extras list -->
              <div v-if="pkg.extras && pkg.extras.length > 0" class="row" style="margin-top: 20px;">
                <div class="col-md-12">
                  <hr />
                  <h4 style="font-weight: bold;">Package Extras</h4>
                  <table class="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th style="width: 50px;">Icon</th>
                        <th>Name</th>
                        <th style="width: 150px;">Price</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="extra in pkg.extras" :key="extra.id_extra">
                        <td style="text-align: center; font-size: 1.4em;">{{ extra.icon || '-' }}</td>
                        <td>{{ extra.name }}</td>
                        <td>{{ formatCurrency(extra.price) }}</td>
                        <td>{{ extra.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
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
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Category</label>
                    <select v-model="form.id_category" class="form-control">
                      <option :value="null">-- Select Category --</option>
                      <option v-for="category in categories" :key="category.id_category" :value="category.id_category">
                        {{ category.category_name }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Price *</label>
                    <input
                      v-model="displayPrice"
                      class="form-control"
                      placeholder="Price"
                      required
                      @keypress="(e) => { if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault() }"
                      @input="(e) => { const t = e.target as HTMLInputElement; t.value = t.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }"
                    />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Duration</label>
                    <input v-model="form.duration" class="form-control" placeholder="e.g. 2 Hours, 1 Day" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">What's Included</label>
                    <textarea v-model="form.whats_included" class="form-control" placeholder="Describe inclusions (e.g. Album, Videography)" rows="4"></textarea>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; text-align: left;">Description</label>
                    <textarea v-model="form.description" class="form-control" placeholder="General description of the package" rows="5"></textarea>
                  </div>
                </div>
              </div>

              <!-- Extras Section -->
              <div class="row" style="margin-top: 20px;">
                <div class="col-md-12">
                  <hr />
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="font-weight: bold; margin: 0;">Additional Extras</h4>
                    <button type="button" class="btn btn-success btn-sm" @click="addExtra">
                      <i class="fa fa-plus"></i> Add Extra
                    </button>
                  </div>
                  <p style="color: #888; font-size: 0.9em; margin-bottom: 12px;">
                    Tambahkan layanan tambahan yang bisa dipilih customer saat booking (contoh: Drone, Hairdo, Hijab Styling, dll).
                  </p>

                  <div v-if="form.extras.length === 0" style="text-align: center; padding: 20px; background: #f9f9f9; border-radius: 6px; color: #aaa;">
                    Belum ada extras. Klik "Add Extra" untuk menambahkan.
                  </div>

                  <div
                    v-for="(extra, idx) in form.extras"
                    :key="idx"
                    style="background: #f5f7fa; border: 1px solid #e8eaed; border-radius: 6px; padding: 12px; margin-bottom: 10px;"
                  >
                    <div class="row" style="display: flex; align-items: flex-start;">
                      <div class="col-md-2">
                        <label class="control-label" style="font-weight: bold; display: block; text-align: left; font-size: 0.85em;">Icon</label>
                        <input v-model="extra.icon" class="form-control" placeholder="e.g. 📷" style="text-align: center; font-size: 1.3em;" />
                      </div>
                      <div class="col-md-3">
                        <label class="control-label" style="font-weight: bold; display: block; text-align: left; font-size: 0.85em;">Name *</label>
                        <input v-model="extra.name" class="form-control" placeholder="Extra name" />
                      </div>
                      <div class="col-md-3">
                        <label class="control-label" style="font-weight: bold; display: block; text-align: left; font-size: 0.85em;">Price *</label>
                        <input v-model="extra.price" class="form-control" placeholder="0" type="number" min="0" />
                      </div>
                      <div class="col-md-3">
                        <label class="control-label" style="font-weight: bold; display: block; text-align: left; font-size: 0.85em;">Description</label>
                        <input v-model="extra.description" class="form-control" placeholder="Optional description" />
                      </div>
                      <div class="col-md-1" style="display: flex; align-items: flex-end; padding-top: 22px;">
                        <button type="button" class="btn btn-danger btn-xs" @click="removeExtra(idx)" title="Remove extra">
                          <i class="fa fa-trash"></i>
                        </button>
                      </div>
                    </div>
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
