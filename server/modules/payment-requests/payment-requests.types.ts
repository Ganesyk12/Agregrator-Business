export interface PaymentRequest {
  id_request: number
  request_number: string
  title: string
  description: string | null
  request_date: Date
  requested_by: number
  notes: string | null
  payment_method: string | null
  bank_account_number: string | null
  payment_to: string | null
  status: string
  reviewed_by: number | null
  reviewed_at: Date | null
  approval_notes: string | null
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null

  requester?: { id_user: number; full_name: string; email: string }
  reviewer?: { id_user: number; full_name: string; email: string }
  items?: PaymentRequestItem[]
  transactions?: PaymentTransaction[]
}

export interface PaymentRequestItem {
  id_item: number
  id_request: number
  description: string
  quantity: number
  unit_price: number
  amount: number
  notes: string | null
  sort_order: number
  date_created: Date
}

export interface PaymentTransaction {
  id_transaction: number
  id_request: number
  transaction_date: Date
  transaction_type: string
  description: string | null
  payment_proof_url: string | null
  payment_method: string | null
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  reference_number: string | null
  paid_at: Date | null
  created_by: string | null
  date_created: Date
}
