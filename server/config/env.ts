import 'dotenv/config'

function req(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env variable: ${key}`)
  return val
}

// First non-empty value among the given env keys (supports both naming styles).
function or(...keys: string[]): string {
  for (const key of keys) {
    const val = process.env[key]
    if (val) return val
  }
  return ''
}

export const env = {
  port: Number(req('PORT')),
  nodeEnv: req('NODE_ENV'),
  jwtSecret: req('JWT_SECRET'),
  corsOrigin: req('CORS_ORIGIN'),
  databaseUrl: req('DATABASE_URL'),
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY || '',
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || '',
  midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  r2AccountId: process.env.R2_ACCOUNT_ID || '',
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  r2Bucket: or('R2_BUCKET_NAME', 'R2_BUCKET'),
  r2PublicUrl: or('R2_PUBLIC_DOMAIN', 'R2_PUBLIC_URL'),
}

