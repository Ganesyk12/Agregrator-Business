import prisma from '../../db'

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id_product: true, name: true, price: true, images: { take: 1, select: { image_url: true } } },
      },
    },
  },
  vendor: { select: { id_vendor: true, business_name: true } },
} as const

export async function createOrder(userId: number, vendorId: number, items: Array<{ id_product: number; id_variant?: number; quantity: number; price: number; addon_ids?: string }>, deliveryInfo?: string, notes?: string) {
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return prisma.order.create({
    data: {
      id_user: userId,
      id_vendor: vendorId,
      total_price: totalPrice,
      status: 'pending',
      delivery_info: deliveryInfo,
      notes,
      user_created: String(userId),
      items: {
        create: items.map(i => ({
          id_product: i.id_product,
          id_variant: i.id_variant,
          quantity: i.quantity,
          price: i.price,
          addon_ids: i.addon_ids,
        })),
      },
    },
    include: orderInclude,
  })
}

export async function getUserOrders(userId: number) {
  return prisma.order.findMany({
    where: { id_user: userId },
    include: orderInclude,
    orderBy: { date_created: 'desc' },
  })
}

export async function getVendorOrders(vendorId: number) {
  return prisma.order.findMany({
    where: { id_vendor: vendorId },
    include: {
      items: {
        include: {
          product: { select: { id_product: true, name: true, price: true } },
        },
      },
      user: { select: { id_user: true, full_name: true, email: true, phone: true } },
    },
    orderBy: { date_created: 'desc' },
  })
}

export async function getOrderById(orderId: number) {
  return prisma.order.findUnique({ where: { id_order: orderId }, include: orderInclude })
}

export async function updateOrderStatus(orderId: number, status: string) {
  return prisma.order.update({ where: { id_order: orderId }, data: { status }, include: orderInclude })
}
