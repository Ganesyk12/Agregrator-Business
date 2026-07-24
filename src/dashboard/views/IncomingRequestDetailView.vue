<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const request = ref<any>(null)
const loading = ref(true)

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
    const res = await fetch(`${apiUrl}/api/payment-requests/${id}`)
    if (!res.ok) throw new Error('Request not found')
    const json = await res.json()
    request.value = json.data
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
    showCancelButton: true,
    confirmButtonColor: '#5cb85c',
    confirmButtonText: 'Yes, Release Receipt',
    cancelButtonText: 'Cancel',
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

async function handlePrintReceipt() {
  if (!request.value?.id_request) return
  router.push(`/receipts/${request.value.id_request}`)
}

function goBack() {
  router.push('/incoming-requests')
}

function onApprovalFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  approvalFile.value = input.files?.[0] || null
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

onMounted(fetchRequest)
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
          <h2 style="margin:0;">{{ request.request_number }} <small>{{ request.title }}</small></h2>
          <span :class="'label ' + statusClass(request.status)" style="font-size:14px; padding:6px 12px; color:#fff; margin-left:auto;">{{ statusLabel(request.status) }}</span>
        </div>
        <div class="x_content">
          <!-- Request Info -->
          <div class="row">
            <div class="col-md-6">
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Request Number</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.request_number }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Title</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.title }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.description">
                <div class="col-xs-5" style="color:#73879C;">Description</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.description }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.payment_method">
                <div class="col-xs-5" style="color:#73879C;">Payment Method</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.payment_method }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.bank_account_number">
                <div class="col-xs-5" style="color:#73879C;">Account Number</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.bank_account_number }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.payment_to">
                <div class="col-xs-5" style="color:#73879C;">Payment To</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.payment_to }}</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Requested By</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.requested_by || '-' }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;">
                <div class="col-xs-5" style="color:#73879C;">Request Date</div>
                <div class="col-xs-7" style="font-weight:600;">{{ new Date(request.request_date).toLocaleDateString('id-ID') }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.notes">
                <div class="col-xs-5" style="color:#73879C;">Notes</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.notes }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.reviewed_by">
                <div class="col-xs-5" style="color:#73879C;">Reviewed By</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.reviewed_by }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.approval_notes">
                <div class="col-xs-5" style="color:#73879C;">Approval Notes</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.approval_notes }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.receipt_number">
                <div class="col-xs-5" style="color:#73879C;">Receipt Number</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.receipt_number }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.reference_number">
                <div class="col-xs-5" style="color:#73879C;">Reference Number</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.reference_number }}</div>
              </div>
              <div class="row" style="margin-bottom:6px;" v-if="request.released_by">
                <div class="col-xs-5" style="color:#73879C;">Released By</div>
                <div class="col-xs-7" style="font-weight:600;">{{ request.released_by }}</div>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="ln_solid" style="margin:15px 0;"></div>
          <h5 style="font-weight:700; margin-bottom:10px; color:#73879C;"><i class="fa fa-list"></i> Items</h5>
          <table class="table table-bordered table-striped" v-if="request.items?.length">
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
          <p v-else class="text-muted">No items.</p>

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

          <!-- Action Buttons -->
          <div class="ln_solid" style="margin:20px 0 10px;"></div>
          <div class="row">
            <div class="col-xs-12">
              <template v-if="request.status === 'pending'">
                <button class="btn btn-warning" @click="handleApprove('revision')"><i class="fa fa-pencil"></i> Revision</button>
                <button class="btn btn-danger" @click="handleApprove('rejected')" style="margin-left:6px;"><i class="fa fa-times"></i> Reject</button>
                <button class="btn btn-success" @click="handleApprove('approved')" style="margin-left:6px;"><i class="fa fa-check"></i> Approve</button>
              </template>
              <button v-if="request.status === 'approved'" class="btn btn-primary" @click="handleRelease"><i class="fa fa-file-text"></i> Release Receipt</button>
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
</template>
