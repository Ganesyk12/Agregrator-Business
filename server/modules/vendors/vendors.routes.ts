import { Router } from 'express'
import * as vendorCtrl from './vendors.controller'

const router = Router()

/**
 * @openapi
 * /api/vendors:
 *   get:
 *     tags: [Vendors]
 *     summary: Daftar semua vendor
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
 *                     $ref: '#/components/schemas/Vendor'
 */
router.get('/', vendorCtrl.getAll)

/**
 * @openapi
 * /api/vendors/{id}:
 *   get:
 *     tags: [Vendors]
 *     summary: Detail vendor by ID
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
 *                 data: { $ref: '#/components/schemas/Vendor' }
 *       404:
 *         description: Vendor tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', vendorCtrl.getById)

export default router
