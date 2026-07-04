import { Router } from 'express'
import * as bookingCtrl from './bookings.controller'

const router = Router()

router.get('/', bookingCtrl.getAll)
router.get('/:id', bookingCtrl.getById)
router.post('/', bookingCtrl.create)
router.put('/:id', bookingCtrl.update)
router.delete('/:id', bookingCtrl.remove)

export default router
