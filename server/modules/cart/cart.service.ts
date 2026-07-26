import prisma from '../../db'

const packageInclude = {
  package: {
    select: {
      id_package: true, name: true, price: true, description: true, duration: true,
      vendor: { select: { id_vendor: true, business_name: true } },
    },
  },
} as const

const productInclude = {
  product: {
    select: {
      id_product: true, name: true, price: true, stock: true, description: true,
      images: { take: 1, select: { image_url: true } },
      vendor: { select: { id_vendor: true, business_name: true } },
    },
  },
} as const

const cartInclude = {
  items: {
    include: {
      ...packageInclude,
      ...productInclude,
    },
    orderBy: { date_created: 'asc' as const },
  },
} as const

export async function getCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { id_user: userId },
    include: cartInclude,
  })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { id_user: userId },
      include: cartInclude,
    })
  }
  return cart
}

export async function addPackageItem(userId: number, packageId: number) {
  const cart = await getCart(userId)
  const existing = await prisma.cartItem.findUnique({
    where: { id_cart_id_package: { id_cart: cart.id_cart, id_package: packageId } },
  })
  if (existing) {
    return prisma.cartItem.update({
      where: { id_cart_item: existing.id_cart_item },
      data: { quantity: existing.quantity + 1 },
      include: { ...packageInclude },
    })
  }
  return prisma.cartItem.create({
    data: { id_cart: cart.id_cart, id_package: packageId, quantity: 1 },
    include: { ...packageInclude },
  })
}

export async function addProductItem(userId: number, productId: number, quantity: number) {
  const cart = await getCart(userId)
  const existing = await prisma.cartItem.findUnique({
    where: { id_cart_id_product: { id_cart: cart.id_cart, id_product: productId } },
  })
  if (existing) {
    return prisma.cartItem.update({
      where: { id_cart_item: existing.id_cart_item },
      data: { quantity: existing.quantity + quantity },
      include: { ...productInclude },
    })
  }
  return prisma.cartItem.create({
    data: { id_cart: cart.id_cart, id_product: productId, quantity },
    include: { ...productInclude },
  })
}

export async function updateItemQuantity(cartItemId: number, quantity: number) {
  return prisma.cartItem.update({
    where: { id_cart_item: cartItemId },
    data: { quantity },
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
