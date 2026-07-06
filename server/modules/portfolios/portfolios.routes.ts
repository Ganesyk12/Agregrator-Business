import { Router } from 'express'
import * as portfolioCtrl from './portfolios.controller'

const router = Router()

/**
 * @openapi
 * /api/portfolios:
 *   get:
 *     tags: [Portfolios]
 *     summary: Daftar semua portfolio
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
router.get('/', portfolioCtrl.getAll)

/**
 * @openapi
 * /api/portfolios/{id}:
 *   get:
 *     tags: [Portfolios]
 *     summary: Detail portfolio by ID
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
 *         description: Portfolio tidak ditemukan
 */
router.get('/:id', portfolioCtrl.getById)

/**
 * @openapi
 * /api/portfolios/{id}/related:
 *   get:
 *     tags: [Portfolios]
 *     summary: Portfolio terkait dari vendor yang sama
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 */
router.get('/:id/related', portfolioCtrl.getRelated)

/**
 * @openapi
 * /api/portfolios/vendor/{vendorId}/info:
 *   get:
 *     tags: [Portfolios]
 *     summary: Info vendor termasuk reviews, packages, availability
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Berhasil
 */
router.get('/vendor/:vendorId/info', portfolioCtrl.getVendorInfo)

export default router
