<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface ProductForm {
  id_vendor: number
  type_name: string | null
  size_name: string | null
  name: string
  description: string
  price: number
  stock: number
  estimated_delivery: string
  delivery_info: string
  occasion_ids: number[]
  images: Array<{ image_url: string; caption?: string | null }>
  variants: Array<{ name: string; price_adjust: number; stock: number }>
  addons: Array<{ name: string; price: number; description?: string }>
}

const celebrationOptions = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'formal', label: 'Formal' },
]

const occasionSlugToId: Record<string, number> = {
  wedding: 1, graduation: 2, birthday: 3,
  engagement: 4, anniversary: 5, formal: 6,
}

function parseLabelsToIds(labels?: string | null): number[] {
  if (!labels) return []
  return labels.split(',').map(s => s.trim()).filter(Boolean).map(slug => occasionSlugToId[slug]).filter(id => id !== undefined)
}

const productTypeOptions = ['Flower Bouquet', 'Money Bouquet', 'Snack Bouquet', 'Chocolate Bouquet', 'Mixed Bouquet']
const productSizeOptions = ['Small', 'Medium', 'Large']

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  product?: any
  vendors: Array<{ id_vendor: number; business_name: string; vendor_code: string }>
  occasions: Array<{ id_occasion: number; name: string }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: ProductForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const isUploading = ref(false)
const uploadError = ref('')

const form = ref<ProductForm>({
  id_vendor: 0,
  type_name: null,
  size_name: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  estimated_delivery: '',
  delivery_info: '',
  occasion_ids: [],
  images: [],
  variants: [],
  addons: [],
})

function toggleOccasion(id: number) {
  const ids = new Set(form.value.occasion_ids)
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  form.value.occasion_ids = Array.from(ids)
}

const displayPrice = computed({
  get() {
    if (!form.value.price || form.value.price === 0) return ''
    return form.value.price.toLocaleString('id-ID')
  },
  set(val: string) {
    form.value.price = val.replace(/\D/g, '') ? parseInt(val.replace(/\D/g, ''), 10) : 0
  }
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.mode === 'add') {
      form.value = {
        id_vendor: props.vendors[0]?.id_vendor ?? 0,
        type_name: null,
        size_name: null,
        name: '',
        description: '',
        price: 0,
        stock: 0,
        estimated_delivery: '',
        delivery_info: '',
        occasion_ids: [],
        images: [],
        variants: [],
        addons: [],
      }
    } else if (props.product) {
      form.value = {
        id_vendor: props.product.id_vendor,
        type_name: props.product.type_name || null,
        size_name: props.product.size_name || null,
        name: props.product.name,
        description: props.product.description || '',
        price: props.product.price,
        stock: props.product.stock || 0,
        estimated_delivery: props.product.estimated_delivery || '',
        delivery_info: props.product.delivery_info || '',
        occasion_ids: parseLabelsToIds(props.product.labels),
        images: (props.product.images || []).map((img: any) => ({ image_url: img.image_url, caption: img.caption })),
        variants: (props.product.variants || []).map((v: any) => ({ name: v.name, price_adjust: v.price_adjust, stock: v.stock })),
        addons: (props.product.addons || []).map((a: any) => ({ name: a.name, price: a.price, description: a.description })),
      }
    }
  }
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

async function onImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  const vendor = props.vendors.find(v => v.id_vendor === form.value.id_vendor)
  if (!vendor) { uploadError.value = 'Pilih vendor terlebih dahulu'; return }
  const formData = new FormData()
  formData.append('vendor_code', vendor.vendor_code)
  formData.append('category', 'products')
  formData.append('file', file)
  isUploading.value = true
  uploadError.value = ''
  try {
    const res = await fetch(`${apiUrl}/api/upload`, { method: 'POST', body: formData })
    if (!res.ok) throw new Error((await res.json()).error?.message || 'Upload failed')
    const result = await res.json()
    form.value.images.push({ image_url: result.url, caption: null })
  } catch (err: any) {
    uploadError.value = err.message || 'Upload failed'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

function removeImage(idx: number) {
  form.value.images.splice(idx, 1)
}

function addVariant() {
  form.value.variants.push({ name: '', price_adjust: 0, stock: 0 })
}

function removeVariant(idx: number) {
  form.value.variants.splice(idx, 1)
}

function addAddon() {
  form.value.addons.push({ name: '', price: 0, description: '' })
}

function removeAddon(idx: number) {
  form.value.addons.splice(idx, 1)
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
            <template v-if="mode === 'add'">Add Product</template>
            <template v-else-if="mode === 'edit'">Edit Product</template>
            <template v-else>Product Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && product">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Product Name</label>
                    <input class="form-control" :value="product.name" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Vendor</label>
                    <input class="form-control" :value="product.vendor?.business_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Price</label>
                    <input class="form-control" :value="formatCurrency(product.price)" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Stock</label>
                    <input class="form-control" :value="product.stock ?? 0" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Celebration / Occasion</label>
                    <div v-if="product.labels">
                      <span class="label label-primary" style="margin-right:4px;display:inline-block;margin-bottom:4px;" v-for="lbl in (product.labels || '').split(',').filter(Boolean)" :key="lbl">{{ lbl.charAt(0).toUpperCase() + lbl.slice(1) }}</span>
                    </div>
                    <input v-else class="form-control" value="-" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Type</label>
                    <input class="form-control" :value="product.type_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Size</label>
                    <input class="form-control" :value="product.size_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Est. Delivery</label>
                    <input class="form-control" :value="product.estimated_delivery || '-'" readonly />
                  </div>
                </div>
              </div>
              <div class="row" style="margin-top: 16px;">
                <div class="col-md-12">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Description</label>
                    <textarea class="form-control" :value="product.description || '-'" readonly rows="3"></textarea>
                  </div>
                </div>
              </div>
              <!-- Images -->
              <div v-if="product.images?.length" class="row" style="margin-top: 16px;">
                <div class="col-md-12">
                  <label class="control-label" style="font-weight: bold; display: block; margin-bottom: 8px;">Gallery</label>
                  <div class="row">
                    <div v-for="img in product.images" :key="img.id_image" class="col-md-3 col-sm-4" style="margin-bottom: 8px;">
                      <img :src="img.image_url" style="width:100%; height:120px; object-fit:cover; border-radius:4px;" />
                    </div>
                  </div>
                </div>
              </div>
              <!-- Variants -->
              <div v-if="product.variants?.length" class="row" style="margin-top: 16px;">
                <div class="col-md-12">
                  <hr />
                  <h4 style="font-weight: bold;">Variants</h4>
                  <table class="table table-bordered">
                    <thead><tr><th>Name</th><th>Price Adjust</th><th>Stock</th></tr></thead>
                    <tbody>
                      <tr v-for="v in product.variants" :key="v.id_variant">
                        <td>{{ v.name }}</td>
                        <td>{{ formatCurrency(v.price_adjust) }}</td>
                        <td>{{ v.stock }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <!-- Addons -->
              <div v-if="product.addons?.length" class="row" style="margin-top: 16px;">
                <div class="col-md-12">
                  <hr />
                  <h4 style="font-weight: bold;">Add-ons</h4>
                  <table class="table table-bordered">
                    <thead><tr><th>Name</th><th>Price</th><th>Description</th></tr></thead>
                    <tbody>
                      <tr v-for="a in product.addons" :key="a.id_addon">
                        <td>{{ a.name }}</td>
                        <td>{{ formatCurrency(a.price) }}</td>
                        <td>{{ a.description || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </template>

          <!-- ADD/EDIT FORM -->
          <template v-else>
            <form @submit.prevent="save" class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Product Name *</label>
                    <input v-model="form.name" class="form-control" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Vendor *</label>
                    <select v-model="form.id_vendor" class="form-control" required>
                      <option v-for="v in vendors" :key="v.id_vendor" :value="v.id_vendor">{{ v.business_name }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; margin-bottom: 8px;">Celebration / Occasion</label>
                    <p style="font-size:0.85em;color:#888;margin-bottom:8px;">Pilih lebih dari satu jika sesuai dengan beberapa momen.</p>
                    <div class="celebration-checkboxes">
                      <label class="checkbox-inline" v-for="opt in celebrationOptions" :key="opt.value" style="margin-right:12px;font-weight:normal;cursor:pointer;">
                        <input type="checkbox" :value="occasionSlugToId[opt.value]" :checked="form.occasion_ids.includes(occasionSlugToId[opt.value])" @change="toggleOccasion(occasionSlugToId[opt.value])" style="margin-right:4px;" />
                        {{ opt.label }}
                      </label>
                    </div>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Type</label>
                    <select v-model="form.type_name" class="form-control">
                      <option :value="null">-- Select --</option>
                      <option v-for="t in productTypeOptions" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Size</label>
                    <select v-model="form.size_name" class="form-control">
                      <option :value="null">-- Select --</option>
                      <option v-for="s in productSizeOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Price *</label>
                    <input v-model="displayPrice" class="form-control" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Stock</label>
                    <input v-model="form.stock" class="form-control" type="number" min="0" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Est. Delivery Time</label>
                    <input v-model="form.estimated_delivery" class="form-control" placeholder="e.g. 2-3 days" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Delivery Info</label>
                    <textarea v-model="form.delivery_info" class="form-control" rows="2" placeholder="Delivery notes"></textarea>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Description</label>
                    <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                  </div>

                  <!-- Images -->
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Gallery</label>
                    <input type="file" @change="onImageUpload" class="form-control" accept="image/*" />
                    <span v-if="isUploading" class="text-info"><i class="fa fa-spinner fa-spin"></i> Uploading...</span>
                    <span v-if="uploadError" class="text-danger">{{ uploadError }}</span>
                    <div class="row" style="margin-top: 8px;">
                      <div v-for="(img, idx) in form.images" :key="idx" class="col-md-4 col-sm-4" style="margin-bottom: 8px; position: relative;">
                        <img :src="img.image_url" style="width:100%; height:80px; object-fit:cover; border-radius:4px;" />
                        <button type="button" class="btn btn-danger btn-xs" style="position:absolute; top:2px; right:2px;" @click="removeImage(idx)">&times;</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Variants -->
              <div class="row" style="margin-top: 20px;">
                <div class="col-md-12">
                  <hr />
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="font-weight:bold; margin:0;">Variants</h4>
                    <button type="button" class="btn btn-success btn-sm" @click="addVariant"><i class="fa fa-plus"></i> Add Variant</button>
                  </div>
                  <div v-if="form.variants.length === 0" style="text-align:center; padding:16px; background:#f9f9f9; border-radius:6px; color:#aaa;">No variants.</div>
                  <div v-for="(v, idx) in form.variants" :key="idx" style="background:#f5f7fa; border:1px solid #e8eaed; border-radius:6px; padding:10px; margin-bottom:8px;">
                    <div class="row">
                      <div class="col-md-4">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Name</label>
                        <input v-model="v.name" class="form-control" placeholder="e.g. Red" />
                      </div>
                      <div class="col-md-3">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Price Adjust</label>
                        <input v-model="v.price_adjust" class="form-control" type="number" />
                      </div>
                      <div class="col-md-3">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Stock</label>
                        <input v-model="v.stock" class="form-control" type="number" min="0" />
                      </div>
                      <div class="col-md-2" style="display:flex; align-items:flex-end; padding-top:22px;">
                        <button type="button" class="btn btn-danger btn-xs" @click="removeVariant(idx)"><i class="fa fa-trash"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Add-ons -->
              <div class="row" style="margin-top: 20px;">
                <div class="col-md-12">
                  <hr />
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h4 style="font-weight:bold; margin:0;">Add-ons</h4>
                    <button type="button" class="btn btn-success btn-sm" @click="addAddon"><i class="fa fa-plus"></i> Add Add-on</button>
                  </div>
                  <div v-if="form.addons.length === 0" style="text-align:center; padding:16px; background:#f9f9f9; border-radius:6px; color:#aaa;">No add-ons.</div>
                  <div v-for="(a, idx) in form.addons" :key="idx" style="background:#f5f7fa; border:1px solid #e8eaed; border-radius:6px; padding:10px; margin-bottom:8px;">
                    <div class="row">
                      <div class="col-md-4">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Name</label>
                        <input v-model="a.name" class="form-control" placeholder="e.g. Ribbon wrap" />
                      </div>
                      <div class="col-md-3">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Price</label>
                        <input v-model="a.price" class="form-control" type="number" />
                      </div>
                      <div class="col-md-3">
                        <label style="font-weight:bold; display:block; font-size:0.85em;">Description</label>
                        <input v-model="a.description" class="form-control" />
                      </div>
                      <div class="col-md-2" style="display:flex; align-items:flex-end; padding-top:22px;">
                        <button type="button" class="btn btn-danger btn-xs" @click="removeAddon(idx)"><i class="fa fa-trash"></i></button>
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
