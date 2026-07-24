<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import PaymentRequestModal, { type PaymentRequestForm } from '../components/PaymentRequestModal.vue'

const route = useRoute()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const request = ref<any>(null)
const terms = ref<any[]>([])
const rfpPayments = ref<any[]>([])
const loading = ref(true)

const showPaymentProgress = ref(true)

const modalVisible = ref(false)
const modalMode = ref<'add' | 'edit' | 'detail' | 'approve' | 'release'>('edit')
const detailFile = ref<File | null>(null)
const detailNotes = ref('')

const releaseNotes = ref('')

const approvalNotes = ref('')
const approvalFile = ref<File | null>(null)

const Toast = Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
})

function getUser() {
  try {
    const raw = localStorage.getItem('sigyn_user')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

async function fetchRequest() {
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
    rfpPayments.value = paymentsJson.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function uploadFile(requestNumber: string, file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${apiUrl}/api/upload/payment-proof?request_number=${encodeURIComponent(requestNumber)}`, { method: 'POST', body: fd })
  if (!res.ok) return null
  const json = await res.json()
  return json.url
}

async function handleRelease() {
  if (!request.value) return
  const user = getUser()
  if (!user?.email) {
    Toast.fire({ icon: 'error', title: 'User not found' })
    return
  }

  const result = await Swal.fire({
    title: 'Release Receipt?',
    text: `This will generate receipt for ${request.value.request_number} and change status to Released.`,
    icon: 'question',
    input: 'textarea',
    inputPlaceholder: 'Optional notes...',
    showCancelButton: true,
    confirmButtonColor: '#5cb85c',
    confirmButtonText: 'Yes, Release Receipt',
    cancelButtonText: 'Cancel',
    preConfirm: (notes) => { releaseNotes.value = notes || '' },
  })
  if (!result.isConfirmed) return

  try {
    const res = await fetch(`${apiUrl}/api/payment-requests/${request.value.id_request}/release`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        released_by: user.email,
        user_modified: user.email || 'SYSTEM',
      }),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to release receipt')
    }

    await fetchRequest()
    Toast.fire({ icon: 'success', title: `Receipt released for ${request.value.request_number}` })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
}

async function handleApprove(status: 'approved' | 'rejected' | 'revision') {
  if (!request.value) return
  const user = getUser()
  if (!user?.email) {
    Toast.fire({ icon: 'error', title: 'User not found' })
    return
  }

  const labels: Record<string, string> = { approved: 'Approve', rejected: 'Reject', revision: 'Revision' }
  const result = await Swal.fire({
    title: `${labels[status]} Request?`,
    text: `This will change status to ${status}.`,
    icon: 'question',
    input: 'textarea',
    inputPlaceholder: 'Notes (optional)...',
    showCancelButton: true,
    confirmButtonColor: status === 'approved' ? '#5cb85c' : status === 'rejected' ? '#d9534f' : '#f0ad4e',
    confirmButtonText: `Yes, ${labels[status]}`,
    cancelButtonText: 'Cancel',
    preConfirm: (notes) => { approvalNotes.value = notes || '' },
  })
  if (!result.isConfirmed) return

  let proofUrl: string | null = null
  if (approvalFile.value && request.value.request_number) {
    proofUrl = await uploadFile(request.value.request_number, approvalFile.value)
  }

  try {
    const res = await fetch(`${apiUrl}/api/payment-requests/${request.value.id_request}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        approval_notes: approvalNotes.value || null,
        reviewed_by: user.email,
        user_modified: user.email || 'SYSTEM',
        attachment_url: proofUrl,
      }),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to process')
    }

    await fetchRequest()
    const label = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'sent for revision'
    Toast.fire({ icon: 'success', title: `Request ${label}` })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
}

function onApprovalFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  approvalFile.value = input.files?.[0] || null
}

async function handlePrintReceipt() {
  if (!request.value?.id_request) return
  router.push(`/receipts/${request.value.id_request}`)
}

function goBack() {
  router.push('/payment-requests')
}

function openEdit() {
  if (!request.value) return
  modalMode.value = 'edit'
  modalVisible.value = true
}

async function handleSave(data: PaymentRequestForm) {
  const user = getUser()
  const body: Record<string, any> = {
    title: data.title,
    description: data.description,
    payment_method: data.payment_method,
    bank_account_number: data.bank_account_number,
    payment_to: data.payment_to,
    reference_number: data.reference_number,
    requested_by: user?.email,
    user_modified: user?.email || 'SYSTEM',
    status: data.status,
    items: data.items,
  }

  try {
    const res = await fetch(`${apiUrl}/api/payment-requests/${request.value.id_request}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to update')
    }

    const json = await res.json()
    const requestNumber = json.data?.request_number

    if (data.attachment_file && requestNumber) {
      const proofUrl = await uploadFile(requestNumber, data.attachment_file)
      if (proofUrl && data.status === 'pending') {
        await fetch(`${apiUrl}/api/payment-requests/${json.data.id_request}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_type: 'submitted', description: 'Payment request submitted', payment_proof_url: proofUrl, created_by: user?.email || 'SYSTEM' }),
        })
      }
    }

    await fetchRequest()
    Toast.fire({ icon: 'success', title: 'Payment request updated' })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
  modalVisible.value = false
}

async function handleSubmit() {
  if (!request.value) return
  const user = getUser()

  let proofUrl: string | null = null
  if (detailFile.value && request.value.request_number) {
    proofUrl = await uploadFile(request.value.request_number, detailFile.value)
  }

  try {
    const res = await fetch(`${apiUrl}/api/payment-requests/${request.value.id_request}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'pending',
        user_modified: user?.email || 'SYSTEM',
        attachment_url: proofUrl,
        approval_notes: detailNotes.value || null,
      }),
    })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody?.error?.message || 'Failed to submit')
    }

    await fetchRequest()
    Toast.fire({ icon: 'success', title: 'Request submitted for approval' })
  } catch (err: any) {
    Toast.fire({ icon: 'error', title: err.message })
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: 'Draft', pending: 'Pending', approved: 'Approved',
    rejected: 'Rejected', revision: 'Revision',
    submitted: 'Submitted', processing: 'Processing',
    paid: 'Paid', confirmed: 'Confirmed',
    released: 'Released',
  }
  return map[s] || s
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    draft: 'label-default', pending: 'label-warning', approved: 'label-success',
    rejected: 'label-danger', revision: 'label-info',
    submitted: 'label-primary', processing: 'label-info',
    paid: 'label-success', confirmed: 'label-primary',
    released: 'label-primary',
  }
  return map[s] || 'label-default'
}

function dotColor(s: string) {
  const map: Record<string, string> = {
    draft: '#bbb', pending: '#f0ad4e', approved: '#5cb85c',
    rejected: '#d9534f', revision: '#5bc0de',
    submitted: '#337ab7', processing: '#5bc0de',
    paid: '#5cb85c', confirmed: '#337ab7',
    released: '#337ab7',
  }
  return map[s] || '#bbb'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  detailFile.value = input.files?.[0] || null
}

onMounted(fetchRequest)
</script>

<template>
  <div class="row">
    <div class="col-md-12" v-if="loading">
      <div class="card"><div class="card-body"><p style="text-align:center;padding:40px;">Loading...</p></div></div>
    </div>

    <div class="col-md-12" v-else-if="!request">
      <div class="card">
        <div class="card-body">
          <p style="text-align:center;padding:40px;">Request not found.</p>
          <div style="text-align:center;"><button class="btn btn-primary" @click="goBack">Back to List</button></div>
        </div>
      </div>
    </div>

    <div class="col-md-12" v-else>
      <div class="card">
        <div class="card-header" style="display:flex; align-items:center; justify-content:space-between;">
          <h2 style="margin:0;">{{ request.request_number }} <small>{{ request.title }}</small></h2>
          <span :class="'label ' + statusClass(request.status)" style="font-size:14px; padding:6px 12px; color:#fff; margin-left:auto;">{{ statusLabel(request.status) }}</span>
        </div>
        <div class="card-body">
          <!-- Request Info -->
          <div class="row">
            <!-- Left Info Panel -->
            <div class="col-md-6 m-b-20">
              <div class="card h-100 mb-0 shadow-sm border">
                <div class="card-header bg-light py-2 px-3">
                  <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-info-circle text-c-blue"></i> Detail Pengajuan</h6>
                </div>
                <div class="card-body p-3">
                  <dl class="row m-b-0" style="font-size: 13px;">
                    <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Request Number</dt>
                    <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.request_number }}</dd>

                    <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Title</dt>
                    <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.title }}</dd>

                    <template v-if="request.description">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Description</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.description }}</dd>
                    </template>

                    <template v-if="request.payment_method">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Payment Method</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.payment_method }}</dd>
                    </template>

                    <template v-if="request.bank_account_number">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Account Number</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.bank_account_number }}</dd>
                    </template>

                    <template v-if="request.payment_to">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Payment To</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.payment_to }}</dd>
                    </template>
                  </dl>
                </div>
              </div>
            </div>

            <!-- Right Info Panel -->
            <div class="col-md-6 m-b-20">
              <div class="card h-100 mb-0 shadow-sm border">
                <div class="card-header bg-light py-2 px-3">
                  <h6 class="m-0 font-weight-bold text-muted"><i class="fa fa-clock-o text-c-green"></i> Status & Pembuat</h6>
                </div>
                <div class="card-body p-3">
                  <dl class="row m-b-0" style="font-size: 13px;">
                    <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Requested By</dt>
                    <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.requested_by || '-' }}</dd>

                    <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Request Date</dt>
                    <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ new Date(request.request_date).toLocaleDateString('id-ID') }}</dd>

                    <template v-if="request.notes">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Notes</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.notes }}</dd>
                    </template>

                    <template v-if="request.receipt_number">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Receipt Number</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.receipt_number }}</dd>
                    </template>

                    <template v-if="request.reference_number">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Reference Number</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.reference_number }}</dd>
                    </template>

                    <template v-if="request.released_at">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Released At</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ new Date(request.released_at).toLocaleString('id-ID') }}</dd>
                    </template>

                    <template v-if="request.released_by">
                      <dt class="col-sm-5 text-start font-weight-bold text-muted" style="margin-bottom: 6px;">Released By</dt>
                      <dd class="col-sm-7 text-start" style="margin-bottom: 6px; font-weight: 600;">{{ request.released_by }}</dd>
                    </template>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="ln_solid" style="margin:15px 0;"></div>
          <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-list"></i> Items</h5>
          <div class="table-responsive" v-if="request.items?.length">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th style="width:40px;">No.</th>
                  <th>Description</th>
                  <th style="width:60px;">Qty</th>
                  <th style="width:150px;">Unit Price</th>
                  <th style="width:150px;">Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in request.items" :key="item.id_item || i">
                  <td>{{ Number(i) + 1 }}</td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity || 1 }}</td>
                  <td>{{ formatCurrency(item.unit_price || item.amount) }}</td>
                  <td>{{ formatCurrency(item.amount) }}</td>
                  <td>{{ item.notes || '-' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="font-weight:bold; background:#f9f9f9;">
                  <td colspan="4" style="text-align:right;">Total</td>
                  <td>{{ formatCurrency(request.items.reduce((sum: number, i: any) => sum + Number(i.amount), 0)) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p v-else class="text-muted">No items.</p>

          <!-- Payment Progress -->
          <template v-if="request.status !== 'draft' && terms.length > 0">
            <div class="ln_solid" style="margin:15px 0;"></div>

            <div class="card">
              <div class="card-header" style="display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding:8px 15px;" @click="showPaymentProgress = !showPaymentProgress">
                <h5 style="margin:0; font-weight:700; color:#73879C;"><i class="fa fa-credit-card"></i> Payment Progress</h5>
                <a style="cursor:pointer;"><i :class="showPaymentProgress ? 'fa fa-chevron-up' : 'fa fa-chevron-down'" style="color:#73879C;"></i></a>
              </div>
              <div class="card-body" v-show="showPaymentProgress" style="padding:10px 15px;">
                <div class="row" style="margin-bottom:12px;">
                  <div class="col-md-4">
                    <div style="padding:12px; background:#f9f9f9; border-radius:4px; text-align:center;">
                      <div style="color:#73879C; font-size:12px; margin-bottom:4px;">Total Amount</div>
                      <div style="font-size:18px; font-weight:700;">{{ formatCurrency(request.total_amount) }}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div style="padding:12px; background:#f0faf0; border-radius:4px; text-align:center;">
                      <div style="color:#73879C; font-size:12px; margin-bottom:4px;">Paid</div>
                      <div style="font-size:18px; font-weight:700; color:#5cb85c;">{{ formatCurrency(request.total_amount - request.outstanding) }}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div style="padding:12px; background:#fdf0f0; border-radius:4px; text-align:center;">
                      <div style="color:#73879C; font-size:12px; margin-bottom:4px;">Outstanding</div>
                      <div style="font-size:18px; font-weight:700; color:#d9534f;">{{ formatCurrency(request.outstanding) }}</div>
                    </div>
                  </div>
                </div>
                <div style="margin-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span style="font-size:12px; color:#73879C;">Progress</span>
                    <span style="font-size:12px; font-weight:600;">{{ request.total_amount > 0 ? Math.round(((request.total_amount - request.outstanding) / request.total_amount) * 100) : 0 }}%</span>
                  </div>
                  <div class="progress" style="height:8px; margin:0;">
                    <div class="progress-bar progress-bar-success" role="progressbar"
                      :style="{ width: (request.total_amount > 0 ? ((request.total_amount - request.outstanding) / request.total_amount) * 100 : 0) + '%' }">
                    </div>
                  </div>
                </div>

                <div class="ln_solid" style="margin:10px 0;"></div>

                <!-- Terms -->
                <div v-if="terms.length" style="margin-bottom:12px;">
                  <h6 style="font-weight:600; color:#73879C; margin-bottom:8px;">Terms</h6>
                  <div class="table-responsive">
                    <table class="table table-bordered table-striped" style="margin-bottom:0;">
                      <thead>
                        <tr>
                          <th>Term</th>
                          <th style="width:150px;">Amount</th>
                          <th style="width:150px;">Paid</th>
                          <th style="width:150px;">Remaining</th>
                          <th style="width:80px;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="term in terms" :key="term.id_rfp_term">
                          <td>{{ term.term_name }}</td>
                          <td>{{ formatCurrency(term.amount) }}</td>
                          <td style="color:#5cb85c;">{{ formatCurrency(term.paid_amount) }}</td>
                          <td style="color:#d9534f;">{{ formatCurrency(term.amount - term.paid_amount) }}</td>
                          <td><span :class="'label ' + (term.status === 'paid' ? 'label-success' : term.status === 'partial' ? 'label-warning' : 'label-default')">{{ term.status }}</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Payment History -->
                <div v-if="rfpPayments.length">
                  <h6 style="font-weight:600; color:#73879C; margin-bottom:8px;">Payment History</h6>
                  <div class="table-responsive">
                    <table class="table table-bordered table-striped" style="margin-bottom:0;">
                      <thead>
                        <tr>
                          <th style="width:40px;">No.</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Source Bank</th>
                          <th>Account</th>
                          <th>Status</th>
                          <th>Proof</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(p, i) in rfpPayments" :key="p.id_rfp_payment || i">
                          <td>{{ i + 1 }}</td>
                          <td>{{ new Date(p.payment_date).toLocaleDateString('id-ID') }}</td>
                          <td><strong>{{ formatCurrency(p.amount) }}</strong></td>
                          <td>{{ p.source_bank || '-' }}</td>
                          <td>{{ p.source_account_number || '-' }} {{ p.source_account_name ? `(${p.source_account_name})` : '' }}</td>
                          <td><span :class="'label ' + statusClass(p.status)">{{ p.status }}</span></td>
                          <td><a v-if="p.proof_url" :href="p.proof_url" target="_blank"><i class="fa fa-paperclip"></i> View</a><span v-else>-</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p v-else class="text-muted" style="margin:0;">No payments recorded yet.</p>
              </div>
            </div>
          </template>

          <!-- Submit Section (for draft / revision) -->
          <template v-if="request.status === 'draft' || request.status === 'revision'">
            <div class="ln_solid" style="margin:15px 0;"></div>
            <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-send"></i> Submit Request</h5>
            <div class="form-group" style="text-align:left;">
              <label class="control-label" style="font-weight:bold;">Notes</label>
              <textarea v-model="detailNotes" class="form-control" rows="2" placeholder="Notes for submission (optional)"></textarea>
            </div>
            <div class="form-group" style="text-align:left;">
              <label class="control-label" style="font-weight:bold;">Attachment (optional)</label>
              <input type="file" class="form-control" accept="image/*,application/pdf" @change="onFileSelected" />
            </div>
          </template>

          <!-- Approval Section (for pending status) -->
          <template v-if="request.status === 'pending'">
            <div class="ln_solid" style="margin:15px 0;"></div>
            <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-check-circle"></i> Approval Action</h5>
            <div class="form-group" style="text-align:left;">
              <label class="control-label" style="font-weight:bold;">Attachment (optional)</label>
              <input type="file" class="form-control" accept="image/*,application/pdf" @change="onApprovalFileSelected" />
            </div>
          </template>

          <!-- Transaction History -->
          <div class="ln_solid" style="margin:15px 0;"></div>
          <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-clock-o"></i> Transaction History</h5>
          <div v-if="request.transactions?.length" style="position:relative; padding-left:30px;">
            <div style="position:absolute; left:10px; top:4px; bottom:4px; width:2px; background:#e0e0e0;"></div>
            <div v-for="(t, i) in [...(request.transactions || [])].reverse()" :key="t.id_transaction || i" style="position:relative; padding-bottom:18px;">
              <div :style="{
                position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px',
                borderRadius: '50%', border: '2px solid ' + dotColor(t.transaction_type),
                background: '#fff',
              }"></div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span :class="'label ' + statusClass(t.transaction_type)" style="font-size:11px; text-transform:uppercase;">{{ statusLabel(t.transaction_type) }}</span>
                  <span style="margin-left:8px; color:#999; font-size:12px;">{{ new Date(t.transaction_date).toLocaleString('id-ID') }}</span>
                  <div style="margin-top:4px; font-size:13px;">{{ t.description || '-' }}</div>
                  <div style="font-size:11px; color:#999; margin-top:2px;">by {{ t.created_by || 'SYSTEM' }}</div>
                  <a v-if="t.payment_proof_url" :href="t.payment_proof_url" target="_blank" style="font-size:12px; margin-top:2px; display:inline-block;"><i class="fa fa-paperclip"></i> View Attachment</a>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted">No transactions yet.</p>

          <div class="ln_solid" style="margin:20px 0 10px;"></div>
          <div class="row">
            <div class="col-xs-12">
              <button v-if="request.status === 'draft' || request.status === 'revision'" class="btn btn-success" @click="handleSubmit"><i class="fa fa-send"></i> {{ request.status === 'revision' ? 'Resubmit' : 'Submit' }}</button>
              <button v-if="request.status === 'draft' || request.status === 'revision'" class="btn btn-info" @click="openEdit" style="margin-left:6px;"><i class="fa fa-pencil"></i> Edit</button>
              <template v-if="request.status === 'pending'">
                <button class="btn btn-warning" @click="handleApprove('revision')"><i class="fa fa-pencil"></i> Revision</button>
                <button class="btn btn-danger" @click="handleApprove('rejected')" style="margin-left:6px;"><i class="fa fa-times"></i> Reject</button>
                <button class="btn btn-success" @click="handleApprove('approved')" style="margin-left:6px;"><i class="fa fa-check"></i> Approve</button>
              </template>
              <button v-if="request.status === 'approved' && request.outstanding <= 0" class="btn btn-primary" @click="handleRelease"><i class="fa fa-file-text"></i> Release Receipt</button>
              <button v-if="request.status === 'released'" class="btn btn-info" @click="handlePrintReceipt" style="margin-left:6px;"><i class="fa fa-print"></i> Print Receipt</button>
            </div>
          </div>
        </div>
        <div class="x_footer">
          <button class="btn btn-default" @click="goBack"><i class="fa fa-arrow-left"></i> Back to Requests</button>
        </div>
      </div>
    </div>
  </div>

  <PaymentRequestModal
    :visible="modalVisible"
    :mode="modalMode"
    :request="request"
    @close="modalVisible = false; fetchRequest()"
    @save="handleSave"
  />
</template>

<style scoped>
@media (max-width: 767px) {
  .btn { margin-bottom: 4px; }
  .table td, .table th { font-size: 12px; padding: 6px 4px; }
  .table-responsive { font-size: 12px; }
}
</style>
