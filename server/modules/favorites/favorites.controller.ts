import type { Request, Response, NextFunction } from 'express'
import * as favoriteService from './favorites.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id_user
    const items = await favoriteService.findByUser(userId)
    res.json({ data: items })
  } catch (err) {
    next(err)
  }
}

export async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id_user
    const { id_package } = req.body
    if (!id_package) throw createError(400, 'id_package is required')
    const fav = await favoriteService.add(userId, Number(id_package))
    res.status(201).json({ data: fav })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id_user
    const packageId = Number(req.params.packageId)
    const deleted = await favoriteService.remove(userId, packageId)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Favorite not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function check(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id_user
    const packageId = Number(req.params.packageId)
    const favorited = await favoriteService.isFavorited(userId, packageId)
    res.json({ data: { is_favorited: favorited } })
  } catch (err) {
    next(err)
  }
}
