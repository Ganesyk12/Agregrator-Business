import type { Request, Response, NextFunction } from 'express'
import * as bookingService from './bookings.service'
import { createError } from '../../middleware/error-handler'
import * as userService from '../users/users.service'
import prisma from '../../db'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { vendorId } = req.query
    let bookings
    if (vendorId) {
      bookings = await bookingService.findByVendor(Number(vendorId))
    } else {
      bookings = await bookingService.findAll()
    }
    res.json({ data: bookings })
  } catch (err) {
    next(err)
  }
}

export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user!.id_user
    const bookings = await bookingService.findByUser(userId)
    res.json({ data: bookings })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const booking = await bookingService.findById(id)
    if (!booking) {
      res.status(404).json({ error: { message: 'Booking not found' } })
      return
    }
    res.json({ data: booking })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_user, guest_info, package_ids, products, event_date, event_location, total_price, dp_amount, notes } = req.body
    
    let userId = req.user?.id_user || (id_user ? Number(id_user) : null)

    if (!userId && guest_info && guest_info.email) {
      const email = guest_info.email.toLowerCase().trim()
      const fullName = guest_info.fullName || guest_info.full_name || 'Customer'
      const phone = guest_info.phone || null

      let user = await userService.findByEmail(email)
      if (!user) {
        user = await userService.create({
          email,
          password: '123456',
          full_name: fullName,
          phone,
        })
        await prisma.user_Role.create({
          data: {
            email,
            role_code: 'eUser-Customer',
            user_created: 'SYSTEM',
          }
        })
      }
      userId = user.id_user
    }

    if (!userId || !package_ids?.length || !event_date || total_price === undefined) {
      throw createError(400, 'id_user (or guest_info), package_ids (array), event_date, and total_price are required')
    }

    const booking = await bookingService.create({
      id_user: Number(userId),
      package_ids: (package_ids as number[]).map(Number),
      products: products ? (products as any[]) : undefined,
      event_date: new Date(event_date),
      event_location: event_location || null,
      total_price: Number(total_price),
      dp_amount: dp_amount ? Number(dp_amount) : 0,
      notes: notes || null,
    })

    res.status(201).json({ data: booking })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { event_date, event_location, total_price, dp_amount, status, notes, package_ids } = req.body

    const updateData: any = {}
    if (event_date) updateData.event_date = new Date(event_date)
    if (event_location !== undefined) updateData.event_location = event_location
    if (total_price !== undefined) updateData.total_price = Number(total_price)
    if (dp_amount !== undefined) updateData.dp_amount = Number(dp_amount)
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (package_ids !== undefined) updateData.package_ids = (package_ids as number[]).map(Number)

    const booking = await bookingService.update(id, updateData)
    if (!booking) {
      res.status(404).json({ error: { message: 'Booking not found' } })
      return
    }
    res.json({ data: booking })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await bookingService.remove(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Booking not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
