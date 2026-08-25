<script setup lang="ts">
import { ref } from 'vue'
import defaultImage from '@/assets/default/nothing.png'

const props = defineProps<{
  images: { id_image: number; image_url: string; caption: string | null }[]
}>()

const emit = defineEmits<{
  preview: [index: number]
}>()

const previewIndex = ref<number | null>(null)
const showPreview = ref(false)

function openPreview(index: number) {
  previewIndex.value = index
  showPreview.value = true
  emit('preview', index)
}

function closePreview() {
  showPreview.value = false
  previewIndex.value = null
}

function nextImage() {
  if (previewIndex.value !== null && previewIndex.value < props.images.length - 1) {
    previewIndex.value++
  }
}

function prevImage() {
  if (previewIndex.value !== null && previewIndex.value > 0) {
    previewIndex.value--
  }
}
</script>

<template>
  <div class="portfolio-gallery">
    <div class="gallery-grid">
      <div
        v-for="(image, index) in images"
        :key="image.id_image"
        class="gallery-item"
        @click="openPreview(index)"
      >
        <img :src="image.image_url || defaultImage" :alt="image.caption || 'Gallery image'" loading="lazy" />
        <div class="gallery-overlay">
          <span class="overlay-icon">+</span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showPreview && previewIndex !== null" class="preview-modal" @click.self="closePreview">
        <button class="preview-close" @click="closePreview">&times;</button>
        <button v-if="previewIndex > 0" class="preview-nav prev" @click="prevImage">&lsaquo;</button>
        <button v-if="previewIndex < images.length - 1" class="preview-nav next" @click="nextImage">&rsaquo;</button>
        <div class="preview-content">
          <img :src="images[previewIndex].image_url || defaultImage" alt="Preview" />
          <p v-if="images[previewIndex].caption" class="preview-caption">{{ images[previewIndex].caption }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4/3;
}
.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.gallery-item:hover img {
  transform: scale(1.08);
}
.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.gallery-item:hover .gallery-overlay {
  opacity: 1;
}
.overlay-icon {
  color: #fff;
  font-size: 2rem;
  font-weight: 300;
}
.preview-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-close {
  position: absolute;
  top: 20px;
  right: 30px;
  background: none;
  border: none;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}
.preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  font-size: 3rem;
  padding: 10px 18px;
  cursor: pointer;
  border-radius: 50%;
  z-index: 10;
  transition: background 0.2s;
}
.preview-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}
.preview-nav.prev { left: 20px; }
.preview-nav.next { right: 20px; }
.preview-content {
  max-width: 80vw;
  max-height: 85vh;
  text-align: center;
}
.preview-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}
.preview-caption {
  color: #ccc;
  margin-top: 12px;
  font-size: 0.95rem;
}
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .gallery-grid { grid-template-columns: 1fr; }
}
</style>
