import prisma from '../../db'
import type { Portfolio } from './portfolios.types'

const includeRelations = {
  vendor: { select: { business_name: true } },
  package: { select: { name: true } },
  category: { select: { category_name: true } },
}

export async function findAll(): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: {
      status: { not: 'deleted' },
    },
    include: includeRelations,
    orderBy: { sort_order: 'asc' },
  }) as unknown as Portfolio[]
}

export async function findById(id: number): Promise<Portfolio | null> {
  return prisma.portfolio.findFirst({
    where: {
      id_portfolio: id,
      status: { not: 'deleted' },
    },
    include: includeRelations,
  }) as unknown as Portfolio | null
}

export async function findByVendor(vendorId: number): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: {
      id_vendor: vendorId,
      status: { not: 'deleted' },
    },
    include: includeRelations,
    orderBy: { sort_order: 'asc' },
  }) as unknown as Portfolio[]
}

export async function create(
  data: Pick<Portfolio, 'id_vendor' | 'id_package' | 'id_category' | 'media_url' | 'description' | 'location' | 'label' | 'sort_order'> &
    Partial<Pick<Portfolio, 'user_created' | 'user_modified'>>
): Promise<Portfolio> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.portfolio.create({
    data: payload,
    include: includeRelations,
  }) as unknown as Portfolio
}

export async function update(
  id: number,
  data: Partial<Pick<Portfolio, 'id_package' | 'id_category' | 'media_url' | 'description' | 'location' | 'label' | 'sort_order' | 'status' | 'user_modified'>>
): Promise<Portfolio | null> {
  const existing = await prisma.portfolio.findFirst({
    where: {
      id_portfolio: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.portfolio.update({
    where: { id_portfolio: id },
    data: payload,
    include: includeRelations,
  }) as unknown as Portfolio
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.portfolio.findFirst({
    where: {
      id_portfolio: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false

  await prisma.portfolio.update({
    where: { id_portfolio: id },
    data: {
      status: 'deleted',
      user_modified: 'SYSTEM',
    },
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
