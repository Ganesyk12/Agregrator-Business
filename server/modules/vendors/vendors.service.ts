import prisma from '../../db'
import type { Vendor } from './vendors.types'

const vendorSelect = {
  id_vendor: true, id_user: true, vendor_code: true, business_name: true,
  description: true, category: true, location: true, years_exp: true,
  avatar_url: true, instagram: true, vendor_type: true,
  status: true, verified_at: true, date_created: true, date_modified: true,
  user_created: true, user_modified: true,
  user: { select: { id_user: true, email: true, full_name: true } },
} as const

export async function findAll(): Promise<Vendor[]> {
  return prisma.vendor.findMany({
    where: { status: { not: 'deleted' } },
    select: vendorSelect,
    orderBy: { date_created: 'desc' },
  }) as unknown as Vendor[]
}

export async function findById(id: number): Promise<Vendor | null> {
  return prisma.vendor.findFirst({
    where: { id_vendor: id, status: { not: 'deleted' } },
    select: vendorSelect,
  }) as unknown as Vendor | null
}

export async function findByUserId(userId: number): Promise<Vendor | null> {
  return prisma.vendor.findFirst({
    where: { id_user: userId, status: { not: 'deleted' } },
    select: vendorSelect,
  }) as unknown as Vendor | null
}

export async function create(
  data: Pick<Vendor, 'id_user' | 'business_name' | 'category' | 'description' | 'location'> &
    Partial<Pick<Vendor, 'years_exp' | 'user_created' | 'user_modified'>>
): Promise<Vendor> {
  const vendorType = data.category === 'Bouquet Flowers' ? 'PRODUCT' : 'SERVICE'
  const payload = {
    ...data,
    vendor_type: vendorType,
    years_exp: data.years_exp ?? 0,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.vendor.create({
    data: payload,
    select: vendorSelect,
  }) as unknown as Vendor
}

export async function update(
  id: number,
  data: Partial<Pick<Vendor, 'business_name' | 'category' | 'description' | 'location' | 'years_exp' | 'avatar_url' | 'instagram' | 'status' | 'user_modified'>>
): Promise<Vendor | null> {
  const existing = await prisma.vendor.findFirst({
    where: { id_vendor: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  return prisma.vendor.update({
    where: { id_vendor: id },
    data: { ...data, user_modified: data.user_modified ?? 'SYSTEM' },
    select: vendorSelect,
  }) as unknown as Vendor
}

export async function findVendorsWithPackages() {
  return prisma.vendor.findMany({
    where: { status: 'verified' },
    select: {
      ...vendorSelect,
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
    where: { id_vendor: id, status: { not: 'deleted' } },
  })
  if (!existing) return false

  await prisma.vendor.update({
    where: { id_vendor: id },
    data: { status: 'deleted', user_modified: 'SYSTEM' },
  })
  return true
}
