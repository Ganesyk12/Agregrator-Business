import { Router } from 'express'
import * as portfolioCtrl from './portfolios.controller'

const router = Router()

router.get('/', portfolioCtrl.getAll)
router.post('/', portfolioCtrl.create)
router.put('/reorder', portfolioCtrl.reorder)
router.get('/vendor/:vendorId', portfolioCtrl.getByVendor)
router.get('/vendor/:vendorId/info', portfolioCtrl.getVendorInfo)
router.get('/:id', portfolioCtrl.getById)
router.get('/:id/related', portfolioCtrl.getRelated)
router.put('/:id', portfolioCtrl.update)
router.delete('/:id', portfolioCtrl.remove)

export default router
