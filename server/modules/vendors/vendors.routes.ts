import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import * as vendorCtrl from './vendors.controller'

const router = Router()

router.get('/', vendorCtrl.getAll)
router.get('/me', authenticate, vendorCtrl.getMe)
router.patch('/me', authenticate, vendorCtrl.updateMe)
router.get('/:id', vendorCtrl.getById)
router.post('/', vendorCtrl.create)
router.put('/:id', vendorCtrl.update)
router.delete('/:id', vendorCtrl.remove)
router.patch('/:id/approve', vendorCtrl.approve)

export default router
