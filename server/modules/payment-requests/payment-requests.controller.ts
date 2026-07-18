import type { Request, Response, NextFunction } from 'express'
import * as paymentRequestService from './payment-requests.service'
import { createError } from '../../middleware/error-handler'

export async function getAll(_req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await paymentRequestService.findAll()
    res.json({ data: requests })
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const request = await paymentRequestService.findById(id)
    if (!request) {
      res.status(404).json({ error: { message: 'Payment request not found' } })
      return
    }
    res.json({ data: request })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, requested_by, notes, payment_method, bank_account_number, payment_to, status, items } = req.body
    if (!title || !requested_by || !items || !items.length) {
      throw createError(400, 'title, requested_by, and items are required')
    }

    const request = await paymentRequestService.create({
      title,
      description: description || null,
      requested_by: Number(requested_by),
      notes: notes || null,
      payment_method: payment_method || null,
      bank_account_number: bank_account_number || null,
      payment_to: payment_to || null,
      status: status || 'draft',
      items: items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity ? Number(item.quantity) : 1,
        unit_price: item.unit_price ? Number(item.unit_price) : Number(item.amount),
        amount: Number(item.amount),
        notes: item.notes || null,
      })),
    })

    if (status === 'pending') {
      await paymentRequestService.addTransaction(request.id_request, {
        transaction_type: 'submitted',
        description: 'Payment request submitted',
        payment_proof_url: req.body.attachment_url || null,
        created_by: req.body.user_created || 'SYSTEM',
      })
    }

    res.status(201).json({ data: request })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { title, description, notes, payment_method, bank_account_number, payment_to, status, reviewed_by, approval_notes, items } = req.body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (notes !== undefined) updateData.notes = notes
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (bank_account_number !== undefined) updateData.bank_account_number = bank_account_number
    if (payment_to !== undefined) updateData.payment_to = payment_to
    if (status !== undefined) updateData.status = status
    if (reviewed_by !== undefined) updateData.reviewed_by = Number(reviewed_by)
    if (approval_notes !== undefined) updateData.approval_notes = approval_notes
    updateData.user_modified = req.body.user_modified || 'SYSTEM'

    if (items !== undefined) {
      updateData.items = items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity ? Number(item.quantity) : 1,
        unit_price: item.unit_price ? Number(item.unit_price) : Number(item.amount),
        amount: Number(item.amount),
        notes: item.notes || null,
      }))
    }

    if (['approved', 'rejected', 'revision'].includes(status)) {
      updateData.reviewed_at = new Date()
    }

    const request = await paymentRequestService.update(id, updateData)
    if (!request) {
      res.status(404).json({ error: { message: 'Payment request not found' } })
      return
    }

    if (status === 'pending') {
      await paymentRequestService.addTransaction(id, {
        transaction_type: 'submitted',
        description: approval_notes || 'Payment request submitted',
        payment_proof_url: req.body.attachment_url || null,
        created_by: req.body.user_modified || 'SYSTEM',
      })
    } else if (['approved', 'rejected', 'revision'].includes(status)) {
      await paymentRequestService.addTransaction(id, {
        transaction_type: status,
        description: approval_notes || `Request ${status}`,
        payment_proof_url: req.body.attachment_url || null,
        created_by: req.body.user_modified || 'SYSTEM',
      })
    }

    res.json({ data: request })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const deleted = await paymentRequestService.remove(id)
    if (!deleted) {
      res.status(404).json({ error: { message: 'Payment request not found' } })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

export async function addTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { transaction_type, description, payment_proof_url, payment_method, bank_name, bank_account_number, bank_account_name, reference_number, paid_at, created_by } = req.body

    if (!transaction_type) {
      throw createError(400, 'transaction_type is required')
    }

    const request = await paymentRequestService.findById(id)
    if (!request) {
      res.status(404).json({ error: { message: 'Payment request not found' } })
      return
    }

    const transaction = await paymentRequestService.addTransaction(id, {
      transaction_type,
      description: description || null,
      payment_proof_url: payment_proof_url || null,
      payment_method: payment_method || null,
      bank_name: bank_name || null,
      bank_account_number: bank_account_number || null,
      bank_account_name: bank_account_name || null,
      reference_number: reference_number || null,
      paid_at: paid_at ? new Date(paid_at) : null,
      created_by: created_by || 'SYSTEM',
    })

    res.status(201).json({ data: transaction })
  } catch (err) {
    next(err)
  }
}

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const transactions = await paymentRequestService.getTransactions(id)
    res.json({ data: transactions })
  } catch (err) {
    next(err)
  }
}
