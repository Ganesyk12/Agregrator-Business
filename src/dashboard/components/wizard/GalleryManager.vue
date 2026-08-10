<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  images: any[]
  optionGroups: any[]
  sizeConfigs: any[]
}>()

const emit = defineEmits<{
  'update:images': [value: any[]]
}>()

const auth = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function imageUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${apiUrl}${url}`
}
const uploading = ref(false)
const uploadError = ref('')
const dragIndex = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  uploading.value = true
  uploadError.value = ''
  const vCode = auth.vendorCode || auth.user?.vendor_code || 'general'
  try {
    for (const file of Array.from(input.files)) {
      const formData = new FormData()
      formData.append('vendor_code', vCode)
      formData.append('category', 'products')
      formData.append('file', file)

      const res = await fetch(`${apiUrl}/api/upload?vendor_code=${encodeURIComponent(vCode)}&category=products`, {
        method: 'POST',
        headers: auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {},
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Upload failed' } }))
        uploadError.value = err.error?.message || 'Upload failed'
        return
      }

      const data = await res.json()
      const updated = [...props.images, {
        image_url: data.url,
        sort_order: props.images.length,
        caption: '',
        option_value_id: null as number | null,
        size_config_id: null as number | null,
      }]
      emit('update:images', updated)
    }
  } catch (err: any) {
    uploadError.value = err.message || 'Upload error'
  }
  finally {
    uploading.value = false
    input.value = ''
  }
}

function removeImage(index: number) {
  emit('update:images', props.images.filter((_, i) => i !== index))
}

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
}

function onDrop(index: number) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const updated = [...props.images]
  const [moved] = updated.splice(dragIndex.value, 1)
  updated.splice(index, 0, moved)
  emit('update:images', updated.map((img, i) => ({ ...img, sort_order: i })))
  dragIndex.value = null
}

function updateCaption(index: number, caption: string) {
  const updated = [...props.images]
  updated[index] = { ...updated[index], caption }
  emit('update:images', updated)
}
</script>

<template>
  <div class="gallery-manager">
    <p class="text-muted">Upload product images. Drag to reorder. The first image will be the cover.</p>

    <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>

    <!-- Upload area -->
    <div class="upload-area" @click="fileInput?.click()" :class="{ 'upload-limit': images.length >= 20 }">
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        hidden
        @change="handleUpload"
        :disabled="images.length >= 20"
      />
      <div class="upload-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>{{ uploading ? 'Uploading...' : images.length >= 20 ? 'Maximum 20 images reached' : 'Click to upload images' }}</p>
        <span class="upload-hint">{{ images.length }}/20 images uploaded. Minimum 1 image required. Supported: JPEG, PNG, WebP</span>
      </div>
    </div>

    <!-- Image grid -->
    <div v-if="images.length > 0" class="image-grid">
      <div
        v-for="(img, i) in images"
        :key="i"
        class="image-item"
        draggable="true"
        @dragstart="onDragStart(i)"
        @dragover="onDragOver"
        @drop="onDrop(i)"
        :class="{ dragging: dragIndex === i }"
      >
        <div class="img-preview">
          <img :src="imageUrl(img.image_url)" :alt="'Image ' + (i + 1)" />
          <div v-if="i === 0" class="cover-badge">Cover</div>
          <button class="btn-remove-img" @click="removeImage(i)" title="Remove">&times;</button>
        </div>
        <input
          v-model="img.caption"
          placeholder="Caption (optional)"
          @input="updateCaption(i, img.caption)"
          class="caption-input"
        />
      </div>
    </div>

    <div v-else-if="!uploading" class="no-images">
      <p>No images uploaded yet.</p>
    </div>
  </div>
</template>

<style scoped>
.text-muted {
  color: #999;
  font-size: 0.85rem;
  margin: 0 0 16px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #B89C7B;
  background: #FDF8F3;
}

.upload-placeholder p {
  margin: 8px 0 4px;
  color: #666;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.75rem;
  color: #aaa;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.image-item {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}

.image-item.dragging {
  opacity: 0.5;
  border-color: #B89C7B;
}

.img-preview {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  padding: 2px 10px;
  background: #B89C7B;
  color: #fff;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 600;
}

.btn-remove-img {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .btn-remove-img {
  opacity: 1;
}

.caption-input {
  width: 100%;
  padding: 8px;
  border: none;
  border-top: 1px solid #eee;
  font-size: 0.8rem;
  outline: none;
}

.no-images {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 0.85rem;
}

.upload-error {
  background: #fef2f2;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 12px;
}
</style>
