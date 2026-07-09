import type { Request, Response, NextFunction } from 'express'
import * as userRoleService from './user-roles.service'
import * as userService from '../users/users.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const userRoles = await userRoleService.findAll()
    res.json({ data: userRoles.length === 0 ? null : userRoles })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const userRole = await userRoleService.findById(Number(req.params.id))
    if (!userRole) {
      res.status(404).json({ error: { message: 'User role not found' } })
      return
    }
    res.json({ data: userRole })
  } catch (err) {
    next(err)
  }
}

export async function getByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userRoles = await userRoleService.findByEmail(req.params.email)
    res.json({ data: userRoles.length === 0 ? null : userRoles })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role_code } = req.body
    if (!email || !role_code) {
      throw createError(400, 'email and role_code are required')
    }

    const user = await userService.findByEmail(email)
    if (!user) {
      throw createError(404, 'User not found')
    }

    const existing = await userRoleService.findByEmailAndRole(email, role_code)
    if (existing) {
      throw createError(409, 'User already has this role')
    }

    const userRole = await userRoleService.create({ email, role_code })
    res.status(201).json({ data: userRole })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { role_code, status } = req.body
    const userRole = await userRoleService.update(Number(req.params.id), { role_code, status })
    if (!userRole) {
      res.status(404).json({ error: { message: 'User role not found' } })
      return
    }
    res.json({ data: userRole })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await userRoleService.remove(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ error: { message: 'User role not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function syncByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.params
    const { role_codes } = req.body
    if (!Array.isArray(role_codes)) {
      throw createError(400, 'role_codes must be an array')
    }

    const user = await userService.findByEmail(email)
    if (!user) {
      throw createError(404, 'User not found')
    }

    const userRoles = await userRoleService.syncRolesByEmail(email, role_codes)
    res.json({ data: userRoles })
  } catch (err) {
    next(err)
  }
}
