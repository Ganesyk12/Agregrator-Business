export interface PackageExtra {
  id_extra: number
  id_package: number
  name: string
  description: string | null
  price: number
  icon: string | null
  status: string
}

export interface Package {
  id_package: number
  id_vendor: number
  id_category: number | null
  name: string
  description: string | null
  price: number
  duration: string | null
  whats_included: string | null
  status: string
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null
  vendor?: {
    business_name: string
  }
  category?: {
    category_name: string
  }
  extras?: PackageExtra[]
}
