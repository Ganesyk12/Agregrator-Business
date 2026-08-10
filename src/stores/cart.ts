import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>([])
  const loading = ref(false)
  const editTarget = ref<any>(null)

  const count = computed(() => items.value.length)
  const total = computed(() => items.value.reduce((s, i) => {
    if (i.package) return s + i.package.price
    if (i.product) {
      if (typeof i.subtotal === 'number' && i.subtotal) return s + i.subtotal
      return s + i.product.price * i.quantity
    }
    return s
  }, 0))

  async function fetchCart() {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      items.value = []
      return
    }
    loading.value = true
    try {
      const res = await auth.authFetch('/api/cart')
      const json = await res.json()
      if (res.ok) items.value = json.data?.items || []
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function addPackage(packageId: number) {
    const auth = useAuthStore()
    const res = await auth.authFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ id_package: packageId }),
    })
    if (res.ok) await fetchCart()
    return res.ok
  }

  async function addProduct(productId: number, quantity: number = 1, config: any = {}) {
    const auth = useAuthStore()
    const res = await auth.authFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ id_product: productId, quantity, ...config }),
    })
    if (res.ok) await fetchCart()
    return res.ok
  }

  async function updateQuantity(itemId: number, quantity: number) {
    const auth = useAuthStore()
    const res = await auth.authFetch(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
    if (res.ok) await fetchCart()
    return res.ok
  }

  async function removeItem(itemId: number) {
    const auth = useAuthStore()
    const res = await auth.authFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' })
    if (res.ok) await fetchCart()
    return res.ok
  }

  async function clearCart() {
    const auth = useAuthStore()
    const res = await auth.authFetch('/api/cart', { method: 'DELETE' })
    if (res.ok) items.value = []
    return res.ok
  }

  return { items, loading, editTarget, count, total, fetchCart, addPackage, addProduct, updateQuantity, removeItem, clearCart }
})
