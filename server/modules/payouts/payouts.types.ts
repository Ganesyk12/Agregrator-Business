export interface Payout {
  id_payout: number
  id_vendor: number
  id_booking: number
  amount: number
  status: string
  paid_at: Date | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  vendor?: { id_vendor: number; business_name: string }
  booking?: {
    id_booking: number
    total_price: number
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
