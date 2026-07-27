import type { Request, Response, NextFunction } from 'express'
import * as productService from './products.service'

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { occasion, type, size, vendorId } = req.query
    const products = await productService.findAll({
      occasion: occasion as string,
      type: type as string,
      size: size as string,
      vendorId: vendorId ? Number(vendorId) : undefined,
    })
    res.json({ data: products.length === 0 ? null : products })
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.findById(Number(req.params.id))
    if (!product) { res.status(404).json({ error: { message: 'Product not found' } }); return }
    res.json({ data: product })
  } catch (err) { next(err) }
}

export async function getByVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await productService.findByVendor(Number(req.params.vendorId))
    res.json({ data: products.length === 0 ? null : products })
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_vendor, id_occasion, id_template, name, description, price, stock, estimated_delivery, delivery_info, occasion_ids, type_name, size_name, images, variants, addons, option_groups, size_configs, optional_extras } = req.body
    if (!id_vendor || !name || price === undefined) {
      res.status(400).json({ error: { message: 'id_vendor, name, and price are required' } }); return
    }
    const product = await productService.create({
      id_vendor: Number(id_vendor),
      id_occasion: id_occasion ? Number(id_occasion) : null,
      id_template: id_template ? Number(id_template) : null,
      type_name: type_name || null,
      size_name: size_name || null,
      name, description, price: Number(price),
      stock: stock ? Number(stock) : 0,
      estimated_delivery, delivery_info,
      occasion_ids: occasion_ids ? occasion_ids.map(Number) : [],
      images, variants, addons, option_groups, size_configs, optional_extras,
    })
    res.status(201).json({ data: product })
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.update(Number(req.params.id), req.body)
    if (!product) { res.status(404).json({ error: { message: 'Product not found' } }); return }
    res.json({ data: product })
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await productService.remove(Number(req.params.id))
    if (!deleted) { res.status(404).json({ error: { message: 'Product not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}

export async function getOccasions(_req: Request, res: Response, next: NextFunction) {
  try {
    const occasions = await productService.findAllOccasions()
    res.json({ data: occasions })
  } catch (err) { next(err) }
}

export async function getTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await productService.findAllTypes()
    res.json({ data: types })
  } catch (err) { next(err) }
}

export async function getSizes(_req: Request, res: Response, next: NextFunction) {
  try {
    const sizes = await productService.findAllSizes()
    res.json({ data: sizes })
  } catch (err) { next(err) }
}

export async function getTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await productService.findAllTemplates()
    res.json({ data: templates })
  } catch (err) { next(err) }
}

// Option Groups
export async function createOptionGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params
    const { name, display_type, sort_order, is_required } = req.body
    if (!name) { res.status(400).json({ error: { message: 'name is required' } }); return }
    const group = await productService.createOptionGroup(Number(productId), { name, display_type, sort_order, is_required })
    res.status(201).json({ data: group })
  } catch (err) { next(err) }
}

export async function updateOptionGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const group = await productService.updateOptionGroup(Number(req.params.id), req.body)
    if (!group) { res.status(404).json({ error: { message: 'Option group not found' } }); return }
    res.json({ data: group })
  } catch (err) { next(err) }
}

export async function deleteOptionGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await productService.deleteOptionGroup(Number(req.params.id))
    if (!deleted) { res.status(404).json({ error: { message: 'Option group not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}

// Option Values
export async function createOptionValue(req: Request, res: Response, next: NextFunction) {
  try {
    const { groupId } = req.params
    const { name, price_adjust, stock, sku, description, image_url, sort_order, images } = req.body
    if (!name) { res.status(400).json({ error: { message: 'name is required' } }); return }
    const value = await productService.createOptionValue(Number(groupId), { name, price_adjust, stock, sku, description, image_url, sort_order, images })
    res.status(201).json({ data: value })
  } catch (err) { next(err) }
}

export async function updateOptionValue(req: Request, res: Response, next: NextFunction) {
  try {
    const value = await productService.updateOptionValue(Number(req.params.id), req.body)
    if (!value) { res.status(404).json({ error: { message: 'Option value not found' } }); return }
    res.json({ data: value })
  } catch (err) { next(err) }
}

export async function deleteOptionValue(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await productService.deleteOptionValue(Number(req.params.id))
    if (!deleted) { res.status(404).json({ error: { message: 'Option value not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}

// Size Configs
export async function createSizeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params
    const { name, price, stock, sku, sort_order, images } = req.body
    if (!name || price === undefined) { res.status(400).json({ error: { message: 'name and price are required' } }); return }
    const config = await productService.createSizeConfig(Number(productId), { name, price: Number(price), stock, sku, sort_order, images })
    res.status(201).json({ data: config })
  } catch (err) { next(err) }
}

export async function updateSizeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await productService.updateSizeConfig(Number(req.params.id), req.body)
    if (!config) { res.status(404).json({ error: { message: 'Size config not found' } }); return }
    res.json({ data: config })
  } catch (err) { next(err) }
}

export async function deleteSizeConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await productService.deleteSizeConfig(Number(req.params.id))
    if (!deleted) { res.status(404).json({ error: { message: 'Size config not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}

// Optional Extras
export async function createOptionalExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId } = req.params
    const { name, image_url, description, price, stock, sort_order } = req.body
    if (!name || price === undefined) { res.status(400).json({ error: { message: 'name and price are required' } }); return }
    const extra = await productService.createOptionalExtra(Number(productId), { name, image_url, description, price: Number(price), stock, sort_order })
    res.status(201).json({ data: extra })
  } catch (err) { next(err) }
}

export async function updateOptionalExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const extra = await productService.updateOptionalExtra(Number(req.params.id), req.body)
    if (!extra) { res.status(404).json({ error: { message: 'Optional extra not found' } }); return }
    res.json({ data: extra })
  } catch (err) { next(err) }
}

export async function deleteOptionalExtra(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await productService.deleteOptionalExtra(Number(req.params.id))
    if (!deleted) { res.status(404).json({ error: { message: 'Optional extra not found' } }); return }
    res.status(204).send()
  } catch (err) { next(err) }
}

// Get option groups / sizes / extras by product
export async function getOptionGroupsByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await productService.getOptionGroupsByProduct(Number(req.params.productId))
    res.json({ data: groups })
  } catch (err) { next(err) }
}

export async function getSizeConfigsByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const configs = await productService.getSizeConfigsByProduct(Number(req.params.productId))
    res.json({ data: configs })
  } catch (err) { next(err) }
}

export async function getOptionalExtrasByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const extras = await productService.getOptionalExtrasByProduct(Number(req.params.productId))
    res.json({ data: extras })
  } catch (err) { next(err) }
}
