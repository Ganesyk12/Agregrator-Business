import { Router } from 'express'
import * as commissionCtrl from './commissions.controller'

const router = Router()

/**
 * @openapi
 * /api/commissions:
 *   get:
 *     tags: [Commissions]
 *     summary: Daftar semua komisi
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
 *                     $ref: '#/components/schemas/Commission'
 *   post:
 *     tags: [Commissions]
 *     summary: Buat komisi baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_booking, percentage, amount]
 *             properties:
 *               id_booking: { type: integer }
 *               percentage: { type: number }
 *               amount: { type: number }
 *     responses:
 *       201:
 *         description: Komisi berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Commission' }
 */
router.get('/', commissionCtrl.getAll)

/**
 * @openapi
 * /api/commissions/{id}:
 *   get:
 *     tags: [Commissions]
 *     summary: Detail komisi by ID
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
 *                 data: { $ref: '#/components/schemas/Commission' }
 *       404:
 *         description: Komisi tidak ditemukan
 *   put:
 *     tags: [Commissions]
 *     summary: Update data komisi
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
 *               percentage: { type: number }
 *               amount: { type: number }
 *               status: { type: string, enum: [pending, paid, cancelled] }
 *     responses:
 *       200:
 *         description: Komisi berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Commission' }
 *       404:
 *         description: Komisi tidak ditemukan
 *   delete:
 *     tags: [Commissions]
 *     summary: Hapus komisi (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Komisi tidak ditemukan
 */
router.get('/:id', commissionCtrl.getById)
router.post('/', commissionCtrl.create)
router.put('/:id', commissionCtrl.update)
router.delete('/:id', commissionCtrl.remove)

export default router
