import type { Request, Response, NextFunction } from 'express'
import * as companyInfoService from './company-info.service'

export async function get(_req: Request, res: Response, next: NextFunction) {
  try {
    const info = await companyInfoService.get()
    res.json({ data: info })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const allowedFields = [
      'company_name', 'address', 'phone', 'email', 'website',
      'bank_name', 'bank_account', 'bank_holder', 'footer_text', 'logo_url',
      'service_fee_percent', 'delivery_fee',
    ]
    const data: Record<string, any> = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field]
      }
    }
    data.user_modified = req.body.user_modified ?? 'SYSTEM'
    const info = await companyInfoService.update(data)
    res.json({ data: info })
  } catch (err) {
    next(err)
  }
}
