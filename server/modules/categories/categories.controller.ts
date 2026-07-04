import type { Request, Response, NextFunction } from 'express'
import * as categoryService from './categories.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.findAll()
    res.json({ data: categories })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      throw createError(400, 'Invalid category ID')
    }
    const category = await categoryService.findById(id)
    if (!category) {
      res.status(404).json({ error: { message: 'Category not found' } })
      return
    }
    res.json({ data: category })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { category_name } = req.body
    if (!category_name) {
      throw createError(400, 'category_name is required')
    }
    const existing = await categoryService.findByName(category_name)
    if (existing) {
      throw createError(409, 'Category name already exists')
    }
    const category = await categoryService.create({ category_name })
    res.status(201).json({ data: category })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      throw createError(400, 'Invalid category ID')
    }
    const { category_name, status } = req.body
    if (category_name) {
      const existing = await categoryService.findByName(category_name)
      if (existing && existing.id_category !== id) {
        throw createError(409, 'Category name already exists')
      }
    }
    const category = await categoryService.update(id, { category_name, status })
    if (!category) {
      res.status(404).json({ error: { message: 'Category not found' } })
      return
    }
    res.json({ data: category })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      throw createError(400, 'Invalid category ID')
    }
    const deleted = await categoryService.remove(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Category not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
