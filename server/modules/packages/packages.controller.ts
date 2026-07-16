import type { Request, Response, NextFunction } from 'express'
import * as packageService from './packages.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await packageService.findAll()
    res.json({ data: packages.length === 0 ? null : packages })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const pkg = await packageService.findById(Number(req.params.id))
    if (!pkg) {
      res.status(404).json({ error: { message: 'Package not found' } })
      return
    }
    res.json({ data: pkg })
  } catch (err) {
    next(err)
  }
}

export async function getByVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await packageService.findByVendor(Number(req.params.vendorId))
    res.json({ data: packages.length === 0 ? null : packages })
  } catch (err) {
    next(err)
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await packageService.findByCategory(Number(req.params.categoryId))
    res.json({ data: packages.length === 0 ? null : packages })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_vendor, id_category, name, price, description, duration, whats_included } = req.body
    if (!id_vendor || !name || price === undefined) {
      throw createError(400, 'id_vendor, name, and price are required')
    }
    const pkg = await packageService.create({
      id_vendor: Number(id_vendor),
      id_category: id_category ? Number(id_category) : null,
      name,
      price: Number(price),
      description,
      duration,
      whats_included
    })
    res.status(201).json({ data: pkg })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_category, name, price, description, duration, whats_included, status } = req.body
    const updateData: any = {}
    if (id_category !== undefined) updateData.id_category = id_category ? Number(id_category) : null
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = price !== null ? Number(price) : undefined
    if (description !== undefined) updateData.description = description
    if (duration !== undefined) updateData.duration = duration
    if (whats_included !== undefined) updateData.whats_included = whats_included
    if (status !== undefined) updateData.status = status

    const pkg = await packageService.update(Number(req.params.id), updateData)
    if (!pkg) {
      res.status(404).json({ error: { message: 'Package not found' } })
      return
    }
    res.json({ data: pkg })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await packageService.remove(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ error: { message: 'Package not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
