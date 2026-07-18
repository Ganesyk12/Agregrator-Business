import prisma from '../../db'
import type { PaymentRequest, PaymentRequestItem, PaymentTransaction } from './payment-requests.types'

const requestInclude = {
  requester: { select: { id_user: true, full_name: true, email: true } },
  reviewer: { select: { id_user: true, full_name: true, email: true } },
  items: { orderBy: { sort_order: 'asc' as const } },
  transactions: { orderBy: { date_created: 'asc' as const } },
} as const

function generateRequestNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `RFP-${y}${m}-${rand}`
}

export async function findAll(): Promise<PaymentRequest[]> {
  return prisma.paymentRequest.findMany({
    where: { status: { not: 'deleted' } },
    include: requestInclude,
    orderBy: { date_created: 'desc' },
  }) as unknown as PaymentRequest[]
}

export async function findById(id: number): Promise<PaymentRequest | null> {
  return prisma.paymentRequest.findFirst({
    where: { id_request: id, status: { not: 'deleted' } },
    include: requestInclude,
  }) as unknown as PaymentRequest | null
}

export async function create(
  data: Pick<PaymentRequest, 'title' | 'requested_by'> &
    Partial<Pick<PaymentRequest, 'description' | 'notes' | 'payment_method' | 'bank_account_number' | 'payment_to' | 'status' | 'user_created'>> & {
      items: Array<Pick<PaymentRequestItem, 'description' | 'amount'> &
        Partial<Pick<PaymentRequestItem, 'quantity' | 'unit_price' | 'notes'>>
      >
    }
): Promise<PaymentRequest> {
  const requestNumber = generateRequestNumber()

  const request = await prisma.paymentRequest.create({
    data: {
      request_number: requestNumber,
      title: data.title,
      description: data.description ?? null,
      requested_by: data.requested_by,
      notes: data.notes ?? null,
      payment_method: data.payment_method ?? null,
      bank_account_number: data.bank_account_number ?? null,
      payment_to: data.payment_to ?? null,
      status: data.status ?? 'draft',
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_created ?? 'SYSTEM',
      items: {
        create: data.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity ?? 1,
          unit_price: item.unit_price ?? item.amount,
          amount: item.amount,
          notes: item.notes ?? null,
          sort_order: i,
        })),
      },
    },
    include: requestInclude,
  }) as unknown as PaymentRequest

  return request
}

export async function update(
  id: number,
  data: Partial<Pick<PaymentRequest, 'title' | 'description' | 'notes' | 'payment_method' | 'bank_account_number' | 'payment_to' | 'status' | 'reviewed_by' | 'reviewed_at' | 'approval_notes' | 'user_modified'>> & {
    items?: Array<{
      id_item?: number
      description: string
      quantity?: number
      unit_price?: number
      amount: number
      notes?: string | null
    }>
  }
): Promise<PaymentRequest | null> {
  const existing = await prisma.paymentRequest.findFirst({
    where: { id_request: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const payload: any = {}
  if (data.title !== undefined) payload.title = data.title
  if (data.description !== undefined) payload.description = data.description
  if (data.notes !== undefined) payload.notes = data.notes
  if (data.payment_method !== undefined) payload.payment_method = data.payment_method
  if (data.bank_account_number !== undefined) payload.bank_account_number = data.bank_account_number
  if (data.payment_to !== undefined) payload.payment_to = data.payment_to
  if (data.status !== undefined) payload.status = data.status
  if (data.reviewed_by !== undefined) payload.reviewed_by = data.reviewed_by
  if (data.reviewed_at !== undefined) payload.reviewed_at = data.reviewed_at
  if (data.approval_notes !== undefined) payload.approval_notes = data.approval_notes
  payload.user_modified = data.user_modified ?? 'SYSTEM'

  if (data.items) {
    await prisma.paymentRequestItem.deleteMany({ where: { id_request: id } })
  }

  const request = await prisma.paymentRequest.update({
    where: { id_request: id },
    data: {
      ...payload,
      ...(data.items ? {
        items: {
          create: data.items.map((item, i) => ({
            description: item.description,
            quantity: item.quantity ?? 1,
            unit_price: item.unit_price ?? item.amount,
            amount: item.amount,
            notes: item.notes ?? null,
            sort_order: i,
          })),
        },
      } : {}),
    },
    include: requestInclude,
  }) as unknown as PaymentRequest

  return request
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.paymentRequest.findFirst({
    where: { id_request: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.paymentRequest.update({
    where: { id_request: id },
    data: { status: 'deleted' },
  })
  return true
}

export async function addTransaction(
  id_request: number,
  data: Pick<PaymentTransaction, 'transaction_type'> &
    Partial<Pick<PaymentTransaction, 'description' | 'payment_proof_url' | 'payment_method' | 'bank_name' | 'bank_account_number' | 'bank_account_name' | 'reference_number' | 'paid_at' | 'created_by'>>
): Promise<PaymentTransaction> {
  const payload: any = {
    id_request,
    transaction_type: data.transaction_type,
    description: data.description ?? null,
    payment_proof_url: data.payment_proof_url ?? null,
    payment_method: data.payment_method ?? null,
    bank_name: data.bank_name ?? null,
    bank_account_number: data.bank_account_number ?? null,
    bank_account_name: data.bank_account_name ?? null,
    reference_number: data.reference_number ?? null,
    paid_at: data.paid_at ?? null,
    created_by: data.created_by ?? 'SYSTEM',
  }

  return prisma.paymentTransaction.create({
    data: payload,
  }) as unknown as PaymentTransaction
}

export async function getTransactions(id_request: number): Promise<PaymentTransaction[]> {
  return prisma.paymentTransaction.findMany({
    where: { id_request },
    orderBy: { date_created: 'asc' },
  }) as unknown as PaymentTransaction[]
}
