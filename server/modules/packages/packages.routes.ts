import { Router } from 'express'
import * as packageCtrl from './packages.controller'

const router = Router()

router.get('/', packageCtrl.getAll)
router.post('/', packageCtrl.create)

router.get('/vendor/:vendorId', packageCtrl.getByVendor)

router.get('/:id', packageCtrl.getById)
router.put('/:id', packageCtrl.update)
router.delete('/:id', packageCtrl.remove)

router.post('/:id/extras', packageCtrl.addExtra)
router.put('/:id/extras/:extraId', packageCtrl.updateExtra)
router.delete('/:id/extras/:extraId', packageCtrl.removeExtra)

export default router
