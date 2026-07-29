import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { createError } from '../../middleware/error-handler'

const router = Router()
const guardPath = path.resolve(process.cwd(), 'server', 'config', 'guard.json')

router.get('/', (_req, res) => {
  const config = JSON.parse(fs.readFileSync(guardPath, 'utf-8'))
  res.json({ data: config })
})

router.post('/activate', (req, res) => {
  const { user_id } = req.body
  if (!user_id) {
    throw createError(400, 'user_id is required')
  }

  const config = JSON.parse(fs.readFileSync(guardPath, 'utf-8'))

  if (config.activated_at) {
    throw createError(400, 'System is already activated')
  }

  config.activated_at = new Date().toISOString()
  config.user_activate = user_id

  fs.writeFileSync(guardPath, JSON.stringify(config, null, 2))
  res.json({ message: 'System activated successfully', data: config })
})

export default router
