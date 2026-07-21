import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import * as cartCtrl from './cart.controller'

const router = Router()

router.get('/', authenticate, cartCtrl.getMyCart)
router.post('/items', authenticate, cartCtrl.addItem)
router.delete('/items/:itemId', authenticate, cartCtrl.removeItem)
router.delete('/', authenticate, cartCtrl.clearCart)

export default router
