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

export async function create(
  data: Pick<Role, 'role_code' | 'name'> &
    Partial<Pick<Role, 'user_created' | 'user_modified'>>
): Promise<Role> {
  const payload = {
    ...data,
    user_created: data.user_created ?? 'SYSTEM',
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.role.create({ data: payload }) as unknown as Role
}

export async function update(
  code: string,
  data: Partial<Pick<Role, 'name' | 'status' | 'user_modified'>>
): Promise<Role | null> {
  const existing = await prisma.role.findFirst({
    where: {
      role_code: code,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }
  return prisma.role.update({ where: { role_code: code }, data: payload }) as unknown as Role
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
