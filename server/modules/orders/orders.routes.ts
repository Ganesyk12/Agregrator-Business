import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import * as orderCtrl from './orders.controller'

const router = Router()

router.post('/', authenticate, orderCtrl.createOrder)
router.get('/', authenticate, orderCtrl.getMyOrders)
router.get('/vendor/:vendorId', authenticate, orderCtrl.getVendorOrders)
router.get('/:orderId', authenticate, orderCtrl.getOrder)
router.patch('/:orderId/status', authenticate, orderCtrl.updateStatus)

export default router
