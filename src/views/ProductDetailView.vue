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
