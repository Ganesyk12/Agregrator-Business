export interface PortfolioImage {
  id_image: number
  id_portfolio: number
  image_url: string
  caption: string | null
  sort_order: number
  date_created: Date
}

export interface Portfolio {
  id_portfolio: number
  id_vendor: number
  id_package: number | null
  id_category: number | null
  title: string
  code: string
  description: string | null
  cover_url: string
  location: string | null
  label: string | null
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
  user_created: string | null
  user_modified: string | null
  images?: PortfolioImage[]
  vendor?: {
    id_vendor: number
    business_name: string
    category: string
    location: string | null
    description: string | null
    status: string
    _count?: {
      portfolios: number
      reviews?: number
    }
  }
  package?: {
    name: string
  }
  category?: {
    category_name: string
  }
}
