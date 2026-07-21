export interface ExtraItem {
  id_extra: number
  name: string
  price: number
  icon: string | null
  description: string | null
}

/**
 * Extras are now stored in the PackageExtra table in the database.
 * Each Package has its own set of PackageExtra records.
 *
 * This file exists only for the ExtraItem type definition.
 * API controllers should load extras from the PackageExtra table
 * via Prisma includes rather than from static config.
 */
export function getExtrasByCategory(_category: string): ExtraItem[] {
  return []
}

export function attachExtras<T>(item: T): T & { extras: ExtraItem[] } {
  return { ...item, extras: [] }
}
