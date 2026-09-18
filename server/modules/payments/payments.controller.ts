import type { Request, Response, NextFunction } from 'express'
import * as paymentService from './payments.service'
import { createError } from '../../middleware/error-handler'
import { coreApi, snap, withTimeout } from '../../config/midtrans'
import { env } from '../../config/env'
import prisma from '../../db'

const orderQrisUrlCache = new Map<string, string>()

export async function getQrisImage(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = String(req.params.orderId)
    if (!orderId) throw createError(400, 'orderId is required')

    let qrActionUrl = orderQrisUrlCache.get(orderId)

    if (!qrActionUrl) {
      const payment = await paymentService.findByOrderId(orderId)
      qrActionUrl = (payment as any)?.qr_action_url
    }

    if (!qrActionUrl) throw createError(404, 'QR action URL not available')

    const authHeader = 'Basic ' + Buffer.from(env.midtransServerKey + ':').toString('base64')
    const qrRes = await fetch(qrActionUrl, { headers: { Authorization: authHeader } })
    if (!qrRes.ok) throw createError(502, `Midtrans QR API returned ${qrRes.status}`)

    const buf = Buffer.from(await qrRes.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'no-cache')
    res.send(buf)
  } catch (err) {
    next(err)
  }
}

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await paymentService.findAll()
    res.json({ data: payments })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const payment = await paymentService.findById(id)
    if (!payment) {
      res.status(404).json({ error: { message: 'Payment not found' } })
      return
    }
    res.json({ data: payment })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_booking, id_term, amount, payment_type, payment_proof_url, paid_at, released_at } = req.body
    if (!id_booking || amount === undefined || !payment_type) {
      throw createError(400, 'id_booking, amount, and payment_type are required')
    }

    const payment = await paymentService.create({
      id_booking: Number(id_booking),
      id_term: id_term ? Number(id_term) : undefined,
      amount: Number(amount),
      payment_type,
      payment_proof_url: payment_proof_url || null,
      paid_at: paid_at ? new Date(paid_at) : null,
      released_at: released_at ? new Date(released_at) : null,
    })

    res.status(201).json({ data: payment })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { id_term, amount, payment_type, status, payment_proof_url, paid_at, released_at } = req.body

    const updateData: any = {}
    if (id_term !== undefined) updateData.id_term = id_term ? Number(id_term) : null
    if (amount !== undefined) updateData.amount = Number(amount)
    if (payment_type !== undefined) updateData.payment_type = payment_type
    if (status !== undefined) updateData.status = status
    if (payment_proof_url !== undefined) updateData.payment_proof_url = payment_proof_url
    if (paid_at !== undefined) updateData.paid_at = paid_at ? new Date(paid_at) : null
    if (released_at !== undefined) updateData.released_at = released_at ? new Date(released_at) : null

    const payment = await paymentService.update(id, updateData)
    if (!payment) {
      res.status(404).json({ error: { message: 'Payment not found' } })
      return
    }
    res.json({ data: payment })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await paymentService.remove(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Payment not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

const SUPPORTED_BANKS = ['bca', 'mandiri', 'bni', 'bri', 'permata', 'cimb', 'danamon', 'maybank'] as const
type SupportedBank = (typeof SUPPORTED_BANKS)[number]

interface ResolvedPayment {
  orderId: string
  amountToPay: number
  customerName: string
  customerEmail: string
  customerPhone: string
  idBooking?: number
  idOrder?: number
  idTerm?: number
}

async function resolvePaymentTarget(body: { id_booking?: number; id_order?: number; id_term?: number; typePrefix?: string }): Promise<ResolvedPayment> {
  const { id_booking, id_order, id_term, typePrefix } = body
  if (id_order) {
    const order = await prisma.order.findUnique({
      where: { id_order: Number(id_order) },
      include: { user: true },
    })
    if (!order) throw createError(404, 'Order not found')
    const orderId = `ORDER-${order.id_order}-${typePrefix || 'PAY'}-${Date.now()}`
    return {
      orderId,
      amountToPay: order.total_price,
      customerName: order.recipient_name || order.user?.full_name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.recipient_phone || order.user?.phone || '',
      idOrder: order.id_order,
    }
  }

  if (id_booking) {
    const booking = await paymentService.findBookingForPayment(Number(id_booking))
    if (!booking) throw createError(404, 'Booking not found')
    let amountToPay = booking.total_price
    if (id_term) {
      const term = booking.payment_terms?.find((t: any) => t.id_term === Number(id_term))
      if (!term) throw createError(404, 'Payment term not found')
      amountToPay = term.amount
    }
    const orderId = `BOOKING-${booking.id_booking}-${id_term || typePrefix || 'FULL'}-${Date.now()}`
    return {
      orderId,
      amountToPay,
      customerName: booking.customer?.full_name || 'Customer',
      customerEmail: booking.customer?.email || '',
      customerPhone: booking.customer?.phone || '',
      idBooking: booking.id_booking,
      idTerm: id_term ? Number(id_term) : undefined,
    }
  }

  throw createError(400, 'id_booking or id_order is required')
}

export async function generateMidtransVA(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_booking, id_order, id_term, bank } = req.body as { id_booking?: number; id_order?: number; id_term?: number; bank?: string }

    if ((!id_booking && !id_order) || !bank) {
      throw createError(400, 'id_booking or id_order, and bank are required')
    }

    const normalizedBank = bank.toLowerCase() as SupportedBank
    if (!SUPPORTED_BANKS.includes(normalizedBank)) {
      throw createError(400, `Unsupported bank. Supported: ${SUPPORTED_BANKS.join(', ')}`)
    }

    const target = await resolvePaymentTarget({ id_booking, id_order, id_term, typePrefix: normalizedBank })

    const midtransPayload = {
      payment_type: 'bank_transfer',
      bank_transfer: { bank: normalizedBank },
      transaction_details: {
        order_id: target.orderId,
        gross_amount: target.amountToPay,
      },
      customer_details: {
        first_name: target.customerName,
        email: target.customerEmail,
        phone: target.customerPhone,
      },
    }

    const chargeResult = await withTimeout(coreApi.charge(midtransPayload), 'VA charge')
    console.log('[Midtrans VA] chargeResult:', JSON.stringify(chargeResult, null, 2))

    if (chargeResult.status_code === '201' || chargeResult.status_code === 201) {
      const vaNumber = chargeResult.va_numbers?.[0]?.va_number
        || chargeResult.billing_number
        || chargeResult.permata_va_number
        || ''
      const bankName = chargeResult.va_numbers?.[0]?.bank
        || (chargeResult.permata_va_number ? 'permata' : normalizedBank)
      const expiryTime = chargeResult.expiry_time || ''

      let paymentId: number | undefined
      if (target.idBooking) {
        const payment = await paymentService.create({
          id_booking: target.idBooking,
          order_id: target.orderId,
          id_term: target.idTerm,
          amount: target.amountToPay,
          payment_type: `bank_transfer_${bankName}`,
          status: 'pending',
        })
        paymentId = payment.id_booking_payment
      } else if (target.idOrder) {
        await prisma.order.update({
          where: { id_order: target.idOrder },
          data: { payment_status: 'pending' },
        })
      }

      res.status(201).json({
        data: {
          id_payment: paymentId,
          order_id: target.orderId,
          va_number: vaNumber,
          bank: bankName,
          amount: target.amountToPay,
          expiry_time: expiryTime,
          status: chargeResult.transaction_status,
        },
      })
    } else {
      throw createError(400, chargeResult.status_message || 'Failed to create VA')
    }
  } catch (err: any) {
    if (err.httpResponse) {
      res.status(err.httpResponse?.statusCode || 502).json({
        error: { message: err.httpResponse?.body?.status_message || 'Midtrans API error' },
      })
      return
    }
    next(err)
  }
}

export async function generateMidtransQRIS(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_booking, id_order, id_term } = req.body as { id_booking?: number; id_order?: number; id_term?: number }

    if (!id_booking && !id_order) {
      throw createError(400, 'id_booking or id_order is required')
    }

    const target = await resolvePaymentTarget({ id_booking, id_order, id_term, typePrefix: 'QRIS' })

    const midtransPayload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: target.orderId,
        gross_amount: target.amountToPay,
      },
      customer_details: {
        first_name: target.customerName,
        email: target.customerEmail,
        phone: target.customerPhone,
      },
    }

    const chargeResult = await withTimeout(coreApi.charge(midtransPayload), 'QRIS charge')
    console.log('[Midtrans QRIS] chargeResult:', JSON.stringify(chargeResult, null, 2))

    if (chargeResult.status_code === '201' || chargeResult.status_code === 201) {
      const qrString = chargeResult.qr_string || ''
      const qrAction = chargeResult.actions?.find((a: any) => a.name === 'generate-qr-code')
      const qrActionUrl = qrAction?.url || ''

      if (qrActionUrl) {
        orderQrisUrlCache.set(target.orderId, qrActionUrl)
      }

      let paymentId: number | undefined
      if (target.idBooking) {
        const payment = await paymentService.create({
          id_booking: target.idBooking,
          order_id: target.orderId,
          qr_string: qrString,
          qr_action_url: qrActionUrl,
          id_term: target.idTerm,
          amount: target.amountToPay,
          payment_type: 'qris',
          status: 'pending',
        })
        paymentId = payment.id_booking_payment
      } else if (target.idOrder) {
        await prisma.order.update({
          where: { id_order: target.idOrder },
          data: { payment_status: 'pending' },
        })
      }

      res.status(201).json({
        data: {
          id_payment: paymentId,
          order_id: target.orderId,
          qr_string: qrString,
          amount: target.amountToPay,
          expiry_time: chargeResult.expiry_time || '',
          status: chargeResult.transaction_status,
        },
      })
    } else {
      throw createError(400, chargeResult.status_message || 'Failed to create QRIS')
    }
  } catch (err: any) {
    if (err.httpResponse) {
      res.status(err.httpResponse?.statusCode || 502).json({
        error: { message: err.httpResponse?.body?.status_message || 'Midtrans API error' },
      })
      return
    }
    next(err)
  }
}

export async function checkMidtransStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = String(req.params.orderId)
    if (!orderId) {
      throw createError(400, 'orderId is required')
    }

    if (orderId.startsWith('ORDER-')) {
      const orderPk = Number(orderId.split('-')[1])
      const existingOrder = await prisma.order.findUnique({ where: { id_order: orderPk } })
      if (existingOrder?.payment_status === 'paid') {
        res.json({
          data: {
            order_id: orderId,
            transaction_status: 'settlement',
            payment_type: 'midtrans',
            gross_amount: existingOrder.total_price,
            transaction_time: '',
            is_paid: true,
          },
        })
        return
      }
    } else {
      const existing = await paymentService.findByOrderId(orderId)
      if (existing?.status === 'paid') {
        res.json({
          data: {
            order_id: orderId,
            transaction_status: 'settlement',
            payment_type: existing.payment_type,
            gross_amount: existing.amount,
            transaction_time: existing.paid_at?.toISOString() || '',
            is_paid: true,
          },
        })
        return
      }
    }

    let statusResult: any
    try {
      const baseUrl = env.midtransIsProduction
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com'
      const authHeader = 'Basic ' + Buffer.from(env.midtransServerKey + ':').toString('base64')
      const statusRes = await withTimeout(
        fetch(`${baseUrl}/v2/${orderId}/status`, { headers: { Authorization: authHeader } }),
        'Check status',
      )
      if (!statusRes.ok) throw new Error(`Midtrans status API returned ${statusRes.status}`)
      statusResult = await statusRes.json()
    } catch (err: any) {
      console.log('[Midtrans Status] API failed for', orderId, '—', err.message || err)
      res.json({
        data: {
          order_id: orderId,
          transaction_status: 'pending',
          payment_type: '',
          gross_amount: 0,
          transaction_time: '',
          is_paid: false,
        },
      })
      return
    }

    console.log('[Midtrans Status]', orderId, statusResult.transaction_status)

    const isPaid = statusResult.transaction_status === 'settlement'
      || statusResult.transaction_status === 'capture'

    if (isPaid) {
      await paymentService.updateByOrderId(orderId, {
        status: 'paid',
        paid_at: new Date(statusResult.transaction_time),
      })
    } else if (statusResult.transaction_status === 'expire') {
      await paymentService.updateByOrderId(orderId, { status: 'expired' })
    } else if (statusResult.transaction_status === 'cancel') {
      await paymentService.updateByOrderId(orderId, { status: 'cancelled' })
    }

    res.json({
      data: {
        order_id: orderId,
        transaction_status: statusResult.transaction_status,
        fraud_status: statusResult.fraud_status,
        payment_type: statusResult.payment_type,
        gross_amount: statusResult.gross_amount,
        transaction_time: statusResult.transaction_time,
        is_paid: isPaid,
      },
    })
  } catch (err: any) {
    if (err.httpResponse) {
      res.status(err.httpResponse?.statusCode || 502).json({
        error: { message: err.httpResponse?.body?.status_message || 'Midtrans API error' },
      })
      return
    }
    next(err)
  }
}

export async function generateSnapToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_booking, id_order, id_term } = req.body as { id_booking?: number; id_order?: number; id_term?: number }

    if (!id_booking && !id_order) {
      throw createError(400, 'id_booking or id_order is required')
    }

    const target = await resolvePaymentTarget({ id_booking, id_order, id_term, typePrefix: 'CC' })

    const snapPayload: any = {
      transaction_details: {
        order_id: target.orderId,
        gross_amount: target.amountToPay,
      },
      credit_card: {
        secure: true,
      },
    }

    if (target.customerEmail && target.customerEmail.includes('@')) {
      snapPayload.customer_details = {
        first_name: target.customerName,
        email: target.customerEmail,
        ...(target.customerPhone ? { phone: target.customerPhone } : {}),
      }
    }

    const snapResult = await withTimeout(snap.createTransaction(snapPayload), 'Snap token')
    console.log('[Midtrans Snap] token created for order:', target.orderId)

    let paymentId: number | undefined
    if (target.idBooking) {
      const payment = await paymentService.create({
        id_booking: target.idBooking,
        order_id: target.orderId,
        id_term: target.idTerm,
        amount: target.amountToPay,
        payment_type: 'credit_card',
        status: 'pending',
      })
      paymentId = payment.id_booking_payment
    } else if (target.idOrder) {
      await prisma.order.update({
        where: { id_order: target.idOrder },
        data: { payment_status: 'pending' },
      })
    }

    res.status(201).json({
      data: {
        id_payment: paymentId,
        order_id: target.orderId,
        token: snapResult.token,
        redirect_url: snapResult.redirect_url,
      },
    })
  } catch (err: any) {
    if (err.httpResponse) {
      res.status(err.httpResponse?.statusCode || 502).json({
        error: { message: err.httpResponse?.body?.status_message || 'Midtrans API error' },
      })
      return
    }
    next(err)
  }
}

export async function simulatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.nodeEnv !== 'development') {
      throw createError(403, 'Simulate endpoint is only available in development')
    }

    const orderId = String(req.params.orderId)
    if (!orderId) {
      throw createError(400, 'orderId is required')
    }

    console.log('[Simulate] Marking payment as paid:', orderId)

    await paymentService.updateByOrderId(orderId, {
      status: 'paid',
      paid_at: new Date(),
    })

    res.json({
      data: {
        order_id: orderId,
        transaction_status: 'settlement',
        is_paid: true,
        message: 'Payment simulated successfully',
      },
    })
  } catch (err) {
    next(err)
  }
}

