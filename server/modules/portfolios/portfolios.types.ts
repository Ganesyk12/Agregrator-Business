export interface Portfolio {
  id_portfolio: number
  id_vendor: number
  id_package: number | null
  id_category: number | null
  media_url: string
  description: string | null
  location: string | null
  label: string | null
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
  user_created: string | null
  user_modified: string | null
  vendor?: {
    business_name: string
  }
  package?: {
    name: string
  }
  category?: {
    category_name: string
  }
}
