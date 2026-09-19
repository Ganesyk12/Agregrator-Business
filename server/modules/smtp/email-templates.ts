import type {
  BookingEmailPayload,
  OrderEmailPayload,
  PaymentRequestEmailPayload,
  ReceiptEmailPayload,
  NotificationEmailPayload
} from './smtp.types'

/**
 * Format currency to IDR
 */
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date to Indonesian locale
 */
function formatDate(date?: string | Date): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Base email layout wrapper with responsive styling
 */
export function renderEmailLayout(options: {
  title: string
  preheader?: string
  content: string
  actionUrl?: string
  actionText?: string
  companyName?: string
}): string {
  const brandName = options.companyName || 'SIGYN Business'
  const year = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f4f6f9;
      padding: 30px 0;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      max-width: 600px;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
    }
    .header {
      background-color: #1e293b;
      padding: 24px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .body-content {
      padding: 32px;
    }
    .footer {
      background-color: #fafafa;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #eeeeee;
      font-size: 12px;
      color: #888888;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background-color: #1e293b;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    .details-table th, .details-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #edf2f7;
    }
    .details-table th {
      background-color: #f8fafc;
      color: #475569;
      text-align: left;
      font-weight: 600;
    }
    .total-row td {
      font-weight: 700;
      font-size: 15px;
      border-top: 2px solid #cbd5e1;
      border-bottom: none;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 4px;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-blue { background: #e0f2fe; color: #0369a1; }
    .badge-yellow { background: #fef9c3; color: #a16207; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header">
          <h1>${brandName}</h1>
        </td>
      </tr>
      <tr>
        <td class="body-content">
          ${options.content}
          ${
            options.actionUrl && options.actionText
              ? `<div style="text-align: center; margin-top: 28px;">
                  <a href="${options.actionUrl}" class="btn" target="_blank">${options.actionText}</a>
                </div>`
              : ''
          }
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px;">Email ini dikirim otomatis oleh sistem ${brandName}.</p>
          <p style="margin: 0;">&copy; ${year} ${brandName}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `
}

/**
 * Render Booking Confirmation Email HTML
 */
export function renderBookingEmail(payload: BookingEmailPayload): { subject: string; html: string; text: string } {
  const subject = `[Konfirmasi Booking] ${payload.packageName} ${payload.bookingCode ? `#${payload.bookingCode}` : ''}`
  
  const content = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Bukti Pemesanan / Booking</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
      Halo <strong>${payload.customerName}</strong>, terima kasih telah melakukan pemesanan. Berikut rincian booking Anda:
    </p>

    <table class="details-table">
      ${payload.bookingCode ? `
        <tr>
          <td style="color: #64748b; width: 140px;">No. Booking</td>
          <td style="font-weight: 600; color: #0f172a;">#${payload.bookingCode}</td>
        </tr>
      ` : ''}
      <tr>
        <td style="color: #64748b;">Paket Layanan</td>
        <td style="font-weight: 600; color: #0f172a;">${payload.packageName}</td>
      </tr>
      ${payload.vendorName ? `
        <tr>
          <td style="color: #64748b;">Vendor Penyedia</td>
          <td>${payload.vendorName}</td>
        </tr>
      ` : ''}
      ${payload.eventDate ? `
        <tr>
          <td style="color: #64748b;">Tanggal Acara</td>
          <td>${formatDate(payload.eventDate)}</td>
        </tr>
      ` : ''}
      ${payload.location ? `
        <tr>
          <td style="color: #64748b;">Lokasi Acara</td>
          <td>${payload.location}</td>
        </tr>
      ` : ''}
      ${payload.status ? `
        <tr>
          <td style="color: #64748b;">Status Booking</td>
          <td><span class="badge badge-green">${payload.status}</span></td>
        </tr>
      ` : ''}
      <tr class="total-row">
        <td>Total Biaya</td>
        <td style="color: #0284c7;">${formatRupiah(payload.totalAmount)}</td>
      </tr>
    </table>

    ${payload.notes ? `
      <div style="background-color: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 13px; color: #475569;">
        <strong>Catatan Tambahan:</strong><br/>
        ${payload.notes}
      </div>
    ` : ''}
  `

  const html = renderEmailLayout({
    title: subject,
    content,
    actionUrl: payload.viewUrl,
    actionText: 'Lihat Detail Booking'
  })

  const text = `Konfirmasi Booking: ${payload.packageName}\nHalo ${payload.customerName},\nBooking Anda telah terdaftar dengan total ${formatRupiah(payload.totalAmount)}.`

  return { subject, html, text }
}

/**
 * Render Order / Invoice Email HTML
 */
export function renderOrderEmail(payload: OrderEmailPayload): { subject: string; html: string; text: string } {
  const subject = `[Invoice Pesanan] Order #${payload.orderNumber}`

  const itemsRows = payload.items.map(item => `
    <tr>
      <td style="text-align: left;">${item.name}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${formatRupiah(item.price)}</td>
      <td style="text-align: right; font-weight: 600;">${formatRupiah(item.total)}</td>
    </tr>
  `).join('')

  const content = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Invoice Pesanan</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
      Halo <strong>${payload.customerName}</strong>, pesanan Anda dengan nomor <strong>#${payload.orderNumber}</strong> telah berhasil dibuat.
    </p>

    <table class="details-table">
      <thead>
        <tr>
          <th>Produk / Layanan</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Harga</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; color: #64748b;">Subtotal:</td>
          <td style="text-align: right;">${formatRupiah(payload.subtotal)}</td>
        </tr>
        ${payload.discountAmount ? `
          <tr>
            <td colspan="3" style="text-align: right; color: #16a34a;">Diskon:</td>
            <td style="text-align: right; color: #16a34a;">-${formatRupiah(payload.discountAmount)}</td>
          </tr>
        ` : ''}
        ${payload.shippingCost ? `
          <tr>
            <td colspan="3" style="text-align: right; color: #64748b;">Ongkos Kirim:</td>
            <td style="text-align: right;">${formatRupiah(payload.shippingCost)}</td>
          </tr>
        ` : ''}
        <tr class="total-row">
          <td colspan="3" style="text-align: right;">Grand Total:</td>
          <td style="text-align: right; color: #0284c7;">${formatRupiah(payload.grandTotal)}</td>
        </tr>
      </tfoot>
    </table>

    ${payload.shippingAddress ? `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; margin-top: 18px; font-size: 13px;">
        <strong style="color: #334155;">Informasi Pengiriman:</strong><br/>
        ${payload.recipientName ? `<strong>Penerima:</strong> ${payload.recipientName} (${payload.recipientPhone || '-' })<br/>` : ''}
        <strong>Alamat:</strong> ${payload.shippingAddress}
      </div>
    ` : ''}

    ${payload.greetingCardMessage ? `
      <div style="background-color: #f0f9ff; border-left: 3px solid #0ea5e9; padding: 12px 16px; margin-top: 14px; border-radius: 4px; font-size: 13px; color: #0369a1;">
        <strong>Pesan Greeting Card:</strong><br/>
        <em>"${payload.greetingCardMessage}"</em>
      </div>
    ` : ''}
  `

  const html = renderEmailLayout({
    title: subject,
    content,
    actionUrl: payload.viewUrl,
    actionText: 'Lihat Detail Pesanan'
  })

  const text = `Invoice Pesanan #${payload.orderNumber}\nHalo ${payload.customerName}, total pesanan Anda adalah ${formatRupiah(payload.grandTotal)}.`

  return { subject, html, text }
}

/**
 * Render Payment Request / RFP Email HTML
 */
export function renderPaymentRequestEmail(payload: PaymentRequestEmailPayload): { subject: string; html: string; text: string } {
  const subject = `[Permintaan Pembayaran] ${payload.termName || 'Tagihan'} Invoice #${payload.invoiceNumber}`

  const content = `
    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Permintaan Pembayaran (RFP)</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
      Halo <strong>${payload.recipientName}</strong>, berikut adalah rincian permintaan pembayaran untuk invoice <strong>#${payload.invoiceNumber}</strong>:
    </p>

    <table class="details-table">
      <tr>
        <td style="color: #64748b; width: 150px;">Term / Termin</td>
        <td style="font-weight: 600; color: #0f172a;">${payload.termName || 'Pembayaran'}</td>
      </tr>
      <tr>
        <td style="color: #64748b;">Jumlah Tagihan</td>
        <td style="font-weight: 700; color: #0284c7; font-size: 16px;">${formatRupiah(payload.amount)}</td>
      </tr>
      ${payload.dueDate ? `
        <tr>
          <td style="color: #64748b;">Jatuh Tempo</td>
          <td style="color: #dc2626; font-weight: 600;">${formatDate(payload.dueDate)}</td>
        </tr>
      ` : ''}
      ${payload.paymentStatus ? `
        <tr>
          <td style="color: #64748b;">Status</td>
          <td><span class="badge badge-yellow">${payload.paymentStatus}</span></td>
        </tr>
      ` : ''}
    </table>

    ${payload.bankName || payload.bankAccountNumber ? `
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 6px; margin: 18px 0; font-size: 13px;">
        <strong style="color: #1e293b;">Instruksi Pembayaran Transfer Bank:</strong><br/>
        <div style="margin-top: 6px; line-height: 1.6;">
          Bank: <strong>${payload.bankName || '-'}</strong><br/>
          No. Rekening: <strong>${payload.bankAccountNumber || '-'}</strong><br/>
          Atas Nama: <strong>${payload.bankAccountHolder || '-'}</strong>
        </div>
      </div>
    ` : ''}

    ${payload.notes ? `
      <p style="font-size: 13px; color: #64748b; margin-top: 12px;">${payload.notes}</p>
    ` : ''}
  `

  const html = renderEmailLayout({
    title: subject,
    content,
    actionUrl: payload.paymentUrl,
    actionText: 'Bayar Sekarang'
  })

  const text = `Permintaan Pembayaran Invoice #${payload.invoiceNumber}: ${formatRupiah(payload.amount)}. Harap dibayar sebelum ${formatDate(payload.dueDate)}.`

  return { subject, html, text }
}

/**
 * Render Receipt / Kuitansi Email HTML
 */
export function renderReceiptEmail(payload: ReceiptEmailPayload): { subject: string; html: string; text: string } {
  const subject = `[Bukti Pembayaran / Kuitansi] #${payload.receiptNumber}`

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge badge-green" style="font-size: 14px; padding: 6px 16px;">PEMBAYARAN BERHASIL</span>
    </div>

    <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px;">Kuitansi Pembayaran</h2>
    <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
      Halo <strong>${payload.customerName}</strong>, pembayaran Anda telah kami terima dengan rincian berikut:
    </p>

    <table class="details-table">
      <tr>
        <td style="color: #64748b; width: 160px;">No. Kuitansi (Receipt)</td>
        <td style="font-weight: 600; color: #0f172a;">#${payload.receiptNumber}</td>
      </tr>
      ${payload.referenceInvoiceNumber ? `
        <tr>
          <td style="color: #64748b;">No. Invoice</td>
          <td>#${payload.referenceInvoiceNumber}</td>
        </tr>
      ` : ''}
      <tr>
        <td style="color: #64748b;">Tanggal Bayar</td>
        <td>${formatDate(payload.paymentDate || new Date())}</td>
      </tr>
      ${payload.paymentMethod ? `
        <tr>
          <td style="color: #64748b;">Metode Pembayaran</td>
          <td>${payload.paymentMethod}</td>
        </tr>
      ` : ''}
      <tr class="total-row">
        <td>Jumlah Diterima</td>
        <td style="color: #16a34a; font-size: 16px;">${formatRupiah(payload.paidAmount)}</td>
      </tr>
      ${payload.remainingAmount !== undefined ? `
        <tr>
          <td style="color: #64748b;">Sisa Tagihan</td>
          <td style="font-weight: 600;">${formatRupiah(payload.remainingAmount)}</td>
        </tr>
      ` : ''}
    </table>
  `

  const html = renderEmailLayout({
    title: subject,
    content,
    actionUrl: payload.receiptUrl,
    actionText: 'Unduh / Cetak Kuitansi'
  })

  const text = `Bukti Pembayaran #${payload.receiptNumber} sebesar ${formatRupiah(payload.paidAmount)} telah berhasil diterima.`

  return { subject, html, text }
}

/**
 * Render General Notification Email HTML
 */
export function renderNotificationEmail(payload: NotificationEmailPayload): { subject: string; html: string; text: string } {
  const subject = payload.title

  const badgeClass = payload.badgeColor === 'green' ? 'badge-green'
    : payload.badgeColor === 'yellow' ? 'badge-yellow'
    : payload.badgeColor === 'red' ? 'badge-red'
    : 'badge-blue'

  const detailsRows = payload.keyDetails && payload.keyDetails.length > 0
    ? `
      <table class="details-table">
        ${payload.keyDetails.map(d => `
          <tr>
            <td style="color: #64748b; width: 140px;">${d.label}</td>
            <td style="font-weight: 600; color: #0f172a;">${d.value}</td>
          </tr>
        `).join('')}
      </table>
    `
    : ''

  const content = `
    ${payload.badgeText ? `
      <div style="margin-bottom: 16px;">
        <span class="badge ${badgeClass}">${payload.badgeText}</span>
      </div>
    ` : ''}

    <h2 style="margin: 0 0 12px; color: #1e293b; font-size: 20px;">${payload.title}</h2>
    ${payload.recipientName ? `<p style="margin: 0 0 12px; color: #64748b;">Halo <strong>${payload.recipientName}</strong>,</p>` : ''}
    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      ${payload.message.replace(/\n/g, '<br/>')}
    </p>

    ${detailsRows}
  `

  const html = renderEmailLayout({
    title: subject,
    content,
    actionUrl: payload.actionUrl,
    actionText: payload.actionText
  })

  const text = `${payload.title}\n\n${payload.message}`

  return { subject, html, text }
}
