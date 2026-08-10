import prisma from '../../db'
import { Prisma } from '@prisma/client'
import { createError } from '../../middleware/error-handler'

const orderInclude = {
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
  user: { select: { id_user: true, full_name: true, email: true, phone: true } },
} as const

function generateOrderNumber(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  return `ORD-${y}${m}-${stamp}`
}

interface ItemInput {
  id_product: number
  id_variant?: number | null
  quantity: number
  price: number
  addon_ids?: string
  size_name?: string | null
  variant_name?: string | null
  options?: any
  greeting_card?: string | null
  greeting_message?: string | null
  extras?: any
  unit_price?: number | null
  extras_price?: number | null
  subtotal?: number | null
}

interface OrderData {
  recipient_name?: string
  recipient_phone?: string
  delivery_address?: string
  delivery_city?: string
  delivery_province?: string
  delivery_postal_code?: string
  delivery_notes?: string
  delivery_date?: string | null
  delivery_time?: string | null
  delivery_fee?: number
  service_fee?: number
  payment_status?: string
  fulfillment_status?: string
}

async function resolveItem(productId: number, cfg: any, qty: number) {
  const product = (await prisma.product.findUnique({
    where: { id_product: productId },
    include: {
      variants: true,
      addons: true,
      option_groups: { include: { values: true } },
      size_configs: true,
      optional_extras: true,
    },
  })) as any

  if (!product) throw createError(400, `Product ${productId} not found`)
  if (product.status !== 'active') throw createError(400, `Product "${product.name}" is not available`)

  const isNew = product.option_groups?.length > 0
  const base = Number(product.price || 0)

  let variantId: number | null = null
  let variantName = ''
  let variantAdjust = 0
  if (!isNew && cfg?.id_variant != null) {
    const v = product.variants?.find((r: any) => r.id_variant === Number(cfg.id_variant))
    if (!v) throw createError(400, `Variant not found for "${product.name}"`)
    variantId = v.id_variant
    variantName = v.name
    variantAdjust = Number(v.price_adjust || 0)
  }

  let optionsAdjust = 0
  const resolvedOptions: any[] = []
  const options = Array.isArray(cfg?.options) ? cfg.options : []
  for (const o of options) {
    const group = product.option_groups?.find((g: any) => g.name === o.groupName)
    const val = group?.values?.find((v: any) => v.name === o.valueName)
    if (!val) throw createError(400, `Invalid option "${o.groupName}: ${o.valueName}" for "${product.name}"`)
    if (val.status !== 'active') throw createError(400, `Option "${val.name}" is not available`)
    optionsAdjust += Number(val.price_adjust || 0)
    resolvedOptions.push({ groupName: o.groupName, valueName: o.valueName, priceAdjust: Number(val.price_adjust || 0) })
  }

  let sizeName: string | null = null
  let sizePrice = 0
  if (cfg?.size_name) {
    const s = product.size_configs?.find((sz: any) => sz.name === cfg.size_name)
    if (!s) throw createError(400, `Invalid size "${cfg.size_name}" for "${product.name}"`)
    sizeName = s.name
    sizePrice = Number(s.price || 0)
  }

  let extrasPrice = 0
  const extras: any[] = []
  const extrasRaw = Array.isArray(cfg?.extras) ? cfg.extras : []
  if (isNew) {
    for (const e of extrasRaw) {
      const en = product.optional_extras?.find((x: any) => x.name === e.name)
      if (!en) throw createError(400, `Invalid extra "${e.name}" for "${product.name}"`)
      extras.push({ id: en.id_optional_extra, name: en.name, price: Number(en.price || 0) })
      extrasPrice += Number(en.price || 0)
    }
  } else {
    for (const e of extrasRaw) {
      const a = product.addons?.find((x: any) => x.id_addon === Number(e.id))
      if (!a) throw createError(400, `Invalid add-on "${e.name}" for "${product.name}"`)
      extras.push({ id: a.id_addon, name: a.name, price: Number(a.price || 0) })
      extrasPrice += Number(a.price || 0)
    }
  }

  const unitPrice = base + variantAdjust + optionsAdjust + sizePrice + extrasPrice

  if (product.stock > 0 && qty > product.stock) {
    throw createError(400, `Insufficient stock for "${product.name}" (available: ${product.stock})`)
  }
  if (variantId) {
    const v = product.variants?.find((r: any) => r.id_variant === variantId)
    if (v && v.stock > 0 && qty > v.stock) {
      throw createError(400, `Insufficient stock for variant "${v.name}"`)
    }
  }

  return {
    id_variant: variantId,
    variant_name: variantName || null,
    size_name: sizeName,
    options: resolvedOptions.length ? resolvedOptions : Prisma.JsonNull,
    greeting_card: cfg?.greeting_card || null,
    greeting_message: cfg?.greeting_message || null,
    extras: extras.length ? extras : Prisma.JsonNull,
    unit_price: unitPrice,
    extras_price: extrasPrice,
    subtotal: unitPrice * qty,
  }
}

export async function createOrder(userId: number, vendorId: number, items: ItemInput[], deliveryInfo?: string, notes?: string, data?: OrderData) {
  const resolved: any[] = []
  let totalPrice = 0
  for (const item of items) {
    const qty = Math.max(1, Number(item.quantity) || 1)
    const r = await resolveItem(item.id_product, item, qty)
    totalPrice += r.subtotal
    resolved.push({
      id_product: item.id_product,
      id_variant: r.id_variant,
      quantity: qty,
      price: r.unit_price,
      addon_ids: item.addon_ids || null,
      size_name: r.size_name,
      variant_name: r.variant_name,
      options: r.options,
      greeting_card: r.greeting_card,
      greeting_message: r.greeting_message,
      extras: r.extras,
      unit_price: r.unit_price,
      extras_price: r.extras_price,
      subtotal: r.subtotal,
    })
  }

  const deliveryFee = Number(data?.delivery_fee) || 0
  const serviceFee = Number(data?.service_fee) || 0
  const grandTotal = totalPrice + deliveryFee + serviceFee

  const orderNumber = generateOrderNumber()
  const deliveryDate = data?.delivery_date ? new Date(data.delivery_date) : null

  return prisma.order.create({
    data: {
      id_user: userId,
      id_vendor: vendorId,
      total_price: grandTotal,
      status: 'pending',
      delivery_info: deliveryInfo,
      notes,
      order_number: orderNumber,
      recipient_name: data?.recipient_name || null,
      recipient_phone: data?.recipient_phone || null,
      delivery_address: data?.delivery_address || null,
      delivery_city: data?.delivery_city || null,
      delivery_province: data?.delivery_province || null,
      delivery_postal_code: data?.delivery_postal_code || null,
      delivery_notes: data?.delivery_notes || null,
      delivery_date: deliveryDate,
      delivery_time: data?.delivery_time || null,
      payment_status: data?.payment_status || 'pending',
      fulfillment_status: data?.fulfillment_status || 'pending',
      delivery_fee: deliveryFee,
      service_fee: serviceFee,
      user_created: String(userId),
      items: { create: resolved },
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

export async function updateOrderFulfillment(orderId: number, fulfillmentStatus: string) {
  return prisma.order.update({ where: { id_order: orderId }, data: { fulfillment_status: fulfillmentStatus }, include: orderInclude })
}
