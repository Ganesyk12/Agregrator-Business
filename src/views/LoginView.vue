<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/layout/Navbar.vue'
import CartOffcanvas from '@/components/layout/CartOffcanvas.vue'
import SearchPopup from '@/components/layout/SearchPopup.vue'
import Footer from '@/components/layout/Footer.vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi!'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    const json = await res.json()

    if (!res.ok) {
      throw new Error(json.error?.message || 'Login gagal')
    }

    auth.setAuth({
      token: json.data.token,
      user: {
        id_user: json.data.id_user,
        email: json.data.email,
        full_name: json.data.full_name,
        roles: json.data.roles,
      },
      vendor_info: json.data.vendor_info,
    })

    const isCustomer = json.data.roles?.some((r: any) => r.role_code === 'eUser-Customer')
    const hasDashboardRole = json.data.roles?.some((r: any) =>
      ['eUser-Admin', 'eUser-Vendor', 'eUser-Finance', 'eUser-SuperAdmin'].includes(r.role_code)
    )

    if (isCustomer && !hasDashboardRole) {
      router.push('/')
    } else {
      window.location.href = '/dashboard'
    }

  } catch (err: any) {
    if (err.message === 'User not found') {
      errorMessage.value = 'Email tidak terdaftar.'
    } else if (err.message === 'Invalid email or password') {
      errorMessage.value = 'Email atau kata sandi salah.'
    } else if (err.message === 'Account is suspended or inactive') {
      errorMessage.value = 'Akun Anda sedang dinonaktifkan.'
    } else {
      errorMessage.value = err.message || 'Terjadi kesalahan sistem.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <Navbar />
    <SearchPopup />
    <CartOffcanvas />

    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <h1>Sign In</h1>
          <p>Welcome back! Please sign in to your account.</p>
        </div>

        <div v-if="errorMessage" class="alert-error">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label>Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                :disabled="isLoading"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            <span v-if="!isLoading">Sign In</span>
            <span v-else>Signing in...</span>
          </button>
        </form>
      </div>
    </div>

    <Footer />
  </div>
</template>


