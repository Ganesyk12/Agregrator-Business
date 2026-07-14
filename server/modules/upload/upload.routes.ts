import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
const router = Router()

const baseDir = path.join(process.cwd(), 'public', 'uploads', 'portfolio')

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    try {
      const vendorCode = req.query.vendor_code || req.body.vendor_code
      const category = req.query.category || req.body.category || 'uncategorized'

      if (!vendorCode) {
        cb(new Error('vendor_code is required'), '')
        return
      }

      const targetDir = path.join(baseDir, vendorCode, category)
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      cb(null, targetDir)
    } catch (err: any) {
      cb(err, '')
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

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

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
})

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload media (gambar/video)
 *     parameters:
 *       - in: query
 *         name: vendor_code
 *         schema: { type: string }
 *         required: true
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
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: { message: err.message } })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: { message: 'File tidak ditemukan' } })
      }

      const vendorCode = req.query.vendor_code || req.body.vendor_code
      const category = req.query.category || req.body.category || 'uncategorized'
      const fileUrl = `/uploads/portfolio/${vendorCode}/${category}/${req.file.filename}`

      res.json({
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      })
    } catch (error: any) {
      res.status(500).json({ error: { message: error.message } })
    }
  })
})

export default router
