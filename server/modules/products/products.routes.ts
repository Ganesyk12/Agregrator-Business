import { Router } from 'express'
import * as productController from './products.controller'

const router = Router()

router.get('/', productController.getAll)
router.post('/', productController.create)
router.get('/occasions', productController.getOccasions)
router.get('/types', productController.getTypes)
router.get('/sizes', productController.getSizes)
router.get('/templates', productController.getTemplates)
router.get('/vendor/:vendorId', productController.getByVendor)

// Option groups
router.get('/:productId/option-groups', productController.getOptionGroupsByProduct)
router.post('/:productId/option-groups', productController.createOptionGroup)
router.put('/option-groups/:id', productController.updateOptionGroup)
router.delete('/option-groups/:id', productController.deleteOptionGroup)

// Option values
router.post('/option-groups/:groupId/values', productController.createOptionValue)
router.put('/option-values/:id', productController.updateOptionValue)
router.delete('/option-values/:id', productController.deleteOptionValue)

// Size configs
router.get('/:productId/sizes', productController.getSizeConfigsByProduct)
router.post('/:productId/sizes', productController.createSizeConfig)
router.put('/sizes/:id', productController.updateSizeConfig)
router.delete('/sizes/:id', productController.deleteSizeConfig)

// Optional extras
router.get('/:productId/optional-extras', productController.getOptionalExtrasByProduct)
router.post('/:productId/optional-extras', productController.createOptionalExtra)
router.put('/optional-extras/:id', productController.updateOptionalExtra)
router.delete('/optional-extras/:id', productController.deleteOptionalExtra)

router.get('/:id', productController.getById)
router.put('/:id', productController.update)
router.delete('/:id', productController.remove)

export default router
