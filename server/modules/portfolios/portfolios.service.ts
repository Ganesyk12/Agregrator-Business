import prisma from '../../db'
import type { Portfolio } from './portfolios.types'

const includeRelations = {
  vendor: { select: { id_vendor: true, business_name: true, category: true, location: true, description: true, status: true, _count: { select: { portfolios: true } } } },
  package: { select: { name: true } },
  category: { select: { category_name: true } },
}

export async function findAll(): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: { status: { not: 'deleted' } },
    include: {
      ...includeRelations,
      images: { orderBy: { sort_order: 'asc' } },
    },
    orderBy: { sort_order: 'asc' },
  }) as unknown as Portfolio[]
}

export async function findById(id: number): Promise<Portfolio | null> {
  return prisma.portfolio.findFirst({
    where: { id_portfolio: id, status: { not: 'deleted' } },
    include: {
      ...includeRelations,
      images: { orderBy: { sort_order: 'asc' } },
      vendor: {
        select: { id_vendor: true, business_name: true, category: true, location: true, description: true, status: true, years_exp: true, _count: { select: { portfolios: true, reviews: true } } },
      },
    },
  }) as unknown as Portfolio | null
}

export async function findByVendor(vendorId: number): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: { id_vendor: vendorId, status: { not: 'deleted' } },
    include: {
      ...includeRelations,
      images: { orderBy: { sort_order: 'asc' } },
    },
    orderBy: { sort_order: 'asc' },
  }) as unknown as Portfolio[]
}

export async function findByVendorId(vendorId: number, excludePortfolioId?: number): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: {
      id_vendor: vendorId,
      ...(excludePortfolioId ? { id_portfolio: { not: excludePortfolioId } } : {}),
    },
    orderBy: { sort_order: 'asc' },
    take: 4,
    include: {
      ...includeRelations,
      images: { orderBy: { sort_order: 'asc' }, take: 1 },
    },
  }) as unknown as Portfolio[]
}

export async function create(
  data: {
    id_vendor: number
    id_package?: number | null
    id_category?: number | null
    title: string
    code: string
    cover_url: string
    description?: string | null
    location?: string | null
    label?: string | null
    sort_order?: number
  } & Partial<Pick<Portfolio, 'user_created' | 'user_modified'>>
): Promise<Portfolio> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.portfolio.create({
    data: payload,
    include: { ...includeRelations, images: { orderBy: { sort_order: 'asc' } } },
  }) as unknown as Portfolio
}

export async function update(
  id: number,
  data: Partial<Pick<Portfolio, 'id_package' | 'id_category' | 'title' | 'code' | 'cover_url' | 'description' | 'location' | 'label' | 'sort_order' | 'status' | 'user_modified'>>
): Promise<Portfolio | null> {
  const existing = await prisma.portfolio.findFirst({
    where: { id_portfolio: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const payload = { ...data, user_modified: data.user_modified ?? 'SYSTEM' }
  return prisma.portfolio.update({
    where: { id_portfolio: id },
    data: payload,
    include: { ...includeRelations, images: { orderBy: { sort_order: 'asc' } } },
  }) as unknown as Portfolio
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.portfolio.findFirst({
    where: { id_portfolio: id, status: { not: 'deleted' } },
  })
  if (!existing) return false
  await prisma.portfolio.update({
    where: { id_portfolio: id },
    data: { status: 'deleted', user_modified: 'SYSTEM' },
  })
  return true
}

export async function reorder(items: Array<{ id_portfolio: number; sort_order: number }>): Promise<void> {
  await prisma.$transaction(
    items.map((item) =>
      prisma.portfolio.update({
        where: { id_portfolio: item.id_portfolio },
        data: { sort_order: item.sort_order },
      })
    )
  )
}

export async function getVendorReviews(vendorId: number) {
  return prisma.review.findMany({
    where: { id_vendor: vendorId },
    orderBy: { date_created: 'desc' },
    include: {
      user: { select: { id_user: true, full_name: true, avatar_url: true } },
    },
  })
}

export async function getVendorPackages(vendorId: number) {
  return prisma.package.findMany({
    where: { id_vendor: vendorId, status: 'active' },
    orderBy: { price: 'asc' },
  })
}

export async function getVendorAvailability(vendorId: number) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return prisma.vendorAvailability.findFirst({
    where: { id_vendor: vendorId, date: { gte: today }, is_available: true },
    orderBy: { date: 'asc' },
  })
}
