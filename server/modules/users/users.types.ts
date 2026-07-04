export interface User {
  id_user: number
  email: string
  password?: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  user_roles?: { iduser_role: number; email: string; role_code: string; role?: { id_role: number; role_code: string; name: string } }[]
}
