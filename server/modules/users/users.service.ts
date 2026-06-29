import prisma from '../../db'
import type { User } from './users.types'

export async function findAll(): Promise<User[]> {
  return prisma.user.findMany({
    select: {
      id_user: true,
      email: true,
      full_name: true,
      phone: true,
      avatar_url: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  }) as unknown as User[]
}

export async function findById(id: number): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id_user: id },
    select: {
      id_user: true,
      email: true,
      full_name: true,
      phone: true,
      avatar_url: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  }) as unknown as User | null
}

export async function create(data: Pick<User, 'email' | 'password' | 'full_name' | 'role'>): Promise<User> {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
    },
    select: {
      id_user: true,
      email: true,
      full_name: true,
      phone: true,
      avatar_url: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  }) as unknown as User
}
