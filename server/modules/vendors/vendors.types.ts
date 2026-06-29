export interface Vendor {
  id_vendor: number
  id_user: number
  business_name: string
  description: string | null
  category: string
  location: string | null
  status: string
  verified_at: Date | null
  created_at: Date
}
