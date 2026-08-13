export interface Booking {
  id_booking: number
  id_user: number
  booking_number: string | null
  event_date: Date
  event_location: string | null
  total_price: number
  dp_amount: number
  status: string
  notes: string | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  customer?: {
    id_user: number
    email: string
    full_name: string
  }
  booking_packages?: {
    package: {
      id_package: number
      name: string
      price: number
      description: string | null
      duration: string | null
      vendor: {
        id_vendor: number
        business_name: string
      }
    }
  }[]
}

export interface ProductBookingInput {
  id_product: number
  quantity: number
  price: number
  size_name?: string | null
  options?: { groupName: string; valueName: string; priceAdjust?: number }[]
  extras?: { id: number; name: string; price: number }[]
}

export interface BookingCreateInput {
  id_user: number
  package_ids: number[]
  products?: ProductBookingInput[]
  event_date: Date
  event_location?: string | null
  total_price: number
  dp_amount?: number
  notes?: string | null
  user_created?: string
  user_modified?: string
}
