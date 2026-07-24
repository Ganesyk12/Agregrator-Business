import { Router } from 'express'
import * as ctrl from './payment-terms.controller'

const router = Router()

/**
 * @openapi
 * /api/payment-terms/bookings/{bookingId}:
 *   get:
 *     tags: [Payment Terms]
 *     summary: Daftar termin pembayaran untuk booking
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 *   post:
 *     tags: [Payment Terms]
 *     summary: Simpan termin pembayaran (replace all)
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [terms]
 *             properties:
 *               terms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [term_name, amount]
 *                   properties:
 *                     term_order: { type: integer }
 *                     term_name: { type: string }
 *                     amount: { type: number }
 *                     due_date: { type: string, format: date }
 *                     notes: { type: string }
 *     responses:
 *       200:
 *         description: Berhasil
 */
router.get('/bookings/:bookingId', ctrl.getByBooking)
router.post('/bookings/:bookingId', ctrl.upsert)

/**
 * @openapi
 * /api/payment-terms/bookings/{bookingId}/auto-generate:
 *   post:
 *     tags: [Payment Terms]
 *     summary: Generate termin otomatis dari total_price dan dp_amount
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [total_price]
 *             properties:
 *               total_price: { type: number }
 *               dp_amount: { type: number }
 *     responses:
 *       200:
 *         description: Berhasil
 */
router.post('/bookings/:bookingId/auto-generate', ctrl.autoGenerate)

/**
 * @openapi
 * /api/payment-terms/{id}:
 *   delete:
 *     tags: [Payment Terms]
 *     summary: Hapus termin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil
 */
router.delete('/:id', ctrl.remove)

export default router
