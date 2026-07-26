<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const form = ref({
  business_name: '',
  description: '',
  location: '',
  avatar_url: '',
  instagram: '',
})

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref('')
const avatarPreview = ref('')

onMounted(async () => {
  try {
    const res = await auth.authFetch('/api/vendors/me')
    if (res.ok) {
      const json = await res.json()
      const v = json.data
      if (v) {
        form.value = {
          business_name: v.business_name || '',
          description: v.description || '',
          location: v.location || '',
          avatar_url: v.avatar_url || '',
          instagram: v.instagram || '',
        }
        avatarPreview.value = v.avatar_url || ''
      }
    }
  } catch { error.value = 'Failed to load profile' }
  finally { loading.value = false }
})

function handleAvatarInput(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = reader.result as string
    form.value.avatar_url = reader.result as string
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  avatarPreview.value = ''
  form.value.avatar_url = ''
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  success.value = false
  try {
    const res = await auth.authFetch('/api/vendors/me', {
      method: 'PATCH',
      body: JSON.stringify({
        business_name: form.value.business_name,
        description: form.value.description,
        location: form.value.location,
        avatar_url: form.value.avatar_url || null,
        instagram: form.value.instagram,
      }),
    })
    if (!res.ok) {
      const e = await res.json().catch(() => ({}))
      throw new Error(e?.error?.message || 'Failed to update profile')
    }
    const json = await res.json()
    const v = json.data
    auth.setVendorInfo({
      vendor_id: v.id_vendor,
      vendor_category: v.category,
      vendor_name: v.business_name,
      vendor_avatar: v.avatar_url,
    })
    if (v.avatar_url) auth.updateVendorAvatar(v.avatar_url)
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (err: any) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="x_panel">
    <div class="x_title"><h2>My Profile</h2><div class="clearfix"></div></div>
    <div class="x_content">
      <div v-if="loading" class="text-center py-4"><p>Loading profile...</p></div>

      <form v-else @submit.prevent="saveProfile" class="profile-form">
        <!-- Avatar -->
        <div class="form-group avatar-section">
          <label>Profile Photo</label>
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" />
              <div v-else class="avatar-placeholder">
                <i class="fa fa-user-circle-o"></i>
              </div>
            </div>
            <div class="avatar-actions">
              <label class="btn-upload">
                <i class="fa fa-camera"></i> Upload Photo
                <input type="file" accept="image/*" @change="handleAvatarInput" hidden />
              </label>
              <button v-if="avatarPreview" type="button" class="btn-remove" @click="removeAvatar">
                <i class="fa fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Business Name -->
        <div class="form-group">
          <label>Business Name</label>
          <input v-model="form.business_name" type="text" class="form-control" required />
        </div>

        <!-- Instagram -->
        <div class="form-group">
          <label>Instagram / Portfolio URL</label>
          <input v-model="form.instagram" type="url" class="form-control" placeholder="https://instagram.com/yourprofile" />
        </div>

        <!-- Location -->
        <div class="form-group">
          <label>Location</label>
          <input v-model="form.location" type="text" class="form-control" placeholder="City, Province" />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description" class="form-control" rows="4" placeholder="Describe your business..."></textarea>
        </div>

        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="success" class="text-success">Profile updated successfully!</p>

        <button type="submit" class="btn btn-primary" :disabled="saving">
          <i class="fa fa-save"></i> {{ saving ? 'Saving...' : 'Save Profile' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-form {
  max-width: 600px;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e0e0e0;
  flex-shrink: 0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #ccc;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #1e293b;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-upload:hover { background: #334155; }

.btn-remove {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-remove:hover { background: #fef2f2; }

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.85rem;
}
</style>
