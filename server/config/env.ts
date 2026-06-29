import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  dbPath: process.env.DB_PATH || './server/db/data.sqlite',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
