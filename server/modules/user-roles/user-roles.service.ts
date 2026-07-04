import prisma from '../../db'
import type { UserRole } from './user-roles.types'

export async function findAll(): Promise<UserRole[]> {
  return prisma.user_role.findMany({
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
      role: { select: { id_role: true, role_code: true, name: true } },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as UserRole[]
}

export async function findById(id: number): Promise<UserRole | null> {
  return prisma.user_role.findUnique({
    where: { iduser_role: id },
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
      role: { select: { id_role: true, role_code: true, name: true } },
    },
  }) as unknown as UserRole | null
}

export async function findByEmail(email: string): Promise<UserRole[]> {
  return prisma.user_role.findMany({
    where: { email },
    include: {
      role: { select: { id_role: true, role_code: true, name: true } },
    },
    orderBy: { date_created: 'desc' },
  }) as unknown as UserRole[]
}

export async function create(
  data: Pick<UserRole, 'email' | 'role_code'> &
    Partial<Pick<UserRole, 'user_created' | 'user_modified'>>
): Promise<UserRole> {
  return prisma.user_role.create({
    data: {
      email: data.email,
      role_code: data.role_code,
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
    },
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
      role: { select: { id_role: true, role_code: true, name: true } },
    },
  }) as unknown as UserRole
}

export async function update(
  id: number,
  data: Partial<Pick<UserRole, 'role_code' | 'status' | 'user_modified'>>
): Promise<UserRole | null> {
  const existing = await prisma.user_role.findUnique({ where: { iduser_role: id } })
  if (!existing) return null

  return prisma.user_role.update({
    where: { iduser_role: id },
    data: { ...data, user_modified: data.user_modified ?? 'SYSTEM' },
    include: {
      user: { select: { id_user: true, email: true, full_name: true } },
      role: { select: { id_role: true, role_code: true, name: true } },
    },
  }) as unknown as UserRole
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.user_role.findUnique({ where: { iduser_role: id } })
  if (!existing) return false
  await prisma.user_role.delete({ where: { iduser_role: id } })
  return true
}

export async function findByEmailAndRole(email: string, role_code: string): Promise<UserRole | null> {
  return prisma.user_role.findUnique({
    where: { email_role_code: { email, role_code } },
    include: {
      role: { select: { id_role: true, role_code: true, name: true } },
    },
  }) as unknown as UserRole | null
}
