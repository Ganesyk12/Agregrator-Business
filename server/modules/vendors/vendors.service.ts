import prisma from '../../db'
import type { Vendor } from './vendors.types'

export async function findAll(): Promise<Vendor[]> {
  return prisma.vendor.findMany({
    where: {
      status: { not: 'deleted' },
    },
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as Vendor[]
}

export async function findById(id: number): Promise<Vendor | null> {
  return prisma.vendor.findFirst({
    where: {
      id_vendor: id,
      status: { not: 'deleted' },
    },
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
    },
  }) as unknown as Vendor | null
}

export async function create(
  data: Pick<Vendor, 'id_user' | 'business_name' | 'category' | 'description' | 'location' | 'years_exp'> &
    Partial<Pick<Vendor, 'user_created' | 'user_modified'>>
): Promise<Vendor> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.vendor.create({
    data: payload,
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
    },
  }) as unknown as Vendor
}

export async function update(
  id: number,
  data: Partial<Pick<Vendor, 'business_name' | 'category' | 'description' | 'location' | 'years_exp' | 'status' | 'user_modified'>>
): Promise<Vendor | null> {
  const existing = await prisma.vendor.findFirst({
    where: {
      id_vendor: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.vendor.update({
    where: { id_vendor: id },
    data: payload,
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
    },
  }) as unknown as Vendor
}

export async function findVendorsWithPackages() {
  return prisma.vendor.findMany({
    where: { status: { not: 'deleted' } },
    include: {
      packages: {
        where: { status: 'active' },
        select: { id_package: true, name: true, price: true, duration: true },
        orderBy: { price: 'asc' },
      },
      _count: { select: { portfolios: true, reviews: true } },
    },
    orderBy: { date_created: 'desc' },
  })
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.vendor.findFirst({
    where: {
      id_vendor: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false

  await prisma.vendor.update({
    where: { id_vendor: id },
    data: {
      status: 'deleted',
      user_modified: 'SYSTEM',
    },
  })
  return true
}
