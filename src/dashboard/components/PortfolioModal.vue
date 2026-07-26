<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Swal from 'sweetalert2'

export interface PortfolioForm {
  id_vendor: number
  id_package: number | null
  id_category: number | null
  cover_url: string
  title: string
  description: string
  location: string
  label: string | null
  sort_order: number
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail'
  portfolio?: any
  vendors: Array<{ id_vendor: number; business_name: string }>
  packages: Array<{ id_package: number; id_vendor: number; name: string; id_category: number | null; category?: { category_name: string } }>
}>()

const emit = defineEmits<{
  close: []
  save: [data: PortfolioForm]
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const isUploading = ref(false)
const uploadError = ref('')

const celebrationOptions = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'formal', label: 'Formal' },
]

const selectedLabels = computed({
  get() {
    return (form.value.label || '').split(',').filter(Boolean)
  },
  set(val: string[]) {
    form.value.label = val.length > 0 ? val.join(',') : null
  }
})

function toggleLabel(value: string) {
  const current = selectedLabels.value
  const idx = current.indexOf(value)
  if (idx === -1) {
    selectedLabels.value = [...current, value]
  } else {
    selectedLabels.value = current.filter(v => v !== value)
  }
}

const form = ref<PortfolioForm>({
  id_vendor: 0,
  id_package: null,
  id_category: null,
  cover_url: '',
  title: '',
  description: '',
  location: '',
  label: null,
  sort_order: 0,
})

const filteredPackages = computed(() => {
  if (!form.value.id_vendor) return []
  return props.packages.filter(p => Number(p.id_vendor) === Number(form.value.id_vendor))
})

watch(() => form.value.id_vendor, (newVendorId) => {
  if (form.value.id_package) {
    const pkg = props.packages.find(p => Number(p.id_package) === Number(form.value.id_package))
    if (!pkg || Number(pkg.id_vendor) !== Number(newVendorId)) {
      form.value.id_package = null
      form.value.id_category = null
    }
  }
})

watch(() => form.value.id_package, (newPkgId) => {
  if (newPkgId) {
    const pkg = props.packages.find(p => Number(p.id_package) === Number(newPkgId))
    if (pkg) {
      form.value.id_category = pkg.id_category || null
    }
  } else {
    form.value.id_category = null
  }
})

watch(() => props.visible, (val) => {
  if (val) {
    uploadError.value = ''
    isUploading.value = false
    if (props.mode === 'add') {
      form.value = {
        id_vendor: props.vendors[0]?.id_vendor ?? 0,
        id_package: null,
        id_category: null,
        cover_url: '',
        title: '',
        description: '',
        location: '',
        label: null,
        sort_order: 0,
      }
    } else if (props.portfolio) {
      form.value = {
        id_vendor: props.portfolio.id_vendor,
        id_package: props.portfolio.id_package || null,
        id_category: props.portfolio.id_category || null,
        cover_url: props.portfolio.cover_url || '',
        title: props.portfolio.title || '',
        description: props.portfolio.description || '',
        location: props.portfolio.location || '',
        label: props.portfolio.label || null,
        sort_order: props.portfolio.sort_order || 0,
      }
    }
  }
})

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  if (!form.value.id_vendor) {
    uploadError.value = 'Silakan pilih Vendor terlebih dahulu.'
    target.value = ''
    return
  }

  if (!form.value.id_package) {
    uploadError.value = 'Silakan pilih Paket terlebih dahulu.'
    target.value = ''
    return
  }

  const file = target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  uploadError.value = ''

  try {
    let catNameClean = 'no-category'

    const pkg = props.packages.find(p => Number(p.id_package) === Number(form.value.id_package))
    if (pkg) {
      if (pkg.category) {
        catNameClean = pkg.category.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
    }

    const vendor = props.vendors.find(v => Number(v.id_vendor) === Number(form.value.id_vendor))
    const vendorCode = vendor ? (vendor as any).vendor_code : ''

    const queryParams = new URLSearchParams({
      vendor_code: vendorCode,
      category: catNameClean,
    })

    const res = await fetch(`${apiUrl}/api/upload?${queryParams.toString()}`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Gagal mengunggah media')
    }

    const result = await res.json()
    form.value.cover_url = result.url
    ToastSuccess('Media berhasil diunggah')
  } catch (err: any) {
    console.error('Upload error:', err)
    uploadError.value = err.message || 'Terjadi kesalahan saat mengunggah'
  } finally {
    isUploading.value = false
  }
}

function ToastSuccess(message: string) {
  try {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2000
    })
  } catch (e) {
    console.log(message)
  }
}

function getMediaUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${apiUrl}${url}`
}

function save() {
  if (!form.value.cover_url || !form.value.id_vendor || !form.value.title) return
  emit('save', { ...form.value, label: form.value.label || null })
}
</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">Add Catalog Product (Portfolio)</template>
            <template v-else-if="mode === 'edit'">Edit Catalog Product (Portfolio)</template>
            <template v-else>Catalog Product Detail</template>
          </h4>
        </div>

        <div class="modal-body">
          <!-- DETAIL VIEW -->
          <template v-if="mode === 'detail' && portfolio">
            <div class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Code</label>
                    <input class="form-control" :value="portfolio.code || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Title</label>
                    <input class="form-control" :value="portfolio.title || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Vendor</label>
                    <input class="form-control" :value="portfolio.vendor?.business_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Package (Paket)</label>
                    <input class="form-control" :value="portfolio.package?.name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Category</label>
                    <input class="form-control" :value="portfolio.category?.category_name || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Location</label>
                    <input class="form-control" :value="portfolio.location || '-'" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Celebration / Occasion</label>
                    <div v-if="portfolio.label">
                      <span class="label label-primary" style="margin-right: 4px; display: inline-block; margin-bottom: 4px;" v-for="lbl in (portfolio.label || '').split(',').filter(Boolean)" :key="lbl">
                        {{ lbl.charAt(0).toUpperCase() + lbl.slice(1) }}
                      </span>
                    </div>
                    <input v-else class="form-control" value="-" readonly />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Media path</label>
                    <input class="form-control" :value="portfolio.cover_url" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;" v-if="portfolio.cover_url">
                    <label class="control-label" style="font-weight: bold; display: block; margin-bottom: 8px;">Preview Media</label>
                    <img :src="getMediaUrl(portfolio.cover_url)" alt="Preview" style="max-width: 100%; max-height: 180px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px;" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Description</label>
                    <textarea class="form-control" :value="portfolio.description || '-'" readonly rows="4"></textarea>
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
                    <label class="control-label" style="font-weight: bold; display: block;">Title *</label>
                    <input v-model="form.title" class="form-control" placeholder="e.g. Traditional Wedding MUA, Outdoor Prewedding" required />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Vendor *</label>
                    <select v-model="form.id_vendor" class="form-control" required>
                      <option v-for="vendor in vendors" :key="vendor.id_vendor" :value="vendor.id_vendor">
                        {{ vendor.business_name }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- Package Dropdown -->
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Package (Paket) *</label>
                    <select v-model="form.id_package" class="form-control" required>
                      <option :value="null" disabled>-- Pilih Paket --</option>
                      <option v-for="pkg in filteredPackages" :key="pkg.id_package" :value="pkg.id_package">
                        {{ pkg.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Category Display (Read-Only calculated) -->
                  <div class="form-group" style="text-align: left;" v-if="form.id_package">
                    <label class="control-label" style="font-weight: bold; display: block;">Category</label>
                    <input class="form-control" :value="packages.find(p => p.id_package === form.id_package)?.category?.category_name || '-'" readonly />
                  </div>

                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Location</label>
                    <input v-model="form.location" class="form-control" placeholder="e.g. Jakarta, Bali, Bandung" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block; margin-bottom: 8px;">Celebration / Occasion</label>
                    <div class="celebration-checkboxes">
                      <label class="checkbox-inline" v-for="opt in celebrationOptions" :key="opt.value" style="margin-right: 12px; font-weight: normal; cursor: pointer;">
                        <input type="checkbox" :value="opt.value" :checked="selectedLabels.includes(opt.value)" @change="toggleLabel(opt.value)" style="margin-right: 4px;" />
                        {{ opt.label }}
                      </label>
                    </div>
                    <p style="color: #888; font-size: 0.8em; margin-top: 4px;">Pilih lebih dari satu jika sesuai dengan beberapa momen.</p>
                  </div>
                </div>

                <div class="col-md-6">
                  <!-- File Upload Input with Package & Category query params -->
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Upload Media (Foto/Video) *</label>
                    <input type="file" @change="onFileChange" class="form-control" accept="image/*,video/*" :required="mode === 'add' && !form.cover_url" />
                    <div style="margin-top: 6px;">
                      <span v-if="isUploading" class="text-info"><i class="fa fa-spinner fa-spin"></i> Mengunggah file...</span>
                      <span v-if="uploadError" class="text-danger"><i class="fa fa-exclamation-circle"></i> {{ uploadError }}</span>
                      <span v-if="form.cover_url && !isUploading" class="text-success"><i class="fa fa-check-circle"></i> File siap: {{ form.cover_url }}</span>
                    </div>
                  </div>

                  <div class="form-group" style="text-align: left; margin-top: 15px;" v-if="form.cover_url">
                    <label class="control-label" style="font-weight: bold; display: block; margin-bottom: 8px;">Preview Media</label>
                    <img :src="getMediaUrl(form.cover_url)" alt="Preview" style="max-width: 100%; max-height: 180px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px;" />
                  </div>

                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold; display: block;">Description</label>
                    <textarea v-model="form.description" class="form-control" placeholder="Description of the catalog product/service" rows="5"></textarea>
                  </div>
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>
          <button v-if="mode !== 'detail'" type="button" class="btn btn-primary" @click="save" :disabled="!form.cover_url || !form.id_vendor || !form.title || isUploading">
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
