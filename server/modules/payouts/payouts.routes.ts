import { Router } from 'express'
import * as payoutCtrl from './payouts.controller'

const router = Router()

/**
 * @openapi
 * /api/payouts:
 *   get:
 *     tags: [Payouts]
 *     summary: Daftar semua payout
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
 *                     $ref: '#/components/schemas/Payout'
 *   post:
 *     tags: [Payouts]
 *     summary: Buat payout baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_vendor, id_booking, amount]
 *             properties:
 *               id_vendor: { type: integer }
 *               id_booking: { type: integer }
 *               amount: { type: number }
 *               paid_at: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Payout berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payout' }
 */
router.get('/', payoutCtrl.getAll)

/**
 * @openapi
 * /api/payouts/{id}:
 *   get:
 *     tags: [Payouts]
 *     summary: Detail payout by ID
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
 *                 data: { $ref: '#/components/schemas/Payout' }
 *       404:
 *         description: Payout tidak ditemukan
 *   put:
 *     tags: [Payouts]
 *     summary: Update data payout
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
 *               status: { type: string, enum: [pending, paid, cancelled] }
 *               paid_at: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Payout berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Payout' }
 *       404:
 *         description: Payout tidak ditemukan
 *   delete:
 *     tags: [Payouts]
 *     summary: Hapus payout (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Payout tidak ditemukan
 */
router.get('/:id', payoutCtrl.getById)
router.post('/', payoutCtrl.create)
router.put('/:id', payoutCtrl.update)
router.delete('/:id', payoutCtrl.remove)

export default router
