import prisma from '../../db'
import type { Vendor } from './vendors.types'

export async function findAll(): Promise<Vendor[]> {
  return prisma.vendor.findMany({ orderBy: { date_created: 'desc' } }) as unknown as Vendor[]
}

export async function findById(id: number): Promise<Vendor | null> {
  return prisma.vendor.findUnique({ where: { id_vendor: id } }) as unknown as Vendor | null
}

export async function create(data: Pick<Vendor, 'id_user' | 'business_name' | 'category' | 'description' | 'location'>): Promise<Vendor> {
  return prisma.vendor.create({ data }) as unknown as Vendor
}
