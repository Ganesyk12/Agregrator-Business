import { Router } from 'express'
import * as userRoleCtrl from './user-roles.controller'

const router = Router()

/**
 * @openapi
 * /api/user-roles:
 *   get:
 *     tags: [UserRoles]
 *     summary: Daftar semua user role
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
 *                     $ref: '#/components/schemas/UserRole'
 *   post:
 *     tags: [UserRoles]
 *     summary: Assign role ke user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, role_code]
 *             properties:
 *               email:     { type: string }
 *               role_code: { type: string }
 *     responses:
 *       201:
 *         description: Role berhasil diassign
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/UserRole' }
 *       409:
 *         description: User sudah punya role ini
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', userRoleCtrl.getAll)
router.post('/', userRoleCtrl.create)

/**
 * @openapi
 * /api/user-roles/email/{email}:
 *   get:
 *     tags: [UserRoles]
 *     summary: User roles by email
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
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
 *                     $ref: '#/components/schemas/UserRole'
 */
router.get('/email/:email', userRoleCtrl.getByEmail)
router.put('/email/:email', userRoleCtrl.syncByEmail)

/**
 * @openapi
 * /api/user-roles/{id}:
 *   get:
 *     tags: [UserRoles]
 *     summary: Detail user role by ID
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
 *                 data: { $ref: '#/components/schemas/UserRole' }
 *       404:
 *         description: User role tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     tags: [UserRoles]
 *     summary: Update user role
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
 *               role_code: { type: string }
 *               status:    { type: string, enum: [active, inactive] }
 *     responses:
 *       200:
 *         description: Berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/UserRole' }
 *       404:
 *         description: User role tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [UserRoles]
 *     summary: Hapus user role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 *       404:
 *         description: User role tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userRoleCtrl.getById)
router.put('/:id', userRoleCtrl.update)
router.delete('/:id', userRoleCtrl.remove)

export default router
