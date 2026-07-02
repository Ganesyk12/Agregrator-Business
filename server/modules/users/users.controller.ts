import type { Request, Response, NextFunction } from 'express'
import * as userService from './users.service'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.findAll()
    res.json({ data: users.length === 0 ? null : users })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(Number(req.params.id))
    if (!user) {
      res.status(404).json({ error: { message: 'User not found' } })
      return
    }
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, full_name, phone } = req.body
    if (!email || !full_name) {
      res.status(400).json({ error: { message: 'email and full_name are required' } })
      return
    }
    const user = await userService.create({ email, password, full_name, role_code: 'customer', phone })
    res.status(201).json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, full_name, phone, status, is_active } = req.body
    const user = await userService.update(Number(req.params.id), { email, full_name, phone, status, is_active })
    if (!user) {
      res.status(404).json({ error: { message: 'User not found' } })
      return
    }
    res.json({ data: user })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await userService.remove(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ error: { message: 'User not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
