import type { Request, Response, NextFunction } from 'express'
import * as paymentTermService from './payment-terms.service'
import { createError } from '../../middleware/error-handler'

export async function getByBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const id_booking = Number(req.params.bookingId)
    const terms = await paymentTermService.getTermsByBooking(id_booking)
    res.json({ data: terms })
  } catch (err) {
    next(err)
  }
}

export async function upsert(req: Request, res: Response, next: NextFunction) {
  try {
    const id_booking = Number(req.params.bookingId)
    const { terms } = req.body

    if (!terms || !Array.isArray(terms) || terms.length === 0) {
      throw createError(400, 'terms array is required with at least one term')
    }

    for (const term of terms) {
      if (!term.term_name || !term.amount) {
        throw createError(400, 'Each term requires term_name and amount')
      }
    }

    const result = await paymentTermService.upsertTerms(
      id_booking,
      terms.map((t: any) => ({
        term_order: t.term_order,
        term_name: t.term_name,
        amount: Number(t.amount),
        due_date: t.due_date || null,
        notes: t.notes || null,
      })),
      req.body.user_created || 'SYSTEM'
    )

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function autoGenerate(req: Request, res: Response, next: NextFunction) {
  try {
    const id_booking = Number(req.params.bookingId)
    const { total_price, dp_amount, user_created } = req.body

    if (!total_price) {
      throw createError(400, 'total_price is required')
    }

    const result = await paymentTermService.autoGenerateTerms(
      id_booking,
      Number(total_price),
      Number(dp_amount || 0),
      user_created || 'SYSTEM'
    )

    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await paymentTermService.removeTerm(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Payment term not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
