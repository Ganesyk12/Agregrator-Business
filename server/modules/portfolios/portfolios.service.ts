import prisma from '../../db'
import type { Portfolio } from './portfolios.types'

export async function findAll(): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      vendor: {
        select: {
          id_vendor: true,
          business_name: true,
          category: true,
          location: true,
          description: true,
          starting_price: true,
          years_exp: true,
          status: true,
          _count: { select: { portfolios: true } },
        },
      },
    },
  }) as unknown as Portfolio[]
}

export async function findById(id: number): Promise<Portfolio | null> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id_portfolio: id },
    include: {
      images: { orderBy: { sort_order: 'asc' } },
      vendor: {
        select: {
          id_vendor: true,
          business_name: true,
          category: true,
          location: true,
          description: true,
          starting_price: true,
          years_exp: true,
          status: true,
          _count: { select: { portfolios: true, reviews: true } },
        },
      },
    },
  })

  if (!portfolio) return null

  return portfolio as unknown as Portfolio
}

export async function findByVendorId(vendorId: number, excludePortfolioId?: number): Promise<Portfolio[]> {
  return prisma.portfolio.findMany({
    where: {
      id_vendor: vendorId,
      ...(excludePortfolioId ? { id_portfolio: { not: excludePortfolioId } } : {}),
    },
    orderBy: { created_at: 'desc' },
    take: 4,
    include: {
      vendor: {
        select: {
          id_vendor: true,
          business_name: true,
          category: true,
          location: true,
          description: true,
          starting_price: true,
          years_exp: true,
          status: true,
        },
      },
    },
  }) as unknown as Portfolio[]
}

export async function getVendorReviews(vendorId: number) {
  return prisma.review.findMany({
    where: { id_vendor: vendorId },
    orderBy: { created_at: 'desc' },
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
    where: {
      id_vendor: vendorId,
      date: { gte: today },
      is_available: true,
    },
    orderBy: { date: 'asc' },
  })
}
