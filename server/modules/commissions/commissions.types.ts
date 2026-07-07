export interface Commission {
  id_commission: number
  id_booking: number
  id_vendor: number
  percentage: number
  amount: number
  status: string
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  vendor?: { id_vendor: number; business_name: string }
  booking?: {
    id_booking: number
    total_price: number
    dp_amount: number
    status: string
    event_date: Date
    customer?: { id_user: number; email: string; full_name: string }
    booking_packages?: {
      package: {
        id_package: number
        name: string
        price: number
        vendor: { id_vendor: number; business_name: string }
      }
    }[]
  }
}
