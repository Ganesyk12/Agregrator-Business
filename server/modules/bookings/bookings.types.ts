export interface Booking {
  id_booking: number
  id_user: number
  id_vendor: number
  id_package: number
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
  vendor?: {
    id_vendor: number
    business_name: string
  }
  package?: {
    id_package: number
    name: string
    price: number
  }
}
