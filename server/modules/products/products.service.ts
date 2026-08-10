import prisma from '../../db'
import type { Product } from './products.types'

const includeAll = {
  vendor: { select: { id_vendor: true, business_name: true, location: true, category: true } },
  occasion: { select: { id_occasion: true, name: true, slug: true } },
  template: { select: { id_template: true, name: true, slug: true, icon: true, short_desc: true } },
  images: { orderBy: { sort_order: 'asc' as const } },
  variants: { where: { status: 'active' }, orderBy: { sort_order: 'asc' as const } },
  addons: { where: { status: 'active' } },
  option_groups: {
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' as const },
    include: {
      values: {
        where: { status: 'active' },
        orderBy: { sort_order: 'asc' as const },
        include: { images: { orderBy: { sort_order: 'asc' as const } } },
      },
    },
  },
  size_configs: {
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' as const },
    include: { images: { orderBy: { sort_order: 'asc' as const } } },
  },
  optional_extras: {
    where: { status: 'active' },
    orderBy: { sort_order: 'asc' as const },
  },
}

function buildLabels(occasionIds: number[]): string | null {
  if (!occasionIds || occasionIds.length === 0) return null
  const slugMap: Record<number, string> = {
    1: 'wedding', 2: 'graduation', 3: 'birthday',
    4: 'engagement', 5: 'anniversary', 6: 'formal',
  }
  const slugs = occasionIds.map(id => slugMap[id]).filter(Boolean)
  return slugs.length > 0 ? slugs.join(',') : null
}

export async function findAll(params?: {
  occasion?: string
  type?: string
  size?: string
  vendorId?: number
}): Promise<Product[]> {
  const where: any = { status: { not: 'deleted' } }
  if (params?.vendorId) where.id_vendor = params.vendorId
  if (params?.occasion) where.labels = { contains: params.occasion }
  if (params?.type) where.type_name = { contains: params.type }
  if (params?.size) where.size_name = { contains: params.size }

  return prisma.product.findMany({
    where,
    include: includeAll,
    orderBy: { date_created: 'desc' },
  }) as unknown as Product[]
}

export async function findById(id: number): Promise<Product | null> {
  return prisma.product.findFirst({
    where: { id_product: id, status: { not: 'deleted' } },
    include: includeAll,
  }) as unknown as Product | null
}

export async function findByVendor(vendorId: number): Promise<Product[]> {
  return prisma.product.findMany({
    where: { id_vendor: vendorId, status: { not: 'deleted' } },
    include: includeAll,
    orderBy: { date_created: 'desc' },
  }) as unknown as Product[]
}

export async function create(data: {
  id_vendor: number
  id_occasion?: number | null
  id_template?: number | null
  name: string
  description?: string | null
  price: number
  stock?: number
  estimated_delivery?: string | null
  delivery_info?: string | null
  occasion_ids?: number[]
  type_name?: string | null
  size_name?: string | null
  images?: Array<{ image_url: string; caption?: string | null; sort_order?: number }>
  variants?: Array<{ name: string; price_adjust?: number; stock?: number; sort_order?: number }>
  addons?: Array<{ name: string; price: number; description?: string | null }>
  option_groups?: Array<{
    name: string
    display_type?: string
    sort_order?: number
    is_required?: boolean
    values?: Array<{
      name: string
      price_adjust?: number
      stock?: number
      sku?: string | null
      description?: string | null
      image_url?: string | null
      sort_order?: number
      images?: Array<{ image_url: string; sort_order?: number }>
    }>
  }>
  size_configs?: Array<{
    name: string
    price: number
    stock?: number
    sku?: string | null
    sort_order?: number
    images?: Array<{ image_url: string; sort_order?: number }>
  }>
  optional_extras?: Array<{
    name: string
    image_url?: string | null
    description?: string | null
    price: number
    stock?: number
    sort_order?: number
  }>
}): Promise<Product> {
  const payload: any = {
    id_vendor: data.id_vendor,
    id_occasion: data.id_occasion ?? null,
    id_template: data.id_template ?? null,
    type_name: data.type_name ?? null,
    size_name: data.size_name ?? null,
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    stock: data.stock ?? 0,
    estimated_delivery: data.estimated_delivery ?? null,
    delivery_info: data.delivery_info ?? null,
    labels: buildLabels(data.occasion_ids || []),
    user_created: 'SYSTEM',
    user_modified: 'SYSTEM',
  }

  if (data.images && data.images.length > 0) {
    payload.images = { create: data.images.map((img, i) => ({ image_url: img.image_url, caption: img.caption ?? null, sort_order: img.sort_order ?? i })) }
  }
  if (data.variants && data.variants.length > 0) {
    payload.variants = { create: data.variants.map((v, i) => ({ name: v.name, price_adjust: v.price_adjust ?? 0, stock: v.stock ?? 0, sort_order: v.sort_order ?? i })) }
  }
  if (data.addons && data.addons.length > 0) {
    payload.addons = { create: data.addons.map(a => ({ name: a.name, price: a.price, description: a.description ?? null })) }
  }

  if (data.option_groups && data.option_groups.length > 0) {
    payload.option_groups = {
      create: data.option_groups.map((og, oi) => ({
        name: og.name,
        display_type: og.display_type ?? 'select',
        sort_order: og.sort_order ?? oi,
        is_required: og.is_required ?? false,
        values: og.values && og.values.length > 0
          ? { create: og.values.map((ov, vi) => ({
              name: ov.name,
              price_adjust: ov.price_adjust ?? 0,
              stock: ov.stock ?? 0,
              sku: ov.sku ?? null,
              description: ov.description ?? null,
              image_url: ov.image_url ?? null,
              sort_order: ov.sort_order ?? vi,
              images: ov.images && ov.images.length > 0
                ? { create: ov.images.map((img, ii) => ({ image_url: img.image_url, sort_order: img.sort_order ?? ii })) }
                : undefined,
            })) }
          : undefined,
      })),
    }
  }

  if (data.size_configs && data.size_configs.length > 0) {
    payload.size_configs = {
      create: data.size_configs.map((sc, si) => ({
        name: sc.name,
        price: sc.price,
        stock: sc.stock ?? 0,
        sku: sc.sku ?? null,
        sort_order: sc.sort_order ?? si,
        images: sc.images && sc.images.length > 0
          ? { create: sc.images.map((img, ii) => ({ image_url: img.image_url, sort_order: img.sort_order ?? ii })) }
          : undefined,
      })),
    }
  }

  if (data.optional_extras && data.optional_extras.length > 0) {
    payload.optional_extras = {
      create: data.optional_extras.map((oe, ei) => ({
        name: oe.name,
        image_url: oe.image_url ?? null,
        description: oe.description ?? null,
        price: oe.price,
        stock: oe.stock ?? 0,
        sort_order: oe.sort_order ?? ei,
      })),
    }
  }

  return prisma.product.create({ data: payload, include: includeAll }) as unknown as Product
}

export async function update(id: number, data: any): Promise<Product | null> {
  const existing = await prisma.product.findFirst({ where: { id_product: id, status: { not: 'deleted' } } })
  if (!existing) return null

  const payload: any = { user_modified: 'SYSTEM' }
  if (data.id_occasion !== undefined) payload.id_occasion = data.id_occasion ?? null
  if (data.id_template !== undefined) payload.id_template = data.id_template ?? null
  if (data.type_name !== undefined) payload.type_name = data.type_name ?? null
  if (data.size_name !== undefined) payload.size_name = data.size_name ?? null
  if (data.name !== undefined) payload.name = data.name
  if (data.description !== undefined) payload.description = data.description
  if (data.price !== undefined) payload.price = data.price
  if (data.stock !== undefined) payload.stock = data.stock
  if (data.estimated_delivery !== undefined) payload.estimated_delivery = data.estimated_delivery
  if (data.delivery_info !== undefined) payload.delivery_info = data.delivery_info
  if (data.status !== undefined) payload.status = data.status
  if (data.occasion_ids !== undefined) payload.labels = buildLabels(data.occasion_ids)

  return prisma.product.update({ where: { id_product: id }, data: payload, include: includeAll }) as unknown as Product
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.product.findFirst({ where: { id_product: id, status: { not: 'deleted' } } })
  if (!existing) return false
  await prisma.product.update({ where: { id_product: id }, data: { status: 'deleted', user_modified: 'SYSTEM' } })
  return true
}

export async function findAllOccasions(): Promise<any[]> {
  return prisma.productOccasion.findMany({ where: { status: 'active' }, orderBy: { sort_order: 'asc' } })
}

export async function findAllTypes(): Promise<any[]> {
  return prisma.productType.findMany({ where: { status: 'active' }, orderBy: { sort_order: 'asc' } })
}

export async function findAllSizes(): Promise<any[]> {
  return prisma.productSize.findMany({ where: { status: 'active' }, orderBy: { sort_order: 'asc' } })
}

export async function findAllTemplates(): Promise<any[]> {
  return prisma.productTemplate.findMany({ where: { status: 'active' }, orderBy: { sort_order: 'asc' } })
}

export async function findTemplateById(id: number): Promise<any | null> {
  return prisma.productTemplate.findFirst({ where: { id_template: id, status: 'active' } })
}

export async function createOptionGroup(productId: number, data: {
  name: string
  display_type?: string
  sort_order?: number
  is_required?: boolean
}): Promise<any> {
  return prisma.optionGroup.create({
    data: {
      id_product: productId,
      name: data.name,
      display_type: data.display_type ?? 'select',
      sort_order: data.sort_order ?? 0,
      is_required: data.is_required ?? false,
    },
  })
}

export async function updateOptionGroup(id: number, data: any): Promise<any | null> {
  const existing = await prisma.optionGroup.findFirst({ where: { id_option_group: id } })
  if (!existing) return null
  return prisma.optionGroup.update({ where: { id_option_group: id }, data })
}

export async function deleteOptionGroup(id: number): Promise<boolean> {
  const existing = await prisma.optionGroup.findFirst({ where: { id_option_group: id } })
  if (!existing) return false
  await prisma.optionGroup.delete({ where: { id_option_group: id } })
  return true
}

export async function createOptionValue(groupId: number, data: {
  name: string
  price_adjust?: number
  stock?: number
  sku?: string | null
  description?: string | null
  image_url?: string | null
  sort_order?: number
  images?: Array<{ image_url: string; sort_order?: number }>
}): Promise<any> {
  const payload: any = {
    id_option_group: groupId,
    name: data.name,
    price_adjust: data.price_adjust ?? 0,
    stock: data.stock ?? 0,
    sku: data.sku ?? null,
    description: data.description ?? null,
    image_url: data.image_url ?? null,
    sort_order: data.sort_order ?? 0,
  }
  if (data.images && data.images.length > 0) {
    payload.images = { create: data.images.map((img, i) => ({ image_url: img.image_url, sort_order: img.sort_order ?? i })) }
  }
  return prisma.optionValue.create({ data: payload, include: { images: true } })
}

export async function updateOptionValue(id: number, data: any): Promise<any | null> {
  const existing = await prisma.optionValue.findFirst({ where: { id_option_value: id } })
  if (!existing) return null
  return prisma.optionValue.update({ where: { id_option_value: id }, data })
}

export async function deleteOptionValue(id: number): Promise<boolean> {
  const existing = await prisma.optionValue.findFirst({ where: { id_option_value: id } })
  if (!existing) return false
  await prisma.optionValue.delete({ where: { id_option_value: id } })
  return true
}

export async function createSizeConfig(productId: number, data: {
  name: string
  price: number
  stock?: number
  sku?: string | null
  sort_order?: number
  images?: Array<{ image_url: string; sort_order?: number }>
}): Promise<any> {
  const payload: any = {
    id_product: productId,
    name: data.name,
    price: data.price,
    stock: data.stock ?? 0,
    sku: data.sku ?? null,
    sort_order: data.sort_order ?? 0,
  }
  if (data.images && data.images.length > 0) {
    payload.images = { create: data.images.map((img, i) => ({ image_url: img.image_url, sort_order: img.sort_order ?? i })) }
  }
  return prisma.sizeConfig.create({ data: payload, include: { images: true } })
}

export async function updateSizeConfig(id: number, data: any): Promise<any | null> {
  const existing = await prisma.sizeConfig.findFirst({ where: { id_size_config: id } })
  if (!existing) return null
  return prisma.sizeConfig.update({ where: { id_size_config: id }, data })
}

export async function deleteSizeConfig(id: number): Promise<boolean> {
  const existing = await prisma.sizeConfig.findFirst({ where: { id_size_config: id } })
  if (!existing) return false
  await prisma.sizeConfig.delete({ where: { id_size_config: id } })
  return true
}

export async function createOptionalExtra(productId: number, data: {
  name: string
  image_url?: string | null
  description?: string | null
  price: number
  stock?: number
  sort_order?: number
}): Promise<any> {
  return prisma.optionalExtra.create({
    data: {
      id_product: productId,
      name: data.name,
      image_url: data.image_url ?? null,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock ?? 0,
      sort_order: data.sort_order ?? 0,
    },
  })
}

export async function updateOptionalExtra(id: number, data: any): Promise<any | null> {
  const existing = await prisma.optionalExtra.findFirst({ where: { id_optional_extra: id } })
  if (!existing) return null
  return prisma.optionalExtra.update({ where: { id_optional_extra: id }, data })
}

export async function deleteOptionalExtra(id: number): Promise<boolean> {
  const existing = await prisma.optionalExtra.findFirst({ where: { id_optional_extra: id } })
  if (!existing) return false
  await prisma.optionalExtra.delete({ where: { id_optional_extra: id } })
  return true
}

export async function getOptionGroupsByProduct(productId: number): Promise<any[]> {
  return prisma.optionGroup.findMany({
    where: { id_product: productId, status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: {
      values: {
        where: { status: 'active' },
        orderBy: { sort_order: 'asc' },
        include: { images: { orderBy: { sort_order: 'asc' } } },
      },
    },
  })
}

export async function getSizeConfigsByProduct(productId: number): Promise<any[]> {
  return prisma.sizeConfig.findMany({
    where: { id_product: productId, status: 'active' },
    orderBy: { sort_order: 'asc' },
    include: { images: { orderBy: { sort_order: 'asc' } } },
  })
}

export async function getOptionalExtrasByProduct(productId: number): Promise<any[]> {
  return prisma.optionalExtra.findMany({
    where: { id_product: productId, status: 'active' },
    orderBy: { sort_order: 'asc' },
  })
}
