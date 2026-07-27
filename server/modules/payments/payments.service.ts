import prisma from '../../db'
import type { BookingPayment } from './payments.types'
import { updateTermStatus } from '../payment-terms/payment-terms.service'

const bookingInclude = {
  customer: { select: { id_user: true, email: true, full_name: true, phone: true } },
  booking_packages: {
    include: {
      package: {
        select: {
          id_package: true, name: true, price: true,
          description: true, duration: true,
          vendor: { select: { id_vendor: true, business_name: true } },
        },
      },
    },
  },
} as const

const paymentInclude = {
  booking: { include: bookingInclude },
  payment_term: { select: { id_term: true, term_name: true, term_order: true, amount: true, status: true } },
} as const

export async function findAll(): Promise<BookingPayment[]> {
  return prisma.bookingPayment.findMany({
    where: { status: { not: 'deleted' } },
    include: paymentInclude,
    orderBy: { date_created: 'desc' },
  }) as unknown as BookingPayment[]
}

export async function findById(id: number): Promise<BookingPayment | null> {
  return prisma.bookingPayment.findFirst({
    where: { id_booking_payment: id, status: { not: 'deleted' } },
    include: paymentInclude,
  }) as unknown as BookingPayment | null
}

export async function create(
  data: Pick<BookingPayment, 'id_booking' | 'amount' | 'payment_type'> &
    Partial<Pick<BookingPayment, 'id_term' | 'payment_proof_url' | 'paid_at' | 'released_at' | 'status' | 'user_created' | 'user_modified'>>
): Promise<BookingPayment> {
  const payload: any = {
    id_booking: data.id_booking,
    amount: data.amount,
    payment_type: data.payment_type,
    status: data.status ?? 'pending',
    payment_proof_url: data.payment_proof_url ?? null,
    paid_at: data.paid_at ?? null,
    released_at: data.released_at ?? null,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  if (data.id_term !== undefined) payload.id_term = data.id_term

  const payment = await prisma.bookingPayment.create({
    data: payload,
    include: paymentInclude,
  }) as unknown as BookingPayment

  if (data.id_term) {
    await updateTermStatus(data.id_term)
  }

  return payment
}

export async function update(
  id: number,
  data: Partial<Pick<BookingPayment, 'id_term' | 'amount' | 'payment_type' | 'status' | 'payment_proof_url' | 'paid_at' | 'released_at' | 'user_modified'>>
): Promise<BookingPayment | null> {
  const existing = await prisma.bookingPayment.findFirst({
    where: { id_booking_payment: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  const payment = await prisma.bookingPayment.update({
    where: { id_booking_payment: id },
    data: payload,
    include: paymentInclude,
  }) as unknown as BookingPayment

  const termId = data.id_term ?? existing.id_term
  if (termId) {
    await updateTermStatus(termId)
  }

  return payment
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.bookingPayment.findFirst({
    where: { id_booking_payment: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.bookingPayment.update({
    where: { id_booking_payment: id },
    data: { status: 'deleted' },
  })
  return true
}
