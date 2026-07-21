import prisma from '../../db'
import type { ContactMessage } from './contact-messages.types'

export async function create(data: Pick<ContactMessage, 'name' | 'email' | 'message'> & Partial<Pick<ContactMessage, 'subject'>>): Promise<ContactMessage> {
  return prisma.contactMessage.create({ data }) as unknown as ContactMessage
}

export async function findAll(): Promise<ContactMessage[]> {
  return prisma.contactMessage.findMany({ orderBy: { date_created: 'desc' } }) as unknown as ContactMessage[]
}

export async function markAsRead(id: number): Promise<ContactMessage | null> {
  const existing = await prisma.contactMessage.findUnique({ where: { id_message: id } })
  if (!existing) return null
  return prisma.contactMessage.update({ where: { id_message: id }, data: { is_read: true } }) as unknown as ContactMessage
}
