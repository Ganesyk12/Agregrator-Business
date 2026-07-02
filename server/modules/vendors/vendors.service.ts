import prisma from '../../db'
import type { Vendor } from './vendors.types'

export async function findAll(): Promise<Vendor[]> {
  return prisma.vendor.findMany({ orderBy: { date_created: 'desc' } }) as unknown as Vendor[]
}

export async function findById(id: number): Promise<Vendor | null> {
  return prisma.vendor.findUnique({ where: { id_vendor: id } }) as unknown as Vendor | null
}

export async function create(
  data: Pick<Vendor, 'id_user' | 'business_name' | 'category' | 'description' | 'location'> &
    Partial<Pick<Vendor, 'user_created' | 'user_modified'>>
): Promise<Vendor> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.vendor.create({ data: payload }) as unknown as Vendor
}

export async function update(
  id: number,
  data: Partial<Pick<Vendor, 'business_name' | 'category' | 'description' | 'location' | 'status' | 'user_modified'>>
): Promise<Vendor | null> {
  const existing = await prisma.vendor.findUnique({ where: { id_vendor: id } })
  if (!existing) return null
  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.vendor.update({ where: { id_vendor: id }, data: payload }) as unknown as Vendor
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.vendor.findUnique({ where: { id_vendor: id } })
  if (!existing) return false
  await prisma.vendor.delete({ where: { id_vendor: id } })
  return true
}
