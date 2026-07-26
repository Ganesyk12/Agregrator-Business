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
  vendor_category?: string
  vendor_id?: number
  vendor_code?: string
  vendor_name?: string
  vendor_avatar?: string
  vendor_type?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sigyn_token') || '')
  const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem('sigyn_user') || 'null'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const isCustomer = computed(() => user.value?.roles?.some(r => r.role_code === 'eUser-Customer') ?? false)
  const isVendor = computed(() => user.value?.roles?.some(r => r.role_code === 'eUser-Vendor') ?? false)
  const isProductVendor = computed(() => user.value?.vendor_type === 'PRODUCT')
  const vendorId = computed(() => user.value?.vendor_id ?? null)
  const vendorCode = computed(() => user.value?.vendor_code ?? '')
  const wishlistCount = ref(0)

  function setAuth(data: { token: string; user: AuthUser; vendor_info?: { vendor_id: number; vendor_code?: string; vendor_category: string; vendor_name: string; vendor_type?: string; vendor_avatar?: string } }) {
    token.value = data.token
    const u = { ...data.user }
    if (data.vendor_info) {
      u.vendor_id = data.vendor_info.vendor_id
      u.vendor_code = data.vendor_info.vendor_code
      u.vendor_category = data.vendor_info.vendor_category
      u.vendor_name = data.vendor_info.vendor_name
      u.vendor_type = data.vendor_info.vendor_type
      u.vendor_avatar = data.vendor_info.vendor_avatar
    }
    user.value = u
    localStorage.setItem('sigyn_token', data.token)
    localStorage.setItem('sigyn_user', JSON.stringify(u))
    refreshWishlistCount()
  }

  function setVendorInfo(info: { vendor_id: number; vendor_code?: string; vendor_category: string; vendor_name: string; vendor_type?: string; vendor_avatar?: string }) {
    if (!user.value) return
    user.value.vendor_id = info.vendor_id
    user.value.vendor_code = info.vendor_code
    user.value.vendor_category = info.vendor_category
    user.value.vendor_name = info.vendor_name
    user.value.vendor_type = info.vendor_type
    user.value.vendor_avatar = info.vendor_avatar
    localStorage.setItem('sigyn_user', JSON.stringify(user.value))
  }

  function updateVendorAvatar(url: string) {
    if (!user.value) return
    user.value.vendor_avatar = url
    localStorage.setItem('sigyn_user', JSON.stringify(user.value))
  }

  function logout() {
    token.value = ''
    user.value = null
    wishlistCount.value = 0
    localStorage.removeItem('sigyn_token')
    localStorage.removeItem('sigyn_user')
  }

  async function fetchVendorProfile() {
    if (!isVendor.value || !token.value) return
    try {
      const res = await authFetch('/api/vendors/me')
      if (res.ok) {
        const json = await res.json()
        const v = json.data
        if (v) {
          setVendorInfo({
            vendor_id: v.id_vendor,
            vendor_code: v.vendor_code,
            vendor_category: v.category,
            vendor_name: v.business_name,
            vendor_type: v.vendor_type,
            vendor_avatar: v.avatar_url,
          })
        }
      }
    } catch { /* ignore */ }
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

  return {
    token, user, isLoggedIn, isCustomer, isVendor, isProductVendor, vendorId, vendorCode, wishlistCount,
    setAuth, setVendorInfo, updateVendorAvatar, logout,
    authHeaders, authFetch, refreshWishlistCount, fetchVendorProfile,
  }
})