export interface Package {
  id_package: number
  id_vendor: number
  name: string
  description: string | null
  price: number
  duration: string | null
  whats_included: string | null
  status: string
  created_at: Date
}
