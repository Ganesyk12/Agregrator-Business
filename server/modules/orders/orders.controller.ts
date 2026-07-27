import type { Request, Response, NextFunction } from 'express'
import * as orderService from './orders.service'
import { createError } from '../../middleware/error-handler'

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_vendor, items, delivery_info, notes } = req.body
    if (!id_vendor || !items?.length) throw createError(400, 'id_vendor and items are required')
    const order = await orderService.createOrder(req.user!.id_user, Number(id_vendor), items, delivery_info, notes)
    res.status(201).json({ data: order })
  } catch (err) {
    next(err)
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.getUserOrders(req.user!.id_user)
    res.json({ data: orders })
  } catch (err) {
    next(err)
  }
}

export async function getVendorOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const vendorId = Number(req.params.vendorId)
    const orders = await orderService.getVendorOrders(vendorId)
    res.json({ data: orders })
  } catch (err) {
    next(err)
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderById(Number(req.params.orderId))
    if (!order) throw createError(404, 'Order not found')
    res.json({ data: order })
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      throw createError(400, 'Invalid status')
    }
    const order = await orderService.updateOrderStatus(Number(req.params.orderId), status)
    res.json({ data: order })
  } catch (err) {
    next(err)
  }
}
