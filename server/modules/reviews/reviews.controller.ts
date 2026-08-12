import type { Request, Response, NextFunction } from 'express'
import * as reviewsService from './reviews.service'
import { createError } from '../../middleware/error-handler'

export async function getByVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = req.query.vendorId ? Number(req.query.vendorId) : undefined
    if (!vendorId || isNaN(vendorId)) {
      throw createError(400, 'vendorId query parameter is required and must be a number')
    }
    const reviews = await reviewsService.findByVendor(vendorId)
    res.json({ data: reviews })
  } catch (err) {
    next(err)
  }
}
