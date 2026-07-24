import prisma from '../../db'
import type { PaymentRequest, PaymentRequestItem, PaymentTransaction } from './payment-requests.types'

const requestInclude = {
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

function generateReceiptNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9000) + 1000)
  return `KWT-${y}${m}-${rand}`
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
    Partial<Pick<PaymentRequest, 'description' | 'notes' | 'payment_method' | 'bank_account_number' | 'payment_to' | 'reference_number' | 'status' | 'user_created' | 'total_amount' | 'outstanding'>> & {
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
      reference_number: data.reference_number ?? null,
      status: data.status ?? 'draft',
      total_amount: data.total_amount ?? 0,
      outstanding: data.outstanding ?? 0,
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
  data: Partial<Pick<PaymentRequest, 'title' | 'description' | 'notes' | 'payment_method' | 'bank_account_number' | 'payment_to' | 'reference_number' | 'status' | 'reviewed_by' | 'reviewed_at' | 'approval_notes' | 'user_modified' | 'total_amount' | 'outstanding'>> & {
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
  if (data.reference_number !== undefined) payload.reference_number = data.reference_number
  if (data.status !== undefined) payload.status = data.status
  if (data.reviewed_by !== undefined) payload.reviewed_by = data.reviewed_by
  if (data.reviewed_at !== undefined) payload.reviewed_at = data.reviewed_at
  if (data.approval_notes !== undefined) payload.approval_notes = data.approval_notes
  if (data.total_amount !== undefined) payload.total_amount = data.total_amount
  if (data.outstanding !== undefined) payload.outstanding = data.outstanding
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
    Partial<Pick<PaymentTransaction, 'description' | 'payment_proof_url' | 'created_by'>>
): Promise<PaymentTransaction> {
  const payload: any = {
    id_request,
    transaction_type: data.transaction_type,
    description: data.description ?? null,
    payment_proof_url: data.payment_proof_url ?? null,
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

export async function releaseReceipt(
  id: number,
  released_by: string,
  user_modified?: string
): Promise<PaymentRequest | null> {
  const existing = await prisma.paymentRequest.findFirst({
    where: { id_request: id, status: 'approved' },
  })
  if (!existing) return null

  const receiptNumber = generateReceiptNumber()

  const request = await prisma.paymentRequest.update({
    where: { id_request: id },
    data: {
      status: 'released',
      receipt_number: receiptNumber,
      released_by: released_by,
      released_at: new Date(),
      user_modified: user_modified ?? 'SYSTEM',
    },
    include: requestInclude,
  }) as unknown as PaymentRequest

  await prisma.paymentTransaction.create({
    data: {
      id_request: id,
      transaction_type: 'released',
      description: `Receipt ${receiptNumber} released`,
      created_by: user_modified ?? 'SYSTEM',
    },
  })

  return request
}

export async function getReceiptData(id: number): Promise<PaymentRequest | null> {
  return prisma.paymentRequest.findFirst({
    where: { id_request: id, status: 'released', receipt_number: { not: null } },
    include: {
      ...requestInclude,
      items: { orderBy: { sort_order: 'asc' } },
    },
  }) as unknown as PaymentRequest | null
}
