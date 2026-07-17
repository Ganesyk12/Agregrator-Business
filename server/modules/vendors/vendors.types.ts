export interface Vendor {
  id_vendor: number
  id_user: number
  vendor_code: string
  business_name: string
  description: string | null
  category: string
  location: string | null
  years_exp: number
  status: string
  verified_at: Date | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null
  user?: {
    id_user: number
    email: string
    full_name: string
  }
}
