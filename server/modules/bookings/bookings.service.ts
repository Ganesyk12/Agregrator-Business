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
  orders: {
    include: {
      items: {
        include: {
          product: {
            select: {
              id_product: true,
              name: true,
              price: true,
              images: { take: 1, select: { image_url: true } },
            },
          },
        },
      },
      vendor: { select: { id_vendor: true, business_name: true } },
    },
  },
  payments: {
    orderBy: { date_created: 'desc' as const },
  },
  payment_terms: {
    orderBy: { term_order: 'asc' as const },
    include: {
      payments: {
        select: { id_booking_payment: true, amount: true, payment_type: true, status: true, paid_at: true },
        orderBy: { date_created: 'asc' as const },
      },
    },
  },
} as const

async function autoCancelExpiredBookings() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  try {
    await prisma.booking.updateMany({
      where: {
        status: 'pending',
        date_created: { lt: oneHourAgo },
        payments: {
          none: {}
        }
      },
      data: {
        status: 'cancelled'
      }
    })
  } catch (err) {
    console.error('Failed to auto cancel expired bookings:', err)
  }
}

export async function findAll(): Promise<Booking[]> {
  await autoCancelExpiredBookings()
  return prisma.booking.findMany({
    where: { status: { not: 'deleted' } },
    include,
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

export async function findById(id: number): Promise<Booking | null> {
  await autoCancelExpiredBookings()
  return prisma.booking.findFirst({
    where: { id_booking: id, status: { not: 'deleted' } },
    include,
  }) as unknown as Booking | null
}

export async function findByUser(userId: number): Promise<Booking[]> {
  await autoCancelExpiredBookings()
  return prisma.booking.findMany({
    where: { id_user: userId, status: { not: 'deleted' } },
    include,
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

export async function findByVendor(vendorId: number): Promise<Booking[]> {
  await autoCancelExpiredBookings()
  return prisma.booking.findMany({
    where: {
      status: { not: 'deleted' },
      booking_packages: {
        some: {
          package: { id_vendor: vendorId },
        },
      },
    },
    include,
    orderBy: { date_created: 'desc' },
  }) as unknown as Booking[]
}

function generateOrderNumber(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  return `ORD-${y}${m}-${stamp}`
}

function generateBookingNumber(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  return `BK-${y}${m}-${stamp}`
}

export async function create(
  data: BookingCreateInput & { user_created?: string; user_modified?: string }
): Promise<Booking> {
  const { package_ids, products, ...rest } = data

  // 1. Fetch product details to resolve their vendors
  const productIds = (products || []).map(p => p.id_product)
  const dbProducts = productIds.length > 0 
    ? await prisma.product.findMany({ where: { id_product: { in: productIds } } })
    : []

  // 2. Group products by vendor
  const productsByVendor: Record<number, any[]> = {}
  for (const p of (products || [])) {
    const dbP = dbProducts.find(x => x.id_product === p.id_product)
    if (!dbP) continue
    const vendorId = dbP.id_vendor
    if (!productsByVendor[vendorId]) productsByVendor[vendorId] = []
    productsByVendor[vendorId].push({
      id_product: p.id_product,
      quantity: p.quantity,
      price: p.price,
      size_name: p.size_name || null,
      options: p.options || null,
      extras: p.extras || null,
      subtotal: p.price * p.quantity
    })
  }

  // 3. Create booking with nested packages and orders
  const booking = await prisma.booking.create({
    data: {
      ...rest,
      booking_number: generateBookingNumber(),
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
      booking_packages: {
        create: package_ids.map((id_package) => ({
          id_package,
          user_created: data.user_created ?? 'SYSTEM',
        })),
      },
      orders: {
        create: Object.entries(productsByVendor).map(([vendorIdStr, items]) => {
          const vendorId = Number(vendorIdStr)
          const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
          
          return {
            id_user: data.id_user,
            id_vendor: vendorId,
            total_price: itemsTotal,
            status: 'pending',
            order_number: generateOrderNumber(),
            user_created: data.user_created ?? 'SYSTEM',
            items: {
              create: items.map(item => ({
                id_product: item.id_product,
                quantity: item.quantity,
                price: item.price,
                size_name: item.size_name,
                options: item.options ? JSON.parse(JSON.stringify(item.options)) : undefined,
                extras: item.extras ? JSON.parse(JSON.stringify(item.extras)) : undefined,
                unit_price: item.price,
                subtotal: item.subtotal
              }))
            }
          }
        })
      }
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
