import { Router } from 'express'
import * as userCtrl from './users.controller'

const router = Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Daftar semua user
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
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', userCtrl.getAll)

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Detail user by ID
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
 *                 data: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userCtrl.getById)
router.post('/', userCtrl.create)
router.put('/:id', userCtrl.update)
router.delete('/:id', userCtrl.remove)

export default router
