import { Router } from 'express'
import { authenticate, optionalAuthenticate } from '../../middleware/auth'
import * as orderCtrl from './orders.controller'

const router = Router()

router.post('/', optionalAuthenticate, orderCtrl.createOrder)
router.get('/', authenticate, orderCtrl.getMyOrders)
router.get('/vendor/:vendorId', authenticate, orderCtrl.getVendorOrders)
router.get('/:orderId', authenticate, orderCtrl.getOrder)
router.patch('/:orderId/status', authenticate, orderCtrl.updateStatus)
router.patch('/:orderId/fulfillment', authenticate, orderCtrl.updateFulfillment)

export default router
