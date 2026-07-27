import prisma from '../../db'
import type { PaymentRequestTerm, RfpPayment } from './payment-request-payments.types'

export async function getTermsByRequest(id_request: number): Promise<PaymentRequestTerm[]> {
  return prisma.paymentRequestTerm.findMany({
    where: { id_request },
    orderBy: { term_order: 'asc' },
  }) as unknown as PaymentRequestTerm[]
}

export async function getTermById(id_rfp_term: number): Promise<PaymentRequestTerm | null> {
  return prisma.paymentRequestTerm.findFirst({
    where: { id_rfp_term },
  }) as unknown as PaymentRequestTerm | null
}

export async function autoGenerateTerms(
  id_request: number,
  total_amount: number,
  user?: string
): Promise<PaymentRequestTerm[]> {
  const existing = await prisma.paymentRequestTerm.findMany({ where: { id_request } })
  if (existing.length > 0) return existing as unknown as PaymentRequestTerm[]

  const term = await prisma.paymentRequestTerm.create({
    data: {
      id_request,
      term_order: 1,
      term_name: 'Full Payment',
      amount: total_amount,
      status: 'unpaid',
    },
  })

  return [term] as unknown as PaymentRequestTerm[]
}

export async function updateTermStatus(id_rfp_term: number): Promise<PaymentRequestTerm | null> {
  const term = await prisma.paymentRequestTerm.findFirst({
    where: { id_rfp_term },
    include: {
      payments: { where: { status: { in: ['paid', 'released'] } } },
    },
  })
  if (!term) return null

  const totalPaid = (term.payments as any[]).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  const newStatus = totalPaid >= term.amount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid'

  const updated = await prisma.paymentRequestTerm.update({
    where: { id_rfp_term },
    data: {
      paid_amount: totalPaid,
      status: newStatus,
    },
  })

  return updated as unknown as PaymentRequestTerm
}

export async function getPaymentsByRequest(id_request: number): Promise<RfpPayment[]> {
  return prisma.rfpPayment.findMany({
    where: { id_request },
    orderBy: { date_created: 'desc' },
  }) as unknown as RfpPayment[]
}

export async function createPayment(
  data: {
    id_request: number
    id_rfp_term: number
    amount: number
    source_bank?: string
    source_account_number?: string
    source_account_name?: string
    payment_date?: Date
    proof_url?: string
    notes?: string
    created_by?: string
  }
): Promise<RfpPayment> {
  const payment = await prisma.rfpPayment.create({
    data: {
      id_request: data.id_request,
      id_rfp_term: data.id_rfp_term,
      amount: data.amount,
      source_bank: data.source_bank ?? null,
      source_account_number: data.source_account_number ?? null,
      source_account_name: data.source_account_name ?? null,
      payment_date: data.payment_date ?? new Date(),
      proof_url: data.proof_url ?? null,
      notes: data.notes ?? null,
      status: 'paid',
      created_by: data.created_by ?? 'SYSTEM',
    },
  })

  await updateTermStatus(data.id_rfp_term)

  const term = await prisma.paymentRequestTerm.findFirst({ where: { id_rfp_term: data.id_rfp_term } })
  if (term) {
    const allTerms = await prisma.paymentRequestTerm.findMany({ where: { id_request: data.id_request } })
    const allPaid = allTerms.every((t: any) => t.status === 'paid')
    if (allPaid) {
      await prisma.paymentRequest.update({
        where: { id_request: data.id_request },
        data: {
          outstanding: 0,
          paid_at: new Date(),
        },
      })
    } else {
      const totalPaid = allTerms.reduce((sum: number, t: any) => sum + t.paid_amount, 0)
      const request = await prisma.paymentRequest.findFirst({ where: { id_request: data.id_request } })
      if (request) {
        await prisma.paymentRequest.update({
          where: { id_request: data.id_request },
          data: {
            outstanding: request.total_amount - totalPaid,
          },
        })
      }
    }
  }

  return payment as unknown as RfpPayment
}

export async function getPaymentById(id_rfp_payment: number): Promise<RfpPayment | null> {
  return prisma.rfpPayment.findFirst({
    where: { id_rfp_payment },
  }) as unknown as RfpPayment | null
}
