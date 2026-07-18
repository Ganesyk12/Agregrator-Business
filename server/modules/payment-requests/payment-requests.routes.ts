import { Router } from 'express'
import * as ctrl from './payment-requests.controller'

const router = Router()

/**
 * @openapi
 * /api/payment-requests:
 *   get:
 *     tags: [Payment Requests]
 *     summary: Daftar semua payment request
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     tags: [Payment Requests]
 *     summary: Buat payment request baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, requested_by, items]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               requested_by: { type: integer }
 *               notes: { type: string }
 *               payment_method: { type: string }
 *               bank_account_number: { type: string }
 *               payment_to: { type: string }
 *               status: { type: string, enum: [draft, pending] }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [description, amount]
 *                   properties:
 *                     description: { type: string }
 *                     quantity: { type: integer }
 *                     unit_price: { type: number }
 *                     amount: { type: number }
 *                     notes: { type: string }
 *     responses:
 *       201:
 *         description: Payment request berhasil dibuat
 */
router.get('/', ctrl.getAll)
router.post('/', ctrl.create)

/**
 * @openapi
 * /api/payment-requests/{id}:
 *   get:
 *     tags: [Payment Requests]
 *     summary: Detail payment request by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 *   put:
 *     tags: [Payment Requests]
 *     summary: Update payment request
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               notes: { type: string }
 *               payment_method: { type: string }
 *               bank_account_number: { type: string }
 *               payment_to: { type: string }
 *               status: { type: string, enum: [draft, pending, approved, rejected, revision] }
 *               reviewed_by: { type: integer }
 *               approval_notes: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description: { type: string }
 *                     quantity: { type: integer }
 *                     unit_price: { type: number }
 *                     amount: { type: number }
 *                     notes: { type: string }
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *   delete:
 *     tags: [Payment Requests]
 *     summary: Hapus payment request (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */
router.get('/:id', ctrl.getById)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

/**
 * @openapi
 * /api/payment-requests/{id}/transactions:
 *   get:
 *     tags: [Payment Requests]
 *     summary: Daftar transaksi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     tags: [Payment Requests]
 *     summary: Tambah transaksi
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
 *             required: [transaction_type]
 *             properties:
 *               transaction_type: { type: string }
 *               description: { type: string }
 *               payment_proof_url: { type: string }
 *               payment_method: { type: string }
 *               bank_name: { type: string }
 *               bank_account_number: { type: string }
 *               bank_account_name: { type: string }
 *               reference_number: { type: string }
 *               paid_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Transaksi berhasil ditambahkan
 */
router.get('/:id/transactions', ctrl.getTransactions)
router.post('/:id/transactions', ctrl.addTransaction)

export default router
