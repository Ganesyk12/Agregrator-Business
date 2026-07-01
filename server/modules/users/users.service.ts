import prisma from '../../db'
import type { User } from './users.types'

const userSelect = {
  id_user: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  role_code: true,
  is_active: true,
  status: true,
  date_created: true,
  date_modified: true,
  user_created: true,
  user_modified: true,
} as const

export async function findAll(): Promise<User[]> {
  return prisma.user.findMany({
    select: { ...userSelect, role: { select: { id_role: true, role_code: true, name: true } } },
    orderBy: { date_created: 'desc' },
  }) as unknown as User[]
}

export async function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id_user: id },
    select: { ...userSelect, role: { select: { id_role: true, role_code: true, name: true } } },
  }) as unknown as User | null
}

export async function create(data: Pick<User, 'email' | 'password' | 'full_name' | 'role_code'>): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role_code: data.role_code,
    },
    select: { ...userSelect, role: { select: { id_role: true, role_code: true, name: true } } },
  }) as unknown as User
}
