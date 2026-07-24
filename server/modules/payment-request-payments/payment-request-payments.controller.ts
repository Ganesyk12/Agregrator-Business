import type { Request, Response, NextFunction } from 'express'
import * as svc from './payment-request-payments.service'
import * as requestSvc from '../payment-requests/payment-requests.service'
import { createError } from '../../middleware/error-handler'

export async function getTermsByRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const terms = await svc.getTermsByRequest(id)
    res.json({ data: terms })
  } catch (err) {
    next(err)
  }
}

export async function getPaymentsByRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const payments = await svc.getPaymentsByRequest(id)
    res.json({ data: payments })
  } catch (err) {
    next(err)
  }
}

export async function createPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const { id_rfp_term, amount, source_bank, source_account_number, source_account_name, payment_date, proof_url, notes, created_by } = req.body

    if (!id_rfp_term || !amount) {
      throw createError(400, 'id_rfp_term and amount are required')
    }

    const request = await requestSvc.findById(id)
    if (!request) {
      res.status(404).json({ error: { message: 'Payment request not found' } })
      return
    }

    if (request.status !== 'approved') {
      throw createError(400, 'Payment request must be approved before making payments')
    }

    const term = await svc.getTermById(Number(id_rfp_term))
    if (!term || term.id_request !== id) {
      res.status(404).json({ error: { message: 'Payment term not found' } })
      return
    }

    const payment = await svc.createPayment({
      id_request: id,
      id_rfp_term: Number(id_rfp_term),
      amount: Number(amount),
      source_bank: source_bank || null,
      source_account_number: source_account_number || null,
      source_account_name: source_account_name || null,
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      proof_url: proof_url || null,
      notes: notes || null,
      created_by: created_by || 'SYSTEM',
    })

    res.status(201).json({ data: payment })
  } catch (err) {
    next(err)
  }
}
