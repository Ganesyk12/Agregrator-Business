import type { Request, Response, NextFunction } from 'express'
import * as portfolioService from './portfolios.service'
import * as vendorService from '../vendors/vendors.service'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const portfolios = await portfolioService.findAll()
    res.json({ data: portfolios })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const portfolio = await portfolioService.findById(Number(req.params.id))
    if (!portfolio) {
      res.status(404).json({ error: { message: 'Portfolio not found' } })
      return
    }
    res.json({ data: portfolio })
  } catch (err) {
    next(err)
  }
}

export async function getRelated(req: Request, res: Response, next: NextFunction) {
  try {
    const portfolio = await portfolioService.findById(Number(req.params.id))
    if (!portfolio) {
      res.status(404).json({ error: { message: 'Portfolio not found' } })
      return
    }
    const related = await portfolioService.findByVendorId(portfolio.id_vendor, portfolio.id_portfolio)
    res.json({ data: related })
  } catch (err) {
    next(err)
  }
}

export async function getVendorInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = Number(req.params.vendorId)
    const vendor = await vendorService.findById(vendorId)
    if (!vendor) {
      res.status(404).json({ error: { message: 'Vendor not found' } })
      return
    }

    const reviews = await portfolioService.getVendorReviews(vendorId)
    const packages = await portfolioService.getVendorPackages(vendorId)
    const availability = await portfolioService.getVendorAvailability(vendorId)

    res.json({
      data: {
        vendor,
        reviews,
        packages,
        availability,
      },
    })
  } catch (err) {
    next(err)
  }
}
