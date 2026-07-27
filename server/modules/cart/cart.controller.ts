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
    const { id_package, id_product, quantity } = req.body
    if (id_package) {
      const item = await cartService.addPackageItem(req.user!.id_user, Number(id_package))
      return res.status(201).json({ data: item })
    }
    if (id_product) {
      const item = await cartService.addProductItem(req.user!.id_user, Number(id_product), Number(quantity || 1))
      return res.status(201).json({ data: item })
    }
    throw createError(400, 'id_package or id_product is required')
  } catch (err) {
    next(err)
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity } = req.body
    const item = await cartService.updateItemQuantity(Number(req.params.itemId), Number(quantity))
    res.json({ data: item })
  } catch (err) {
    next(err)
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.removeItem(Number(req.params.itemId))
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
