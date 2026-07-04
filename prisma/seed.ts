import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database roles...')
  const roles = [
    { role_code: 'eUser-Admin', name: 'Admin' },
    { role_code: 'eUser-Vendor', name: 'Vendor' },
    { role_code: 'eUser-Customer', name: 'Customer' },
  ]
  for (const r of roles) {
    await prisma.role.upsert({
      where: { role_code: r.role_code },
      update: {},
      create: r,
    })
  }
  console.log('Database roles seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
