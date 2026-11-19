import type { Request, Response, NextFunction } from 'express'
import * as vendorService from './vendors.service'
import * as userRoleService from '../user-roles/user-roles.service'
import { createError } from '../../middleware/error-handler'
import prisma from '../../db'
import '../../middleware/auth'

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = req.query.vendorId ? Number(req.query.vendorId) : undefined
    const vendor = await vendorService.findByUserId(req.user!.id_user, vendorId)
    if (!vendor) {
      res.status(404).json({ error: { message: 'Vendor profile not found' } })
      return
    }
    res.json({ data: vendor })
  } catch (err) {
    next(err)
  }
}

export async function getMine(req: Request, res: Response, next: NextFunction) {
  try {
    const vendors = await vendorService.findAllByUserId(req.user!.id_user)
    res.json({ data: vendors })
  } catch (err) {
    next(err)
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = req.query.vendorId ? Number(req.query.vendorId) : undefined
    const vendor = await vendorService.findByUserId(req.user!.id_user, vendorId)
    if (!vendor) {
      throw createError(404, 'Vendor profile not found')
    }

    const { business_name, description, location, avatar_url, instagram, status } = req.body
    const updated = await vendorService.update(vendor.id_vendor, {
      business_name,
      description,
      location,
      avatar_url,
      instagram,
      status,
    })

    res.json({ data: updated })
  } catch (err) {
    next(err)
  }
}

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
    const { id_user, business_name, description, category, location, years_exp } = req.body

    if (!id_user) {
      throw createError(400, 'id_user is required')
    }
    if (!business_name || !category) {
      throw createError(400, 'business_name and category are required')
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id_user: Number(id_user) }
    })
    if (!user) {
      throw createError(404, 'User not found')
    }

    // Assign vendor role to the user if they don't already have it
    const existingRole = await prisma.user_Role.findUnique({
      where: {
        email_role_code: {
          email: user.email,
          role_code: 'eUser-Vendor'
        }
      }
    })
    if (!existingRole) {
      await userRoleService.create({ email: user.email, role_code: 'eUser-Vendor' })
    }

    const payload = {
      business_name,
      description: description ?? null,
      category,
      location: location ?? null,
      years_exp: years_exp === undefined || years_exp === null || years_exp === '' ? 0 : Number(years_exp),
    }

    const vendor = await vendorService.create({
      id_user: Number(id_user),
      ...payload,
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

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const existing = await prisma.vendor.findUnique({ where: { id_vendor: id } })
    if (!existing) {
      res.status(404).json({ error: { message: 'Vendor not found' } })
      return
    }

    const vendor = await prisma.vendor.update({
      where: { id_vendor: id },
      data: {
        status: 'active',
        verified_at: new Date(),
        user_modified: 'SYSTEM',
      },
      include: {
        user: { select: { id_user: true, email: true, full_name: true } }
      }
    })

    res.json({ data: vendor })
  } catch (err) {
    next(err)
  }
}
