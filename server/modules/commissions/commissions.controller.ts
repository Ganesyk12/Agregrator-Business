import type { Request, Response, NextFunction } from 'express'
import * as commissionService from './commissions.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await commissionService.findAll()
    res.json({ data })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = await commissionService.findById(id)
    if (!data) { res.status(404).json({ error: { message: 'Commission not found' } }); return }
    res.json({ data })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_booking, id_vendor, percentage, amount } = req.body
    if (!id_booking || !id_vendor || percentage === undefined || amount === undefined) {
      throw createError(400, 'id_booking, id_vendor, percentage, and amount are required')
    }
    const data = await commissionService.create({
      id_booking: Number(id_booking),
      id_vendor: Number(id_vendor),
      percentage: Number(percentage),
      amount: Number(amount),
    })
    res.status(201).json({ data })
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { percentage, amount, status } = req.body
    const updateData: any = {}
    if (percentage !== undefined) updateData.percentage = Number(percentage)
    if (amount !== undefined) updateData.amount = Number(amount)
    if (status !== undefined) updateData.status = status
    const data = await commissionService.update(id, updateData)
    if (!data) { res.status(404).json({ error: { message: 'Commission not found' } }); return }
    res.json({ data })
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await commissionService.remove(id)
    if (!deleted) { res.status(404).json({ error: { message: 'Commission not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}
