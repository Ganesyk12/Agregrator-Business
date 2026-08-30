import {
  S3Client,
  PutObjectCommand,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import { env } from '../../config/env'

const PREFIX = 'uploads'

/**
 * S3-compatible client for Cloudflare R2.
 * Endpoint is derived from R2_ACCOUNT_ID unless R2_ENDPOINT is provided.
 */
function createR2Client(): S3Client {
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${env.r2AccountId}.r2.cloudflarestorage.com`

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: env.r2AccessKeyId,
      secretAccessKey: env.r2SecretAccessKey,
    },
  })
}

const client = createR2Client()

/**
 * True when enough R2 config is present to attempt an upload to the bucket.
 * Sentinel/placeholder values (e.g. "your-r2-account-id") are treated as
 * not-configured so the disk fallback is used until real credentials are set.
 */
export function isR2Configured(): boolean {
  const values = [
    env.r2AccountId,
    env.r2AccessKeyId,
    env.r2SecretAccessKey,
    env.r2Bucket,
  ]
  return values.every(
    (v) => Boolean(v) && !/^your-r2-|your-bucket-name/i.test(v || ''),
  )
}

/**
 * Public base URL for served objects.
 * Prefer a custom/public domain, else the R2 bucket S3 endpoint.
 */
function publicBaseUrl(): string {
  const custom = (env.r2PublicUrl || '').replace(/\/+$/, '')
  if (custom) return custom
  const endpoint =
    process.env.R2_ENDPOINT ||
    `https://${env.r2AccountId}.r2.cloudflarestorage.com`
  return `${endpoint}/${env.r2Bucket}`
}

export interface UploadFile {
  body: Buffer | Uint8Array
  contentType?: string
  key?: string
}

/**
 * Save an uploaded file to Cloudflare R2 under `sigyn-project/uploads/<folder>/<category>/...`
 * and return its full public URL.
 */
async function uploadToR2(
  folder: string,
  category: string,
  params: UploadFile,
): Promise<string> {
  const key = `${PREFIX}/${folder}/${category}/${params.key || ''}`
  const cleanKey = key.replace(/\/{2,}/g, '/')

  const input: PutObjectCommandInput = {
    Bucket: env.r2Bucket,
    Key: cleanKey,
    Body: params.body,
  }
  if (params.contentType) {
    input.ContentType = params.contentType
  }

  await client.send(new PutObjectCommand(input))

  return `${publicBaseUrl()}/${cleanKey}`
}

/**
 * Fallback: store the file on local disk under `public/uploads/<folder>/<category>/...`
 * and return the relative URL served by the static `/uploads` mount.
 */
async function uploadToDisk(
  folder: string,
  category: string,
  params: UploadFile,
): Promise<string> {
  const targetDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    folder,
    category,
  )
  fs.mkdirSync(targetDir, { recursive: true })

  const filename = params.key || `${Date.now()}-${Math.round(Math.random() * 1e9)}`
  await fs.promises.writeFile(path.join(targetDir, filename), params.body)

  return `/uploads/${folder}/${category}/${filename}`
}

/**
 * Save an uploaded file, preferring Cloudflare R2 and falling back to local
 * disk when R2 is not configured.
 *
 * @param folder  e.g. "portfolio" or "payment"
 * @param category  sub-folder segment (vendors, products, request numbers, etc.)
 * @param params  the file body + metadata
 * @returns the access URL of the stored object
 */
export async function saveUpload(
  folder: string,
  category: string,
  params: UploadFile,
): Promise<string> {
  if (isR2Configured()) {
    return uploadToR2(folder, category, params)
  }
  return uploadToDisk(folder, category, params)
}

export default client
