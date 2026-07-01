export interface Vendor {
  id_vendor: number
  id_user: number
  business_name: string
  description: string | null
  category: string
  location: string | null
  status: string
  verified_at: Date | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null
}
