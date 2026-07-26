export interface Product {
  id_product: number
  id_vendor: number
  id_occasion: number | null
  id_template: number | null
  name: string
  description: string | null
  price: number
  stock: number
  estimated_delivery: string | null
  delivery_info: string | null
  labels: string | null
  type_name: string | null
  size_name: string | null
  status: string
  date_created: Date | string
  date_modified: Date | string
  user_created: string | null
  user_modified: string | null
  vendor?: {
    id_vendor: number
    business_name: string
    location: string | null
  }
  occasion?: { id_occasion: number; name: string; slug: string }
  template?: ProductTemplate | null
  images?: ProductImage[]
  variants?: ProductVariant[]
  addons?: ProductAddon[]
  option_groups?: OptionGroup[]
  size_configs?: SizeConfig[]
  optional_extras?: OptionalExtra[]
}

export interface ProductImage {
  id_image: number
  id_product: number
  image_url: string
  caption: string | null
  sort_order: number
}

export interface ProductVariant {
  id_variant: number
  id_product: number
  name: string
  price_adjust: number
  stock: number
  sort_order: number
  status: string
}

export interface ProductAddon {
  id_addon: number
  id_product: number
  name: string
  price: number
  description: string | null
  status: string
}

export interface ProductOccasion {
  id_occasion: number
  name: string
  slug: string
  sort_order: number
  status: string
}

export interface ProductType {
  id_type: number
  name: string
  slug: string
  sort_order: number
  status: string
}

export interface ProductSize {
  id_size: number
  name: string
  slug: string
  sort_order: number
  status: string
}

export interface ProductTemplate {
  id_template: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  short_desc: string | null
  recommended_use: string | null
  suggested_config: any
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
}

export interface OptionGroup {
  id_option_group: number
  id_product: number
  name: string
  display_type: string
  sort_order: number
  is_required: boolean
  status: string
  date_created: Date | string
  date_modified: Date | string
  values?: OptionValue[]
}

export interface OptionValue {
  id_option_value: number
  id_option_group: number
  name: string
  price_adjust: number
  stock: number
  sku: string | null
  description: string | null
  image_url: string | null
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
  images?: ValueImage[]
}

export interface ValueImage {
  id_value_image: number
  id_option_value: number
  image_url: string
  sort_order: number
  date_created: Date | string
}

export interface SizeConfig {
  id_size_config: number
  id_product: number
  name: string
  price: number
  stock: number
  sku: string | null
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
  images?: SizeConfigImage[]
}

export interface SizeConfigImage {
  id_size_image: number
  id_size_config: number
  image_url: string
  sort_order: number
  date_created: Date | string
}

export interface OptionalExtra {
  id_optional_extra: number
  id_product: number
  name: string
  image_url: string | null
  description: string | null
  price: number
  stock: number
  sort_order: number
  status: string
  date_created: Date | string
  date_modified: Date | string
}
