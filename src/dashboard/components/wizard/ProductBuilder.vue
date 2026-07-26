<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function imageUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${apiUrl}${url}`
}

const props = defineProps<{
  optionGroups: any[]
  sizeConfigs: any[]
  optionalExtras: any[]
  templateSlug?: string
}>()

const emit = defineEmits<{
  'update:optionGroups': [value: any[]]
  'update:sizeConfigs': [value: any[]]
  'update:optionalExtras': [value: any[]]
}>()

const auth = useAuthStore()
const uploading = ref<Record<string, boolean>>({})

const enableSize = ref(props.sizeConfigs.length > 0)
const enableWrapping = ref(false)
const enableGreeting = ref(false)
const enableRibbon = ref(false)
const enableStyle = ref(false)

const sizes = ref<Array<{ name: string; price: number }>>(
  props.sizeConfigs.length > 0
    ? props.sizeConfigs.map(s => ({ name: s.name, price: s.price }))
    : [{ name: 'Small', price: 0 }, { name: 'Medium', price: 50000 }, { name: 'Large', price: 100000 }]
)

const wrappingColors = ref<Array<{ name: string; image_url: string; price_adjust: number }>>([])
const greetingTemplate = ref('')
const ribbonColors = ref<Array<{ name: string; price_adjust: number }>>([])
const styles = ref<Array<{ name: string; price_adjust: number }>>([])

const customGroups = ref<Array<{ name: string; values: Array<{ name: string; price_adjust: number }> }>>([])

const extras = ref<Array<{ name: string; image_url: string; description: string; price: number; stock: number }>>(
  props.optionalExtras.length > 0 ? [...props.optionalExtras] : []
)

function getStyleSuggestions(): string[] {
  const slug = props.templateSlug || ''
  if (slug.includes('flower')) return ['Minimalis', 'Luxury', 'Korean Style', 'Rustic', 'Elegant', 'Cute']
  if (slug.includes('money')) return ['Elegant', 'Creative', 'Minimalis', 'Luxury', 'Unique']
  if (slug.includes('snack')) return ['Fun', 'Colorful', 'Minimalis', 'Cute', 'Rustic']
  if (slug.includes('chocolate')) return ['Luxury', 'Elegant', 'Romantic', 'Minimalis', 'Premium']
  if (slug.includes('mixed')) return ['Creative', 'Colorful', 'Luxury', 'Minimalis', 'Unique']
  return ['Minimalis', 'Luxury', 'Korean Style', 'Elegant', 'Cute']
}

function addSize() { sizes.value.push({ name: '', price: 0 }) }
function removeSize(i: number) { sizes.value.splice(i, 1) }

function addWrappingColor() { wrappingColors.value.push({ name: '', image_url: '', price_adjust: 0 }) }
function removeWrappingColor(i: number) { wrappingColors.value.splice(i, 1) }

async function uploadWrappingImage(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const key = 'wc-' + index
  uploading.value[key] = true
  try {
    const fd = new FormData()
    fd.append('vendor_code', auth.vendorCode || '')
    fd.append('category', 'products')
    fd.append('file', input.files[0])
    const res = await fetch(`${apiUrl}/api/upload`, { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      wrappingColors.value[index].image_url = data.url
    }
  } catch { /* ignore */ }
  finally { uploading.value[key] = false; input.value = '' }
}

function addRibbonColor() { ribbonColors.value.push({ name: '', price_adjust: 0 }) }
function removeRibbonColor(i: number) { ribbonColors.value.splice(i, 1) }

function addStyleSuggestion(suggestion: string) {
  if (!styles.value.find(s => s.name === suggestion)) {
    styles.value.push({ name: suggestion, price_adjust: 0 })
  }
}
function addStyle() { styles.value.push({ name: '', price_adjust: 0 }) }
function removeStyle(i: number) { styles.value.splice(i, 1) }

function addCustomGroup() { customGroups.value.push({ name: '', values: [] }) }
function removeCustomGroup(i: number) { customGroups.value.splice(i, 1) }
function addCustomValue(gi: number) { customGroups.value[gi].values.push({ name: '', price_adjust: 0 }) }
function removeCustomValue(gi: number, vi: number) { customGroups.value[gi].values.splice(vi, 1) }

function addExtra() { extras.value.push({ name: '', image_url: '', description: '', price: 0, stock: 0 }) }
function removeExtra(i: number) { extras.value.splice(i, 1) }

function syncToParent() {
  const groups: any[] = []
  let sortOrder = 0

  if (enableWrapping.value && wrappingColors.value.filter(c => c.name).length > 0) {
    groups.push({
      name: 'Wrapping Color',
      display_type: 'color',
      is_required: false,
      sort_order: sortOrder++,
      values: wrappingColors.value.filter(c => c.name).map((c, i) => ({
        name: c.name,
        price_adjust: Number(c.price_adjust || 0),
        stock: 0,
        sku: null,
        description: null,
        image_url: c.image_url || null,
        sort_order: i,
        images: [],
      })),
    })
  }

  if (enableGreeting.value) {
    const greetingValues: any[] = [
      { name: 'Without Greeting Card', price_adjust: 0, stock: 0, sku: null, description: null, image_url: null, sort_order: 0, images: [] },
      { name: 'With Greeting Card', price_adjust: 0, stock: 0, sku: null, description: greetingTemplate.value || null, image_url: null, sort_order: 1, images: [] },
    ]
    groups.push({
      name: 'Greeting Card',
      display_type: 'select',
      is_required: true,
      sort_order: sortOrder++,
      values: greetingValues,
    })
  }

  if (enableRibbon.value && ribbonColors.value.filter(c => c.name).length > 0) {
    groups.push({
      name: 'Ribbon Color',
      display_type: 'color',
      is_required: false,
      sort_order: sortOrder++,
      values: ribbonColors.value.filter(c => c.name).map((c, i) => ({
        name: c.name,
        price_adjust: Number(c.price_adjust || 0),
        stock: 0,
        sku: null,
        description: null,
        image_url: null,
        sort_order: i,
        images: [],
      })),
    })
  }

  if (enableStyle.value && styles.value.filter(s => s.name).length > 0) {
    groups.push({
      name: 'Product Style',
      display_type: 'select',
      is_required: false,
      sort_order: sortOrder++,
      values: styles.value.filter(s => s.name).map((s, i) => ({
        name: s.name,
        price_adjust: Number(s.price_adjust || 0),
        stock: 0,
        sku: null,
        description: null,
        image_url: null,
        sort_order: i,
        images: [],
      })),
    })
  }

  for (const cg of customGroups.value) {
    if (!cg.name) continue
    groups.push({
      name: cg.name,
      display_type: 'select',
      is_required: false,
      sort_order: sortOrder++,
      values: cg.values.filter(v => v.name).map((v, i) => ({
        name: v.name,
        price_adjust: Number(v.price_adjust || 0),
        stock: 0,
        sku: null,
        description: null,
        image_url: null,
        sort_order: i,
        images: [],
      })),
    })
  }

  emit('update:optionGroups', groups)
  emit('update:sizeConfigs', enableSize.value
    ? sizes.value.filter(s => s.name).map((s, i) => ({
        name: s.name,
        price: Number(s.price || 0),
        stock: 0,
        sku: null,
        sort_order: i,
        images: [],
      }))
    : [])
  emit('update:optionalExtras', extras.value.filter(e => e.name).map((e, i) => ({
    name: e.name,
    image_url: e.image_url || null,
    description: e.description || null,
    price: Number(e.price || 0),
    stock: Number(e.stock || 0),
    sort_order: i,
  })))
}

watch([enableSize, enableWrapping, enableGreeting, enableRibbon, enableStyle, sizes, wrappingColors, greetingTemplate, ribbonColors, styles, customGroups, extras], syncToParent, { deep: true })
</script>

<template>
  <div class="builder-container">
    <p class="helper-text">Choose what customers can customize before purchasing. Every option is optional — enable only what you need.</p>

    <!-- Card 1: Size -->
    <div class="config-card">
      <div class="card-header">
        <label class="toggle-label">
          <input type="checkbox" v-model="enableSize" />
          <span class="toggle-title">Size</span>
        </label>
        <span class="card-hint">Customers can choose between different sizes</span>
      </div>

      <div v-if="enableSize" class="card-body">
        <div v-for="(size, i) in sizes" :key="i" class="inline-row">
          <input :value="size.name" placeholder="Size name" @input="size.name = ($event.target as HTMLInputElement).value" class="input-name" />
          <div class="price-prefix">
            <span class="prefix-label">+Rp</span>
            <input :value="size.price" type="number" min="0" placeholder="0" @input="size.price = Number(($event.target as HTMLInputElement).value)" class="input-price" />
          </div>
          <button class="btn-remove-sm" @click="removeSize(i)" v-if="sizes.length > 1">&times;</button>
        </div>
        <button class="btn-add-sm" @click="addSize">+ Add Size</button>
      </div>
    </div>

    <!-- Card 2: Wrapping Color -->
    <div class="config-card">
      <div class="card-header">
        <label class="toggle-label">
          <input type="checkbox" v-model="enableWrapping" />
          <span class="toggle-title">Wrapping Color</span>
        </label>
        <span class="card-hint">Let customers pick their preferred wrapping color</span>
      </div>

      <div v-if="enableWrapping" class="card-body">
        <div v-for="(color, i) in wrappingColors" :key="i" class="inline-row">
          <input :value="color.name" placeholder="Color name" @input="color.name = ($event.target as HTMLInputElement).value" class="input-name" />
          <div class="color-preview" :style="{ background: color.image_url ? 'none' : '#f0f0f0' }">
            <img v-if="color.image_url" :src="imageUrl(color.image_url)" class="color-thumb" />
            <label class="upload-color-btn">
              <input type="file" accept="image/*" hidden @change="uploadWrappingImage(i, $event)" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </label>
          </div>
          <div class="price-prefix">
            <span class="prefix-label">+Rp</span>
            <input :value="color.price_adjust" type="number" min="0" placeholder="0" @input="color.price_adjust = Number(($event.target as HTMLInputElement).value)" class="input-price" />
          </div>
          <button class="btn-remove-sm" @click="removeWrappingColor(i)">&times;</button>
        </div>
        <button class="btn-add-sm" @click="addWrappingColor">+ Add Color</button>
      </div>
    </div>

    <!-- Card 3: Greeting Card -->
    <div class="config-card">
      <div class="card-header">
        <label class="toggle-label">
          <input type="checkbox" v-model="enableGreeting" />
          <span class="toggle-title">Greeting Card</span>
        </label>
        <span class="card-hint">Offer a personalized greeting card with every purchase</span>
      </div>

      <div v-if="enableGreeting" class="card-body">
        <label class="field-label">Default Greeting Template</label>
        <input :value="greetingTemplate" placeholder="e.g. Happy Graduation! Congratulations!" @input="greetingTemplate = ($event.target as HTMLInputElement).value" class="input-full" />
        <p class="field-hint">Customers can write their own message during checkout. This is just a default suggestion.</p>
      </div>
    </div>

    <!-- Card 4: Ribbon Color -->
    <div class="config-card">
      <div class="card-header">
        <label class="toggle-label">
          <input type="checkbox" v-model="enableRibbon" />
          <span class="toggle-title">Ribbon Color</span>
        </label>
        <span class="card-hint">Optional ribbon color selection</span>
      </div>

      <div v-if="enableRibbon" class="card-body">
        <div v-for="(ribbon, i) in ribbonColors" :key="i" class="inline-row">
          <input :value="ribbon.name" placeholder="Ribbon color" @input="ribbon.name = ($event.target as HTMLInputElement).value" class="input-name" />
          <div class="price-prefix">
            <span class="prefix-label">+Rp</span>
            <input :value="ribbon.price_adjust" type="number" min="0" placeholder="0" @input="ribbon.price_adjust = Number(($event.target as HTMLInputElement).value)" class="input-price" />
          </div>
          <button class="btn-remove-sm" @click="removeRibbonColor(i)">&times;</button>
        </div>
        <button class="btn-add-sm" @click="addRibbonColor">+ Add Color</button>
      </div>
    </div>

    <!-- Card 5: Product Style -->
    <div class="config-card">
      <div class="card-header">
        <label class="toggle-label">
          <input type="checkbox" v-model="enableStyle" />
          <span class="toggle-title">Product Style</span>
        </label>
        <span class="card-hint">Let customers choose a style theme</span>
      </div>

      <div v-if="enableStyle" class="card-body">
        <div class="style-chips">
          <button
            v-for="suggestion in getStyleSuggestions()"
            :key="suggestion"
            class="chip-add"
              @click="addStyleSuggestion(suggestion)"
          >+ {{ suggestion }}</button>
        </div>
        <div v-for="(style, i) in styles" :key="i" class="inline-row">
          <input :value="style.name" placeholder="Style name" @input="style.name = ($event.target as HTMLInputElement).value" class="input-name" />
          <div class="price-prefix">
            <span class="prefix-label">+Rp</span>
            <input :value="style.price_adjust" type="number" min="0" placeholder="0" @input="style.price_adjust = Number(($event.target as HTMLInputElement).value)" class="input-price" />
          </div>
          <button class="btn-remove-sm" @click="removeStyle(i)">&times;</button>
        </div>
        <button class="btn-add-sm" @click="addStyle">+ Add Custom Style</button>
      </div>
    </div>

    <!-- Card 6: Custom Options -->
    <div class="config-card">
      <div class="card-header">
        <span class="toggle-title">Custom Options</span>
        <span class="card-hint">Create unlimited option groups for any customization</span>
        <button class="btn-add-sm" @click="addCustomGroup" style="margin-left:auto;">+ Add Group</button>
      </div>

      <div v-if="customGroups.length > 0" class="card-body">
        <div v-for="(cg, gi) in customGroups" :key="gi" class="custom-group">
          <div class="custom-group-header">
            <input :value="cg.name" placeholder="Group name (e.g. Chocolate Brand)" @input="cg.name = ($event.target as HTMLInputElement).value" class="input-name" />
            <button class="btn-remove-sm" @click="removeCustomGroup(gi)">Remove</button>
          </div>
          <div v-for="(cv, vi) in cg.values" :key="vi" class="inline-row" style="padding-left:16px;">
            <input :value="cv.name" placeholder="Value name" @input="cv.name = ($event.target as HTMLInputElement).value" class="input-name" />
            <div class="price-prefix">
              <span class="prefix-label">+Rp</span>
              <input :value="cv.price_adjust" type="number" min="0" placeholder="0" @input="cv.price_adjust = Number(($event.target as HTMLInputElement).value)" class="input-price" />
            </div>
            <button class="btn-remove-sm" @click="removeCustomValue(gi, vi)">&times;</button>
          </div>
          <button class="btn-add-sm" style="margin-left:16px;" @click="addCustomValue(gi)">+ Add Value</button>
        </div>
      </div>
    </div>

    <!-- Optional Extras -->
    <div class="config-card">
      <div class="card-header">
        <span class="toggle-title">Optional Extras</span>
        <span class="card-hint">Add-on items customers can purchase alongside this product</span>
        <button class="btn-add-sm" @click="addExtra" style="margin-left:auto;">+ Add Extra</button>
      </div>

      <div v-if="extras.length > 0" class="card-body">
        <div v-for="(extra, i) in extras" :key="i" class="extra-row">
          <input :value="extra.name" placeholder="Name" @input="extra.name = ($event.target as HTMLInputElement).value" class="input-name" />
          <input :value="extra.price" type="number" min="0" placeholder="Price" @input="extra.price = Number(($event.target as HTMLInputElement).value)" class="input-price-sm" />
          <input :value="extra.stock" type="number" min="0" placeholder="Stock" @input="extra.stock = Number(($event.target as HTMLInputElement).value)" class="input-price-sm" />
          <input :value="extra.description" placeholder="Description" @input="extra.description = ($event.target as HTMLInputElement).value" class="input-name" />
          <button class="btn-remove-sm" @click="removeExtra(i)">&times;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.builder-container {
  padding: 8px 0;
}

.helper-text {
  color: #888;
  font-size: 0.85rem;
  margin: 0 0 20px;
  line-height: 1.5;
}

.config-card {
  border: 1px solid #e8eaed;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e8eaed;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #B89C7B;
}

.toggle-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #333;
}

.card-hint {
  font-size: 0.78rem;
  color: #999;
}

.card-body {
  padding: 16px 20px;
}

.inline-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.input-name {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  flex: 1;
  min-width: 100px;
}

.input-name:focus, .input-full:focus {
  border-color: #B89C7B;
}

.input-price {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  width: 80px;
}

.input-price-sm {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.8rem;
  outline: none;
  max-width: 80px;
}

.price-prefix {
  display: flex;
  align-items: center;
  gap: 2px;
}

.prefix-label {
  font-size: 0.8rem;
  color: #888;
  white-space: nowrap;
}

.input-full {
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  width: 100%;
}

.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.field-hint {
  font-size: 0.75rem;
  color: #aaa;
  margin: 6px 0 0;
}

.btn-remove-sm {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 4px;
  flex-shrink: 0;
}

.btn-remove-sm:hover {
  color: #e44;
}

.btn-add-sm {
  background: transparent;
  border: 1px dashed #ccc;
  color: #888;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 4px;
}

.btn-add-sm:hover {
  border-color: #B89C7B;
  color: #B89C7B;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.color-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-color-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.style-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.chip-add {
  padding: 4px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background: #fff;
  font-size: 0.78rem;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.chip-add:hover {
  border-color: #B89C7B;
  color: #B89C7B;
  background: #FDF8F3;
}

.custom-group {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.custom-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.extra-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
</style>
