import type { Request, Response, NextFunction } from 'express'
import * as smtpService from './smtp.service'

/**
 * GET /api/smtp
 * Get SMTP configuration (safe without raw password)
 */
export async function getConfig(_req: Request, res: Response, next: NextFunction) {
  try {
    const config = await smtpService.getConfig()
    res.json({ data: config })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/smtp
 * Update SMTP configuration
 */
export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const userModified = req.user?.email || 'ADMIN'
    const updated = await smtpService.updateConfig(req.body, userModified)
    res.json({
      message: 'Konfigurasi SMTP berhasil diperbarui',
      data: updated
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/smtp/test
 * Test SMTP connection and send a sample verification email
 */
export async function testConnection(req: Request, res: Response, _next: NextFunction) {
  try {
    const result = await smtpService.testConnection(req.body)
    res.json({
      message: result.message,
      data: result.info
    })
  } catch (err: any) {
    res.status(400).json({
      error: {
        message: err.message || 'Koneksi SMTP gagal. Periksa kembali host, port, username, dan password Anda.'
      }
    })
  }
}
