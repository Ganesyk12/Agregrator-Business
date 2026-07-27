import { Router } from 'express'
import * as paymentCtrl from './payments.controller'

const router = Router()

/**
 * @openapi
 * /api/payments:
 *   get:
 *     tags: [BookingPayments]
 *     summary: Daftar semua booking payment
 *     responses:
 *       200:
 *         description: Berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *   post:
 *     tags: [BookingPayments]
 *     summary: Buat booking payment baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_booking, amount, payment_type]
 *             properties:
 *               id_booking: { type: integer }
 *               amount: { type: number }
 *               payment_type: { type: string }
 *               payment_proof_url: { type: string }
 *               paid_at: { type: string, format: date-time }
 *               released_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Payment berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payment' }
 */
router.get('/', paymentCtrl.getAll)

/**
 * @openapi
 * /api/payments/{id}:
 *   get:
 *     tags: [BookingPayments]
 *     summary: Detail booking payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payment' }
 *       404:
 *         description: Payment tidak ditemukan
 *   put:
 *     tags: [BookingPayments]
 *     summary: Update data booking payment
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
 *               amount: { type: number }
 *               payment_type: { type: string }
 *               status: { type: string, enum: [pending, paid, released, cancelled] }
 *               payment_proof_url: { type: string }
 *               paid_at: { type: string, format: date-time }
 *               released_at: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Payment berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payment' }
 *       404:
 *         description: Payment tidak ditemukan
 *   delete:
 *     tags: [BookingPayments]
 *     summary: Hapus booking payment (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Payment tidak ditemukan
 */
router.get('/:id', paymentCtrl.getById)
router.post('/', paymentCtrl.create)
router.put('/:id', paymentCtrl.update)
router.delete('/:id', paymentCtrl.remove)

export default router
