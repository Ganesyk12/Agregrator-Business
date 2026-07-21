import { Router } from 'express'
import * as contactMessageCtrl from './contact-messages.controller'

const router = Router()

router.post('/', contactMessageCtrl.create)
router.get('/', contactMessageCtrl.getAll)

export default router
