import type { Request, Response, NextFunction } from 'express'
import * as paymentService from './payments.service'
import { createError } from '../../middleware/error-handler'

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
    const { id_booking, amount, payment_type, payment_proof_url, paid_at, released_at } = req.body
    if (!id_booking || amount === undefined || !payment_type) {
      throw createError(400, 'id_booking, amount, and payment_type are required')
    }

    const payment = await paymentService.create({
      id_booking: Number(id_booking),
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
    const { amount, payment_type, status, payment_proof_url, paid_at, released_at } = req.body

    const updateData: any = {}
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
