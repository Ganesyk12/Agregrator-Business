import type { Request, Response, NextFunction } from 'express'
import * as portfolioService from './portfolios.service'
import * as vendorService from '../vendors/vendors.service'
import prisma from '../../db'
import { createError } from '../../middleware/error-handler'
import { attachExtras } from '../../config/extras'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const label = req.query.label as string | undefined
    const portfolios = await portfolioService.findAll(label)
    const data = portfolios.map((p: any) => ({
      ...p,
      vendor: p.vendor ? attachExtras(p.vendor) : p.vendor,
    }))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw createError(400, 'Invalid portfolio ID')
    const portfolio = await portfolioService.findById(id)
    if (!portfolio) {
      res.status(404).json({ error: { message: 'Portfolio not found' } })
      return
    }
    const data = {
      ...portfolio,
      vendor: (portfolio as any).vendor ? attachExtras((portfolio as any).vendor) : (portfolio as any).vendor,
    }
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getByVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = Number(req.params.vendorId)
    if (isNaN(vendorId)) throw createError(400, 'Invalid vendor ID')
    const portfolios = await portfolioService.findByVendor(vendorId)
    res.json({ data: portfolios })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_vendor, id_package, id_category, title, code, cover_url, description, location, label, sort_order } = req.body
    if (!id_vendor || !title || !cover_url) {
      throw createError(400, 'id_vendor, title, and cover_url are required')
    }
    const autoCode = code || `PRT-${Date.now()}`
    const portfolio = await portfolioService.create({
      id_vendor: Number(id_vendor),
      id_package: id_package ? Number(id_package) : null,
      id_category: id_category ? Number(id_category) : null,
      title,
      code: autoCode,
      cover_url,
      description: description || null,
      location: location || null,
      label: label || null,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
    })
    res.status(201).json({ data: portfolio })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw createError(400, 'Invalid portfolio ID')
    const { id_package, id_category, title, code, cover_url, description, location, label, sort_order, status } = req.body
    const updateData: any = {}
    if (id_package !== undefined) updateData.id_package = id_package ? Number(id_package) : null
    if (id_category !== undefined) updateData.id_category = id_category ? Number(id_category) : null
    if (title !== undefined) updateData.title = title
    if (code !== undefined) updateData.code = code
    if (cover_url !== undefined) updateData.cover_url = cover_url
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location
    if (label !== undefined) updateData.label = label
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order)
    if (status !== undefined) updateData.status = status

    const portfolio = await portfolioService.update(id, updateData)
    if (!portfolio) {
      res.status(404).json({ error: { message: 'Portfolio not found' } })
      return
    }
    res.json({ data: portfolio })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw createError(400, 'Invalid portfolio ID')
    const deleted = await portfolioService.remove(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Portfolio not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function reorder(req: Request, res: Response, next: NextFunction) {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) throw createError(400, 'items must be an array of { id_portfolio: number, sort_order: number }')
    await portfolioService.reorder(items)
    res.json({ message: 'Reordered successfully' })
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

export async function getVendors(_req: Request, res: Response, next: NextFunction) {
  try {
    const vendors = await vendorService.findVendorsWithPackages()
    const data = vendors.map((v: any) => {
      const base = {
        id_vendor: v.id_vendor,
        business_name: v.business_name,
        category: v.category,
        location: v.location || '',
        description: v.description || '',
        starting_price: v.packages.length > 0 ? v.packages[0].price : 0,
        years_exp: v.years_exp,
        status: v.status,
        average_rating: 0,
        completed_projects: v._count?.portfolios || 0,
        cover_url: '',
        logo_url: null,
        availability: v.status === 'verified' ? 'available' : 'booked',
      }
      return attachExtras(base)
    })
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getVendorsCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ select: { category_name: true }, where: { status: 'active' } })
    const data = categories.map((c: any) => ({ name: c.category_name }))
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

export async function getPackagesByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryName } = req.params
    if (!categoryName) throw createError(400, 'Category name is required')
    const packages = await portfolioService.getPackagesByCategory(categoryName)
    const data = packages.map((p: any) => ({
      ...p,
      extras: p.extras || [],
    }))
    res.json({ data })
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
    const vendorData = attachExtras(vendor)
    const extras = packages.length > 0
      ? await prisma.packageExtra.findMany({
          where: { id_package: packages[0].id_package, status: 'active' },
          select: { id_extra: true, name: true, price: true, icon: true },
        })
      : []
    res.json({ data: { vendor: { ...vendorData, extras }, reviews, packages, availability } })
  } catch (err) {
    next(err)
  }
}
