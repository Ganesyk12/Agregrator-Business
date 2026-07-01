import prisma from '../../db'
import type { Package } from './packages.types'

export async function findAll(): Promise<Package[]> {
  return prisma.package.findMany({ orderBy: { date_created: 'desc' } }) as unknown as Package[]
}

export async function findById(id: number): Promise<Package | null> {
  return prisma.package.findUnique({ where: { id_package: id } }) as unknown as Package | null
}

export async function findByVendor(vendorId: number): Promise<Package[]> {
  return prisma.package.findMany({
    where: { id_vendor: vendorId },
    orderBy: { date_created: 'desc' },
  }) as unknown as Package[]
}

export async function create(data: Pick<Package, 'id_vendor' | 'name' | 'price' | 'description' | 'duration' | 'whats_included'>): Promise<Package> {
  return prisma.package.create({ data }) as unknown as Package
}

export async function update(id: number, data: Partial<Pick<Package, 'name' | 'description' | 'price' | 'duration' | 'whats_included' | 'status'>>): Promise<Package | null> {
  const existing = await prisma.package.findUnique({ where: { id_package: id } })
  if (!existing) return null
  return prisma.package.update({ where: { id_package: id }, data }) as unknown as Package
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.package.findUnique({ where: { id_package: id } })
  if (!existing) return false
  await prisma.package.delete({ where: { id_package: id } })
  return true
}
