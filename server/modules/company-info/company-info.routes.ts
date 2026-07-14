import { Router } from 'express'
import * as companyInfoCtrl from './company-info.controller'

const router = Router()

router.get('/', companyInfoCtrl.get)
router.put('/', companyInfoCtrl.update)

export default router
