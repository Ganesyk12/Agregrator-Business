import prisma from '../../db'
import type { Package } from './packages.types'

const includeAll = {
  vendor: { select: { business_name: true } },
  category: { select: { category_name: true } },
  extras: {
    where: { status: { not: 'deleted' } },
    select: { id_extra: true, name: true, description: true, price: true, icon: true, status: true },
    orderBy: { id_extra: 'asc' as const },
  },
}

export async function findAll(vendorId?: number): Promise<Package[]> {
  const where: any = { status: { not: 'deleted' } }
  if (vendorId) where.id_vendor = vendorId
  return prisma.package.findMany({
    where,
    orderBy: { date_created: 'desc' },
    include: includeAll,
  }) as unknown as Package[]
}

export async function findById(id: number): Promise<Package | null> {
  return prisma.package.findFirst({
    where: { id_package: id, status: { not: 'deleted' } },
    include: includeAll,
  }) as unknown as Package | null
}

export async function findByVendor(vendorId: number): Promise<Package[]> {
  return prisma.package.findMany({
    where: { id_vendor: vendorId, status: { not: 'deleted' } },
    orderBy: { date_created: 'desc' },
    include: includeAll,
  }) as unknown as Package[]
}

export async function findByCategory(categoryId: number): Promise<Package[]> {
  return prisma.package.findMany({
    where: {
      id_category: categoryId,
      status: { not: 'deleted' },
    },
    orderBy: { date_created: 'desc' },
    include: {
      vendor: { select: { business_name: true, location: true } },
      category: { select: { category_name: true } }
    }
  }) as unknown as Package[]
}

export async function create(
  data: Pick<Package, 'id_vendor' | 'id_category' | 'name' | 'price' | 'description' | 'duration' | 'whats_included'> &
    Partial<Pick<Package, 'user_created' | 'user_modified'>> & { extras?: Array<{ name: string; price: number; description?: string; icon?: string }> }
): Promise<Package> {
  const payload: any = {
    id_vendor: data.id_vendor,
    id_category: data.id_category ?? null,
    name: data.name,
    price: data.price,
    description: data.description ?? null,
    duration: data.duration ?? null,
    whats_included: data.whats_included ?? null,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }

  if (data.extras && data.extras.length > 0) {
    payload.extras = {
      create: data.extras.map((e) => ({
        name: e.name,
        price: e.price,
        description: e.description ?? null,
        icon: e.icon ?? null,
        user_created: 'SYSTEM',
        user_modified: 'SYSTEM',
      })),
    }
  }

  return prisma.package.create({
    data: payload,
    include: includeAll,
  }) as unknown as Package
}

export async function update(
  id: number,
  data: Partial<Pick<Package, 'id_category' | 'name' | 'description' | 'price' | 'duration' | 'whats_included' | 'status' | 'user_modified'>> & { extras?: Array<{ id_extra?: number; name: string; price: number; description?: string; icon?: string }> }
): Promise<Package | null> {
  const existing = await prisma.package.findFirst({
    where: { id_package: id, status: { not: 'deleted' } },
  })
  if (!existing) return null

  const payload: any = {
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  if (data.id_category !== undefined) payload.id_category = data.id_category ?? null
  if (data.name !== undefined) payload.name = data.name
  if (data.price !== undefined) payload.price = data.price
  if (data.description !== undefined) payload.description = data.description
  if (data.duration !== undefined) payload.duration = data.duration
  if (data.whats_included !== undefined) payload.whats_included = data.whats_included
  if (data.status !== undefined) payload.status = data.status

  if (data.extras) {
    const existingExtras = await prisma.packageExtra.findMany({
      where: { id_package: id, status: { not: 'deleted' } },
    })
    const existingIds = existingExtras.map((e) => e.id_extra)
    const incomingIds = data.extras.filter((e) => e.id_extra).map((e) => e.id_extra!) as number[]

    const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid))
    const toCreate = data.extras.filter((e) => !e.id_extra)
    const toUpdate = data.extras.filter((e) => e.id_extra && existingIds.includes(e.id_extra))

    await prisma.$transaction([
      ...toDelete.map((eid) =>
        prisma.packageExtra.update({
          where: { id_extra: eid },
          data: { status: 'deleted', user_modified: 'SYSTEM' },
        })
      ),
      ...toUpdate.map((e) =>
        prisma.packageExtra.update({
          where: { id_extra: e.id_extra! },
          data: {
            name: e.name,
            price: e.price,
            description: e.description ?? null,
            icon: e.icon ?? null,
            user_modified: 'SYSTEM',
          },
        })
      ),
      ...toCreate.map((e) =>
        prisma.packageExtra.create({
          data: {
            id_package: id,
            name: e.name,
            price: e.price,
            description: e.description ?? null,
            icon: e.icon ?? null,
            user_created: 'SYSTEM',
            user_modified: 'SYSTEM',
          },
        })
      ),
    ])
  }

  return prisma.package.update({
    where: { id_package: id },
    data: payload,
    include: includeAll,
  }) as unknown as Package
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.package.findFirst({
    where: { id_package: id, status: { not: 'deleted' } },
  })
  if (!existing) return false

  await prisma.package.update({
    where: { id_package: id },
    data: { status: 'deleted', user_modified: 'SYSTEM' },
  })
  return true
}
