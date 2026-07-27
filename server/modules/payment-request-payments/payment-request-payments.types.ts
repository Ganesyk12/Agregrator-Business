export interface PaymentRequestTerm {
  id_rfp_term: number
  id_request: number
  term_order: number
  term_name: string
  amount: number
  paid_amount: number
  status: string
  due_date: Date | null
  date_created: Date
  date_modified: Date
}

export interface RfpPayment {
  id_rfp_payment: number
  id_request: number
  id_rfp_term: number
  amount: number
  source_bank: string | null
  source_account_number: string | null
  source_account_name: string | null
  payment_date: Date
  proof_url: string | null
  notes: string | null
  status: string
  created_by: string | null
  date_created: Date
  date_modified: Date
}
