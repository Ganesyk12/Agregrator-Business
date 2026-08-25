<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import defaultImage from '@/assets/default/nothing.png'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const product = ref<any>(null)
const loading = ref(true)
const selectedImage = ref(0)
const selectedVariant = ref<number | null>(null)
const quantity = ref(1)
const selectedAddons = ref<Set<number>>(new Set())
const addedToCart = ref(false)

const selectedOptions = ref<Record<string, string>>({})
const selectedSize = ref<string | null>(null)
const selectedExtras = ref<string[]>([])
const greetingMessage = ref('')

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isNewProduct = computed(() => product.value?.option_groups?.length > 0 || product.value?.option_groups)

onMounted(async () => {
  try {
    const res = await fetch(`${apiUrl}/api/products/${route.params.id}`)
    if (!res.ok) throw new Error('Not found')
    const json = await res.json()
    product.value = json.data
    if (route.query.edit) applyEditConfig(cart.editTarget)
  } catch {
    router.push('/404')
  } finally {
    loading.value = false
  }
})

function applyEditConfig(cfg: any) {
  if (!cfg || !product.value) return
  if (cfg.quantity) quantity.value = cfg.quantity
  if (cfg.sizeName) selectedSize.value = cfg.sizeName
  if (cfg.variantId != null && cfg.variantId) selectedVariant.value = cfg.variantId
  if (cfg.variantName) {
    const v = product.value.variants?.find((x: any) => x.name === cfg.variantName)
    if (v) selectedVariant.value = v.id_variant
  }
  if (Array.isArray(cfg.options)) {
    for (const o of cfg.options) {
      if (o.groupName) selectedOptions.value[o.groupName] = o.valueName
    }
  }
  if (Array.isArray(cfg.extras)) {
    if (isNewProduct.value) {
      selectedExtras.value = cfg.extras.map((e: any) => e.name)
    } else {
      const s = new Set<number>()
      for (const e of cfg.extras) if (e.id) s.add(Number(e.id))
      selectedAddons.value = s
    }
  }
  if (cfg.greetingMessage) greetingMessage.value = cfg.greetingMessage
  cart.editTarget = null
}

const images = computed(() => {
  if (!product.value) return []
  return product.value.images || []
})

const mainImage = computed(() => {
  const imgs = images.value
  return imgs[selectedImage.value]?.image_url || imgs[0]?.image_url || defaultImage
})

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.dataset.fallbackApplied) return
  img.dataset.fallbackApplied = '1'
  img.src = defaultImage
}

const basePrice = computed(() => product.value?.price || 0)

const variantAdjustment = computed(() => {
  if (!isNewProduct.value && selectedVariant.value !== null) {
    const variant = (product.value?.variants || []).find((v: any) => v.id_variant === selectedVariant.value)
    return variant?.price_adjust || 0
  }
  return 0
})

const optionsAdjustment = computed(() => {
  if (!isNewProduct.value || !product.value?.option_groups) return 0
  let total = 0
  for (const [groupName, valueName] of Object.entries(selectedOptions.value)) {
    const group = product.value.option_groups.find((g: any) => g.name === groupName)
    if (group) {
      const value = group.values?.find((v: any) => v.name === valueName)
      if (value) total += Number(value.price_adjust || 0)
    }
  }
  return total
})

const sizePrice = computed(() => {
  if (!isNewProduct.value || !selectedSize.value) return 0
  const size = product.value?.size_configs?.find((s: any) => s.name === selectedSize.value)
  return size ? Number(size.price || 0) : 0
})

const extrasTotal = computed(() => {
  if (!isNewProduct.value) {
    let total = 0
    for (const id of selectedAddons.value) {
      const addon = product.value?.addons?.find((a: any) => a.id_addon === id)
      if (addon) total += Number(addon.price || 0)
    }
    return total
  }
  let total = 0
  for (const name of selectedExtras.value) {
    const extra = product.value?.optional_extras?.find((e: any) => e.name === name)
    if (extra) total += Number(extra.price || 0)
  }
  return total
})

const currentPrice = computed(() => {
  return basePrice.value + variantAdjustment.value + optionsAdjustment.value + sizePrice.value + extrasTotal.value
})

const grandTotal = computed(() => currentPrice.value * quantity.value)

const greetingGroupName = computed(() => {
  const groups = product.value?.option_groups || []
  const g = groups.find((grp: any) => grp.name.toLowerCase().includes('greeting'))
  return g?.name || ''
})

function buildConfig() {
  const extras: any[] = []
  const addonIds: number[] = []
  if (isNewProduct.value) {
    for (const name of selectedExtras.value) {
      const extra = product.value?.optional_extras?.find((e: any) => e.name === name)
      if (extra) extras.push({ id: extra.id_optional_extra, name: extra.name, price: Number(extra.price) })
    }
  } else {
    for (const id of selectedAddons.value) {
      const a = product.value?.addons?.find((x: any) => x.id_addon === id)
      if (a) extras.push({ id, name: a.name, price: Number(a.price) })
      addonIds.push(id)
    }
  }

  const options: any[] = []
  let greetingCard = ''
  for (const [groupName, valueName] of Object.entries(selectedOptions.value)) {
    const group = product.value?.option_groups?.find((g: any) => g.name === groupName)
    const val = group?.values?.find((v: any) => v.name === valueName)
    options.push({ groupName, valueName, priceAdjust: Number(val?.price_adjust || 0) })
    if (groupName.toLowerCase().includes('greeting')) greetingCard = valueName
  }

  const variant = product.value?.variants?.find((v: any) => v.id_variant === selectedVariant.value)
  const unitPrice = currentPrice.value

  return {
    productId: product.value.id_product,
    productName: product.value.name,
    thumbnail: images.value[0]?.image_url || '',
    vendorName: product.value.vendor?.business_name || '',
    variantId: selectedVariant.value,
    variantName: isNewProduct.value ? '' : variant?.name || '',
    sizeName: selectedSize.value,
    options,
    greetingCard,
    greetingMessage: greetingMessage.value,
    extras,
    addonIds,
    quantity: quantity.value,
    unitPrice,
    extrasPrice: extrasTotal.value,
    subtotal: unitPrice * quantity.value,
  }
}

function toggleAddon(id: number) {
  const s = new Set(selectedAddons.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedAddons.value = s
}

function toggleExtra(name: string) {
  if (selectedExtras.value.includes(name)) {
    selectedExtras.value = selectedExtras.value.filter(e => e !== name)
  } else {
    selectedExtras.value = [...selectedExtras.value, name]
  }
}

function formatPrice(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID')
}

async function addToCart() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  const ok = await cart.addProduct(product.value.id_product, quantity.value, buildConfig())
  if (ok) {
    addedToCart.value = true
    setTimeout(() => { addedToCart.value = false }, 2000)
  }
}

function buyNow() {
  if (!auth.isLoggedIn) { router.push('/login'); return }
  localStorage.setItem('sigyn_checkout_config', JSON.stringify(buildConfig()))
  router.push('/checkout/product')
}
</script>

<template>
  <div class="product-detail-page">
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div v-if="loading" class="text-center py-5"><p>Loading product...</p></div>

    <template v-else-if="product">
      <div class="product-detail-wrapper">
        <div class="container">
          <div class="detail-header-actions">
            <button @click="router.back()" class="btn-back">
              <i class="fa fa-arrow-left"></i> Back
            </button>
            <div class="breadcrumb-wrap">
              <router-link to="/">Home</router-link>
              <span class="sep">/</span>
              <router-link to="/explore">Explore</router-link>
              <span class="sep">/</span>
              <span>{{ product.name }}</span>
            </div>
          </div>

          <div class="product-main">
            <div class="product-gallery">
              <div class="gallery-main">
                <img :src="mainImage" :alt="product.name" @error="onImgError" />
              </div>
              <div v-if="images.length > 1" class="gallery-thumbs">
                <button
                  v-for="(img, idx) in images"
                  :key="idx"
                  :class="['thumb-btn', { active: selectedImage === idx }]"
                  @click="selectedImage = idx as number"
                >
                  <img :src="img.image_url || defaultImage" :alt="'Thumb ' + idx" @error="onImgError" />
                </button>
              </div>
            </div>

            <div class="product-info">
              <div class="info-header">
                <h1 class="product-name">{{ product.name }}</h1>
                <div class="product-meta">
                  <div class="vendor-row">
                    <span class="vendor-label">By:</span>
                    <router-link :to="'/vendor/' + product.vendor?.id_vendor" class="product-vendor">
                      {{ product.vendor?.business_name }}
                    </router-link>
                  </div>
                  <div v-if="product.labels" class="occasions-row">
                    <span v-for="lbl in (product.labels || '').split(',').filter(Boolean)" :key="lbl" class="product-occasion">{{ lbl.trim().charAt(0).toUpperCase() + lbl.trim().slice(1) }}</span>
                  </div>
                </div>
              </div>

              <div class="product-price">
                {{ formatPrice(grandTotal) }}
                <span class="price-unit" v-if="quantity > 1">({{ formatPrice(currentPrice) }} / unit)</span>
              </div>

              <p class="product-desc">{{ product.description }}</p>

              <!-- NEW SYSTEM: Option Groups -->
              <template v-if="isNewProduct">
                <div v-for="group in (product.option_groups || [])" :key="group.name" class="section">
                  <h3 class="section-title">{{ group.name }} <span v-if="group.is_required" class="required-star">*</span></h3>
                  <div class="variant-list">
                    <button
                      v-for="val in (group.values || [])"
                      :key="val.name"
                      :class="['variant-btn', { active: selectedOptions[group.name] === val.name }]"
                      @click="selectedOptions[group.name] = val.name"
                    >
                      <span class="variant-name">{{ val.name }}</span>
                      <span v-if="val.price_adjust > 0" class="variant-price">+{{ formatPrice(val.price_adjust) }}</span>
                    </button>
                  </div>
                </div>

                <!-- Size Configs -->
                <div v-if="product.size_configs?.length" class="section">
                  <h3 class="section-title">Size</h3>
                  <div class="variant-list">
                    <button
                      v-for="size in product.size_configs"
                      :key="size.name"
                      :class="['variant-btn', { active: selectedSize === size.name }]"
                      @click="selectedSize = size.name"
                    >
                      <span class="variant-name">{{ size.name }}</span>
                      <span v-if="size.price > 0" class="variant-price">{{ formatPrice(size.price) }}</span>
                    </button>
                  </div>
                </div>

                <!-- Optional Extras -->
                <div v-if="product.optional_extras?.length" class="section">
                  <h3 class="section-title">Optional Extras</h3>
                  <div class="addon-list">
                    <label v-for="extra in product.optional_extras" :key="extra.name" class="addon-item">
                      <input type="checkbox" :checked="selectedExtras.includes(extra.name)" @change="toggleExtra(extra.name)" />
                      <span class="addon-name">{{ extra.name }}</span>
                      <span class="addon-price">+{{ formatPrice(extra.price) }}</span>
                    </label>
                  </div>
                </div>

                <!-- Greeting Message -->
                <div v-if="greetingGroupName && selectedOptions[greetingGroupName]" class="section">
                  <h3 class="section-title">Greeting Message</h3>
                  <textarea
                    v-model="greetingMessage"
                    class="greeting-input"
                    rows="3"
                    maxlength="300"
                    placeholder="Write a message to include with your bouquet..."
                  ></textarea>
                </div>
              </template>

              <!-- OLD SYSTEM: Variants & Add-ons -->
              <template v-else>
                <div v-if="product.variants?.length" class="section">
                  <h3 class="section-title">Available Variants</h3>
                  <div class="variant-list">
                    <button
                      v-for="v in product.variants"
                      :key="v.id_variant"
                      :class="['variant-btn', { active: selectedVariant === v.id_variant }]"
                      @click="selectedVariant = selectedVariant === v.id_variant ? null : v.id_variant"
                    >
                      <span class="variant-name">{{ v.name }}</span>
                      <span class="variant-price" v-if="v.price_adjust">+{{ formatPrice(v.price_adjust) }}</span>
                    </button>
                  </div>
                </div>

                <div v-if="product.addons?.length" class="section">
                  <h3 class="section-title">Add-ons</h3>
                  <div class="addon-list">
                    <label v-for="a in product.addons" :key="a.id_addon" class="addon-item">
                      <input type="checkbox" :checked="selectedAddons.has(a.id_addon)" @change="toggleAddon(a.id_addon)" />
                      <span class="addon-name">{{ a.name }}</span>
                      <span class="addon-price">+{{ formatPrice(a.price) }}</span>
                    </label>
                  </div>
                </div>
              </template>

              <!-- Delivery Info -->
              <div class="section delivery-info" v-if="product.estimated_delivery">
                <h3 class="section-title">Delivery</h3>
                <p><strong>Estimated Time:</strong> {{ product.estimated_delivery }}</p>
                <p v-if="product.delivery_info">{{ product.delivery_info }}</p>
              </div>

              <div class="section stock-qty-wrap">
                <div class="quantity-selector">
                  <button @click="quantity = Math.max(1, quantity - 1)" :disabled="quantity <= 1">-</button>
                  <span>{{ quantity }}</span>
                  <button @click="quantity = quantity + 1" :disabled="product.stock > 0 && quantity >= product.stock">+</button>
                </div>

                <div class="stock-pill in-stock" v-if="product.stock > 0">
                  <i class="fa fa-check-circle"></i> In Stock ({{ product.stock }})
                </div>
                <div class="stock-pill out-of-stock" v-else>
                  <i class="fa fa-times-circle"></i> Out of Stock
                </div>
              </div>

              <div class="action-buttons">
                <button class="btn-add-cart" @click="addToCart" :class="{ added: addedToCart }">
                  <i :class="addedToCart ? 'fa fa-check' : 'fa fa-shopping-cart'"></i>
                  {{ addedToCart ? 'Added to Cart' : 'Add to Cart' }}
                </button>
                <button class="btn-buy-now" @click="buyNow">Buy Now</button>
                <button class="btn-wishlist"><i class="fa fa-heart-o"></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Footer />
  </div>
</template>

<style scoped>
.product-detail-page { background: #fff; min-height: 100vh; }
.product-detail-wrapper { padding: 100px 0 80px; }

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: var(--bs-black, #2a2a2a);
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #e9ecef;
  border-color: #dee2e6;
  transform: translateX(-2px);
}

.btn-back i {
  font-size: 0.8rem;
}

.breadcrumb-wrap { font-family: 'Jost', sans-serif; font-size: 0.85rem; color: #888; }
.breadcrumb-wrap a { color: #888; text-decoration: none; }
.breadcrumb-wrap a:hover { color: var(--bs-secondary, #B89C7B); }
.breadcrumb-wrap .sep { margin: 0 8px; color: #ccc; }

.product-main { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }

.product-gallery { position: sticky; top: 24px; }
.gallery-main { width: 100%; border-radius: 16px; overflow: hidden; margin-bottom: 12px; background: #f9f9f9; }
.gallery-main img { width: 100%; height: 500px; object-fit: cover; display: block; }
.gallery-thumbs { display: flex; gap: 8px; }
.thumb-btn { width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 2px solid transparent; padding: 0; cursor: pointer; transition: all 0.2s; }
.thumb-btn.active { border-color: var(--bs-secondary, #B89C7B); }
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; }

.product-info { }
.info-header { margin-bottom: 16px; }
.product-name { font-family: var(--heading-font, 'Marcellus', serif); font-size: 2rem; color: var(--bs-black, #2a2a2a); margin: 0 0 8px; }
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  font-family: 'Jost', sans-serif;
  font-size: 0.9rem;
  color: #888;
}
.vendor-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.vendor-label {
  color: #888;
}
.product-vendor { color: var(--bs-secondary, #B89C7B); font-weight: 600; text-decoration: none; }
.product-vendor:hover { text-decoration: underline; }
.occasions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.product-occasion { background: #f0f0f0; padding: 2px 10px; border-radius: 20px; font-size: 0.78rem; color: #5a5a5a; }

.product-price { font-family: 'Marcellus', serif; font-size: 2rem; font-weight: 700; color: var(--bs-black, #2a2a2a); margin-bottom: 20px; }
.price-unit { font-size: 0.85rem; font-weight: 400; color: #888; font-family: 'Jost', sans-serif; margin-left: 8px; }
.greeting-input { width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-family: 'Jost', sans-serif; font-size: 0.9rem; resize: vertical; }
.greeting-input:focus { outline: none; border-color: var(--bs-secondary, #B89C7B); }
.product-desc { font-family: 'Jost', sans-serif; font-size: 0.95rem; color: #5a5a5a; line-height: 1.7; margin-bottom: 24px; }

.section { margin-bottom: 24px; }
.section-title { font-family: 'Jost', sans-serif; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--bs-black, #2a2a2a); margin: 0 0 12px; }
.required-star { color: #e44; }

.variant-list { display: flex; flex-wrap: wrap; gap: 8px; }
.variant-btn { display: flex; flex-direction: column; align-items: center; padding: 10px 20px; border: 2px solid #e0e0e0; border-radius: 10px; background: #fff; cursor: pointer; transition: all 0.2s; font-family: 'Jost', sans-serif; }
.variant-btn:hover { border-color: #ccc; }
.variant-btn.active { border-color: var(--bs-secondary, #B89C7B); background: rgba(184, 156, 123, 0.05); }
.variant-name { font-size: 0.9rem; font-weight: 500; color: #333; }
.variant-price { font-size: 0.75rem; color: #888; }

.addon-list { display: flex; flex-direction: column; gap: 8px; }
.addon-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 1px solid #e8eaed; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-family: 'Jost', sans-serif; }
.addon-item:hover { border-color: #ccc; }
.addon-item input { accent-color: var(--bs-secondary, #B89C7B); }
.addon-name { flex: 1; font-size: 0.9rem; color: #333; }
.addon-price { font-size: 0.85rem; color: var(--bs-secondary, #B89C7B); font-weight: 600; }

.delivery-info p { font-family: 'Jost', sans-serif; font-size: 0.85rem; color: #5a5a5a; margin: 0 0 4px; }

.quantity-selector { display: inline-flex; align-items: center; border: 2px solid #e0e0e0; border-radius: 10px; overflow: hidden; }
.quantity-selector button { width: 44px; height: 44px; border: none; background: #f9f9f9; cursor: pointer; font-size: 1.2rem; color: #333; transition: all 0.2s; }
.quantity-selector button:hover { background: #f0f0f0; }
.quantity-selector button:disabled { opacity: 0.4; cursor: not-allowed; }
.quantity-selector span { width: 48px; text-align: center; font-weight: 600; font-family: 'Jost', sans-serif; }

.action-buttons { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
.btn-add-cart { flex: 1; padding: 14px 24px; border: 2px solid var(--bs-black, #2a2a2a); border-radius: 999px; background: transparent; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; color: var(--bs-black, #2a2a2a); }
.btn-add-cart:hover { background: var(--bs-black, #2a2a2a); color: #fff; }
.btn-add-cart.added { background: #2ecc71; border-color: #2ecc71; color: #fff; }
.btn-buy-now { flex: 1; padding: 14px 24px; border: none; border-radius: 999px; background: var(--bs-secondary, #B89C7B); color: #fff; font-family: 'Jost', sans-serif; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.btn-buy-now:hover { background: #a88362; }
.btn-wishlist { width: 48px; height: 48px; border: 2px solid #e0e0e0; border-radius: 50%; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 1.2rem; color: #888; }
.btn-wishlist:hover { border-color: #e74c3c; color: #e74c3c; }

.stock-qty-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stock-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-family: 'Jost', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stock-pill.in-stock {
  background: rgba(46, 204, 113, 0.08);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.15);
}

.stock-pill.out-of-stock {
  background: rgba(231, 76, 60, 0.08);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.15);
}

@media (max-width: 992px) {
  .product-main { grid-template-columns: 1fr; gap: 32px; }
  .gallery-main img { height: 350px; }
  .product-gallery { position: static; }
}
</style>
