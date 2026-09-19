import nodemailer from 'nodemailer'
import prisma from '../../db'
import { env } from '../../config/env'
import type { SmtpSetting, SmtpSettingResponse, UpdateSmtpInput, TestSmtpInput, SendMailOptions } from './smtp.types'

/**
 * Get raw SMTP config from database or create default if not exists
 */
export async function getRawConfig(): Promise<SmtpSetting> {
  const existing = await prisma.smtpSetting.findFirst({
    orderBy: { id_smtp: 'asc' }
  })

  if (existing) {
    return existing as SmtpSetting
  }

  // Create initial default configuration record
  const created = await prisma.smtpSetting.create({
    data: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from_name: 'SIGYN',
      from_email: '',
      is_active: false,
      user_created: 'SYSTEM'
    }
  })

  return created as SmtpSetting
}

/**
 * Get safe SMTP config for API response (masks sensitive password)
 */
export async function getConfig(): Promise<SmtpSettingResponse> {
  const raw = await getRawConfig()
  return {
    id_smtp: raw.id_smtp,
    host: raw.host,
    port: raw.port,
    secure: raw.secure,
    username: raw.username,
    has_password: Boolean(raw.password && raw.password.length > 0),
    from_name: raw.from_name,
    from_email: raw.from_email,
    is_active: raw.is_active,
    date_created: raw.date_created,
    date_modified: raw.date_modified,
    is_dev_mode: env.isDevelopment,
    dev_target_emails: env.mailDevTargetEmails,
  }
}

/**
 * Update SMTP settings
 */
export async function updateConfig(data: UpdateSmtpInput, userModified: string = 'SYSTEM'): Promise<SmtpSettingResponse> {
  const current = await getRawConfig()

  const updateData: any = {
    user_modified: userModified
  }

  if (data.host !== undefined) updateData.host = data.host
  if (data.port !== undefined) updateData.port = Number(data.port)
  if (data.secure !== undefined) updateData.secure = Boolean(data.secure)
  if (data.username !== undefined) updateData.username = data.username.trim()
  if (data.from_name !== undefined) updateData.from_name = data.from_name
  if (data.from_email !== undefined) updateData.from_email = data.from_email.trim()
  if (data.is_active !== undefined) updateData.is_active = Boolean(data.is_active)

  // Only update password if a non-empty string was provided
  if (data.password !== undefined && data.password.trim() !== '') {
    updateData.password = data.password.trim()
  }

  const updated = await prisma.smtpSetting.update({
    where: { id_smtp: current.id_smtp },
    data: updateData
  })

  return {
    id_smtp: updated.id_smtp,
    host: updated.host,
    port: updated.port,
    secure: updated.secure,
    username: updated.username,
    has_password: Boolean(updated.password && updated.password.length > 0),
    from_name: updated.from_name,
    from_email: updated.from_email,
    is_active: updated.is_active,
    date_created: updated.date_created,
    date_modified: updated.date_modified,
  }
}

/**
 * Create a nodemailer transporter using provided config or DB config
 */
function createTransporter(config: {
  host: string
  port: number
  secure: boolean
  username: string
  password?: string
}) {
  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: Boolean(config.secure),
    auth: {
      user: config.username,
      pass: config.password || '',
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

/**
 * Test SMTP connection and send a test verification email
 */
export async function testConnection(input: TestSmtpInput): Promise<{ success: boolean; message: string; info?: any }> {
  const current = await getRawConfig()

  const host = input.host || current.host
  const port = input.port !== undefined ? Number(input.port) : current.port
  const secure = input.secure !== undefined ? Boolean(input.secure) : current.secure
  const username = input.username !== undefined ? input.username : current.username
  const password = input.password && input.password.trim() !== '' ? input.password : current.password
  const fromName = input.from_name || current.from_name || 'SIGYN'
  const fromEmail = input.from_email || current.from_email || username

  if (!host || !port || !username || !password) {
    throw new Error('SMTP Host, Port, Username, dan Password wajib diisi untuk melakukan test koneksi.')
  }

  if (!input.target_email) {
    throw new Error('Target email tujuan untuk test wajib diisi.')
  }

  const transporter = createTransporter({ host, port, secure, username, password })

  // 1. Verify connection handshake
  await transporter.verify()

  // 2. Send test email
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: input.target_email,
    subject: `[TEST] SIGYN SMTP Configuration Test - ${new Date().toLocaleString('id-ID')}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2a2a2a; margin: 0 0 6px; font-size: 24px;">SIGYN SMTP Mailer</h2>
          <p style="color: #777; margin: 0; font-size: 14px;">System Notification Test</p>
        </div>
        <div style="background: #f8f9fa; border-left: 4px solid #b89c7b; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #2a2a2a; font-size: 15px; line-height: 1.5;">
            <strong>Koneksi SMTP Berhasil!</strong><br/>
            Email ini dikirim secara otomatis sebagai verifikasi bahwa konfigurasi SMTP Administrator pada platform SIGYN telah terhubung dengan benar.
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #555; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 140px;"><strong>SMTP Host:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${host}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Port:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${port} (${secure ? 'SSL/TLS' : 'STARTTLS/Plain'})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Username / Email:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sender:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">"${fromName}" &lt;${fromEmail}&gt;</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Waktu Kirim:</strong></td>
            <td style="padding: 8px 0;">${new Date().toLocaleString('id-ID')}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} SIGYN Business Platform. All rights reserved.
        </p>
      </div>
    `,
    text: `SIGYN SMTP Test. Koneksi SMTP Berhasil! Email ini dikirim ke ${input.target_email} dari ${fromEmail}.`
  })

  return {
    success: true,
    message: `Test email berhasil dikirim ke ${input.target_email}`,
    info: {
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response
    }
  }
}

/**
 * Universal mailer function for sending transactional emails anywhere in SIGYN
 */
export async function sendEmail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; reason?: string }> {
  try {
    const config = await getRawConfig()

    if (!config.is_active) {
      console.warn('[Mailer] Pengiriman email dilewati karena SMTP dinonaktifkan di pengaturan.')
      return { success: false, reason: 'SMTP is disabled' }
    }

    if (!config.host || !config.username || !config.password) {
      console.warn('[Mailer] Pengiriman email dilewati karena konfigurasi SMTP belum lengkap.')
      return { success: false, reason: 'SMTP configuration is incomplete' }
    }

    const transporter = createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password
    })

    const fromName = config.from_name || 'SIGYN'
    const fromEmail = config.from_email || config.username

    let targetRecipients: string | string[] = options.to
    let mailSubject = options.subject
    let mailHtml = options.html
    let mailText = options.text

    // Check if in development mode and dev target emails are configured
    const isDev = env.isDevelopment
    const devTargets = env.mailDevTargetEmails

    if (isDev && devTargets.length > 0) {
      const originalRecipients = Array.isArray(options.to) ? options.to.join(', ') : options.to
      targetRecipients = devTargets
      mailSubject = `[DEV] ${mailSubject}`

      console.log(`[Mailer Dev Mode] Mengalihkan email dari [${originalRecipients}] ke target dev: [${devTargets.join(', ')}]`)

      if (mailHtml) {
        mailHtml = `
          <div style="background: #fff3cd; border: 1.5px solid #ffeeba; color: #856404; padding: 12px 16px; border-radius: 8px; font-family: sans-serif; font-size: 13px; margin-bottom: 20px;">
            <strong>⚠️ [DEVELOPMENT MODE EMAIL INTERCEPTOR]</strong><br/>
            Email ini dialihkan ke target email pengujian developer.<br/>
            <strong>Penerima Asli:</strong> <code>${originalRecipients}</code><br/>
            <strong>Penerima Dev:</strong> <code>${devTargets.join(', ')}</code>
          </div>
          ${mailHtml}
        `
      }

      if (mailText) {
        mailText = `[DEV MODE REDIRECT - Penerima Asli: ${originalRecipients}]\n\n${mailText}`
      }
    }

    const info = await transporter.sendMail({
      from: options.from || `"${fromName}" <${fromEmail}>`,
      to: targetRecipients,
      subject: mailSubject,
      html: mailHtml,
      text: mailText
    })

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('[Mailer Error]:', error.message || error)
    return {
      success: false,
      reason: error.message || 'Failed to send email'
    }
  }
}

