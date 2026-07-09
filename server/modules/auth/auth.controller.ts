import type { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import * as userService from '../users/users.service'
import { createError } from '../../middleware/error-handler'

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
    if (!user || user.password !== password) {
      throw createError(401, 'Invalid email or password')
    }

    const roles = user.user_roles?.map(ur => ({
      role_code: ur.role_code,
      name: ur.role?.name ?? ur.role_code,
    })) ?? []

    res.json({
      data: {
        id_user: user.id_user,
        email: user.email,
        full_name: user.full_name,
        roles,
      },
    })
  } catch (err) {
    next(err)
  }
}
