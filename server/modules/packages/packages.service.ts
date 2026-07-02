import prisma from '../../db'
import type { Package } from './packages.types'

export async function findAll(): Promise<Package[]> {
  return prisma.package.findMany({
    orderBy: { date_created: 'desc' },
    include: { vendor: { select: { business_name: true } } }
  }) as unknown as Package[]
}

export async function findById(id: number): Promise<Package | null> {
  return prisma.package.findUnique({
    where: { id_package: id },
    include: { vendor: { select: { business_name: true } } }
  }) as unknown as Package | null
}

export async function findByVendor(vendorId: number): Promise<Package[]> {
  return prisma.package.findMany({
    where: { id_vendor: vendorId },
    orderBy: { date_created: 'desc' },
    include: { vendor: { select: { business_name: true } } }
  }) as unknown as Package[]
}

export async function create(
  data: Pick<Package, 'id_vendor' | 'name' | 'price' | 'description' | 'duration' | 'whats_included'> &
    Partial<Pick<Package, 'user_created' | 'user_modified'>>
): Promise<Package> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.package.create({
    data: payload,
    include: { vendor: { select: { business_name: true } } }
  }) as unknown as Package
}

export async function update(
  id: number,
  data: Partial<Pick<Package, 'name' | 'description' | 'price' | 'duration' | 'whats_included' | 'status' | 'user_modified'>>
): Promise<Package | null> {
  const existing = await prisma.package.findUnique({ where: { id_package: id } })
  if (!existing) return null
  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.package.update({
    where: { id_package: id },
    data: payload,
    include: { vendor: { select: { business_name: true } } }
  }) as unknown as Package
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.package.findUnique({ where: { id_package: id } })
  if (!existing) return false
  await prisma.package.delete({ where: { id_package: id } })
  return true
}
