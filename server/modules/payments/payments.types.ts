export interface BookingPayment {
  id_booking_payment: number
  id_booking: number
  id_term: number | null
  amount: number
  payment_type: string
  status: string
  payment_proof_url: string | null
  paid_at: Date | null
  released_at: Date | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  booking?: {
    id_booking: number
    event_date: Date
    total_price: number
    dp_amount: number
    status: string
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
}
