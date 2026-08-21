import type { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import * as userService from '../users/users.service'
import { createError } from '../../middleware/error-handler'
import { signToken } from '../../config/jwt'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, full_name } = req.body

    const existing = await authService.findByEmail(email)
    if (existing) {
      throw createError(409, 'Email already registered')
    }

    const user = await userService.create({ email, password, full_name })
    res.status(201).json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body

    const user = await authService.findByEmail(email)
    if (!user) {
      throw createError(404, 'User not found')
    }

    if (user.password !== password) {
      throw createError(401, 'Invalid email or password')
    }

    if (!user.is_active || user.status === 'suspended' || user.status === 'inactive') {
      throw createError(403, 'Account is suspended or inactive')
    }

    const roles = user.user_roles?.map(ur => ({
      role_code: ur.role_code,
      name: ur.role?.name ?? ur.role_code,
    })) ?? []

    const isVendor = roles.some(r => r.role_code === 'eUser-Vendor')

    let vendorInfo = null
    if (isVendor) {
      const prisma = (await import('../../db')).default
      const vendor = await prisma.vendor.findUnique({
        where: { id_user: user.id_user },
        select: {
          id_vendor: true,
          vendor_code: true,
          business_name: true,
          category: true,
          vendor_type: true,
          avatar_url: true,
        },
      })
      if (vendor) {
        vendorInfo = {
          vendor_id: vendor.id_vendor,
          vendor_code: vendor.vendor_code,
          vendor_category: vendor.category,
          vendor_name: vendor.business_name,
          vendor_type: vendor.vendor_type,
          vendor_avatar: vendor.avatar_url,
        }
      }
    }

    const token = signToken({
      id_user: user.id_user,
      email: user.email,
      full_name: user.full_name,
      role_codes: roles.map(r => r.role_code),
    })

    res.json({
      data: {
        id_user: user.id_user,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone ?? '',
        roles,
        token,
        ...(vendorInfo && { vendor_info: vendorInfo }),
      },
    })
  } catch (err) {
    next(err)
  }
}
