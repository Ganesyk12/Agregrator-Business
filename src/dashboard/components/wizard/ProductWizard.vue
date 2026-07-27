<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ProductBuilder from './ProductBuilder.vue'
import GalleryManager from './GalleryManager.vue'
import LivePreview from './LivePreview.vue'

const emit = defineEmits<{
  close: []
  saved: []
}>()

const auth = useAuthStore()

const step = ref(1)
const totalSteps = 6
const submitting = ref(false)
const error = ref('')

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const templates = ref<any[]>([])
const occasions = ref<any[]>([])
const loading = ref(true)

const form = ref({
  id_template: null as number | null,
  template: null as any,
  name: '',
  description: '',
  occasion_ids: [] as number[],
  price: 0,
  stock: 0,
  estimated_delivery: '',
  status: 'active',
  cover_image: null as string | null,
  option_groups: [] as any[],
  size_configs: [] as any[],
  optional_extras: [] as any[],
  images: [] as any[],
})

onMounted(async () => {
  try {
    const [tRes, oRes] = await Promise.all([
      fetch(`${apiUrl}/api/products/templates`),
      fetch(`${apiUrl}/api/products/occasions`),
    ])
    if (tRes.ok) { const j = await tRes.json(); templates.value = j.data || [] }
    if (oRes.ok) { const j = await oRes.json(); occasions.value = j.data || [] }
  } catch { error.value = 'Failed to load data' }
  finally { loading.value = false }
})

const stepValid = computed(() => {
  switch (step.value) {
    case 1: return form.value.id_template !== null
    case 2: return form.value.name.trim().length > 0 && form.value.price > 0
    case 3: return true
    case 4: return true
    case 5: return true
    case 6: return true
    default: return false
  }
})

const progressPercent = computed(() => Math.round((step.value / totalSteps) * 100))

function selectTemplate(t: any) {
  form.value.id_template = t.id_template
  form.value.template = t
  applySuggestedConfig(t)
}

function applySuggestedConfig(t: any) {
  const config = t.suggested_config
  if (!config) return
  if (config.option_groups) {
    form.value.option_groups = config.option_groups.map((og: any, i: number) => ({
      name: og.name,
      display_type: og.display_type || 'select',
      is_required: og.is_required || false,
      sort_order: i,
      values: [],
    }))
  }
  if (config.sizes) {
    form.value.size_configs = config.sizes.map((s: string, i: number) => ({
      name: s,
      price: 0,
      stock: 0,
      sku: '',
      sort_order: i,
      images: [],
    }))
  }
}

function nextStep() {
  if (step.value < totalSteps) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

async function handlePublish() {
  submitting.value = true
  error.value = ''
  try {
    const payload: any = {
      id_vendor: auth.vendorId!,
      id_template: form.value.id_template,
      name: form.value.name,
      description: form.value.description,
      price: Number(form.value.price),
      stock: Number(form.value.stock),
      estimated_delivery: form.value.estimated_delivery,
      status: form.value.status,
      occasion_ids: form.value.occasion_ids,
      images: form.value.images,
      option_groups: form.value.option_groups.map(og => ({
        name: og.name,
        display_type: og.display_type,
        is_required: og.is_required,
        sort_order: og.sort_order,
        values: (og.values || []).map((ov: any) => ({
          name: ov.name,
          price_adjust: Number(ov.price_adjust || 0),
          stock: Number(ov.stock || 0),
          sku: ov.sku || null,
          description: ov.description || null,
          image_url: ov.image_url || null,
          sort_order: ov.sort_order,
          images: ov.images || [],
        })),
      })),
      size_configs: form.value.size_configs.map(sc => ({
        name: sc.name,
        price: Number(sc.price),
        stock: Number(sc.stock || 0),
        sku: sc.sku || null,
        sort_order: sc.sort_order,
        images: sc.images || [],
      })),
      optional_extras: form.value.optional_extras.map(oe => ({
        name: oe.name,
        image_url: oe.image_url || null,
        description: oe.description || null,
        price: Number(oe.price),
        stock: Number(oe.stock || 0),
        sort_order: oe.sort_order,
      })),
    }
    const res = await fetch(`${apiUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Failed to create product')
    }
    emit('saved')
  } catch (e: any) {
    error.value = e.message || 'Failed to create product'
  } finally {
    submitting.value = false
  }
}

function handleSaveDraft() {
  form.value.status = 'draft'
  handlePublish()
}
</script>

<template>
  <div class="wizard-overlay" @click.self="$emit('close')">
    <div class="wizard-container">
      <div class="wizard-header">
        <button class="btn-close-wizard" @click="$emit('close')">&times;</button>
        <h2>Create New Product</h2>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="step-indicators">
          <span
            v-for="s in totalSteps"
            :key="s"
            class="step-dot"
            :class="{ active: s === step, completed: s < step }"
            @click="step = s"
          >{{ s }}</span>
        </div>
      </div>

      <div class="wizard-body">
        <div v-if="loading" class="loading-state">
          <p>Loading...</p>
        </div>

        <!-- Step 1: Choose Template -->
        <div v-else-if="step === 1" class="step-content">
          <h3>Choose Your Product Type</h3>
          <p class="text-muted">Select the type of bouquet you want to sell. You can customize everything in the next steps.</p>
          <div class="template-grid">
            <div
              v-for="t in templates"
              :key="t.id_template"
              class="template-card"
              :class="{ selected: form.id_template === t.id_template }"
              @click="selectTemplate(t)"
            >
              <div class="template-icon">{{ t.icon }}</div>
              <div class="template-name">{{ t.name }}</div>
              <div class="template-desc">{{ t.short_desc }}</div>
              <div class="template-use">{{ t.description }}</div>
              <div v-if="form.id_template === t.id_template" class="check-mark">&#10003;</div>
            </div>
          </div>
        </div>

        <!-- Step 2: Basic Information -->
        <div v-else-if="step === 2" class="step-content">
          <h3>Basic Information</h3>
          <p class="text-muted">Tell customers about your product. All fields with * are required.</p>
          <div class="form-grid">
            <div class="form-group full">
              <label>Product Name <span class="required">*</span></label>
              <input v-model="form.name" placeholder="e.g. Premium Red Rose Bouquet" />
              <span class="field-hint">Choose a clear, descriptive name that customers can easily understand.</span>
            </div>
            <div class="form-group full">
              <label>Description <span class="required">*</span></label>
              <textarea v-model="form.description" rows="3" placeholder="Describe your product — what makes it special, what flowers or materials are used, and what occasion it's perfect for."></textarea>
              <span class="field-hint">Good descriptions help customers decide. Mention size, colors, and what's included.</span>
            </div>
            <div class="form-group">
              <label>Base Price <span class="required">*</span></label>
              <input v-model.number="form.price" type="number" min="0" placeholder="e.g. 150000" />
              <span class="field-hint">Starting price before customization options.</span>
            </div>
            <div class="form-group">
              <label>Base Stock</label>
              <input v-model.number="form.stock" type="number" min="0" placeholder="e.g. 50" />
              <span class="field-hint">How many units do you have available?</span>
            </div>
            <div class="form-group">
              <label>Estimated Delivery</label>
              <input v-model="form.estimated_delivery" placeholder="e.g. 1-2 days" />
              <span class="field-hint">How long after ordering will this be ready?</span>
            </div>
            <div class="form-group">
              <label>Product Status</label>
              <select v-model="form.status">
                <option value="active">Active — Visible and available for purchase</option>
                <option value="draft">Draft — Save as draft, publish later</option>
                <option value="inactive">Hidden — Not visible to customers</option>
              </select>
            </div>
            <div class="form-group full">
              <label>Occasion Tags</label>
              <p class="field-hint" style="margin:-4px 0 8px;">Pilih lebih dari satu jika sesuai dengan beberapa momen.</p>
              <div class="occasion-checkboxes">
                <label
                  v-for="occ in occasions"
                  :key="occ.id_occasion"
                  class="checkbox-inline"
                  style="margin:0 12px 8px 0;font-weight:normal;cursor:pointer;"
                >
                  <input
                    type="checkbox"
                    :value="occ.id_occasion"
                    v-model="form.occasion_ids"
                    style="margin-right:4px;"
                  />
                  {{ occ.name }}
                </label>
                <p v-if="occasions.length === 0" class="text-muted" style="font-size:0.8rem;width:100%;margin-top:4px;">No occasions loaded. Check server connection or seed data.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Customize Product -->
        <div v-else-if="step === 3" class="step-content">
          <h3>Customize Your Product</h3>
          <ProductBuilder
            :option-groups="form.option_groups"
            :size-configs="form.size_configs"
            :optional-extras="form.optional_extras"
            :template-slug="form.template?.slug"
            @update:option-groups="form.option_groups = $event"
            @update:size-configs="form.size_configs = $event"
            @update:optional-extras="form.optional_extras = $event"
          />
        </div>

        <!-- Step 4: Upload Images -->
        <div v-else-if="step === 4" class="step-content">
          <h3>Upload Images</h3>
          <p class="text-muted">Upload at least 1 and up to 20 product photos. These will appear on the homepage, product detail page, and customer cart.</p>
          <GalleryManager
            :images="form.images"
            :option-groups="form.option_groups"
            :size-configs="form.size_configs"
            @update:images="form.images = $event"
          />
        </div>

        <!-- Step 5: Live Preview -->
        <div v-else-if="step === 5" class="step-content">
          <h3>Live Preview</h3>
          <LivePreview
            :form="form"
          />
        </div>

        <!-- Step 6: Publish -->
        <div v-else-if="step === 6" class="step-content">
          <h3>Review & Publish</h3>
          <p class="text-muted">Review your product details before publishing. You can save as draft and edit later.</p>
          <div class="summary-grid">
            <div class="summary-section">
              <h4>Basic Information</h4>
              <div class="summary-item"><span>Product Name</span><span>{{ form.name }}</span></div>
              <div class="summary-item"><span>Base Price</span><span>Rp {{ Number(form.price).toLocaleString('id-ID') }}</span></div>
              <div class="summary-item"><span>Stock</span><span>{{ form.stock }}</span></div>
              <div class="summary-item"><span>Product Type</span><span>{{ form.template?.name || '-' }}</span></div>
              <div class="summary-item"><span>Delivery</span><span>{{ form.estimated_delivery || '-' }}</span></div>
              <div class="summary-item"><span>Status</span><span>{{ form.status }}</span></div>
            </div>
            <div class="summary-section">
              <h4>Configuration</h4>
              <div class="summary-item"><span>Sizes</span><span>{{ form.size_configs.length }} configured</span></div>
              <div class="summary-item"><span>Custom Options</span><span>{{ form.option_groups.length }} groups</span></div>
              <div class="summary-item"><span>Optional Extras</span><span>{{ form.optional_extras.length }} items</span></div>
              <div class="summary-item"><span>Photos</span><span>{{ form.images.length }} uploaded</span></div>
            </div>
          </div>
          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>
      </div>

      <div class="wizard-footer">
        <button v-if="step > 1" class="btn btn-outline" @click="prevStep">Back</button>
        <button v-if="step > 1 && step < 6" class="btn btn-outline" @click="handleSaveDraft" :disabled="submitting">
          Save Draft
        </button>
        <span class="flex-spacer"></span>
        <button
          v-if="step > 1 && step < 5"
          class="btn btn-link"
          @click="step = 5"
        >Preview</button>
        <button
          v-if="step < 6"
          class="btn btn-primary"
          :disabled="!stepValid || submitting"
          @click="nextStep"
        >Continue</button>
        <button
          v-if="step === 6"
          class="btn btn-primary"
          :disabled="submitting"
          @click="handlePublish"
        >{{ submitting ? 'Publishing...' : 'Publish Product' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.wizard-container {
  background: #fff;
  border-radius: 16px;
  width: 90vw;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.wizard-header {
  padding: 24px 32px 16px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.btn-close-wizard {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
}

.wizard-header h2 {
  margin: 0 0 12px;
  font-size: 1.3rem;
}

.progress-bar-wrap {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-bottom: 8px;
}

.progress-bar-fill {
  height: 100%;
  background: #B89C7B;
  border-radius: 2px;
  transition: width 0.3s;
}

.step-indicators {
  display: flex;
  gap: 8px;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  cursor: pointer;
}

.step-dot.active {
  background: #B89C7B;
  color: #fff;
}

.step-dot.completed {
  background: #4CAF50;
  color: #fff;
}

.wizard-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.step-content h3 {
  margin: 0 0 8px;
  font-size: 1.2rem;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

/* Template Cards */
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.template-card {
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.template-card:hover {
  border-color: #B89C7B;
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #B89C7B;
  background: #FDF8F3;
}

.template-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.template-name {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.template-use {
  font-size: 0.7rem;
  color: #999;
  line-height: 1.3;
}

.check-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #B89C7B;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.required {
  color: #e44;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #B89C7B;
}

/* Occasion Checkboxes */
.occasion-checkboxes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

/* Summary */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 16px;
}

.summary-section h4 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.85rem;
}

.summary-item span:first-child {
  color: #666;
}

.summary-item span:last-child {
  font-weight: 600;
}

.error-msg {
  margin-top: 12px;
  padding: 10px 16px;
  background: #fff0f0;
  border-radius: 8px;
  color: #e44;
  font-size: 0.85rem;
}

/* Footer */
.wizard-footer {
  padding: 16px 32px 24px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 12px;
}

.flex-spacer {
  flex: 1;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #B89C7B;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #A6896A;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.btn-outline:hover {
  border-color: #B89C7B;
  color: #B89C7B;
}

.btn-link {
  background: transparent;
  border: none;
  color: #B89C7B;
  text-decoration: underline;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
