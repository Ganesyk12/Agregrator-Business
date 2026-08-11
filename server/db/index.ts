import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

// Extract schema from DATABASE_URL (e.g. ?schema=sigyn)
const schemaMatch = connectionString.match(/[?&]schema=([^&]+)/)
const searchPath = schemaMatch ? schemaMatch[1] : 'sigyn'

const pool = new pg.Pool({ connectionString })

// PrismaPg supports a 'schema' option that prepends the schema to all table names
const adapter = new PrismaPg(pool, { schema: searchPath })
const prisma = new PrismaClient({ adapter })

export default prisma
