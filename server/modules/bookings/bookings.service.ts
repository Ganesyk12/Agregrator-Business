import prisma from '../../db'
import type { Booking, BookingCreateInput } from './bookings.types'
import { autoGenerateTerms } from '../payment-terms/payment-terms.service'

const include = {
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
  payments: {
    orderBy: { date_created: 'desc' as const },
  },
  payment_terms: {
    orderBy: { term_order: 'asc' as const },
    include: {
      payments: {
        select: { id_payment: true, amount: true, payment_type: true, status: true, paid_at: true },
        orderBy: { date_created: 'asc' as const },
      },
    },
  },
} as const

export async function findAll(): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { status: { not: 'deleted' } },
    include,
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

export async function findById(id: number): Promise<Booking | null> {
  return prisma.booking.findFirst({
    where: { id_booking: id, status: { not: 'deleted' } },
    include,
  }) as unknown as Booking | null
}

export async function findByUser(userId: number): Promise<Booking[]> {
  return prisma.booking.findMany({
    where: { id_user: userId, status: { not: 'deleted' } },
    include,
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

export async function create(
  data: BookingCreateInput & { user_created?: string; user_modified?: string }
): Promise<Booking> {
  const { package_ids, ...rest } = data
  const booking = await prisma.booking.create({
    data: {
      ...rest,
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
      booking_packages: {
        create: package_ids.map((id_package) => ({
          id_package,
          user_created: data.user_created ?? 'SYSTEM',
        })),
      },
    },
    include,
  }) as unknown as Booking

  if (booking.total_price > 0) {
    await autoGenerateTerms(
      booking.id_booking,
      booking.total_price,
      booking.dp_amount || 0,
      data.user_created || 'SYSTEM'
    )
  }

  return booking
}

export async function update(
  id: number,
  data: Partial<Pick<Booking, 'event_date' | 'event_location' | 'total_price' | 'dp_amount' | 'status' | 'notes' | 'user_modified'>> & {
    package_ids?: number[]
  }
): Promise<Booking | null> {
  const existing = await prisma.booking.findFirst({
    where: { id_booking: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const { package_ids, ...fields } = data
  const updateData: any = {
    ...fields,
    user_modified: data.user_modified ?? 'SYSTEM',
  }

  if (package_ids) {
    updateData.booking_packages = {
      deleteMany: {},
      create: package_ids.map((id_package) => ({
        id_package,
        user_created: 'SYSTEM',
      })),
    }
  }

  return prisma.booking.update({
    where: { id_booking: id },
    data: updateData,
    include,
  }) as unknown as Booking
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.booking.findFirst({
    where: { id_booking: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.booking.update({
    where: { id_booking: id },
    data: { status: 'deleted' },
  })
  return true
}
