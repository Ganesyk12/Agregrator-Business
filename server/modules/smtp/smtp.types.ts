export interface SmtpSetting {
  id_smtp: number
  host: string
  port: number
  secure: boolean
  username: string
  password?: string
  from_name: string | null
  from_email: string | null
  is_active: boolean
  date_created: Date
  date_modified: Date
  user_created?: string | null
  user_modified?: string | null
}

export interface SmtpSettingResponse {
  id_smtp: number
  host: string
  port: number
  secure: boolean
  username: string
  has_password: boolean
  from_name: string | null
  from_email: string | null
  is_active: boolean
  date_created: Date
  date_modified: Date
  is_dev_mode?: boolean
  dev_target_emails?: string[]
}

export interface UpdateSmtpInput {
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  from_name?: string
  from_email?: string
  is_active?: boolean
  user_modified?: string
}

export interface TestSmtpInput {
  target_email: string
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  from_name?: string
  from_email?: string
}

export interface SendMailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export interface BookingEmailPayload {
  customerName: string
  bookingCode?: string | number
  packageName: string
  vendorName?: string
  eventDate?: string | Date
  location?: string
  totalAmount: number
  status?: string
  notes?: string
  viewUrl?: string
}

export interface OrderItemEmailPayload {
  name: string
  quantity: number
  price: number
  total: number
}

export interface OrderEmailPayload {
  customerName: string
  orderNumber: string
  items: OrderItemEmailPayload[]
  subtotal: number
  discountAmount?: number
  shippingCost?: number
  grandTotal: number
  paymentMethod?: string
  shippingAddress?: string
  recipientName?: string
  recipientPhone?: string
  greetingCardMessage?: string
  viewUrl?: string
}

export interface PaymentRequestEmailPayload {
  recipientName: string
  invoiceNumber: string
  requestNumber?: string
  termName?: string
  amount: number
  dueDate?: string | Date
  paymentStatus?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  paymentUrl?: string
  notes?: string
}

export interface ReceiptEmailPayload {
  customerName: string
  receiptNumber: string
  referenceInvoiceNumber?: string
  paidAmount: number
  paymentMethod?: string
  paymentDate?: string | Date
  remainingAmount?: number
  receiptUrl?: string
}

export interface NotificationEmailPayload {
  recipientName?: string
  title: string
  message: string
  badgeText?: string
  badgeColor?: 'blue' | 'green' | 'yellow' | 'red'
  keyDetails?: Array<{ label: string; value: string }>
  actionUrl?: string
  actionText?: string
}

