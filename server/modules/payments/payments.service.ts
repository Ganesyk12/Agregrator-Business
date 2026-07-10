import prisma from '../../db'
import type { Payment } from './payments.types'

const bookingInclude = {
  customer: { select: { id_user: true, email: true, full_name: true } },
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

export async function findAll(): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { status: { not: 'deleted' } },
    include: { booking: { include: bookingInclude } },
    orderBy: { date_created: 'desc' },
  }) as unknown as Payment[]
}

export async function findById(id: number): Promise<Payment | null> {
  return prisma.payment.findFirst({
    where: { id_payment: id, status: { not: 'deleted' } },
    include: { booking: { include: bookingInclude } },
  }) as unknown as Payment | null
}

export async function create(
  data: Pick<Payment, 'id_booking' | 'amount' | 'payment_type'> &
    Partial<Pick<Payment, 'payment_proof_url' | 'paid_at' | 'released_at' | 'status' | 'user_created' | 'user_modified'>>
): Promise<Payment> {
  const payload = {
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
  return prisma.payment.create({
    data: payload,
    include: { booking: { include: bookingInclude } },
  }) as unknown as Payment
}

export async function update(
  id: number,
  data: Partial<Pick<Payment, 'amount' | 'payment_type' | 'status' | 'payment_proof_url' | 'paid_at' | 'released_at' | 'user_modified'>>
): Promise<Payment | null> {
  const existing = await prisma.payment.findFirst({
    where: { id_payment: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.payment.update({
    where: { id_payment: id },
    data: payload,
    include: { booking: { include: bookingInclude } },
  }) as unknown as Payment
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.payment.findFirst({
    where: { id_payment: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.payment.update({
    where: { id_payment: id },
    data: { status: 'deleted' },
  })
  return true
}
