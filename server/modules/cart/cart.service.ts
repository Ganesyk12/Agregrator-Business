import prisma from '../../db'
import { Prisma } from '@prisma/client'

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

export async function addProductItem(userId: number, productId: number, quantity: number, cfg?: any) {
  const cart = await getCart(userId)
  const product = (await prisma.product.findUnique({
    where: { id_product: productId },
    include: {
      images: { take: 1, orderBy: { sort_order: 'asc' } },
      vendor: { select: { business_name: true } },
      variants: true,
      addons: true,
      option_groups: { include: { values: true } },
      size_configs: true,
      optional_extras: true,
    },
  })) as any

  if (!product) {
    const snapshot = cfg || {}
    return createProductItem(cart.id_cart, productId, quantity, snapshot, productInclude)
  }

  const snapshot = computeSnapshot(product, cfg, quantity)

  const existing = await prisma.cartItem.findUnique({
    where: { id_cart_id_product: { id_cart: cart.id_cart, id_product: productId } },
  })
  if (existing) {
    return prisma.cartItem.update({
      where: { id_cart_item: existing.id_cart_item },
      data: { quantity: existing.quantity + quantity, ...snapshot },
      include: { ...productInclude },
    })
  }
  return createProductItem(cart.id_cart, productId, quantity, snapshot, productInclude)
}

function createProductItem(idCart: number, productId: number, quantity: number, snapshot: any, include: any) {
  const qty = Number(quantity) > 0 ? Number(quantity) : Number(snapshot.quantity) || 1
  const data = {
    id_cart: idCart,
    id_product: productId,
    quantity: qty,
    id_variant: snapshot.id_variant ?? null,
    variant_name: snapshot.variant_name || null,
    size_name: snapshot.size_name || null,
    options: snapshot.options ?? Prisma.JsonNull,
    greeting_card: snapshot.greeting_card || null,
    greeting_message: snapshot.greeting_message || null,
    extras: snapshot.extras ?? Prisma.JsonNull,
    unit_price: Number(snapshot.unit_price ?? snapshot.unitPrice ?? 0),
    extras_price: Number(snapshot.extras_price ?? 0),
    subtotal: Number(snapshot.subtotal ?? 0),
    thumbnail: snapshot.thumbnail || null,
    vendor_name: snapshot.vendor_name || null,
  }
  return prisma.cartItem.create({ data, include: { ...include } })
}

function computeSnapshot(product: any, cfg: any, quantity: number) {
  const qty = Number(quantity) > 0 ? Number(quantity) : Number(cfg?.quantity) > 0 ? Number(cfg.quantity) : 1
  const isNew = product?.option_groups?.length > 0

  const base = Number(product?.price || 0)

  let variantId: number | null = null
  let variantName = ''
  let variantAdjust = 0
  if (!isNew && cfg?.variantId != null) {
    const v = product.variants?.find((r: any) => r.id_variant === Number(cfg.variantId))
    if (v) { variantId = v.id_variant; variantName = v.name; variantAdjust = Number(v.price_adjust || 0) }
  }

  let optionsAdjust = 0
  const resolvedOptions: any[] = []
  const options = Array.isArray(cfg?.options) ? cfg.options : []
  for (const o of options) {
    const group = product.option_groups?.find((g: any) => g.name === o.groupName)
    const val = group?.values?.find((v: any) => v.name === o.valueName)
    const priceAdjust = Number(val?.price_adjust || 0)
    optionsAdjust += priceAdjust
    resolvedOptions.push({ groupName: o.groupName, valueName: o.valueName, priceAdjust })
  }

  let sizeName: string | null = null
  let sizePrice = 0
  if (cfg?.sizeName) {
    const s = product.size_configs?.find((sz: any) => sz.name === cfg.sizeName)
    if (s) { sizeName = s.name; sizePrice = Number(s.price || 0) }
  }

  let extrasPrice = 0
  const extras: any[] = []
  const extrasRaw = Array.isArray(cfg?.extras) ? cfg.extras : []
  if (isNew) {
    for (const e of extrasRaw) {
      const en = product.optional_extras?.find((x: any) => x.name === e.name)
      if (en) { extras.push({ id: en.id_optional_extra, name: en.name, price: Number(en.price || 0) }); extrasPrice += Number(en.price || 0) }
    }
  } else {
    for (const e of extrasRaw) {
      const a = product.addons?.find((x: any) => x.id_addon === Number(e.id))
      if (a) { extras.push({ id: a.id_addon, name: a.name, price: Number(a.price || 0) }); extrasPrice += Number(a.price || 0) }
    }
  }

  const unitPrice = base + variantAdjust + optionsAdjust + sizePrice + extrasPrice

  return {
    id_variant: variantId,
    variant_name: variantName || null,
    size_name: sizeName,
    options: resolvedOptions.length ? resolvedOptions : Prisma.JsonNull,
    greeting_card: cfg?.greetingCard || null,
    greeting_message: cfg?.greetingMessage || null,
    extras: extras.length ? extras : Prisma.JsonNull,
    unit_price: unitPrice,
    extras_price: extrasPrice,
    subtotal: unitPrice * qty,
    thumbnail: cfg?.thumbnail || product?.images?.[0]?.image_url || null,
    vendor_name: cfg?.vendorName || product?.vendor?.business_name || null,
  }
}

export async function updateItemQuantity(userId: number, cartItemId: number, quantity: number) {
  const item = await prisma.cartItem.findUnique({ where: { id_cart_item: cartItemId } })
  const hasProduct = !!item?.id_product
  const unitPrice = item?.unit_price ?? (hasProduct ? (await prisma.product.findUnique({ where: { id_product: item!.id_product! } }))?.price ?? 0 : 0)
  const qty = Math.max(1, Number(quantity) || 1)
  return prisma.cartItem.update({
    where: { id_cart_item: cartItemId },
    data: {
      quantity: qty,
      subtotal: item?.unit_price != null ? Number(item.unit_price) * qty : Number(unitPrice) * qty,
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
