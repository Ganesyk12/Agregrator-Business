export interface User {
  id_user: number
  email: string
  password?: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'vendor' | 'admin'
  is_active: number
  created_at: string
  updated_at: string
}
