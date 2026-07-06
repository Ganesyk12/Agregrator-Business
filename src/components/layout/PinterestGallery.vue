<template>
  <div class="pinterest-gallery">
    <div class="masonry">
      <div
        v-for="(item, index) in resolvedItems"
        :key="index"
        class="masonry-item"
        @click="handleClick(item)"
      >
        <img :src="item.url" :alt="item.alt || 'Gallery image ' + (index + 1)" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'

interface GalleryItem {
  url: string
  alt?: string
  id_portfolio?: number
}

const props = defineProps<{
  images: string[] | GalleryItem[]
}>()

const router = useRouter()

const resolvedItems = computed<GalleryItem[]>(() => {
  return props.images.map((item) => {
    if (typeof item === 'string') return { url: item }
    return item
  })
})

function handleClick(item: GalleryItem) {
  if (item.id_portfolio) {
    router.push(`/portfolio/${item.id_portfolio}`)
  }
}
</script>

<style scoped>
.pinterest-gallery {
  padding: 0;
}
.masonry {
  column-count: 5;
  column-gap: 12px;
  padding: 0 12px;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.masonry-item:hover {
  transform: scale(1.02);
}
.masonry-item img {
  width: 100%;
  display: block;
  border-radius: 12px;
}
@media (max-width: 1200px) {
  .masonry { column-count: 4; }
}
@media (max-width: 992px) {
  .masonry { column-count: 3; }
}
@media (max-width: 576px) {
  .masonry { column-count: 2; }
}
</style>
