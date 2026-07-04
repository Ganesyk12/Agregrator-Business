export interface Role {
  id_role: number
  role_code: string
  name: string
  status: string
  date_created: Date
  date_modified: Date
  user_created: string | null
  user_modified: string | null
}
