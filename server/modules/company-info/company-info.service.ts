import prisma from '../../db'

export async function get() {
  let info = await prisma.companyInfo.findFirst({ orderBy: { id_company: 'asc' } })
  if (!info) {
    info = await prisma.companyInfo.create({ data: {} })
  }
  return info
}

export async function update(data: Record<string, any>) {
  let info = await prisma.companyInfo.findFirst({ orderBy: { id_company: 'asc' } })
  if (!info) {
    info = await prisma.companyInfo.create({ data: {} })
  }
  return prisma.companyInfo.update({
    where: { id_company: info.id_company },
    data,
  })
}
