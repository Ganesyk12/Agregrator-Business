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

function parseEmailList(val?: string): string[] {
  if (!val) return []
  return val
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0)
}

export const env = {
  port: Number(req('PORT')),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: (process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development',
  isProduction: (process.env.NODE_ENV || '').trim().toLowerCase() === 'production',
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
  mailDevTargetEmails: parseEmailList(process.env.MAIL_DEV_TARGET_EMAILS || process.env.DEV_MAIL_RECIPIENTS || ''),
}


