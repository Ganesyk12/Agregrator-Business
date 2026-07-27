<script setup lang="ts">
import { ref, computed } from 'vue'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function imageUrl(url: string) {
  if (!url) return url
  return url.startsWith('http') ? url : `${apiUrl}${url}`
}

const props = defineProps<{
  form: any
}>()

const selectedOptions = ref<Record<string, string>>({})
const selectedSize = ref<string | null>(null)
const selectedExtras = ref<string[]>([])
const quantity = ref(1)
const mobilePreview = ref(false)

const coverImage = computed(() => {
  if (props.form.images && props.form.images.length > 0) {
    const cover = props.form.images.find((img: any) => img.sort_order === -1 || img.sort_order === 0)
    return imageUrl(cover?.image_url || props.form.images[0]?.image_url)
  }
  return 'https://placehold.co/600x600?text=Product'
})

const displayImages = computed(() => {
  if (props.form.images && props.form.images.length > 0) {
    return props.form.images
  }
  return [{ image_url: coverImage.value }]
})

const basePrice = computed(() => Number(props.form.price) || 0)

const optionsTotal = computed(() => {
  let total = 0
  for (const [groupName, valueName] of Object.entries(selectedOptions.value)) {
    const group = props.form.option_groups?.find((g: any) => g.name === groupName)
    if (group) {
      const value = group.values?.find((v: any) => v.name === valueName)
      if (value) total += Number(value.price_adjust || 0)
    }
  }
  return total
})

const sizePrice = computed(() => {
  if (!selectedSize.value) return 0
  const size = props.form.size_configs?.find((s: any) => s.name === selectedSize.value)
  return size ? Number(size.price || 0) : 0
})

const extrasTotal = computed(() => {
  let total = 0
  for (const extraName of selectedExtras.value) {
    const extra = props.form.optional_extras?.find((e: any) => e.name === extraName)
    if (extra) total += Number(extra.price || 0)
  }
  return total
})

const finalPrice = computed(() => (basePrice.value + optionsTotal.value + sizePrice.value + extrasTotal.value) * quantity.value)

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function toggleExtra(name: string) {
  if (selectedExtras.value.includes(name)) {
    selectedExtras.value = selectedExtras.value.filter(e => e !== name)
  } else {
    selectedExtras.value = [...selectedExtras.value, name]
  }
}
</script>

<template>
  <div class="preview-container">
    <div class="preview-toolbar">
      <p class="text-muted">This is how your product will appear to customers. Every change you make updates instantly.</p>
      <div class="device-toggle">
        <button :class="{ active: !mobilePreview }" @click="mobilePreview = false">Desktop</button>
        <button :class="{ active: mobilePreview }" @click="mobilePreview = true">Mobile</button>
      </div>
    </div>

    <div class="preview-layout" :class="{ mobile: mobilePreview }">
      <!-- Gallery -->
      <div class="preview-gallery">
        <div class="main-image">
          <img :src="coverImage" alt="Product preview" />
        </div>
        <div class="thumbnails">
          <div
            v-for="(img, i) in displayImages"
            :key="i"
            class="thumb"
            :class="{ active: i === 0 }"
          >
            <img :src="imageUrl(img.image_url)" alt="" />
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="preview-info">
        <h2>{{ form.name || 'Product Name' }}</h2>
        <p class="vendor-name">{{ form.vendor?.business_name || 'Your Store' }}</p>

        <div v-if="form.occasion_ids && form.occasion_ids.length > 0" class="occasion-tags">
          <span v-for="id in form.occasion_ids" :key="id" class="tag">
            {{ id === 1 ? 'Wedding' : id === 2 ? 'Graduation' : id === 3 ? 'Birthday' : id === 4 ? 'Engagement' : id === 5 ? 'Anniversary' : id === 6 ? 'Formal' : 'Custom' }}
          </span>
        </div>

        <div class="price-display">{{ formatPrice(basePrice + optionsTotal + sizePrice + extrasTotal) }}</div>

        <p v-if="form.description" class="description">{{ form.description }}</p>

        <!-- Option Groups -->
        <div v-for="group in form.option_groups || []" :key="group.name" class="option-section">
          <label>{{ group.name }} <span v-if="group.is_required" class="required">*</span></label>
          <div class="option-values">
            <button
              v-for="val in group.values || []"
              :key="val.name"
              class="option-btn"
              :class="{ active: selectedOptions[group.name] === val.name }"
              @click="selectedOptions[group.name] = val.name"
            >
              {{ val.name }}
              <span v-if="val.price_adjust > 0" class="price-badge">+{{ formatPrice(val.price_adjust) }}</span>
            </button>
          </div>
        </div>

        <!-- Size Config -->
        <div v-if="form.size_configs && form.size_configs.length > 0" class="option-section">
          <label>Size</label>
          <div class="option-values">
            <button
              v-for="size in form.size_configs"
              :key="size.name"
              class="option-btn"
              :class="{ active: selectedSize === size.name }"
              @click="selectedSize = size.name"
            >
              {{ size.name }}
              <span v-if="size.price > 0" class="price-badge">{{ formatPrice(size.price) }}</span>
            </button>
          </div>
        </div>

        <!-- Optional Extras -->
        <div v-if="form.optional_extras && form.optional_extras.length > 0" class="option-section">
          <label>Optional Extras</label>
          <div class="extras-list">
            <label v-for="extra in form.optional_extras" :key="extra.name" class="extra-item">
              <input
                type="checkbox"
                :checked="selectedExtras.includes(extra.name)"
                @change="toggleExtra(extra.name)"
              />
              <span class="extra-name">{{ extra.name }}</span>
              <span class="extra-price">{{ formatPrice(extra.price) }}</span>
            </label>
          </div>
        </div>

        <!-- Quantity -->
        <div class="quantity-section">
          <label>Quantity</label>
          <div class="qty-control">
            <button @click="quantity = Math.max(1, quantity - 1)">-</button>
            <span>{{ quantity }}</span>
            <button @click="quantity++">+</button>
          </div>
        </div>

        <!-- Total -->
        <div class="total-price">{{ formatPrice(finalPrice) }}</div>

        <!-- Action buttons -->
        <div class="actions">
          <button class="btn btn-primary btn-add-cart">Add to Cart</button>
          <button class="btn btn-outline btn-wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-muted {
  color: #999;
  font-size: 0.85rem;
  margin: 0;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.device-toggle {
  display: flex;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.device-toggle button {
  padding: 6px 14px;
  border: none;
  background: transparent;
  font-size: 0.78rem;
  cursor: pointer;
  color: #888;
  transition: all 0.2s;
}

.device-toggle button.active {
  background: #B89C7B;
  color: #fff;
}

.preview-layout.mobile {
  max-width: 400px;
  margin: 0 auto;
  grid-template-columns: 1fr;
}

.preview-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.preview-gallery {
  position: sticky;
  top: 0;
}

.main-image {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  margin-bottom: 12px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.thumb.active {
  border-color: #B89C7B;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info h2 {
  margin: 0 0 4px;
  font-size: 1.3rem;
}

.vendor-name {
  color: #888;
  font-size: 0.9rem;
  margin: 0 0 12px;
}

.occasion-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 10px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #666;
}

.price-display {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2a2a2a;
  margin-bottom: 12px;
}

.description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.option-section {
  margin-bottom: 16px;
}

.option-section label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.required {
  color: #e44;
}

.option-values {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: #B89C7B;
}

.option-btn.active {
  border-color: #B89C7B;
  background: #FDF8F3;
  font-weight: 600;
}

.price-badge {
  margin-left: 4px;
  color: #B89C7B;
  font-weight: 600;
}

.extras-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.extra-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.extra-item:has(input:checked) {
  border-color: #B89C7B;
  background: #FDF8F3;
}

.extra-name {
  flex: 1;
}

.extra-price {
  color: #B89C7B;
  font-weight: 600;
}

.quantity-section {
  margin-bottom: 16px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-control button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.qty-control span {
  font-size: 1rem;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
}

.total-price {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-add-cart {
  flex: 1;
  padding: 12px 24px;
  background: #B89C7B;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
}

.btn-wishlist {
  width: 48px;
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-wishlist:hover {
  border-color: #e44;
  color: #e44;
}
</style>
