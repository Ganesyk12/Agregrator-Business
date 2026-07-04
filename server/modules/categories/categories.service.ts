import prisma from '../../db'
import type { Category } from './categories.types'

export async function findAll(): Promise<Category[]> {
  return prisma.category.findMany({
    where: {
      status: { not: 'deleted' },
    },
    orderBy: { date_created: 'asc' },
  }) as unknown as Category[]
}

export async function findById(id: number): Promise<Category | null> {
  return prisma.category.findFirst({
    where: {
      id_category: id,
      status: { not: 'deleted' },
    },
  }) as unknown as Category | null
}

export async function findByName(name: string): Promise<Category | null> {
  return prisma.category.findFirst({
    where: {
      category_name: name,
      status: { not: 'deleted' },
    },
  }) as unknown as Category | null
}

export async function create(
  data: Pick<Category, 'category_name'> &
    Partial<Pick<Category, 'user_created' | 'user_modified'>>
): Promise<Category> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.category.create({ data: payload }) as unknown as Category
}

export async function update(
  id: number,
  data: Partial<Pick<Category, 'category_name' | 'status' | 'user_modified'>>
): Promise<Category | null> {
  const existing = await prisma.category.findFirst({
    where: {
      id_category: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.category.update({
    where: { id_category: id },
    data: payload,
  }) as unknown as Category
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.category.findFirst({
    where: {
      id_category: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false

  await prisma.category.update({
    where: { id_category: id },
    data: {
      status: 'deleted',
    },
  })
  return true
}
