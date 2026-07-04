import prisma from '../../db'
import type { User } from './users.types'

const userSelect = {
  id_user: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  is_active: true,
  status: true,
  date_created: true,
  date_modified: true,
  user_created: true,
  user_modified: true,
  user_roles: {
    select: { role: { select: { id_role: true, role_code: true, name: true } } },
  },
} as const

export async function findAll(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      status: { not: 'deleted' },
    },
    select: userSelect,
    orderBy: { date_created: 'desc' },
  }) as unknown as User[]
}

export async function findById(id: number): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      id_user: id,
      status: { not: 'deleted' },
    },
    select: userSelect,
  }) as unknown as User | null
}

export async function create(
  data: Pick<User, 'email' | 'password' | 'full_name'> &
    Partial<Pick<User, 'phone' | 'avatar_url' | 'user_created' | 'user_modified'>>
): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password || '123456',
      full_name: data.full_name,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      user_created: data.user_created ?? 'SYSTEM',
      user_modified: data.user_modified ?? 'SYSTEM',
    },
    select: userSelect,
  }) as unknown as User
}

export async function update(
  id: number,
  data: Partial<Pick<User, 'email' | 'password' | 'full_name' | 'phone' | 'avatar_url' | 'is_active' | 'status' | 'user_modified'>>
): Promise<User | null> {
  const existing = await prisma.user.findFirst({
    where: {
      id_user: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return null

  const payload = {
    ...data,
    user_modified: data.user_modified ?? 'SYSTEM',
  }

  return prisma.user.update({
    where: { id_user: id },
    data: payload,
    select: userSelect,
  }) as unknown as User
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      email,
      status: { not: 'deleted' },
    },
    select: userSelect,
  }) as unknown as User | null
}

export async function remove(id: number): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      id_user: id,
      status: { not: 'deleted' },
    },
  })
  if (!existing) return false

  // Soft delete vendor if user is a vendor
  await prisma.vendor.updateMany({
    where: { id_user: id },
    data: { status: 'deleted' },
  })

  // Soft delete user
  await prisma.user.update({
    where: { id_user: id },
    data: { status: 'deleted' },
  })
  return true
}
