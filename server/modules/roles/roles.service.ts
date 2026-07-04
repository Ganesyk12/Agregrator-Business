import prisma from '../../db'
import type { Role } from './roles.types'

export async function findAll(): Promise<Role[]> {
  return prisma.role.findMany({
    where: {
      status: { not: 'deleted' },
    },
    orderBy: { date_created: 'asc' },
  }) as unknown as Role[]
}

export async function findByCode(code: string): Promise<Role | null> {
  return prisma.role.findFirst({
    where: {
      role_code: code,
      status: { not: 'deleted' },
    },
  }) as unknown as Role | null
}

export async function create(data: Pick<Role, 'role_code' | 'name'>): Promise<Role> {
  return prisma.role.create({ data }) as unknown as Role
}

export async function update(code: string, data: Partial<Pick<Role, 'name' | 'status'>>): Promise<Role | null> {
  const existing = await prisma.role.findFirst({
    where: {
      role_code: code,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null
  return prisma.role.update({ where: { role_code: code }, data }) as unknown as Role
}

export async function remove(code: string): Promise<boolean> {
  const existing = await prisma.role.findFirst({
    where: {
      role_code: code,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false
  await prisma.role.update({
    where: { role_code: code },
    data: {
      status: 'deleted',
    },
  })
  return true
}
