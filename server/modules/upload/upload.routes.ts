import { Router } from 'express'
import multer from 'multer'
import { saveUpload } from './r2.service'

const router = Router()

/**
 * In-memory storage: files are buffered then streamed to Cloudflare R2.
 */
const storage = multer.memoryStorage()

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm',
  ]
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Format file tidak didukung! Hanya gambar dan video yang diperbolehkan.'), false)
  }
}

// Per-file max 10MB. Total upload body per request max 50MB (fieldSize),
// so accumulation across multiple files in a single request stays bounded.
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 50 * 1024 * 1024,
  },
})

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload media (gambar/video) ke Cloudflare R2
 *     parameters:
 *       - in: query
 *         name: vendor_code
 *         schema: { type: string }
 *         required: false
 *         description: Kode unik vendor
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Kategori portfolio (e.g. fotografi, videografi)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string }
 *                 filename: { type: string }
 */
router.post('/', (req: any, res: any) => {
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      const code = (err as any)?.code
      const message =
        code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file melebihi batas maksimal 10 MB.'
          : err.message
      return res.status(400).json({ error: { message } })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'File tidak ditemukan' } })
      }

      let vendorCode = req.query.vendor_code || req.body?.vendor_code
      let category = req.query.category || req.body?.category || 'products'

      if (!vendorCode || typeof vendorCode !== 'string' || !vendorCode.trim()) {
        vendorCode = 'general'
      }
      if (!category || typeof category !== 'string' || !category.trim()) {
        category = 'products'
      }

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = sanitizeExt(req.file.originalname)
      const filename = `${uniqueSuffix}${ext}`

      const url = await saveUpload('portfolio', `${vendorCode}/${category}`, {
        body: req.file.buffer,
        contentType: req.file.mimetype,
        key: filename,
      })

      res.json({
        url,
        filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      })
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } })
    }
  })
})

router.post('/payment-proof', (req: any, res: any) => {
  const requestNumber = req.query.request_number || req.body.request_number || 'unknown'

  const paymentUpload = multer({
    storage,
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      cb(null, allowed.includes(file.mimetype))
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  })

  paymentUpload.single('file')(req, res, async (err: any) => {
    if (err) {
      const code = (err as any)?.code
      const message =
        code === 'LIMIT_FILE_SIZE'
          ? 'Ukuran file melebihi batas maksimal 10 MB.'
          : err.message
      return res.status(400).json({ error: { message } })
    }
    if (!req.file) return res.status(400).json({ error: { message: 'File tidak ditemukan' } })

    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = sanitizeExt(req.file.originalname)
      const filename = `${uniqueSuffix}${ext}`

      const url = await saveUpload('payment', `${requestNumber}`, {
        body: req.file.buffer,
        contentType: req.file.mimetype,
        key: filename,
      })

      res.json({
        url,
        filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      })
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } })
    }
  })
})

/**
 * Extract a safe lowercase file extension from the original filename.
 */
function sanitizeExt(originalname: string): string {
  const ext = originalname.split('.').pop() || ''
  return /^[a-z0-9]+$/i.test(ext) ? `.${ext.toLowerCase()}` : ''
}

export default router
