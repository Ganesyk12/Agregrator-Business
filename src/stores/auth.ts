import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface Role {
  role_code: string
  name: string
}

interface AuthUser {
  id_user: number
  email: string
  full_name: string
  roles: Role[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sigyn_token') || '')
  const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem('sigyn_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isCustomer = computed(() => user.value?.roles?.some(r => r.role_code === 'eUser-Customer') ?? false)
  const wishlistCount = ref(0)

  function setAuth(data: { token: string; user: AuthUser }) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('sigyn_token', data.token)
    localStorage.setItem('sigyn_user', JSON.stringify(data.user))
    refreshWishlistCount()
  }

  function logout() {
    token.value = ''
    user.value = null
    wishlistCount.value = 0
    localStorage.removeItem('sigyn_token')
    localStorage.removeItem('sigyn_user')
  }

  async function refreshWishlistCount() {
    if (!token.value) {
      wishlistCount.value = 0
      return
    }
    try {
      const res = await authFetch('/api/favorites')
      const json = await res.json()
      wishlistCount.value = (json.data || []).length
    } catch {
      wishlistCount.value = 0
    }
  }

  function authHeaders(): HeadersInit {
    return token.value ? { 'Authorization': `Bearer ${token.value}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  }

  async function authFetch(url: string, options: RequestInit = {}) {
    return fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } })
  }

  return { token, user, isLoggedIn, isCustomer, wishlistCount, setAuth, logout, authHeaders, authFetch, refreshWishlistCount }
})
