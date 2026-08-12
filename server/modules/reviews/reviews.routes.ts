import { Router } from 'express'
import * as reviewsCtrl from './reviews.controller'

const router = Router()

router.get('/', reviewsCtrl.getByVendor)

export default router
