import prisma from '../../db'

export async function findByUser(userId: number) {
  return prisma.userFavorite.findMany({
    where: { id_user: userId },
    include: {
      package: {
        include: {
          vendor: { select: { id_vendor: true, business_name: true } },
          category: { select: { category_name: true } },
        },
      },
    },
    orderBy: { date_created: 'desc' },
  })
}

export async function add(userId: number, packageId: number) {
  const existing = await prisma.userFavorite.findUnique({
    where: { id_user_id_package: { id_user: userId, id_package: packageId } },
  })
  if (existing) return existing
  return prisma.userFavorite.create({
    data: { id_user: userId, id_package: packageId },
  })
}

export async function remove(userId: number, packageId: number) {
  const existing = await prisma.userFavorite.findUnique({
    where: { id_user_id_package: { id_user: userId, id_package: packageId } },
  })
  if (!existing) return false
  await prisma.userFavorite.delete({ where: { id_favorite: existing.id_favorite } })
  return true
}

export async function isFavorited(userId: number, packageId: number) {
  const existing = await prisma.userFavorite.findUnique({
    where: { id_user_id_package: { id_user: userId, id_package: packageId } },
  })
  return !!existing
}
