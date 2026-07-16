import type { Request, Response, NextFunction } from 'express'
import * as contactMessageService from './contact-messages.service'
import { createError } from '../../middleware/error-handler'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !email || !message) {
      throw createError(400, 'name, email, and message are required')
    }
    const msg = await contactMessageService.create({ name, email, subject, message })
    res.status(201).json({ data: msg })
  } catch (err) {
    next(err)
  }
}

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const messages = await contactMessageService.findAll()
    res.json({ data: messages })
  } catch (err) {
    next(err)
  }
}
