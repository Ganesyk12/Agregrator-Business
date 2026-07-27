<script setup lang="ts">
import { ref, watch, computed } from 'vue'

export interface PaymentRequestItemForm {
  description: string
  quantity: number
  unit_price: number
  amount: number
  notes: string
}

export interface PaymentRequestForm {
  title: string
  description: string
  payment_method: string
  bank_account_number: string
  payment_to: string
  reference_number: string
  items: PaymentRequestItemForm[]
  status: string
  attachment_file?: File | null
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'detail' | 'approve' | 'release'
  request?: any
}>()

const emit = defineEmits<{
  close: []
  save: [data: PaymentRequestForm]
  approve: [data: { status: string; approval_notes: string; attachment_file?: File | null }]
  submitDetail: [data: { attachment_file?: File | null }]
  release: []
}>()

const currentUserEmail = ref('')

try {
  const raw = localStorage.getItem('sigyn_user')
  if (raw) {
    const user = JSON.parse(raw)
    currentUserEmail.value = user.email || user.username || ''
  }
} catch {}

const form = ref<PaymentRequestForm>({
  title: '',
  description: '',
  payment_method: '',
  bank_account_number: '',
  payment_to: '',
  reference_number: '',
  items: [],
  status: 'draft',
})

function newItem(): PaymentRequestItemForm {
  return { description: '', quantity: 1, unit_price: 0, amount: 0, notes: '' }
}

const approvalFile = ref<File | null>(null)
const approvalNotes = ref('')
const detailFile = ref<File | null>(null)

watch(() => props.visible, async (val) => {
  if (val) {
    approvalNotes.value = ''

    if (props.mode === 'add') {
      form.value = {
        title: '', description: '',
        payment_method: '', bank_account_number: '', payment_to: '', reference_number: '',
        items: [newItem()], status: 'draft',
      }
    } else if (props.request) {
      form.value = {
        title: props.request.title || '',
        description: props.request.description || '',
        payment_method: props.request.payment_method || '',
        bank_account_number: props.request.bank_account_number || '',
        payment_to: props.request.payment_to || '',
        reference_number: props.request.reference_number || '',
        status: props.request.status || 'draft',
        items: (props.request.items || []).length
          ? props.request.items.map((i: any) => ({
              description: i.description,
              quantity: i.quantity || 1,
              unit_price: i.unit_price || i.amount,
              amount: i.amount,
              notes: i.notes || '',
            }))
          : [newItem()],
      }
    }
  }
})



function addItem() {
  form.value.items.push(newItem())
}

function removeItem(index: number) {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const totalAmount = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function formatNumber(value: number): string {
  if (!value && value !== 0) return ''
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}



function onAmountInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const num = Number(raw) || 0
  form.value.items[index].amount = num
  ;(e.target as HTMLInputElement).value = formatNumber(num)
}

function onUnitPriceInput(index: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^\d]/g, '')
  const num = Number(raw) || 0
  form.value.items[index].unit_price = num
  form.value.items[index].amount = (form.value.items[index].quantity || 1) * num
  ;(e.target as HTMLInputElement).value = formatNumber(num)
}

function saveAsDraft() {
  form.value.status = 'draft'
  doSave()
}

function doSave() {
  if (!form.value.title || !form.value.items.length) return
  for (const item of form.value.items) {
    if (!item.description || !item.amount) return
  }
  emit('save', { ...form.value, attachment_file: selectedFile.value })
}

function doApprove() {
  emit('approve', { status: 'approved', approval_notes: approvalNotes.value, attachment_file: approvalFile.value })
}

function doReject() {
  emit('approve', { status: 'rejected', approval_notes: approvalNotes.value, attachment_file: approvalFile.value })
}

function doRevision() {
  emit('approve', { status: 'revision', approval_notes: approvalNotes.value, attachment_file: approvalFile.value })
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    draft: 'Draft', pending: 'Pending', approved: 'Approved',
    rejected: 'Rejected', revision: 'Revision',
    submitted: 'Submitted', processing: 'Processing',
    paid: 'Paid', confirmed: 'Confirmed',
    released: 'Released',
  }
  return map[s] || s
}

const statusClass = (s: string) => {
  const map: Record<string, string> = {
    draft: 'label-default', pending: 'label-warning', approved: 'label-success',
    rejected: 'label-danger', revision: 'label-info',
    submitted: 'label-primary', processing: 'label-info',
    paid: 'label-success', confirmed: 'label-primary',
    released: 'label-primary',
  }
  return map[s] || 'label-default'
}

const dotColor = (s: string) => {
  const map: Record<string, string> = {
    draft: '#bbb', pending: '#f0ad4e', approved: '#5cb85c',
    rejected: '#d9534f', revision: '#5bc0de',
    submitted: '#337ab7', processing: '#5bc0de',
    paid: '#5cb85c', confirmed: '#337ab7',
    released: '#337ab7',
  }
  return map[s] || '#bbb'
}

const selectedFile = ref<File | null>(null)
const showFormAttachment = computed(() => props.mode === 'edit' && props.request?.status !== 'draft')

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (props.mode === 'approve') {
    approvalFile.value = file
  } else if (props.mode === 'detail') {
    detailFile.value = file
  } else {
    selectedFile.value = file
  }
}

function submitFromDetail() {
  emit('submitDetail', { attachment_file: detailFile.value })
}

</script>

<template>
  <div v-if="visible" class="modal" tabindex="-1" style="display: block; background: rgba(0,0,0,0.5); z-index: 1050;">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" @click="emit('close')">&times;</button>
          <h4 class="modal-title">
            <template v-if="mode === 'add'">New Payment Request</template>
            <template v-else-if="mode === 'edit'">Edit Payment Request</template>
            <template v-else-if="mode === 'approve'">Approve Payment Request</template>
            <template v-else-if="mode === 'release'">Release Receipt</template>
            <template v-else>Payment Request Detail</template>
          </h4>
        </div>

        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <!-- DETAIL / APPROVE VIEW -->
          <template v-if="(mode === 'detail' || mode === 'approve') && request">
            <div class="form">
              <div class="row" style="margin-bottom: 4px;">
                <div class="col-md-6">
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Request Number</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.request_number }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Title</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.title }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.description">
                    <div class="col-xs-5" style="color: #73879C;">Description</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.description }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.payment_method">
                    <div class="col-xs-5" style="color: #73879C;">Payment Method</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.payment_method }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.bank_account_number">
                    <div class="col-xs-5" style="color: #73879C;">Account Number</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.bank_account_number }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.payment_to">
                    <div class="col-xs-5" style="color: #73879C;">Payment To</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.payment_to }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Status</div>
                    <div class="col-xs-7">
                      <span :class="'label ' + statusClass(request.status)" style="font-size: 13px; padding: 5px 10px;">{{ statusLabel(request.status) }}</span>
                    </div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Requested By</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.requested_by || '-' }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Request Date</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ new Date(request.request_date).toLocaleDateString('id-ID') }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.notes">
                    <div class="col-xs-5" style="color: #73879C;">Notes</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.notes }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.reviewed_by">
                    <div class="col-xs-5" style="color: #73879C;">Reviewed By</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.reviewed_by }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.approval_notes">
                    <div class="col-xs-5" style="color: #73879C;">Approval Notes</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.approval_notes }}</div>
                  </div>
                </div>
              </div>

              <div class="ln_solid" style="margin: 15px 0;"></div>
              <h5 style="font-weight: 700; margin-bottom: 10px; color: #73879C;"><i class="fa fa-list"></i> Items</h5>
              <table class="table table-bordered table-striped" v-if="request.items?.length">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th>Description</th>
                    <th style="width: 60px;">Qty</th>
                    <th style="width: 150px;">Unit Price</th>
                    <th style="width: 150px;">Amount</th>
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
                  <tr style="font-weight: bold; background: #f9f9f9;">
                    <td colspan="4" style="text-align: right;">Total</td>
                    <td>{{ formatCurrency(request.items.reduce((sum: number, i: any) => sum + i.amount, 0)) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              <p v-else class="text-muted">No items.</p>

              <div class="ln_solid" style="margin: 15px 0;"></div>
              <h5 style="font-weight: 700; margin-bottom: 10px; color: #73879C;"><i class="fa fa-clock-o"></i> Transaction History</h5>
              <div v-if="request.transactions?.length" style="position: relative; padding-left: 30px;">
                <div style="position: absolute; left: 10px; top: 4px; bottom: 4px; width: 2px; background: #e0e0e0;"></div>
                <div v-for="(t, i) in [...(request.transactions || [])].reverse()" :key="t.id_transaction || i" style="position: relative; padding-bottom: 18px;">
                  <div :style="{
                    position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px',
                    borderRadius: '50%', border: '2px solid ' + dotColor(t.transaction_type),
                    background: '#fff',
                  }"></div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                      <span :class="'label ' + statusClass(t.transaction_type)" style="font-size: 11px; text-transform: uppercase;">{{ statusLabel(t.transaction_type) }}</span>
                      <span style="margin-left: 8px; color: #999; font-size: 12px;">{{ new Date(t.transaction_date).toLocaleString('id-ID') }}</span>
                      <div style="margin-top: 4px; font-size: 13px;">{{ t.description || '-' }}</div>
                      <div style="font-size: 11px; color: #999; margin-top: 2px;">by {{ t.created_by || 'SYSTEM' }}</div>
                      <a v-if="t.payment_proof_url" :href="t.payment_proof_url" target="_blank" style="font-size: 12px; margin-top: 2px; display: inline-block;"><i class="fa fa-paperclip"></i> View Attachment</a>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted">No transactions yet.</p>

              <template v-if="mode === 'detail' && (request.status === 'draft' || request.status === 'revision')">
                <div class="ln_solid" style="margin: 15px 0;"></div>
                <h5 style="font-weight: 700; margin-bottom: 10px; color: #73879C;"><i class="fa fa-send"></i> Submit Request</h5>
                <div class="form-group" style="text-align: left;">
                  <label class="control-label" style="font-weight: bold;">Attachment (optional)</label>
                  <input type="file" class="form-control" accept="image/*,application/pdf" @change="onFileSelected" />
                </div>
                <button type="button" class="btn btn-success" @click="submitFromDetail">
                  <i class="fa fa-send"></i> Submit
                </button>
              </template>

              <template v-if="mode === 'approve' && request.status === 'pending'">
                <div class="ln_solid" style="margin: 15px 0;"></div>
                <h5 style="font-weight: 700; margin-bottom: 10px; color: #73879C;"><i class="fa fa-check-circle"></i> Approval Action</h5>
                <div class="form-group" style="text-align: left;">
                  <label class="control-label" style="font-weight: bold;">Notes</label>
                  <textarea v-model="approvalNotes" class="form-control" rows="3" placeholder="Approval notes / reason / revision instructions"></textarea>
                </div>
                <div class="form-group" style="text-align: left;">
                  <label class="control-label" style="font-weight: bold;">Attachment (optional)</label>
                  <input type="file" class="form-control" accept="image/*,application/pdf" @change="onFileSelected" />
                </div>
              </template>
            </div>
          </template>

          <!-- RELEASE RECEIPT VIEW -->
          <template v-else-if="mode === 'release' && request">
            <div class="alert alert-info">
              <i class="fa fa-file-text"></i>
              <strong>Release Receipt Confirmation</strong>
              <p style="margin-top:8px;">This will generate an official receipt (KWT) for <strong>{{ request.request_number }}</strong> and change its status to <strong>Released</strong>.</p>
            </div>
            <div class="form">
              <div class="row" style="margin-bottom: 4px;">
                <div class="col-md-6">
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Request Number</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.request_number }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Title</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.title }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;" v-if="request.payment_to">
                    <div class="col-xs-5" style="color: #73879C;">Payment To</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.payment_to }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Request Date</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ new Date(request.request_date).toLocaleDateString('id-ID') }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Requested By</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ request.requested_by || '-' }}</div>
                  </div>
                  <div class="row" style="margin-bottom: 6px;">
                    <div class="col-xs-5" style="color: #73879C;">Total Amount</div>
                    <div class="col-xs-7" style="font-weight: 600;">{{ formatCurrency(request.items?.reduce((sum: number, i: any) => sum + i.amount, 0) || 0) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ADD/EDIT FORM VIEW -->
          <template v-else>
            <form @submit.prevent class="form">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Title *</label>
                    <input type="text" v-model="form.title" class="form-control" required placeholder="e.g. Pembayaran DP Vendor" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Request By</label>
                    <input type="text" class="form-control" :value="currentUserEmail" readonly />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment Method</label>
                    <input type="text" v-model="form.payment_method" class="form-control" placeholder="e.g. BANK MANDIRI" />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Account Number</label>
                    <input type="text" v-model="form.bank_account_number" class="form-control" placeholder="Destination account number" oninput="this.value = this.value.replace(/\D/g, '')" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Payment To</label>
                    <input type="text" v-model="form.payment_to" class="form-control" placeholder="e.g. Vendor X" />
                  </div>
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Reference Number</label>
                    <input type="text" v-model="form.reference_number" class="form-control" placeholder="e.g. Booking registration number" />
                  </div>
                </div>
              </div>

              <hr />
              <div class="row" style="margin-bottom: 8px;">
                <div class="col-md-6">
                  <h5 style="font-weight: bold; margin: 0; line-height: 34px;">Items</h5>
                </div>
                <div class="col-md-6" style="text-align: right;">
                  <button type="button" class="btn btn-sm btn-success" @click="addItem">
                    <i class="fa fa-plus"></i> Add Item
                  </button>
                </div>
              </div>

              <div v-for="(item, index) in form.items" :key="index" style="border: 1px solid #ddd; padding: 10px 12px; margin-bottom: 8px; border-radius: 4px;">
                <div class="row" style="margin-bottom: 4px;">
                  <div class="col-md-10">
                    <strong style="font-size: 13px;">Item {{ index + 1 }}</strong>
                  </div>
                  <div class="col-md-2" style="text-align: right;">
                    <button type="button" class="btn btn-xs btn-danger" @click="removeItem(index)" :disabled="form.items.length <= 1" title="Remove item">
                      <i class="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group" style="text-align: left; margin-bottom: 6px;">
                      <label class="control-label" style="font-weight: bold; font-size: 12px;">Description *</label>
                      <input type="text" v-model="item.description" class="form-control input-sm" required placeholder="e.g. DP package X" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group" style="text-align: left; margin-bottom: 6px;">
                      <label class="control-label" style="font-weight: bold; font-size: 12px;">Notes <small class="text-muted">(Optional)</small></label>
                      <input type="text" v-model="item.notes" class="form-control input-sm" placeholder="Keterangan tambahan untuk item ini..." />
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-2">
                    <div class="form-group" style="text-align: left; margin-bottom: 0;">
                      <label class="control-label" style="font-weight: bold; font-size: 12px;">Qty</label>
                      <input type="number" v-model.number="item.quantity" class="form-control input-sm" min="1" @input="item.amount = (item.quantity || 1) * (item.unit_price || 0)" />
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group" style="text-align: left; margin-bottom: 0;">
                      <label class="control-label" style="font-weight: bold; font-size: 12px;">Unit Price</label>
                      <input type="text" class="form-control input-sm" :value="formatNumber(item.unit_price)" @input="onUnitPriceInput(index, $event)" placeholder="0" />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group" style="text-align: left; margin-bottom: 0;">
                      <label class="control-label" style="font-weight: bold; font-size: 12px;">Amount *</label>
                      <input type="text" class="form-control input-sm" :value="formatNumber(item.amount)" @input="onAmountInput(index, $event)" required placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div v-if="showFormAttachment" class="col-md-6">
                  <div class="form-group" style="text-align: left;">
                    <label class="control-label" style="font-weight: bold;">Attachment (optional)</label>
                    <input type="file" class="form-control" accept="image/*,application/pdf" @change="onFileSelected" />
                  </div>
                </div>
                <div :class="showFormAttachment ? 'col-md-6' : 'col-md-12'" style="text-align: right; font-weight: bold; font-size: 16px; padding-top: 25px;">
                  Total Amount: Rp {{ formatNumber(totalAmount) }}
                </div>
              </div>
            </form>
          </template>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-default" @click="emit('close')">Close</button>

          <template v-if="mode === 'add' || mode === 'edit'">
            <button type="button" class="btn btn-info" @click="saveAsDraft" :disabled="!form.title || !form.items.length || form.items.some(i => !i.description || !i.amount)">
              <i class="fa fa-save"></i> Save as Draft
            </button>
          </template>

          <template v-if="mode === 'approve' && request?.status === 'pending'">
            <button type="button" class="btn btn-warning" @click="doRevision">
              <i class="fa fa-pencil"></i> Revision
            </button>
            <button type="button" class="btn btn-danger" @click="doReject">
              <i class="fa fa-times"></i> Reject
            </button>
            <button type="button" class="btn btn-success" @click="doApprove">
              <i class="fa fa-check"></i> Approve
            </button>
          </template>

          <template v-if="mode === 'release' && request?.status === 'approved'">
            <button type="button" class="btn btn-primary" @click="emit('release')">
              <i class="fa fa-file-text"></i> Release Receipt
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
