import type { Request, Response, NextFunction } from 'express'
import * as userService from './users.service'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.findAll()
    res.json({ data: users })
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
