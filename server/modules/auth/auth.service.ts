import prisma from '../../db'
import type { User } from '../users/users.types'

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
    include: { role: { select: { id_role: true, role_code: true, name: true } } },
  }) as unknown as User | null
}
