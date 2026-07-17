import type { Request, Response, NextFunction } from 'express'
import * as cartService from './cart.service'
import { createError } from '../../middleware/error-handler'

export async function getMyCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.user!.id_user)
    res.json({ data: cart })
  } catch (err) {
    next(err)
  }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_package } = req.body
    if (!id_package) throw createError(400, 'id_package is required')
    const item = await cartService.addItem(req.user!.id_user, Number(id_package))
    res.status(201).json({ data: item })
  } catch (err) {
    next(err)
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = Number(req.params.itemId)
    await cartService.removeItem(itemId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.clearCart(req.user!.id_user)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
