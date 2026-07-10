import prisma from '../../db'
import type { Payout } from './payouts.types'

const bookingInclude = {
  customer: { select: { id_user: true, email: true, full_name: true } },
  booking_packages: {
    include: {
      package: {
        select: {
          id_package: true, name: true, price: true,
          vendor: { select: { id_vendor: true, business_name: true } },
        },
      },
    },
  },
} as const

export async function findAll(): Promise<Payout[]> {
  return prisma.payout.findMany({
    where: { status: { not: 'deleted' } },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as Payout[]
}

export async function findById(id: number): Promise<Payout | null> {
  return prisma.payout.findFirst({
    where: { id_payout: id, status: { not: 'deleted' } },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Payout | null
}

export async function create(
  data: Pick<Payout, 'id_vendor' | 'id_booking' | 'amount'> &
    Partial<Pick<Payout, 'status' | 'paid_at' | 'user_created' | 'user_modified'>>
): Promise<Payout> {
  return prisma.payout.create({
    data: {
      id_vendor: data.id_vendor,
      id_booking: data.id_booking,
      amount: data.amount,
      status: data.status ?? 'pending',
      paid_at: data.paid_at ?? null,
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
    },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Payout
}

export async function update(
  id: number,
  data: Partial<Pick<Payout, 'amount' | 'status' | 'paid_at' | 'user_modified'>>
): Promise<Payout | null> {
  const existing = await prisma.payout.findFirst({
    where: { id_payout: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  return prisma.payout.update({
    where: { id_payout: id },
    data: { ...data, user_modified: data.user_modified ?? 'SYSTEM' },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Payout
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.payout.findFirst({
    where: { id_payout: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.payout.update({
    where: { id_payout: id },
    data: { status: 'deleted' },
  })
  return true
}
