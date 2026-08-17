<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

interface CompanyInfo {
  id_company: number
  company_name: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  footer_text: string | null
  logo_url: string | null
  service_fee_percent: number
  delivery_fee: number
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const saving = ref(false)
const loading = ref(true)

const form = ref<CompanyInfo>({
  id_company: 0,
  company_name: 'Agregrator Business',
  address: null,
  phone: null,
  email: null,
  website: null,
  bank_name: null,
  bank_account: null,
  bank_holder: null,
  footer_text: null,
  logo_url: null,
  service_fee_percent: 5,
  delivery_fee: 25000,
})

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
})

async function fetchInfo() {
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/api/company-info`)
    const json = await res.json()
    if (json.data) {
      form.value = { ...form.value, ...json.data }
    }
  } catch (err) {
    console.error('Error fetching company info:', err)
    Toast.fire({ icon: 'error', title: 'Failed to load company info' })
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const res = await fetch(`${apiUrl}/api/company-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) throw new Error('Failed to save')
    const json = await res.json()
    if (json.data) form.value = { ...form.value, ...json.data }
    Toast.fire({ icon: 'success', title: 'Company info updated' })
  } catch (err: any) {
    console.error('Error saving company info:', err)
    Toast.fire({ icon: 'error', title: err.message || 'Failed to save' })
  } finally {
    saving.value = false
  }
}

onMounted(fetchInfo)
</script>

<template>
  <div class="card">
    <div class="card-header">
      <h5>Company Information</h5>
      
    </div>

    <div class="card-body">
      <div v-if="loading" style="text-align:center;padding:40px;">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
        <p>Loading...</p>
      </div>

      <form v-else @submit.prevent="save" class="form-horizontal">
        <div class="row">
          <div class="col-md-6">
            <h4 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px;">General</h4>

            <div class="form-group">
              <label class="control-label col-md-4">Company Name</label>
              <div class="col-md-8">
                <input v-model="form.company_name" class="form-control" required />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Address</label>
              <div class="col-md-8">
                <textarea v-model="form.address" class="form-control" rows="3"></textarea>
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Phone</label>
              <div class="col-md-8">
                <input v-model="form.phone" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Email</label>
              <div class="col-md-8">
                <input v-model="form.email" class="form-control" type="email" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Website</label>
              <div class="col-md-8">
                <input v-model="form.website" class="form-control" />
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <h4 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px;">Bank Account</h4>

            <div class="form-group">
              <label class="control-label col-md-4">Bank Name</label>
              <div class="col-md-8">
                <input v-model="form.bank_name" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Account Number</label>
              <div class="col-md-8">
                <input v-model="form.bank_account" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Account Holder</label>
              <div class="col-md-8">
                <input v-model="form.bank_holder" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <div class="row" style="margin-top:20px;">
          <div class="col-md-6">
            <h4 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px;">Fees</h4>

            <div class="form-group">
              <label class="control-label col-md-4">Service Fee (%)</label>
              <div class="col-md-8">
                <input v-model.number="form.service_fee_percent" class="form-control" type="number" min="0" step="0.5" />
              </div>
            </div>

            <div class="form-group">
              <label class="control-label col-md-4">Delivery Fee (Rp)</label>
              <div class="col-md-8">
                <input v-model.number="form.delivery_fee" class="form-control" type="number" min="0" step="1000" />
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <h4 style="border-bottom:1px solid #ddd;padding-bottom:8px;margin-bottom:16px;">Footer</h4>

            <div class="form-group">
              <label class="control-label col-md-2">Footer Text</label>
              <div class="col-md-10">
                <textarea v-model="form.footer_text" class="form-control" rows="2" placeholder="e.g. Terima kasih telah menggunakan layanan kami."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="ln_solid"></div>

        <div class="form-group" style="text-align:right;">
          <button type="submit" class="btn btn-success" :disabled="saving">
            <i class="fa fa-save"></i> {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
