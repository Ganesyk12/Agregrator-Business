<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Email dan password wajib diisi!'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error?.message || 'Login gagal, periksa kredensial Anda.')
    }

    // Save token and user details to localStorage
    localStorage.setItem('sigyn_token', result.data.token)
    localStorage.setItem('sigyn_user', JSON.stringify({
      id_user: result.data.id_user,
      email: result.data.email,
      full_name: result.data.full_name,
      roles: result.data.roles
    }))

    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil!',
      text: `Selamat datang kembali, ${result.data.full_name}!`,
      timer: 1500,
      showConfirmButton: false
    })

    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (err: any) {
    console.error('Login error:', err)
    if (err.message === 'User not found') {
      errorMessage.value = 'Email tidak terdaftar. Silakan periksa kembali atau hubungi Administrator.'
    } else if (err.message === 'Invalid email or password') {
      errorMessage.value = 'Email atau kata sandi yang Anda masukkan salah.'
    } else if (err.message === 'Account is suspended or inactive') {
      errorMessage.value = 'Akun Anda sedang dinonaktifkan atau ditangguhkan. Silakan hubungi Administrator.'
    } else {
      errorMessage.value = err.message || 'Terjadi kesalahan sistem, silakan coba lagi.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container-kaira">
    <!-- Abstract minimal shapes to match luxury branding -->
    <div class="bg-shape-kaira shape-left"></div>
    <div class="bg-shape-kaira shape-right"></div>

    <div class="login-card-kaira">
      <div class="login-card-header">
        <div class="login-logo-box">
          <i class="fa fa-shopping-bag login-logo-icon"></i>
        </div>
        <h2>Sigyn Business</h2>
        <p>Akses akun administratif Anda</p>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMessage" class="login-alert-banner">
        <i class="fa fa-exclamation-triangle"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="login-form-kaira">
        <div class="login-input-field">
          <label for="email_login">Alamat Email</label>
          <div class="login-input-wrapper">
            <i class="fa fa-envelope login-input-icon"></i>
            <input 
              id="email_login" 
              type="email" 
              v-model="email" 
              placeholder="nama@email.com" 
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="login-input-field">
          <div class="login-label-row">
            <label for="password_login">Kata Sandi</label>
            <a href="#" class="login-forgot-link">Lupa kata sandi?</a>
          </div>
          <div class="login-input-wrapper">
            <i class="fa fa-lock login-input-icon"></i>
            <input 
              id="password_login" 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="Masukkan kata sandi" 
              required
              :disabled="isLoading"
            />
            <button 
              type="button" 
              class="login-eye-btn" 
              @click="showPassword = !showPassword"
              :disabled="isLoading"
            >
              <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="login-submit-btn" :disabled="isLoading">
          <span v-if="!isLoading">Masuk Ke Dashboard</span>
          <span v-else class="login-spinner-box">
            <span class="login-spinner"></span>
            Memverifikasi...
          </span>
        </button>
      </form>

      <div class="login-card-footer">
        Hubungi manajemen platform untuk bantuan akun. <a href="#" class="login-register-link">Bantuan</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fonts aligned with Kaira Homepage */
@import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Marcellus&display=swap');

.login-container-kaira {
  font-family: "Jost", Roboto, sans-serif !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: #F1F1F0 !important; /* Matches Kaira --bs-light theme background */
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden !important;
  z-index: 99999 !important;
  box-sizing: border-box !important;
}

/* Reset and match bootstrap box sizing */
.login-container-kaira *,
.login-container-kaira *::before,
.login-container-kaira *::after {
  box-sizing: border-box !important;
}

/* Luxury minimal layout shapes */
.bg-shape-kaira {
  position: absolute !important;
  border-radius: 50% !important;
  background-color: #8C907E !important; /* Sage green primary color */
  opacity: 0.08 !important;
  filter: blur(40px) !important;
  z-index: 1 !important;
}
.shape-left {
  width: 500px !important;
  height: 500px !important;
  top: -150px !important;
  left: -150px !important;
}
.shape-right {
  width: 450px !important;
  height: 450px !important;
  bottom: -150px !important;
  right: -150px !important;
}

/* Premium Minimalist White Card */
.login-card-kaira {
  position: relative !important;
  z-index: 10 !important;
  width: 100% !important;
  max-width: 450px !important;
  background: #ffffff !important;
  border: 1px solid #E1E1E0 !important;
  border-radius: 4px !important; /* Sharp elegant luxury corners */
  padding: 48px 40px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03) !important;
  text-align: center !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease !important;
}

.login-card-header {
  margin-bottom: 36px !important;
}

.login-logo-box {
  width: 50px !important;
  height: 50px !important;
  background-color: #8C907E !important; /* Sage green background */
  border-radius: 50% !important;
  display: inline-flex !important;
  justify-content: center !important;
  align-items: center !important;
  margin-bottom: 20px !important;
}

.login-logo-icon {
  font-size: 20px !important;
  color: #ffffff !important;
}

.login-card-header h2 {
  font-family: "Marcellus", Georgia, serif !important;
  font-size: 28px !important;
  font-weight: 400 !important;
  color: #111111 !important;
  margin: 0 0 10px 0 !important;
  letter-spacing: 0.05rem !important;
}

.login-card-header p {
  font-size: 14px !important;
  color: #8f8f8f !important;
  margin: 0 !important;
  letter-spacing: 0.03rem !important;
}

/* Inputs & Form Groups */
.login-form-kaira {
  text-align: left !important;
  display: block !important;
}

.login-input-field {
  margin-bottom: 24px !important;
  display: block !important;
}

.login-input-field label {
  display: block !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: #111111 !important;
  margin-bottom: 8px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08rem !important;
}

.login-label-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 8px !important;
}

.login-label-row label {
  margin-bottom: 0 !important;
}

.login-forgot-link {
  font-size: 12px !important;
  color: #8f8f8f !important;
  text-decoration: underline !important;
  font-weight: 400 !important;
  transition: color 0.2s !important;
}
.login-forgot-link:hover {
  color: #111111 !important;
}

.login-input-wrapper {
  position: relative !important;
  display: block !important;
  width: 100% !important;
}

.login-input-icon {
  position: absolute !important;
  left: 16px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  color: #8f8f8f !important;
  font-size: 15px !important;
  pointer-events: none !important;
  transition: color 0.2s !important;
  z-index: 5 !important;
}

.login-input-wrapper input {
  width: 100% !important;
  height: 48px !important;
  padding: 0 16px 0 44px !important;
  background: #ffffff !important;
  border: 1px solid #dcdcd9 !important;
  border-radius: 0 !important; /* Matches minimal Kaira input styling */
  color: #111111 !important;
  font-size: 15px !important;
  transition: border-color 0.2s, box-shadow 0.2s !important;
  outline: none !important;
  box-sizing: border-box !important;
}

.login-input-wrapper input[type="password"] {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

.login-input-wrapper input::placeholder {
  color: #bcbcb8 !important;
}

.login-input-wrapper input:focus {
  outline: none !important;
  border-color: #8C907E !important; /* Sage green focus border */
  box-shadow: 0 0 0 4px rgba(140, 144, 126, 0.12) !important;
}

.login-input-wrapper input:focus + .login-input-icon {
  color: #8C907E !important;
}

.login-eye-btn {
  position: absolute !important;
  right: 16px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: none !important;
  border: none !important;
  color: #8f8f8f !important;
  cursor: pointer !important;
  padding: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: color 0.2s !important;
  z-index: 5 !important;
}
.login-eye-btn:hover {
  color: #111111 !important;
}

/* Submit Button styled with Kaira's Primary Color */
.login-submit-btn {
  width: 100% !important;
  height: 52px !important;
  background-color: #111111 !important; /* Matches Kaira's prominent buttons */
  border: 1px solid #111111 !important;
  border-radius: 0 !important; /* Elegant block style */
  color: #ffffff !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.1rem !important;
  cursor: pointer !important;
  transition: background-color 0.25s ease, border-color 0.25s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-top: 10px !important;
}

.login-submit-btn:hover:not(:disabled) {
  background-color: #8C907E !important; /* Hovering to Kaira primary Sage Green */
  border-color: #8C907E !important;
}

.login-submit-btn:disabled {
  background-color: #bcbcb8 !important;
  border-color: #bcbcb8 !important;
  color: #f1f1f0 !important;
  cursor: not-allowed !important;
}

/* Spinner Box */
.login-spinner-box {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
}

.login-spinner {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-top-color: #ffffff !important;
  border-radius: 50% !important;
  animation: spinCustom 0.8s linear infinite !important;
  display: inline-block !important;
}

@keyframes spinCustom {
  to {
    transform: rotate(360deg);
  }
}

/* Footer Section */
.login-card-footer {
  margin-top: 36px !important;
  font-size: 13px !important;
  color: #8f8f8f !important;
  border-top: 1px solid #f1f1f0 !important;
  padding-top: 24px !important;
  letter-spacing: 0.02rem !important;
}

.login-register-link {
  color: #111111 !important;
  text-decoration: underline !important;
  font-weight: 500 !important;
  transition: color 0.2s !important;
}
.login-register-link:hover {
  color: #8C907E !important;
}

/* Error Banner Style */
.login-alert-banner {
  background-color: #FDEDED !important;
  border: 1px solid #F8C2C2 !important;
  color: #D32F2F !important;
  padding: 12px 16px !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  margin-bottom: 24px !important;
  text-align: left !important;
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  line-height: 1.5 !important;
}
.login-alert-banner i {
  font-size: 15px !important;
  margin-top: 2px !important;
  flex-shrink: 0 !important;
}
</style>
