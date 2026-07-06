export interface PortfolioImage {
  id_image: number
  id_portfolio: number
  image_url: string
  caption: string | null
  sort_order: number
  created_at: Date
}

export interface Portfolio {
  id_portfolio: number
  id_vendor: number
  title: string
  code: string
  category: string
  description: string | null
  cover_url: string
  created_at: Date
  images?: PortfolioImage[]
  vendor?: {
    id_vendor: number
    business_name: string
    category: string
    location: string | null
    description: string | null
    starting_price: number
    years_exp: number
    status: string
    _count?: {
      portfolios: number
    }
  }
}
