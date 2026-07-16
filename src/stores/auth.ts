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

  function setAuth(data: { token: string; user: AuthUser }) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('sigyn_token', data.token)
    localStorage.setItem('sigyn_user', JSON.stringify(data.user))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('sigyn_token')
    localStorage.removeItem('sigyn_user')
  }

  return { token, user, isLoggedIn, isCustomer, setAuth, logout }
})
