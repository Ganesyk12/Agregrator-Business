import { Router } from 'express'
import * as portfolioCtrl from './portfolios.controller'

const router = Router()

/**
 * @openapi
 * /api/portfolios:
 *   get:
 *     tags: [Portfolios]
 *     summary: Daftar semua portofolio
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
 *                     $ref: '#/components/schemas/Portfolio'
 *   post:
 *     tags: [Portfolios]
 *     summary: Tambah portofolio baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_vendor, media_url]
 *             properties:
 *               id_vendor: { type: integer }
 *               media_url: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               label: { type: string }
 *               sort_order: { type: integer, default: 0 }
 *     responses:
 *       201:
 *         description: Portofolio berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Portfolio' }
 */
router.get('/', portfolioCtrl.getAll)
router.post('/', portfolioCtrl.create)

/**
 * @openapi
 * /api/portfolios/reorder:
 *   put:
 *     tags: [Portfolios]
 *     summary: Susun ulang urutan portofolio (sort_order)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [id_portfolio, sort_order]
 *                   properties:
 *                     id_portfolio: { type: integer }
 *                     sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil diurutkan
 */
router.put('/reorder', portfolioCtrl.reorder)

/**
 * @openapi
 * /api/portfolios/vendor/{vendorId}:
 *   get:
 *     tags: [Portfolios]
 *     summary: Daftar portofolio berdasarkan ID Vendor
 *     parameters:
 *       - in: path
 *         name: vendorId
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Portfolio'
 */
router.get('/vendor/:vendorId', portfolioCtrl.getByVendor)

/**
 * @openapi
 * /api/portfolios/{id}:
 *   get:
 *     tags: [Portfolios]
 *     summary: Detail portofolio by ID
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
 *                 data: { $ref: '#/components/schemas/Portfolio' }
 *       404:
 *         description: Portofolio tidak ditemukan
 *   put:
 *     tags: [Portfolios]
 *     summary: Update portofolio
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
 *               media_url: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               label: { type: string }
 *               sort_order: { type: integer }
 *               status: { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Portfolio' }
 *       404:
 *         description: Portofolio tidak ditemukan
 *   delete:
 *     tags: [Portfolios]
 *     summary: Hapus portofolio (soft-delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Portofolio tidak ditemukan
 */
router.get('/:id', portfolioCtrl.getById)
router.put('/:id', portfolioCtrl.update)
router.delete('/:id', portfolioCtrl.remove)

export default router
