import { Router } from 'express'
import { authenticate } from '../../middleware/auth'
import * as favoriteCtrl from './favorites.controller'

const router = Router()

router.get('/', authenticate, favoriteCtrl.getAll)
router.post('/', authenticate, favoriteCtrl.add)
router.get('/check/:packageId', authenticate, favoriteCtrl.check)
router.delete('/:packageId', authenticate, favoriteCtrl.remove)

export default router
