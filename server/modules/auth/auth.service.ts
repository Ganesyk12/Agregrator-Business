import prisma from '../../db'
import type { User } from '../users/users.types'

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } }) as unknown as User | null
}
