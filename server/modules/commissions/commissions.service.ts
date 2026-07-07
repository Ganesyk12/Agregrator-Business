import prisma from '../../db'
import type { Commission } from './commissions.types'

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

export async function findAll(): Promise<Commission[]> {
  return prisma.commission.findMany({
    where: { status: { not: 'deleted' } },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as Commission[]
}

export async function findById(id: number): Promise<Commission | null> {
  return prisma.commission.findFirst({
    where: { id_commission: id, status: { not: 'deleted' } },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Commission | null
}

export async function create(
  data: Pick<Commission, 'id_booking' | 'id_vendor' | 'percentage' | 'amount'> &
    Partial<Pick<Commission, 'status' | 'user_created' | 'user_modified'>>
): Promise<Commission> {
  return prisma.commission.create({
    data: {
      id_booking: data.id_booking,
      id_vendor: data.id_vendor,
      percentage: data.percentage,
      amount: data.amount,
      status: data.status ?? 'pending',
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
    },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Commission
}

export async function update(
  id: number,
  data: Partial<Pick<Commission, 'percentage' | 'amount' | 'status' | 'user_modified'>>
): Promise<Commission | null> {
  const existing = await prisma.commission.findFirst({
    where: { id_commission: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  return prisma.commission.update({
    where: { id_commission: id },
    data: { ...data, user_modified: data.user_modified ?? 'SYSTEM' },
    include: {
      vendor: { select: { id_vendor: true, business_name: true } },
      booking: { include: bookingInclude },
    },
  }) as unknown as Commission
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.commission.findFirst({
    where: { id_commission: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.commission.update({
    where: { id_commission: id },
    data: { status: 'deleted' },
  })
  return true
}
