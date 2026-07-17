import prisma from '../../db'

const include = {
  items: {
    include: {
      package: {
        select: {
          id_package: true, name: true, price: true, description: true, duration: true,
          vendor: { select: { id_vendor: true, business_name: true } },
        },
      },
    },
    orderBy: { date_created: 'asc' as const },
  },
} as const

export async function getCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { id_user: userId },
    include,
  })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { id_user: userId },
      include,
    })
  }
  return cart
}

export async function addItem(userId: number, packageId: number) {
  const cart = await getCart(userId)
  const existing = await prisma.cartItem.findUnique({
    where: { id_cart_id_package: { id_cart: cart.id_cart, id_package: packageId } },
  })
  if (existing) return existing
  return prisma.cartItem.create({
    data: { id_cart: cart.id_cart, id_package: packageId },
    include: {
      package: {
        select: { id_package: true, name: true, price: true, description: true, duration: true,
          vendor: { select: { id_vendor: true, business_name: true } } },
      },
    },
  })
}

export async function removeItem(cartItemId: number) {
  await prisma.cartItem.delete({ where: { id_cart_item: cartItemId } })
}

export async function clearCart(userId: number) {
  const cart = await prisma.cart.findUnique({ where: { id_user: userId } })
  if (!cart) return
  await prisma.cartItem.deleteMany({ where: { id_cart: cart.id_cart } })
}
