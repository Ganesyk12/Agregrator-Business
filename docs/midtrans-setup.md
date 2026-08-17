# Panduan Setup Integrasi Midtrans — Sigyn Backend

Dokumen ini menjelaskan konfigurasi, struktur, dan cara penggunaan integrasi Midtrans yang telah disiapkan di backend Sigyn.

---

## 1. Prerequisites (Persiapan Akun)
Sebelum memulai, Anda membutuhkan kredensial API dari Midtrans:
1. Daftar atau masuk ke [Midtrans Dashboard](https://dashboard.midtrans.com/).
2. Pastikan berada di mode **Sandbox** untuk pengembangan lokal, atau **Production** untuk rilis aplikasi.
3. Masuk ke menu **Settings > Access Keys** untuk mendapatkan:
   - **Server Key**
   - **Client Key**

---

## 2. Environment Variables (.env)
Tambahkan variabel berikut pada file `.env` di root directory proyek Anda:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION=false
```

*Catatan:*
- Untuk pengembangan lokal, selalu gunakan `MIDTRANS_IS_PRODUCTION=false` (Sandbox).
- Jangan lupa untuk mengupdate [.env.example](file:///c:/Project/Agregrator-Business/.env.example) jika ada variabel baru lainnya yang diperlukan secara global.

---

## 3. Struktur File Integrasi
File konfigurasi Midtrans terletak pada modul-modul berikut:

1. **[`server/config/env.ts`](file:///c:/Project/Agregrator-Business/server/config/env.ts)**
   Membaca variabel lingkungan (`.env`) ke dalam objek konfigurasi aplikasi. Konfigurasi dibuat opsional agar tidak memblokir start server jika variabel Midtrans belum diisi oleh developer lain.
2. **[`server/types/midtrans-client.d.ts`](file:///c:/Project/Agregrator-Business/server/types/midtrans-client.d.ts)**
   Menyediakan deklarasi tipe TypeScript untuk SDK `midtrans-client` yang tidak memiliki tipe bawaan resmi.
3. **[`server/config/midtrans.ts`](file:///c:/Project/Agregrator-Business/server/config/midtrans.ts)**
   Menginisialisasi client `snap` (untuk pembuatan token/halaman pembayaran) dan `coreApi` (untuk transaksi langsung / pengecekan status).

---

## 4. Cara Penggunaan di Backend

### A. Menggunakan Snap (Checkout dengan Redirect / Pop-up)
Snap digunakan untuk mempermudah pembayaran dengan menghasilkan token/redirect URL ke halaman pembayaran Midtrans.

Contoh implementasi di `service` atau `controller`:

```typescript
import { snap } from '../../config/midtrans'

export async function createPaymentToken(bookingId: number, amount: number, customerDetails: any) {
  const parameter = {
    transaction_details: {
      order_id: `BOOKING-${bookingId}-${Date.now()}`, // Harus unik
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerDetails.fullName,
      email: customerDetails.email,
      phone: customerDetails.phone,
    },
    credit_card: {
      secure: true
    }
  }

  try {
    // Menghasilkan transaction token dan redirect URL
    const transaction = await snap.createTransaction(parameter)
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    }
  } catch (error) {
    console.error('Midtrans Snap Error:', error)
    throw error
  }
}
```

### B. Menggunakan Core API (Pengecekan Status & Transaksi Langsung)
Core API dapat digunakan untuk interaksi langsung seperti mengecek status transaksi di Midtrans.

```typescript
import { coreApi } from '../../config/midtrans'

export async function checkPaymentStatus(orderId: string) {
  try {
    const status = await coreApi.status(orderId)
    // status akan berisi transaction_status seperti 'settlement', 'pending', 'expire', dll.
    return status
  } catch (error) {
    console.error('Midtrans CoreAPI Status Error:', error)
    throw error
  }
}
```

---

## 5. Menangani Webhook / Notification Handler (Rekomendasi Keamanan)
Saat transaksi berhasil dibayar, Midtrans akan mengirimkan HTTP POST Notification (Webhook) ke backend kita. 

Untuk memastikan request benar-benar dikirim dari Midtrans (dan bukan pihak ketiga yang mencoba memanipulasi data), verifikasi `signature_key` dengan mencocokkan SHA512 hash dari:
`order_id + status_code + gross_amount + server_key`

Contoh handler webhook:

```typescript
import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { env } from '../../config/env'
import prisma from '../../db'

export async function handleMidtransNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = req.body
    
    // 1. Verifikasi Signature Key
    const payloadToHash = 
      notification.order_id + 
      notification.status_code + 
      notification.gross_amount + 
      env.midtransServerKey
      
    const computedSignature = crypto
      .createHash('sha512')
      .update(payloadToHash)
      .digest('hex')

    if (computedSignature !== notification.signature_key) {
      return res.status(403).json({ error: { message: 'Invalid signature key' } })
    }

    // 2. Proses status transaksi
    const orderId = notification.order_id // format: e.g. "BOOKING-X"
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status

    console.log(`Webhook received: Order ID: ${orderId}, Status: ${transactionStatus}`)

    // Tentukan status internal database
    let dbStatus = 'pending'
    let paidAt: Date | null = null

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        dbStatus = 'challenge'
      } else if (fraudStatus === 'accept') {
        dbStatus = 'paid'
        paidAt = new Date()
      }
    } else if (transactionStatus === 'settlement') {
      dbStatus = 'paid'
      paidAt = new Date()
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      dbStatus = 'cancelled'
    } else if (transactionStatus === 'pending') {
      dbStatus = 'pending'
    }

    // 3. Update status pembayaran di database Anda
    // Contoh parse Booking ID dari format Order ID kita
    const bookingPaymentId = Number(orderId.split('-')[1])
    
    await prisma.bookingPayment.update({
      where: { id_booking_payment: bookingPaymentId },
      data: {
        status: dbStatus,
        paid_at: paidAt,
      }
    })

    res.status(200).json({ status: 'success' })
  } catch (error) {
    next(error)
  }
}
```
