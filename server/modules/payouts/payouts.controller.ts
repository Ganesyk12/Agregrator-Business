import type { Request, Response, NextFunction } from 'express'
import * as payoutService from './payouts.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await payoutService.findAll()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = await payoutService.findById(id)
    if (!data) { res.status(404).json({ error: { message: 'Payout not found' } }); return }
    res.json({ data })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_vendor, id_booking, amount, paid_at } = req.body
    if (!id_vendor || !id_booking || amount === undefined) {
      throw createError(400, 'id_vendor, id_booking, and amount are required')
    }
    const data = await payoutService.create({
      id_vendor: Number(id_vendor),
      id_booking: Number(id_booking),
      amount: Number(amount),
      paid_at: paid_at ? new Date(paid_at) : null,
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { amount, status, paid_at } = req.body
    const updateData: any = {}
    if (amount !== undefined) updateData.amount = Number(amount)
    if (status !== undefined) updateData.status = status
    if (paid_at !== undefined) updateData.paid_at = paid_at ? new Date(paid_at) : null
    const data = await payoutService.update(id, updateData)
    if (!data) { res.status(404).json({ error: { message: 'Payout not found' } }); return }
    res.json({ data })
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await payoutService.remove(id)
    if (!deleted) { res.status(404).json({ error: { message: 'Payout not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}
