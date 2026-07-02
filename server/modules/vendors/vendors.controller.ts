import type { Request, Response, NextFunction } from 'express'
import * as vendorService from './vendors.service'
import prisma from '../../db'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const vendors = await vendorService.findAll()
    if (!vendors || vendors.length === 0) {
      res.json({ data: null })
      return
    }
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

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { business_name, description, category, location } = req.body

    // Create a unique user for this vendor to satisfy FK constraint
    const email = `vendor_${Date.now()}_${Math.floor(Math.random() * 1000)}@sigyn.com`
    const user = await prisma.user.create({
      data: {
        email,
        password: 'vendor123password',
        full_name: business_name,
        role_code: 'vendor',
      }
    })

    const vendor = await vendorService.create({
      id_user: user.id_user,
      business_name,
      description: description ?? null,
      category,
      location: location ?? null,
    })

    res.status(201).json({ data: vendor })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { business_name, description, category, location, status } = req.body

    const vendor = await vendorService.update(id, {
      business_name,
      description,
      category,
      location,
      status,
    })

    if (!vendor) {
      res.status(404).json({ error: { message: 'Vendor not found' } })
      return
    }

    res.json({ data: vendor })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const success = await vendorService.remove(id)
    if (!success) {
      res.status(404).json({ error: { message: 'Vendor not found' } })
      return
    }
    res.json({ data: { success: true } })
  } catch (err) {
    next(err)
  }
}
