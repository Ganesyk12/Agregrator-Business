import { Router } from 'express'
import * as bookingCtrl from './bookings.controller'

const router = Router()

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Daftar semua booking
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
 *                     $ref: '#/components/schemas/Booking'
 *   post:
 *     tags: [Bookings]
 *     summary: Buat booking baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_user, id_vendor, package_ids, event_date, total_price]
 *             properties:
 *               id_user: { type: integer }
 *               id_vendor: { type: integer }
 *               package_ids: { type: array, items: { type: integer } }
 *               event_date: { type: string, format: date-time }
 *               event_location: { type: string }
 *               total_price: { type: number }
 *               dp_amount: { type: number }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Booking berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Booking' }
 */
router.get('/', bookingCtrl.getAll)

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Detail booking by ID
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
 *                 data: { $ref: '#/components/schemas/Booking' }
 *       404:
 *         description: Booking tidak ditemukan
 *   put:
 *     tags: [Bookings]
 *     summary: Update data booking
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
 *               event_date: { type: string, format: date-time }
 *               event_location: { type: string }
 *               total_price: { type: number }
 *               dp_amount: { type: number }
 *               status: { type: string, enum: [pending, confirmed, completed, cancelled] }
 *               notes: { type: string }
 *               package_ids: { type: array, items: { type: integer } }
 *     responses:
 *       200:
 *         description: Booking berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Booking' }
 *       404:
 *         description: Booking tidak ditemukan
 *   delete:
 *     tags: [Bookings]
 *     summary: Hapus booking (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Booking tidak ditemukan
 */
router.get('/:id', bookingCtrl.getById)
router.post('/', bookingCtrl.create)
router.put('/:id', bookingCtrl.update)
router.delete('/:id', bookingCtrl.remove)

export default router
