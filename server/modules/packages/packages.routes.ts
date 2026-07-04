import { Router } from 'express'
import * as packageCtrl from './packages.controller'

const router = Router()

/**
 * @openapi
 * /api/packages:
 *   get:
 *     tags: [Packages]
 *     summary: Daftar semua paket
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
 *                     $ref: '#/components/schemas/Package'
 *   post:
 *     tags: [Packages]
 *     summary: Tambah paket baru
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_vendor, name, price]
 *             properties:
 *               id_vendor:      { type: integer }
 *               name:           { type: string }
 *               description:    { type: string }
 *               price:          { type: number }
 *               duration:       { type: string }
 *               whats_included: { type: string }
 *     responses:
 *       201:
 *         description: Paket berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Package' }
 *       400:
 *         description: Validasi gagal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', packageCtrl.getAll)
router.post('/', packageCtrl.create)

/**
 * @openapi
 * /api/packages/vendor/{vendorId}:
 *   get:
 *     tags: [Packages]
 *     summary: Daftar paket berdasarkan vendor
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
 *                     $ref: '#/components/schemas/Package'
 */
router.get('/vendor/:vendorId', packageCtrl.getByVendor)

/**
 * @openapi
 * /api/packages/{id}:
 *   get:
 *     tags: [Packages]
 *     summary: Detail paket by ID
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
 *                 data: { $ref: '#/components/schemas/Package' }
 *       404:
 *         description: Paket tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [Packages]
 *     summary: Update paket
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
 *               name:           { type: string }
 *               description:    { type: string }
 *               price:          { type: number }
 *               duration:       { type: string }
 *               whats_included: { type: string }
 *               status:         { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Package' }
 *       404:
 *         description: Paket tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Packages]
 *     summary: Hapus paket
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: Paket tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', packageCtrl.getById)
router.put('/:id', packageCtrl.update)
router.delete('/:id', packageCtrl.remove)

export default router
