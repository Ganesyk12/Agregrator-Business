import { Router } from 'express'

const router = Router()

const LOCATIONS = [
  'Jakarta',
  'Bogor',
  'Depok',
  'Tangerang',
  'Bekasi',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
  'Semarang',
  'Malang',
  'Solo',
  'Medan',
  'Makassar',
  'Denpasar',
  'Palembang'
]

/**
 * @openapi
 * /api/locations:
 *   get:
 *     tags: [Locations]
 *     summary: Daftar semua lokasi / kota
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
 *                     type: string
 */
router.get('/', (_req, res) => {
  res.json({ data: LOCATIONS })
})

export default router
