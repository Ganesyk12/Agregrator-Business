import 'dotenv/config'
import {
  S3Client,
  ListBucketsCommand,
  HeadBucketCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import fs from 'fs'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || ''
const R2_ENDPOINT = process.env.R2_ENDPOINT || ''
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || ''

const endpoint =
  R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

function ok(msg: string) {
  console.log(`${GREEN}✓${RESET} ${msg}`)
}
function fail(msg: string) {
  console.log(`${RED}✗${RESET} ${msg}`)
}
function warn(msg: string) {
  console.log(`${YELLOW}!${RESET} ${msg}`)
}

async function main() {
  console.log('=== Cloudflare R2 Connection Test ===\n')

  console.log('Config summary (secrets masked):')
  console.log(
    `  R2_ACCOUNT_ID  : ${R2_ACCOUNT_ID ? R2_ACCOUNT_ID.slice(0, 6) + '…' : '(kosong)'}`,
  )
  console.log(
    `  R2_ACCESS_KEY  : ${R2_ACCESS_KEY_ID ? R2_ACCESS_KEY_ID.slice(0, 6) + '…' : '(kosong)'}`,
  )
  console.log(`  R2_SECRET      : ${R2_SECRET_ACCESS_KEY ? '(terisi)' : '(kosong)'}`)
  console.log(`  R2_BUCKET      : ${R2_BUCKET || '(kosong)'}`)
  console.log(`  R2_ENDPOINT    : ${endpoint}`)
  console.log(`  R2_PUBLIC_URL  : ${R2_PUBLIC_URL || '(kosong)'}`)
  console.log('')

  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET
  ) {
    fail('Kredensial R2 belum lengkap di .env. Test dibatalkan.')
    process.exit(1)
  }

  // 1. List buckets — memastikan token valid & bisa autentikasi
  // Catatan: token bucket-scoped akan gagal ListBuckets (AccessDenied) itu normal.
  // Yang menentukan upload adalah HeadBucket + PutObject ke bucket spesifik.
  console.log('1) List bucket (uji autentikasi token)…')
  try {
    const list = await client.send(new ListBucketsCommand())
    const names = (list.Buckets || []).map((b: any) => b.Name)
    ok(`Token berhasil autentikasi. Bucket terlihat: ${names.join(', ') || '(tidak ada)'}`)
    if (!names.includes(R2_BUCKET)) {
      warn(`Bucket "${R2_BUCKET}" tidak ada dalam daftar yang terlihat oleh token.`)
    }
  } catch (e: any) {
    warn(`List bucket gagal (${e.name}: ${e.message}). Lanjut ke tes bucket spesifik…`)
  }

  // 2. Head bucket — pastikan bucket yang dimaksud ada & bisa diakses
  console.log(`2) Head bucket "${R2_BUCKET}"…`)
  try {
    await client.send(new HeadBucketCommand({ Bucket: R2_BUCKET }))
    ok(`Bucket "${R2_BUCKET}" ada dan bisa diakses.`)
  } catch (e: any) {
    fail(`Head bucket "${R2_BUCKET}" gagal: ${e.name} — ${e.message}`)
  }

  // 3. Upload file test
  console.log('3) Upload file test ke bucket…')
  const testPath = process.argv[2] || 'test-file.txt'
  const key = `sigyn-project/uploads/_test/${Date.now()}-upload-test.txt`

  if (!fs.existsSync(testPath)) {
    fail(`File test "${testPath}" tidak ditemukan.`)
    process.exit(1)
  }

  const body = fs.readFileSync(testPath)
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: 'text/plain',
      }),
    )
    ok(`Upload berhasil ke key: ${key}`)
  } catch (e: any) {
    fail(`Upload gagal: ${e.name} — ${e.message}`)
    process.exit(1)
  }

  // 4. Verifikasi objek ada
  console.log('4) Verifikasi objek…')
  try {
    await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    ok('Objek terkonfirmasi ada.')
  } catch (e: any) {
    fail(`Verifikasi objek gagal: ${e.name} — ${e.message}`)
  }

  // 5. Coba baca public URL (jika R2_PUBLIC_URL diisi)
  if (R2_PUBLIC_URL) {
    console.log('5) Test akses public URL…')
    const publicUrl = `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`
    try {
      const resp = await fetch(publicUrl)
      if (resp.ok) {
        ok(`Public URL bisa diakses: ${publicUrl}`)
      } else {
        warn(`Public URL mengembalikan status ${resp.status} (mungkin bucket private / butuh domain).`)
      }
    } catch (e: any) {
      warn(`Gagal mengakses public URL (${e.message}).`)
    }
  }

  console.log('\n=== Selesai ===')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
