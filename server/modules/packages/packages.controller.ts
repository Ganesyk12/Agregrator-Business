import type { Request, Response, NextFunction } from 'express'
import * as packageService from './packages.service'
import prisma from '../../db'
import { createError } from '../../middleware/error-handler'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.query
    const packages = await packageService.findAll(vendorId ? Number(vendorId) : undefined)
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
    const { id_vendor, id_category, name, price, description, duration, whats_included, extras } = req.body
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
      whats_included,
      extras: extras || undefined,
    })
    res.status(201).json({ data: pkg })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_category, name, price, description, duration, whats_included, status, extras } = req.body
    const updateData: any = {}
    if (id_category !== undefined) updateData.id_category = id_category ? Number(id_category) : null
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = price !== null ? Number(price) : undefined
    if (description !== undefined) updateData.description = description
    if (duration !== undefined) updateData.duration = duration
    if (whats_included !== undefined) updateData.whats_included = whats_included
    if (status !== undefined) updateData.status = status
    if (extras !== undefined) updateData.extras = extras

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

export async function addExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const packageId = Number(req.params.id)
    const pkg = await prisma.package.findFirst({ where: { id_package: packageId, status: { not: 'deleted' } } })
    if (!pkg) {
      res.status(404).json({ error: { message: 'Package not found' } })
      return
    }
    const { name, price, description, icon } = req.body
    if (!name || price === undefined) {
      throw createError(400, 'name and price are required')
    }
    const extra = await prisma.packageExtra.create({
      data: {
        id_package: packageId,
        name,
        price: Number(price),
        description: description || null,
        icon: icon || null,
        user_created: 'SYSTEM',
        user_modified: 'SYSTEM',
      },
    })
    res.status(201).json({ data: extra })
  } catch (err) {
    next(err)
  }
}

export async function updateExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const extraId = Number(req.params.extraId)
    const existing = await prisma.packageExtra.findFirst({ where: { id_extra: extraId, status: { not: 'deleted' } } })
    if (!existing) {
      res.status(404).json({ error: { message: 'Extra not found' } })
      return
    }
    const { name, price, description, icon } = req.body
    const updateData: any = { user_modified: 'SYSTEM' }
    if (name !== undefined) updateData.name = name
    if (price !== undefined) updateData.price = Number(price)
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon

    const extra = await prisma.packageExtra.update({
      where: { id_extra: extraId },
      data: updateData,
    })
    res.json({ data: extra })
  } catch (err) {
    next(err)
  }
}

export async function removeExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const extraId = Number(req.params.extraId)
    const existing = await prisma.packageExtra.findFirst({ where: { id_extra: extraId, status: { not: 'deleted' } } })
    if (!existing) {
      res.status(404).json({ error: { message: 'Extra not found' } })
      return
    }
    await prisma.packageExtra.update({
      where: { id_extra: extraId },
      data: { status: 'deleted', user_modified: 'SYSTEM' },
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
