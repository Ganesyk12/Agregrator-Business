import 'dotenv/config'

function req(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env variable: ${key}`)
  return val
}

export const env = {
  port: Number(req('PORT')),
  nodeEnv: req('NODE_ENV'),
  jwtSecret: req('JWT_SECRET'),
  corsOrigin: req('CORS_ORIGIN'),
  databaseUrl: req('DATABASE_URL'),
}
