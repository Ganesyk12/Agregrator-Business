export interface PaymentTerm {
  id_term: number
  id_booking: number
  term_order: number
  term_name: string
  amount: number
  due_date: Date | null
  status: string
  paid_amount: number
  notes: string | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  payments?: BookingPaymentPayment[]
}

export interface BookingPaymentPayment {
  id_booking_payment: number
  amount: number
  payment_type: string
  status: string
  paid_at: Date | null
}
