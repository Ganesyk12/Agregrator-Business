export interface UserRole {
  iduser_role: number
  email: string
  role_code: string
  status: string
  date_created: string
  date_modified: string
  user_created: string | null
  user_modified: string | null
  user?: { id_user: number; email: string; full_name: string }
  role?: { id_role: number; role_code: string; name: string }
}
