<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const auth = useAuthStore()

const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 })

const form = ref({
  business_name: auth.user?.vendor_name || '',
  description: '',
  location: '',
  instagram: '',
  avatar_url: auth.user?.vendor_avatar || '',
})

const loading = ref(true)

onMounted(async () => {
  try {
    const res = await auth.authFetch('/api/vendors/me')
    if (res.ok) {
      const json = await res.json()
      const v = json.data
      if (v) {
        form.value.business_name = v.business_name || ''
        form.value.description = v.description || ''
        form.value.location = v.location || ''
        form.value.instagram = v.instagram || ''
        form.value.avatar_url = v.avatar_url || ''
      }
    }
  } catch { /* ignore */ }
  loading.value = false
})

async function handleAvatarUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = async (ev) => {
    const dataUrl = ev.target?.result as string
    form.value.avatar_url = dataUrl
  }
  reader.readAsDataURL(file)
}

async function save() {
  try {
    const res = await auth.authFetch('/api/vendors/me', {
      method: 'PATCH',
      body: JSON.stringify({
        business_name: form.value.business_name,
        description: form.value.description,
        location: form.value.location,
        instagram: form.value.instagram,
        avatar_url: form.value.avatar_url,
      }),
    })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || 'Failed to save') }
    const json = await res.json()
    const v = json.data
    if (v) {
      auth.setVendorInfo({
        vendor_id: v.id_vendor,
        vendor_category: v.category,
        vendor_name: v.business_name,
        vendor_type: v.vendor_type,
        vendor_avatar: v.avatar_url,
      })
    }
    Toast.fire({ icon: 'success', title: 'Store settings updated!' })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>Store Settings</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div v-if="loading" class="text-center py-3"><p>Loading...</p></div>
      <form v-else @submit.prevent="save" class="form-horizontal form-label-left">
        <div class="form-group">
          <label class="control-label col-md-3">Store Logo</label>
          <div class="col-md-9">
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:80px;height:80px;border-radius:50%;overflow:hidden;background:#eee;display:flex;align-items:center;justify-content:center;border:2px dashed #ccc;">
                <img v-if="form.avatar_url" :src="form.avatar_url" style="width:100%;height:100%;object-fit:cover;" />
                <i v-else class="fa fa-store" style="font-size:2rem;color:#ccc;"></i>
              </div>
              <input type="file" accept="image/*" @change="handleAvatarUpload" class="form-control" style="width:auto;display:inline-block;" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="control-label col-md-3">Store Name</label>
          <div class="col-md-9"><input type="text" class="form-control" v-model="form.business_name" required /></div>
        </div>

        <div class="form-group">
          <label class="control-label col-md-3">Description</label>
          <div class="col-md-9"><textarea class="form-control" rows="4" v-model="form.description"></textarea></div>
        </div>

        <div class="form-group">
          <label class="control-label col-md-3">Location</label>
          <div class="col-md-9"><input type="text" class="form-control" v-model="form.location" /></div>
        </div>

        <div class="form-group">
          <label class="control-label col-md-3">Instagram</label>
          <div class="col-md-9"><input type="text" class="form-control" placeholder="https://instagram.com/yourstore" v-model="form.instagram" /></div>
        </div>

        <div class="ln_solid"></div>
        <div class="form-group"><div class="col-md-9 col-md-offset-3"><button type="submit" class="btn btn-success"><i class="fa fa-save"></i> Save Settings</button></div></div>
      </form>
    </div>
  </div>
</template>
