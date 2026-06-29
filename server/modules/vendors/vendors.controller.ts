import type { Request, Response, NextFunction } from 'express'
import * as vendorService from './vendors.service'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const vendors = await vendorService.findAll()
    res.json({ data: vendors })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const vendor = await vendorService.findById(Number(req.params.id))
    if (!vendor) {
      res.status(404).json({ error: { message: 'Vendor not found' } })
      return
    }
    res.json({ data: vendor })
  } catch (err) {
    next(err)
  }
}
