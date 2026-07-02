import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=sigyn',
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
