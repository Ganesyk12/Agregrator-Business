import { Router } from 'express'
import * as ctrl from './payment-request-payments.controller'

const router = Router()

/**
 * @openapi
 * /api/payment-requests/{id}/terms:
 *   get:
 *     tags: [Payment Request Terms]
 *     summary: Get payment terms for a request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of payment terms
 */
router.get('/:id/terms', ctrl.getTermsByRequest)

/**
 * @openapi
 * /api/payment-requests/{id}/payments:
 *   get:
 *     tags: [RFP Payments]
 *     summary: Get RFP payments for a request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of payments
 *   post:
 *     tags: [RFP Payments]
 *     summary: Create an RFP payment for a request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_term, amount]
 *             properties:
 *               id_term: { type: integer }
 *               amount: { type: number }
 *               source_bank: { type: string }
 *               source_account_number: { type: string }
 *               source_account_name: { type: string }
 *               payment_date: { type: string, format: date-time }
 *               proof_url: { type: string }
 *               notes: { type: string }
 *               created_by: { type: string }
 *     responses:
 *       201:
 *         description: Payment created
 */
router.get('/:id/payments', ctrl.getPaymentsByRequest)
router.post('/:id/payments', ctrl.createPayment)

export default router
