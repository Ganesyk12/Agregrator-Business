import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>([])
  const loading = ref(false)

  const count = computed(() => items.value.length)
  const total = computed(() => items.value.reduce((s, i) => s + i.package.price, 0))

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

  async function addItem(packageId: number) {
    const auth = useAuthStore()
    const res = await auth.authFetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ id_package: packageId }),
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

  return { items, loading, count, total, fetchCart, addItem, removeItem, clearCart }
})
