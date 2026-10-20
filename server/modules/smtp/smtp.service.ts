import nodemailer from 'nodemailer'
import prisma from '../../db'
import { env } from '../../config/env'
import type {
  SmtpSetting,
  SmtpSettingResponse,
  UpdateSmtpInput,
  TestSmtpInput,
  SendMailOptions,
  BookingEmailPayload,
  OrderEmailPayload,
  PaymentRequestEmailPayload,
  ReceiptEmailPayload,
  NotificationEmailPayload
} from './smtp.types'
import {
  renderBookingEmail,
  renderOrderEmail,
  renderPaymentRequestEmail,
  renderReceiptEmail,
  renderNotificationEmail
} from './email-templates'

type MailProvider = 'resend' | 'smtp'

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

interface TestEmailResult {
  success: boolean
  provider: MailProvider
  message: string
  info?: any
  warning?: string
}

function buildTestEmail(params: {
  provider: MailProvider
  fromName: string
  fromEmail: string
  details: Array<{ label: string; value: string }>
}): { html: string; text: string } {
  const providerLabel = params.provider === 'resend' ? 'Resend API' : 'SMTP'
  const detailRows = params.details
    .map(
      detail => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 160px;"><strong>${detail.label}:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${detail.value}</td>
          </tr>`
    )
    .join('')

  return {
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2a2a2a; margin: 0 0 6px; font-size: 24px;">SIGYN Email Mailer</h2>
          <p style="color: #777; margin: 0; font-size: 14px;">System Notification Test</p>
        </div>
        <div style="background: #f8f9fa; border-left: 4px solid #b89c7b; padding: 16px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #2a2a2a; font-size: 15px; line-height: 1.5;">
            <strong>Koneksi ${providerLabel} Berhasil!</strong><br/>
            Email ini dikirim secara otomatis sebagai verifikasi bahwa konfigurasi email Administrator pada platform SIGYN telah terhubung dengan benar.
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #555; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 160px;"><strong>Provider:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${providerLabel}</td>
          </tr>${detailRows}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Sender:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">"${params.fromName}" &lt;${params.fromEmail}&gt;</td>
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
    text: `SIGYN ${providerLabel} Test. Koneksi ${providerLabel} berhasil. Email ini dikirim dari ${params.fromEmail}.`
  }
}

/**
 * Test the email pipeline: Resend API first, then SMTP fallback.
 */
export async function testConnection(input: TestSmtpInput): Promise<TestEmailResult> {
  const current = await getRawConfig()

  if (!input.target_email) {
    throw new Error('Target email tujuan untuk test wajib diisi.')
  }

  const subject = `[TEST] SIGYN Email Configuration Test - ${new Date().toLocaleString('id-ID')}`
  const failures: string[] = []

  // 1. Primary provider: Resend API
  if (env.resendApiKey) {
    const fromName = env.resendFromName || input.from_name || current.from_name || 'SIGYN'
    const fromEmail = env.resendFromEmail || input.from_email || current.from_email || current.username

    if (fromEmail) {
      try {
        const { html, text } = buildTestEmail({
          provider: 'resend',
          fromName,
          fromEmail,
          details: [{ label: 'From Email', value: fromEmail }]
        })

        const messageId = await sendViaResend({
          from: `"${fromName}" <${fromEmail}>`,
          to: input.target_email,
          subject,
          html,
          text
        })

        return {
          success: true,
          provider: 'resend',
          message: `Test email berhasil dikirim via Resend ke ${input.target_email}`,
          info: { messageId, from: fromEmail }
        }
      } catch (error: any) {
        const reason = error.message || String(error)
        failures.push(`Resend: ${reason}`)
        console.warn('[Mailer] Test Resend gagal, fallback ke SMTP:', reason)
      }
    } else {
      failures.push('Resend: alamat pengirim belum diset (RESEND_FROM_EMAIL)')
    }
  }

  // 2. Fallback provider: SMTP
  const host = input.host || current.host
  const port = input.port !== undefined ? Number(input.port) : current.port
  const secure = input.secure !== undefined ? Boolean(input.secure) : current.secure
  const username = input.username !== undefined ? input.username : current.username
  const password = input.password && input.password.trim() !== '' ? input.password : current.password
  const fromName = input.from_name || current.from_name || 'SIGYN'
  const fromEmail = input.from_email || current.from_email || username

  if (!host || !port || !username || !password) {
    failures.push('SMTP: Host, Port, Username, dan Password wajib diisi')
    throw new Error(`Test email gagal. ${failures.join(' | ')}`)
  }

  try {
    const transporter = createTransporter({ host, port, secure, username, password })

    await transporter.verify()

    const { html, text } = buildTestEmail({
      provider: 'smtp',
      fromName,
      fromEmail,
      details: [
        { label: 'SMTP Host', value: host },
        { label: 'Port', value: `${port} (${secure ? 'SSL/TLS' : 'STARTTLS/Plain'})` }
      ]
    })

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: input.target_email,
      subject,
      html,
      text
    })

    return {
      success: true,
      provider: 'smtp',
      message: `Test email berhasil dikirim via SMTP ke ${input.target_email}`,
      info: {
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response
      },
      warning: failures.length > 0 ? failures.join(' | ') : undefined
    }
  } catch (error: any) {
    failures.push(`SMTP: ${error.message || String(error)}`)
    throw new Error(`Test email gagal. ${failures.join(' | ')}`)
  }
}

function resolveSender(config: SmtpSetting, override?: string): string {
  if (override) return override

  const fromName = env.resendFromName || config.from_name || 'SIGYN'
  const fromEmail = env.resendFromEmail || config.from_email || config.username

  return `"${fromName}" <${fromEmail}>`
}

/**
 * Send an email through Resend REST API.
 */
async function sendViaResend(params: {
  from: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
}): Promise<string> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: params.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      ...(params.html ? { html: params.html } : {}),
      ...(params.text ? { text: params.text } : {}),
      ...(env.resendReplyTo ? { reply_to: env.resendReplyTo } : {})
    })
  })

  const data = (await response.json().catch(() => ({}))) as {
    id?: string
    message?: string
    name?: string
  }

  if (!response.ok) {
    throw new Error(data.message || data.name || `Resend API error (${response.status})`)
  }

  if (!data.id) {
    throw new Error('Resend API tidak mengembalikan message id')
  }

  return data.id
}

/**
 * Universal mailer function for sending transactional emails anywhere in SIGYN.
 * Priority: Resend API, with SMTP as fallback.
 */
export async function sendEmail(
  options: SendMailOptions
): Promise<{ success: boolean; messageId?: string; reason?: string; provider?: MailProvider }> {
  try {
    const config = await getRawConfig()

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

    const sender = resolveSender(config, options.from)

    // Primary provider: Resend API
    if (env.resendApiKey) {
      const resendFromEmail = env.resendFromEmail || config.from_email || config.username

      if (options.from || resendFromEmail) {
        try {
          const messageId = await sendViaResend({
            from: sender,
            to: targetRecipients,
            subject: mailSubject,
            html: mailHtml,
            text: mailText
          })

          return { success: true, messageId, provider: 'resend' }
        } catch (error: any) {
          console.warn('[Mailer] Resend gagal, mencoba fallback ke SMTP:', error.message || error)
        }
      } else {
        console.warn('[Mailer] Resend aktif tetapi alamat pengirim belum diset (RESEND_FROM_EMAIL). Fallback ke SMTP.')
      }
    }

    // Fallback provider: SMTP
    if (!config.is_active) {
      console.warn('[Mailer] Pengiriman email via SMTP dilewati karena SMTP dinonaktifkan di pengaturan.')
      return { success: false, reason: 'Resend failed and SMTP is disabled' }
    }

    if (!config.host || !config.username || !config.password) {
      console.warn('[Mailer] Pengiriman email via SMTP dilewati karena konfigurasi SMTP belum lengkap.')
      return { success: false, reason: 'Resend failed and SMTP configuration is incomplete' }
    }

    const transporter = createTransporter({
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password
    })

    const info = await transporter.sendMail({
      from: sender,
      to: targetRecipients,
      subject: mailSubject,
      html: mailHtml,
      text: mailText
    })

    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp'
    }
  } catch (error: any) {
    console.error('[Mailer Error]:', error.message || error)
    return {
      success: false,
      reason: error.message || 'Failed to send email'
    }
  }
}


//  Modular: Kirim Bukti / Konfirmasi Booking
 
export async function sendBookingConfirmationEmail(
  to: string | string[],
  payload: BookingEmailPayload
) {
  const { subject, html, text } = renderBookingEmail(payload)
  return sendEmail({ to, subject, html, text })
}


//  Modular: Kirim Invoice / Konfirmasi Pesanan (Order)
export async function sendOrderInvoiceEmail(
  to: string | string[],
  payload: OrderEmailPayload
) {
  const { subject, html, text } = renderOrderEmail(payload)
  return sendEmail({ to, subject, html, text })
}

//  Modular: Kirim Permintaan Pembayaran / RFP (Request For Payment)
export async function sendPaymentRequestEmail(
  to: string | string[],
  payload: PaymentRequestEmailPayload
) {
  const { subject, html, text } = renderPaymentRequestEmail(payload)
  return sendEmail({ to, subject, html, text })
}


//  Modular: Kirim Kuitansi / Bukti Pembayaran (Receipt)
export async function sendReceiptEmail(
  to: string | string[],
  payload: ReceiptEmailPayload
) {
  const { subject, html, text } = renderReceiptEmail(payload)
  return sendEmail({ to, subject, html, text })
}


//  Modular: Kirim Notifikasi Umum (Alert / Info)
export async function sendNotificationEmail(
  to: string | string[],
  payload: NotificationEmailPayload
) {
  const { subject, html, text } = renderNotificationEmail(payload)
  return sendEmail({ to, subject, html, text })
}

