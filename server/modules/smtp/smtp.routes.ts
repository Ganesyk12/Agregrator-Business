import { Router } from 'express'
import { authenticate, authorize } from '../../middleware/auth'
import * as smtpCtrl from './smtp.controller'

const router = Router()

// All SMTP configuration routes are restricted exclusively to Administrator & SuperAdmin
router.use(authenticate, authorize('eUser-Admin', 'eUser-SuperAdmin'))

router.get('/', smtpCtrl.getConfig)
router.put('/', smtpCtrl.updateConfig)
router.post('/test', smtpCtrl.testConnection)

export default router
