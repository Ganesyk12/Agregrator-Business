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
  phone?: string
  roles: Role[]
  vendor_category?: string
  vendor_id?: number
  vendor_code?: string
  vendor_name?: string
  vendor_avatar?: string
  vendor_type?: string
}

interface VendorOption {
  id_vendor: number
  vendor_code?: string
  business_name: string
  category: string
  vendor_type?: string
  avatar_url?: string | null
  status?: string
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
  const vendors = ref<VendorOption[]>([])
  const activeVendorId = ref<number | null>(Number(localStorage.getItem('sigyn_active_vendor')) || null)
  let vendorsLoaded = false

  function setAuth(data: { token: string; user: AuthUser; vendor_info?: { vendor_id: number; vendor_code?: string; vendor_category: string; vendor_name: string; vendor_type?: string; vendor_avatar?: string } }) {
    token.value = data.token
    vendors.value = []
    vendorsLoaded = false
    const u = { ...data.user }
    if (data.vendor_info) {
      u.vendor_id = data.vendor_info.vendor_id
      u.vendor_code = data.vendor_info.vendor_code
      u.vendor_category = data.vendor_info.vendor_category
      u.vendor_name = data.vendor_info.vendor_name
      u.vendor_type = data.vendor_info.vendor_type
      u.vendor_avatar = data.vendor_info.vendor_avatar
      activeVendorId.value = data.vendor_info.vendor_id
      localStorage.setItem('sigyn_active_vendor', String(data.vendor_info.vendor_id))
    } else {
      activeVendorId.value = null
      localStorage.removeItem('sigyn_active_vendor')
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
    activeVendorId.value = info.vendor_id
    localStorage.setItem('sigyn_active_vendor', String(info.vendor_id))
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
    vendors.value = []
    vendorsLoaded = false
    activeVendorId.value = null
    localStorage.removeItem('sigyn_token')
    localStorage.removeItem('sigyn_user')
    localStorage.removeItem('sigyn_active_vendor')
  }

  async function loadVendorProfile(vendorIdToLoad: number) {
    const res = await authFetch(`/api/vendors/me?vendorId=${vendorIdToLoad}`)
    if (!res.ok) return
    const json = await res.json()
    const v = json.data
    if (!v) return
    setVendorInfo({
      vendor_id: v.id_vendor,
      vendor_code: v.vendor_code,
      vendor_category: v.category?.category_name ?? v.category ?? '',
      vendor_name: v.business_name,
      vendor_type: v.vendor_type,
      vendor_avatar: v.avatar_url,
    })
  }

  async function fetchMyVendors(force = false) {
    if (!isVendor.value || !token.value) return
    if (vendorsLoaded && !force) return
    try {
      const res = await authFetch('/api/vendors/mine')
      if (!res.ok) return
      const json = await res.json()
      vendors.value = json.data || []
      vendorsLoaded = true
      if (!vendors.value.length) return

      const saved = activeVendorId.value
      const target = vendors.value.find(v => v.id_vendor === saved) ?? vendors.value[0]
      if (!target) return
      if (user.value?.vendor_id !== target.id_vendor) {
        await loadVendorProfile(target.id_vendor)
      } else if (activeVendorId.value !== target.id_vendor) {
        activeVendorId.value = target.id_vendor
        localStorage.setItem('sigyn_active_vendor', String(target.id_vendor))
      }
    } catch { /* ignore */ }
  }

  async function switchVendor(vendorIdToSwitch: number) {
    if (vendorIdToSwitch === user.value?.vendor_id) return
    vendorsLoaded = true
    await loadVendorProfile(vendorIdToSwitch)
  }

  async function fetchVendorProfile() {
    await fetchMyVendors()
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
    const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } })
    if (res.status === 401 && token.value) {
      logout()
    }
    return res
  }

  return {
    token, user, isLoggedIn, isCustomer, isVendor, isProductVendor, vendorId, vendorCode, wishlistCount,
    vendors, activeVendorId,
    setAuth, setVendorInfo, updateVendorAvatar, logout,
    authHeaders, authFetch, refreshWishlistCount, fetchVendorProfile,
    fetchMyVendors, switchVendor,
  }
})