import type { Request, Response, NextFunction } from 'express'
import * as roleService from './roles.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await roleService.findAll()
    res.json({ data: roles })
  } catch (err) {
    next(err)
  }
}

export async function getByCode(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.findByCode(req.params.code)
    if (!role) {
      res.status(404).json({ error: { message: 'Role not found' } })
      return
    }
    res.json({ data: role })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { role_code, name } = req.body
    if (!role_code || !name) {
      throw createError(400, 'role_code and name are required')
    }
    const existing = await roleService.findByCode(role_code)
    if (existing) {
      throw createError(409, 'Role code already exists')
    }
    const role = await roleService.create({ role_code, name })
    res.status(201).json({ data: role })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.update(req.params.code, req.body)
    if (!role) {
      res.status(404).json({ error: { message: 'Role not found' } })
      return
    }
    res.json({ data: role })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await roleService.remove(req.params.code)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Role not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
