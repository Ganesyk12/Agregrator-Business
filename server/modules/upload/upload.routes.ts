import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const idVendor = req.query.id_vendor || req.body.id_vendor
    const subdir = idVendor ? `vendor-${idVendor}` : 'general'
    const targetDir = path.join(uploadDir, subdir)

    // Ensure the subdirectory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    cb(null, targetDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

// File filter (accept images and videos)
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm'
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
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit to support video files
  }
})

/**
 * @openapi
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload media (gambar/video) ke server
 *     parameters:
 *       - in: query
 *         name: id_vendor
 *         schema: { type: integer }
 *         description: ID Vendor untuk mengklasifikasikan folder upload
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
router.post('/', upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: { message: 'File tidak ditemukan' } })
      return
    }

    const idVendor = req.query.id_vendor || req.body.id_vendor
    const subdir = idVendor ? `vendor-${idVendor}` : 'general'

    // Return relative path accessible statically
    const fileUrl = `/uploads/${subdir}/${req.file.filename}`
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    })
  } catch (error: any) {
    res.status(500).json({ error: { message: error.message } })
  }
})

export default router
