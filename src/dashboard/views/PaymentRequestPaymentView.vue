<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const request = ref<any>(null)
const terms = ref<any[]>([])
const payments = ref<any[]>([])
const loading = ref(true)

const selectedTerm = ref<any>(null)
const amount = ref<number>(0)
const amountDisplay = ref('')
const sourceBank = ref('')
const sourceAccountNumber = ref('')
const sourceAccountName = ref('')
const paymentDate = ref('')
const proofFile = ref<File | null>(null)
const notes = ref('')
const submitting = ref(false)

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
})

function getUser() {
  try {
    const raw = localStorage.getItem('sigyn_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

async function fetchData() {
  try {
    const id = route.params.id
    const [reqRes, termsRes, paymentsRes] = await Promise.all([
      fetch(`${apiUrl}/api/payment-requests/${id}`),
      fetch(`${apiUrl}/api/payment-requests/${id}/terms`),
      fetch(`${apiUrl}/api/payment-requests/${id}/payments`),
    ])
    if (!reqRes.ok) throw new Error('Request not found')
    const reqJson = await reqRes.json()
    const termsJson = await termsRes.json()
    const paymentsJson = await paymentsRes.json()
    request.value = reqJson.data
    terms.value = termsJson.data || []
    payments.value = paymentsJson.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function selectTerm(term: any) {
  if (term.status === 'paid') return
  selectedTerm.value = term
  const remaining = term.amount - term.paid_amount
  amount.value = remaining
  amountDisplay.value = formatNumber(remaining)
}

async function uploadProof(requestNumber: string, file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${apiUrl}/api/upload/payment-proof?request_number=${encodeURIComponent(requestNumber)}`, { method: 'POST', body: fd })
  if (!res.ok) return null
  const json = await res.json()
  return json.url
}

async function handleSubmit() {
  if (!request.value || !selectedTerm.value) {
    Toast.fire({ icon: 'error', title: 'Please select a payment term' })
    return
  }
  if (!amount.value || amount.value <= 0) {
    Toast.fire({ icon: 'error', title: 'Amount must be greater than 0' })
    return
  }
  if (amount.value > (selectedTerm.value.amount - selectedTerm.value.paid_amount)) {
    Toast.fire({ icon: 'error', title: 'Amount exceeds remaining term balance' })
    return
  }

  submitting.value = true
  try {
    const user = getUser()
    let proofUrl: string | null = null
    if (proofFile.value && request.value.request_number) {
      proofUrl = await uploadProof(request.value.request_number, proofFile.value)
    }

    const res = await fetch(`${apiUrl}/api/payment-requests/${request.value.id_request}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_rfp_term: selectedTerm.value.id_rfp_term,
        amount: amount.value,
        source_bank: sourceBank.value || null,
        source_account_number: sourceAccountNumber.value || null,
        source_account_name: sourceAccountName.value || null,
        payment_date: paymentDate.value || new Date().toISOString(),
        proof_url: proofUrl,
        notes: notes.value || null,
        created_by: user?.email || 'SYSTEM',
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to create payment')
    }

    Toast.fire({ icon: 'success', title: 'Payment created successfully' })
    selectedTerm.value = null
    amount.value = 0
    amountDisplay.value = ''
    sourceBank.value = ''
    sourceAccountNumber.value = ''
    sourceAccountName.value = ''
    paymentDate.value = ''
    proofFile.value = null
    notes.value = ''
    await fetchData()
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/rfp-payments')
}

function goToDetail() {
  if (request.value) {
    router.push(`/payment-requests/${request.value.id_request}`)
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function onAmountInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  const num = raw ? parseInt(raw, 10) : 0
  amount.value = num
  amountDisplay.value = num ? formatNumber(num) : ''
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: 'Draft', pending: 'Pending', approved: 'Approved',
    rejected: 'Rejected', revision: 'Revision',
    paid: 'Paid', released: 'Released',
  }
  return map[s] || s
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    draft: 'label-default', pending: 'label-warning', approved: 'label-success',
    rejected: 'label-danger', revision: 'label-info',
    paid: 'label-success', released: 'label-primary',
  }
  return map[s] || 'label-default'
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  proofFile.value = input.files?.[0] || null
}

onMounted(fetchData)
</script>

<template>
  <div class="row">
    <div class="col-md-12" v-if="loading">
      <div class="x_panel"><div class="x_content"><p style="text-align:center;padding:40px;">Loading...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!request">
      <div class="x_panel">
        <div class="x_content">
          <p style="text-align:center;padding:40px;">Request not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to List</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="x_panel">
        <div class="x_title" style="display:flex; align-items:center; justify-content:space-between;">
          <h2 style="margin:0;">Payment: {{ request.request_number }}</h2>
          <span :class="'label ' + statusClass(request.status)" style="font-size:14px; padding:6px 12px; color:#fff; margin-left:auto;">{{ statusLabel(request.status) }}</span>
        </div>
        <div class="x_content">
          <!-- Request Summary -->
          <div class="row" style="margin-bottom:15px;">
            <div class="col-md-6">
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Title</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.title }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Total Amount</div>
                <div class="col-xs-7" style="font-weight:600; color:#5cb85c;">{{ formatCurrency(request.total_amount) }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Outstanding</div>
                <div class="col-xs-7" style="font-weight:600; color:#d9534f;">{{ formatCurrency(request.outstanding) }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Paid At</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.paid_at ? new Date(request.paid_at).toLocaleString('id-ID') : '-' }}</div>
              </div>
            </div>
          </div>

          <div class="ln_solid" style="margin:15px 0;"></div>

          <!-- Payment Terms -->
          <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-calendar"></i> Payment Terms</h5>
          <div class="row" v-if="terms.length">
            <div class="col-md-4" v-for="term in terms" :key="term.id_rfp_term" style="margin-bottom:15px;">
              <div
                :class="['panel', selectedTerm?.id_rfp_term === term.id_rfp_term ? 'panel-primary' : term.status === 'paid' ? 'panel-success' : 'panel-default']"
                style="cursor:pointer;"
                @click="selectTerm(term)"
              >
                <div class="panel-heading" style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>{{ term.term_name }}</strong>
                  <span :class="'label ' + (term.status === 'paid' ? 'label-success' : 'label-warning')">{{ term.status }}</span>
                </div>
                <div class="panel-body">
                  <div style="margin-bottom:4px;"><span style="color:#73879C;">Amount:</span> <strong>{{ formatCurrency(term.amount) }}</strong></div>
                  <div style="margin-bottom:4px;"><span style="color:#73879C;">Paid:</span> <strong>{{ formatCurrency(term.paid_amount) }}</strong></div>
                  <div><span style="color:#73879C;">Remaining:</span> <strong style="color:#5cb85c;">{{ formatCurrency(term.amount - term.paid_amount) }}</strong></div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">No payment terms generated yet.</p>

          <!-- Payment Form -->
          <template v-if="selectedTerm && request.status === 'approved'">
            <div class="ln_solid" style="margin:15px 0;"></div>
            <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-credit-card"></i> Make Payment</h5>
            <div class="form-horizontal form-label-left" style="max-width:700px;">
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Amount <span style="color:red;">*</span></label>
                <div class="col-md-9">
                  <input type="text" :value="amountDisplay" @input="onAmountInput" class="form-control" placeholder="0" required />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Source Bank</label>
                <div class="col-md-9">
                  <input type="text" v-model="sourceBank" class="form-control" placeholder="e.g. BCA, Mandiri, BRI" />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Account Number</label>
                <div class="col-md-9">
                  <input type="text" v-model="sourceAccountNumber" class="form-control" placeholder="Bank account number" />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Account Name</label>
                <div class="col-md-9">
                  <input type="text" v-model="sourceAccountName" class="form-control" placeholder="Account holder name" />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Payment Date</label>
                <div class="col-md-9">
                  <input type="date" v-model="paymentDate" class="form-control" />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Proof</label>
                <div class="col-md-9">
                  <input type="file" class="form-control" accept="image/*,application/pdf" @change="onFileSelected" />
                </div>
              </div>
              <div class="form-group">
                <label class="control-label col-md-3" style="font-weight:bold;">Notes</label>
                <div class="col-md-9">
                  <textarea v-model="notes" class="form-control" rows="2" placeholder="Optional notes"></textarea>
                </div>
              </div>
              <div class="form-group">
                <div class="col-md-9 col-md-offset-3">
                  <button class="btn btn-success" @click="handleSubmit" :disabled="submitting">
                    <i class="fa fa-check"></i> {{ submitting ? 'Processing...' : 'Submit Payment' }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- Payment History -->
          <div class="ln_solid" style="margin:15px 0;"></div>
          <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-history"></i> Payment History</h5>
          <div class="table-responsive" v-if="payments.length">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th style="width:40px;">No.</th>
                <th>Amount</th>
                <th>Source Bank</th>
                <th>Account</th>
                <th>Date</th>
                <th>Status</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in payments" :key="p.id_payment || i">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ formatCurrency(p.amount) }}</strong></td>
                <td>{{ p.source_bank || '-' }}</td>
                <td>{{ p.source_account_number || '-' }} {{ p.source_account_name ? `(${p.source_account_name})` : '' }}</td>
                <td>{{ new Date(p.payment_date).toLocaleDateString('id-ID') }}</td>
                <td><span :class="'label ' + statusClass(p.status)">{{ p.status }}</span></td>
                <td><a v-if="p.proof_url" :href="p.proof_url" target="_blank"><i class="fa fa-paperclip"></i> View</a><span v-else>-</span></td>
              </tr>
            </tbody>
          </table>
          </div>
          <p v-else class="text-muted">No payments recorded yet.</p>

        </div>
        <div class="x_footer">
          <button class="btn btn-default" @click="goBack"><i class="fa fa-arrow-left"></i> Back to Requests</button>
          <button class="btn btn-info pull-right" @click="goToDetail"><i class="fa fa-eye"></i> View Details</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .form-horizontal .control-label {
    text-align: left !important;
    margin-bottom: 4px;
    padding-top: 0;
  }
  .form-horizontal .col-md-3,
  .form-horizontal .col-md-9 {
    width: 100%;
    float: none;
  }
  .btn { margin-bottom: 4px; }
  .table td, .table th { font-size: 12px; padding: 6px 4px; }
}
</style>
