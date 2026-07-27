import prisma from '../../db'
import type { PaymentTerm } from './payment-terms.types'

const termInclude = {
  payments: {
    select: { id_booking_payment: true, amount: true, payment_type: true, status: true, paid_at: true },
    orderBy: { date_created: 'asc' as const },
  },
} as const

export async function getTermsByBooking(id_booking: number): Promise<PaymentTerm[]> {
  return prisma.paymentTerm.findMany({
    where: { id_booking },
    include: termInclude,
    orderBy: { term_order: 'asc' },
  }) as unknown as PaymentTerm[]
}

export async function getTermById(id_term: number): Promise<PaymentTerm | null> {
  return prisma.paymentTerm.findFirst({
    where: { id_term },
    include: termInclude,
  }) as unknown as PaymentTerm | null
}

export async function upsertTerms(
  id_booking: number,
  terms: Array<{
    term_order: number
    term_name: string
    amount: number
    due_date?: string | null
    notes?: string | null
  }>,
  user_created?: string
): Promise<PaymentTerm[]> {
  await prisma.paymentTerm.deleteMany({ where: { id_booking } })

  for (const term of terms) {
    await prisma.paymentTerm.create({
      data: {
        id_booking,
        term_order: term.term_order,
        term_name: term.term_name,
        amount: term.amount,
        due_date: term.due_date ? new Date(term.due_date) : null,
        status: 'unpaid',
        paid_amount: 0,
        notes: term.notes ?? null,
        user_created: user_created ?? 'SYSTEM',
        user_modified: user_created ?? 'SYSTEM',
      },
    })
  }

  return getTermsByBooking(id_booking)
}

export async function autoGenerateTerms(
  id_booking: number,
  total_price: number,
  dp_amount: number,
  user_created?: string
): Promise<PaymentTerm[]> {
  const existing = await prisma.paymentTerm.count({ where: { id_booking } })
  if (existing > 0) return getTermsByBooking(id_booking)

  const terms: Array<{
    term_order: number
    term_name: string
    amount: number
    due_date: string | null
    notes: string | null
  }> = []

  if (dp_amount > 0) {
    terms.push({
      term_order: 1,
      term_name: 'DP (Down Payment)',
      amount: dp_amount,
      due_date: null,
      notes: 'Pembayaran awal / down payment',
    })
  }

  const remaining = total_price - dp_amount
  if (remaining > 0) {
    terms.push({
      term_order: dp_amount > 0 ? 2 : 1,
      term_name: dp_amount > 0 ? 'Pelunasan' : 'Pembayaran Penuh',
      amount: remaining,
      due_date: null,
      notes: dp_amount > 0 ? 'Sisa pembayaran / pelunasan' : 'Pembayaran penuh',
    })
  }

  if (terms.length === 0) return []

  return upsertTerms(id_booking, terms, user_created)
}

export async function updateTermStatus(id_term: number): Promise<PaymentTerm | null> {
  const term = await prisma.paymentTerm.findFirst({
    where: { id_term },
    include: termInclude,
  })
  if (!term) return null

  const totalPaid = term.payments
    .filter(p => p.status === 'paid' || p.status === 'released')
    .reduce((sum, p) => sum + p.amount, 0)

  let newStatus = 'unpaid'
  if (totalPaid >= term.amount) {
    newStatus = 'paid'
  } else if (totalPaid > 0) {
    newStatus = 'partial'
  }

  const now = totalPaid >= term.amount ? new Date() : null

  await prisma.paymentTerm.update({
    where: { id_term },
    data: {
      status: newStatus,
      paid_amount: totalPaid,
      date_modified: new Date(),
    },
  })

  return getTermById(id_term)
}

export async function removeTerm(id_term: number): Promise<boolean> {
  const existing = await prisma.paymentTerm.findFirst({ where: { id_term } })
  if (!existing) return false
  await prisma.paymentTerm.delete({ where: { id_term } })
  return true
}
