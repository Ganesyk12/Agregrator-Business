export interface Category {
  id_category: number
  category_name: string
  status: string
  date_created: Date | string
  date_modified: Date | string
  user_created: string | null
  user_modified: string | null
}
