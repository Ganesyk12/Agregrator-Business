<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

interface SmtpForm {
  id_smtp: number
  host: string
  port: number
  secure: boolean
  username: string
  password?: string
  has_password?: boolean
  from_name: string
  from_email: string
  is_active: boolean
  is_dev_mode?: boolean
  dev_target_emails?: string[]
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const token = localStorage.getItem('sigyn_token') || ''

const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const showPassword = ref(false)

const form = ref<SmtpForm>({
  id_smtp: 0,
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  username: '',
  password: '',
  has_password: false,
  from_name: 'SIGYN',
  from_email: '',
  is_active: true,
})

const testTargetEmail = ref('')

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
})

async function fetchSmtpConfig() {
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/api/smtp`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const json = await res.json()
    if (json.data) {
      form.value = {
        ...form.value,
        ...json.data,
        password: '' // keep empty on load
      }
      if (!testTargetEmail.value && json.data.username) {
        testTargetEmail.value = json.data.username
      }
    }
  } catch (err) {
    console.error('Error fetching SMTP config:', err)
    Toast.fire({ icon: 'error', title: 'Gagal memuat konfigurasi SMTP' })
  } finally {
    loading.value = false
  }
}

async function saveConfig() {
  if (!form.value.host || !form.value.port || !form.value.username) {
    Swal.fire({
      icon: 'warning',
      title: 'Data Belum Lengkap',
      text: 'Host, Port, dan Username wajib diisi.'
    })
    return
  }

  saving.value = true
  try {
    const payload: any = {
      host: form.value.host,
      port: Number(form.value.port),
      secure: form.value.secure,
      username: form.value.username,
      from_name: form.value.from_name,
      from_email: form.value.from_email,
      is_active: form.value.is_active,
    }

    if (form.value.password && form.value.password.trim() !== '') {
      payload.password = form.value.password.trim()
    }

    const res = await fetch(`${apiUrl}/api/smtp`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error?.message || 'Gagal menyimpan konfigurasi')
    }

    if (json.data) {
      form.value = {
        ...form.value,
        ...json.data,
        password: ''
      }
    }

    Toast.fire({ icon: 'success', title: 'Konfigurasi SMTP berhasil disimpan' })
  } catch (err: any) {
    console.error('Error saving SMTP config:', err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: err.message || 'Terjadi kesalahan sistem'
    })
  } finally {
    saving.value = false
  }
}

async function handleTestConnection() {
  if (!testTargetEmail.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Email Tujuan Kosong',
      text: 'Masukkan alamat email tujuan untuk menerima email pengujian.'
    })
    return
  }

  testing.value = true
  try {
    const payload = {
      target_email: testTargetEmail.value,
      host: form.value.host,
      port: Number(form.value.port),
      secure: form.value.secure,
      username: form.value.username,
      password: form.value.password || undefined,
      from_name: form.value.from_name,
      from_email: form.value.from_email
    }

    const res = await fetch(`${apiUrl}/api/smtp/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error?.message || 'Koneksi SMTP gagal')
    }

    Swal.fire({
      icon: 'success',
      title: 'Koneksi SMTP Berhasil!',
      html: `
        <div style="text-align: left; font-size: 14px; margin-top: 10px;">
          <p><strong>Status:</strong> ${json.message}</p>
          <p>Silakan periksa kotak masuk (inbox / spam) pada email <strong>${testTargetEmail.value}</strong>.</p>
        </div>
      `
    })
  } catch (err: any) {
    console.error('SMTP test error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Koneksi SMTP Gagal',
      text: err.message || 'Gagal terhubung ke mail server. Periksa kembali host, port, dan kredensial SMTP Anda.'
    })
  } finally {
    testing.value = false
  }
}

function handlePresetSelect(e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  if (val === 'gmail') {
    form.value.host = 'smtp.gmail.com'
    form.value.port = 587
    form.value.secure = false
  } else if (val === 'mailgun') {
    form.value.host = 'smtp.mailgun.org'
    form.value.port = 587
    form.value.secure = false
  } else if (val === 'sendgrid') {
    form.value.host = 'smtp.sendgrid.net'
    form.value.port = 587
    form.value.secure = false
  } else if (val === 'hostinger') {
    form.value.host = 'smtp.hostinger.com'
    form.value.port = 465
    form.value.secure = true
  } else if (val === 'ses') {
    form.value.host = 'email-smtp.us-east-1.amazonaws.com'
    form.value.port = 587
    form.value.secure = false
  }
}

onMounted(fetchSmtpConfig)
</script>

<template>
  <div class="smtp-settings-view">
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 class="mb-1"><i class="fa fa-envelope-o text-c-blue m-r-5"></i> SMTP Mail Server Configuration</h5>
          <span class="d-block m-t-5 text-muted">Kelola kredensial SMTP untuk pengiriman invoice, konfirmasi booking, dan notifikasi email</span>
        </div>
        <div>
          <span v-if="form.is_active" class="badge bg-success" style="font-size: 13px; padding: 6px 12px;">
            <i class="fa fa-check-circle m-r-5"></i> Mail Service Active
          </span>
          <span v-else class="badge bg-secondary" style="font-size: 13px; padding: 6px 12px;">
            <i class="fa fa-power-off m-r-5"></i> Mail Service Disabled
          </span>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="text-center p-5">
          <i class="fa fa-spinner fa-spin fa-3x text-primary"></i>
          <p class="mt-3 text-muted">Memuat pengaturan SMTP...</p>
        </div>

        <form v-else @submit.prevent="saveConfig">
          <!-- Development Mode Interceptor Info Banner -->
          <div v-if="form.is_dev_mode" class="alert alert-warning border-warning mb-4 d-flex align-items-start gap-3">
            <i class="fa fa-exclamation-triangle text-warning mt-1" style="font-size: 20px;"></i>
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-1">
                <strong>Development Mode Email Redirection Aktif</strong>
                <span class="badge bg-warning text-dark">NODE_ENV=development</span>
              </div>
              <p class="mb-1 text-dark" style="font-size: 13px;">
                Semua email transaksional yang dikirim oleh sistem (invoice, konfirmasi, dll) akan otomatis dialihkan ke target email developer yang didefinisikan di <code>.env</code> (<code>MAIL_DEV_TARGET_EMAILS</code>).
              </p>
              <div v-if="form.dev_target_emails && form.dev_target_emails.length > 0" class="mt-2">
                <span class="text-muted" style="font-size: 12px;">Daftar Email Target Developer:</span>
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span v-for="devEmail in form.dev_target_emails" :key="devEmail" class="badge bg-dark text-white px-2 py-1">
                    <i class="fa fa-envelope-o m-r-5"></i>{{ devEmail }}
                  </span>
                </div>
              </div>
              <div v-else class="text-muted mt-1" style="font-size: 12px;">
                <em>Belum ada email developer di <code>MAIL_DEV_TARGET_EMAILS</code> pada file <code>.env</code> (email akan dikirim ke alamat asli jika kosong).</em>
              </div>
            </div>
          </div>

          <!-- Quick Preset -->
          <div class="alert alert-light border mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="fa fa-magic text-warning" style="font-size: 18px;"></i>
              <div>
                <strong>Preset SMTP Provider:</strong>
                <span class="text-muted ml-1" style="font-size: 13px;">Pilih template host & port otomatis</span>
              </div>
            </div>
            <div style="min-width: 200px;">
              <select class="form-control form-control-sm" @change="handlePresetSelect">
                <option value="">-- Pilih Provider Preset --</option>
                <option value="gmail">Gmail / Google Workspace (Port 587)</option>
                <option value="hostinger">Hostinger SMTP (Port 465 SSL)</option>
                <option value="mailgun">Mailgun SMTP (Port 587)</option>
                <option value="sendgrid">SendGrid SMTP (Port 587)</option>
                <option value="ses">Amazon SES (Port 587)</option>
              </select>
            </div>
          </div>

          <div class="row">
            <!-- Left Column: Server & Port -->
            <div class="col-md-6">
              <h6 class="text-uppercase font-weight-bold text-muted border-bottom pb-2 mb-3">
                <i class="fa fa-server m-r-5"></i> Server & Koneksi
              </h6>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">SMTP Host <span class="text-danger">*</span></label>
                <div class="col-sm-8">
                  <input v-model="form.host" type="text" class="form-control" placeholder="e.g. smtp.gmail.com" required />
                  <small class="form-text text-muted">Domain host server email penyedia Anda.</small>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">SMTP Port <span class="text-danger">*</span></label>
                <div class="col-sm-8">
                  <input v-model.number="form.port" type="number" class="form-control" placeholder="587 / 465" required />
                  <small class="form-text text-muted">Port 587 (TLS/STARTTLS) atau 465 (SSL).</small>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">Keamanan (Secure)</label>
                <div class="col-sm-8 d-flex align-items-center">
                  <div class="form-check form-switch">
                    <input v-model="form.secure" class="form-check-input" type="checkbox" id="secureCheck" />
                    <label class="form-check-label ml-2" for="secureCheck">
                      {{ form.secure ? 'SSL / TLS (Gunakan untuk Port 465)' : 'STARTTLS / Non-SSL (Gunakan untuk Port 587/25)' }}
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">Status Layanan</label>
                <div class="col-sm-8 d-flex align-items-center">
                  <div class="form-check form-switch">
                    <input v-model="form.is_active" class="form-check-input" type="checkbox" id="activeCheck" />
                    <label class="form-check-label ml-2 font-weight-bold" for="activeCheck" :class="form.is_active ? 'text-success' : 'text-danger'">
                      {{ form.is_active ? 'Aktif (Kirim Email Otomatis)' : 'Nonaktif (Email Ditahan)' }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Authentication & Sender -->
            <div class="col-md-6">
              <h6 class="text-uppercase font-weight-bold text-muted border-bottom pb-2 mb-3">
                <i class="fa fa-lock m-r-5"></i> Autentikasi & Pengirim
              </h6>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">SMTP Username <span class="text-danger">*</span></label>
                <div class="col-sm-8">
                  <input v-model="form.username" type="text" class="form-control" placeholder="your-email@domain.com" required />
                  <small class="form-text text-muted">Username atau alamat email login SMTP.</small>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">
                  SMTP Password <span class="text-danger" v-if="!form.has_password">*</span>
                </label>
                <div class="col-sm-8">
                  <div class="input-group">
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :placeholder="form.has_password ? '••••••••  (Tersimpan, isi untuk ubah)' : 'Masukkan App Password / SMTP Password'"
                      :required="!form.has_password"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                    </button>
                  </div>
                  <small class="form-text text-muted">
                    Untuk Gmail gunakan <strong>App Password (16 digit)</strong> dari Google Account Security.
                  </small>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">From Name</label>
                <div class="col-sm-8">
                  <input v-model="form.from_name" type="text" class="form-control" placeholder="e.g. SIGYN Platform" />
                  <small class="form-text text-muted">Nama yang tampil sebagai pengirim email.</small>
                </div>
              </div>

              <div class="form-group row mb-3">
                <label class="col-sm-4 col-form-label font-weight-bold">From Email</label>
                <div class="col-sm-8">
                  <input v-model="form.from_email" type="email" class="form-control" placeholder="e.g. no-reply@yourdomain.com" />
                  <small class="form-text text-muted">Email pengirim (kosongkan jika sama dengan username).</small>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-4 pt-3 border-top gap-2">
            <button type="submit" class="btn btn-primary px-4" :disabled="saving">
              <i class="fa fa-save m-r-5"></i> {{ saving ? 'Menyimpan...' : 'Simpan Konfigurasi' }}
            </button>
          </div>
        </form>

        <!-- Test Email Connection Section -->
        <div class="mt-5 pt-4 border-top">
          <div class="card bg-light border">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-lg-6 mb-3 mb-lg-0">
                  <h6 class="font-weight-bold mb-1">
                    <i class="fa fa-paper-plane text-c-blue m-r-5"></i> Uji Koneksi & Kirim Sample Email
                  </h6>
                  <p class="text-muted mb-0" style="font-size: 13px;">
                    Kirim email pengujian untuk memastikan host, port, dan kredensial SMTP dapat mengirim email dengan sukses.
                  </p>
                </div>
                <div class="col-lg-6">
                  <div class="input-group">
                    <input
                      v-model="testTargetEmail"
                      type="email"
                      class="form-control"
                      placeholder="Masukkan email penerima test (e.g. your@email.com)"
                      :disabled="testing"
                    />
                    <button
                      type="button"
                      class="btn btn-info font-weight-bold text-white px-3"
                      :disabled="testing"
                      @click="handleTestConnection"
                    >
                      <i v-if="testing" class="fa fa-spinner fa-spin m-r-5"></i>
                      <i v-else class="fa fa-paper-plane m-r-5"></i>
                      {{ testing ? 'Menguji...' : 'Kirim Test Email' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
