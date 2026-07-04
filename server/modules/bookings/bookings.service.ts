import prisma from '../../db'
import type { Booking } from './bookings.types'

export async function findAll(): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: {
      status: { not: 'deleted' },
    },
    include: {
      customer: { select: { id_user: true, email: true, full_name: true } },
      vendor: { select: { id_vendor: true, business_name: true } },
      package: { select: { id_package: true, name: true, price: true } },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

export async function findById(id: number): Promise<Booking | null> {
  return prisma.booking.findFirst({
    where: {
      id_booking: id,
      status: { not: 'deleted' },
    },
    include: {
      customer: { select: { id_user: true, email: true, full_name: true } },
      vendor: { select: { id_vendor: true, business_name: true } },
      package: { select: { id_package: true, name: true, price: true } },
    },
  }) as unknown as Booking | null
}

export async function create(
  data: Pick<Booking, 'id_user' | 'id_vendor' | 'id_package' | 'event_date' | 'event_location' | 'total_price' | 'dp_amount' | 'notes'> &
    Partial<Pick<Booking, 'user_created' | 'user_modified'>>
): Promise<Booking> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.booking.create({
    data: payload,
    include: {
      customer: { select: { id_user: true, email: true, full_name: true } },
      vendor: { select: { id_vendor: true, business_name: true } },
      package: { select: { id_package: true, name: true, price: true } },
    },
  }) as unknown as Booking
}

export async function update(
  id: number,
  data: Partial<Pick<Booking, 'event_date' | 'event_location' | 'total_price' | 'dp_amount' | 'status' | 'notes' | 'user_modified'>>
): Promise<Booking | null> {
  const existing = await prisma.booking.findFirst({
    where: {
      id_booking: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.booking.update({
    where: { id_booking: id },
    data: payload,
    include: {
      customer: { select: { id_user: true, email: true, full_name: true } },
      vendor: { select: { id_vendor: true, business_name: true } },
      package: { select: { id_package: true, name: true, price: true } },
    },
  }) as unknown as Booking
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: {
      id_booking: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false
  await prisma.booking.update({
    where: { id_booking: id },
    data: {
      status: 'deleted',
    },
  })
  return true
}
