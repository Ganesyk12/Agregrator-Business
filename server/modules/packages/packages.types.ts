export interface Package {
  id_package: number
  id_vendor: number
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
}
