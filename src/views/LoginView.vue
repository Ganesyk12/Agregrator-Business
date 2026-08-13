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

<style scoped>
.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
  background: #fafafa;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e8e8ed;
  border-radius: 16px;
  padding: 40px 36px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1d1d1f;
}

.login-header p {
  font-size: 0.95rem;
  color: #86868b;
  margin: 0;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d2d2d7;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #1d1d1f;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 70px;
}

input[type="password"] {
  font-family: system-ui, -apple-system, sans-serif;
}

.toggle-password {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #86868b;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
}

.toggle-password:hover {
  color: #1d1d1f;
}

.btn-login {
  width: 100%;
  padding: 14px;
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-login:hover:not(:disabled) {
  background: #2d2d2f;
}

.btn-login:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
}
</style>
