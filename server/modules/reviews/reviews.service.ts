import prisma from '../../db'

export async function findByVendor(vendorId: number) {
  return prisma.review.findMany({
    where: {
      id_vendor: vendorId,
      status: 'active',
    },
    include: {
      user: {
        select: {
          full_name: true,
          email: true,
        },
      },
      booking: {
        select: {
          id_booking: true,
        },
      },
    },
    orderBy: {
      date_created: 'desc',
    },
  })
}
