export interface ContactMessage {
  id_message: number
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  date_created: Date
  date_modified: Date
}
