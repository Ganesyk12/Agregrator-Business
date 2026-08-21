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
    Partial<Pick<BookingPayment, 'order_id' | 'qr_string' | 'qr_action_url' | 'id_term' | 'payment_proof_url' | 'paid_at' | 'released_at' | 'status' | 'user_created' | 'user_modified'>>
): Promise<BookingPayment> {
  const payload: any = {
    id_booking: data.id_booking,
    order_id: data.order_id ?? null,
    qr_string: data.qr_string ?? null,
    qr_action_url: data.qr_action_url ?? null,
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

export async function findBookingForPayment(bookingId: number) {
  return prisma.booking.findUnique({
    where: { id_booking: bookingId },
    include: {
      customer: { select: { id_user: true, email: true, full_name: true, phone: true } },
      payment_terms: { select: { id_term: true, term_name: true, amount: true, status: true } },
    },
  })
}

export async function findByOrderId(orderId: string): Promise<BookingPayment | null> {
  const payment = await prisma.bookingPayment.findFirst({
    where: { order_id: orderId },
    orderBy: { date_created: 'desc' },
  })
  return (payment ?? null) as unknown as BookingPayment | null
}

export async function updateByOrderId(
  orderId: string,
  data: { status?: string; paid_at?: Date }
): Promise<void> {
  console.log('[updateByOrderId] Looking for order_id:', orderId)
  const payment = await prisma.bookingPayment.findFirst({
    where: { order_id: orderId },
  })
  if (!payment) {
    console.log('[updateByOrderId] No payment found for order_id:', orderId)
    return
  }

  console.log('[updateByOrderId] Found payment:', payment.id_booking_payment, '→ updating to', data.status)
  const updateData: any = { ...data }
  if (data.paid_at) updateData.paid_at = data.paid_at

  await prisma.bookingPayment.update({
    where: { id_booking_payment: payment.id_booking_payment },
    data: updateData,
  })

  if (data.status === 'paid' && payment.id_term) {
    await updateTermStatus(payment.id_term)
  }

  if (data.status === 'paid') {
    const allPayments = await prisma.bookingPayment.findMany({
      where: { id_booking: payment.id_booking },
    })

    const allPaid = allPayments.every((p: { id_booking_payment: number; status: string }) =>
      p.id_booking_payment === payment.id_booking_payment
        ? true
        : p.status === 'paid'
    )

    if (allPaid) {
      await prisma.booking.update({
        where: { id_booking: payment.id_booking },
        data: { status: 'confirmed' },
      })
    }
  }
}
