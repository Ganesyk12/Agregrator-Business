# Category Integration - Using Existing Schema

## Current Schema Status

✅ **`Category` model already exists** with basic fields:
- `id_category` (int, primary key)
- `name` (unique)
- `status` (active/inactive)
- `date_created`, `date_modified`

❌ **Needs additional fields** for full integration:
- `slug` - URL-friendly identifier
- `icon` - Emoji or SVG for UI
- `description` - Category description
- `sort_order` - Custom sort order
- `user_created`, `user_modified` - Track who created/modified

✅ **`Vendor` model has** `category` field (String, but should be FK)

## Changes Already Applied

### 1. Updated `Category` Model
```prisma
model Category {
  id_category   Int      @id @default(autoincrement())
  name          String   @unique
  slug          String   @unique       // ✅ NEW
  icon          String?                  // ✅ NEW
  description   String?                  // ✅ NEW
  status        String   @default("active")
  sort_order    Int      @default(0)     // ✅ NEW
  date_created  DateTime @default(now())
  date_modified DateTime @updatedAt
  user_created  String?                 // ✅ NEW
  user_modified String?                 // ✅ NEW

  packages   Package[]
  portfolios Portfolio[]
  vendors   Vendor[]          // ✅ NEW

  @@index([status])
}
```

### 2. Updated `Vendor` Model
```prisma
model Vendor {
  id_vendor     Int      @id @default(autoincrement())
  id_user       Int
  vendor_code   String   @unique @default(uuid())
  business_name String
  description   String?
  id_category   Int?      // ✅ CHANGED from String to Int FK
  location      String?
  years_exp     Int      @default(0)
  status        String   @default("pending")
  verified_at   DateTime?
  date_created  DateTime @default(now())
  date_modified DateTime @updatedAt
  user_created  String?
  user_modified String?

  avatar_url    String?
  instagram     String?
  vendor_type   String?

  user         User                @relation(fields: [id_user], references: [id_user])
  category     Category?           @relation(fields: [id_category], references: [id_category])  // ✅ NEW
  portfolios   Portfolio[]
  packages     Package[]
  products     Product[]
  orders       Order[]
  availability VendorAvailability[]

  reviews      Review[]

  @@index([id_user])
  @@index([id_category])    // ✅ NEW
  @@index([status])
}
```

## Next Steps

### Step 1: Run Migration
```bash
npx prisma migrate dev --name add-category-fields
```

This will:
1. Add new fields to `Category` table
2. Add new foreign key column to `Vendor` table
3. Create index for category relationships

### Step 2: Insert Default Categories

```prisma
// Via Prisma Studio or migration
INSERT INTO Category (name, slug, icon, description, status, sort_order) VALUES
('Photography', 'photography', '📷', 'Professional photography services', 'active', 1),
('Makeup Artist', 'makeup-artist', '💄', 'Makeup and styling services', 'active', 2),
('Bouquet Flowers', 'bouquet-flowers', '💐', 'Floral arrangements and bouquets', 'active', 3);
```

### Step 3: Update Vendor Data

Need to map existing string categories to category IDs:

```prisma
// For each vendor, find category ID based on category name
// and update vendor.id_category
UPDATE vendors
SET id_category = (
  SELECT id_category FROM Category
  WHERE name = vendors.category
)
WHERE id_category IS NULL;
```

### Step 4: Update Code to Use Dynamic Categories

#### PartnerView.vue
```typescript
const businessCategories = ref<Category[]>([])

onMounted(async () => {
  const res = await fetch('/api/categories')
  const json = await res.json()
  businessCategories.value = json.data || []
})
```

#### ExploreView.vue
```typescript
const categories = ref<Category[]>([])

onMounted(async () => {
  const res = await fetch('/api/categories')
  const json = await res.json()
  categories.value = json.data || []
})
```

### Step 5: Create API Endpoints

**GET /api/categories**
```typescript
// src/routes/categories.ts
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { status: 'active' },
      select: {
        id_category: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        sort_order: true,
        _count: {
          select: {
            vendors: true,
            portfolios: true,
            packages: true
          }
        }
      },
      orderBy: { sort_order: 'asc' }
    })
    res.json({ data: categories })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})
```

## Benefits

1. ✅ No new tables needed - reuse existing
2. ✅ Centralized category management
3. ✅ Consistent data across platform
4. ✅ Better filtering and search
5. ✅ Foreign key relationships
6. ✅ Easy to add/remove categories via admin UI

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Categories appear in Partner registration form
- [ ] Categories appear in Explore filter
- [ ] Filter works correctly on vendors tab
- [ ] Filter works correctly on inspirations tab
- [ ] Existing vendors have correct category mapping
- [ ] No vendors have orphaned data
- [ ] API returns correct data with counts

## Frontend UI Updates

1. **Partner Modal**: Show categories with icon and description
2. **Category Chips**: Show available items count per category
3. **Explore Filters**: Dynamic dropdown with category counts
4. **Category Details**: Show vendor/portfolio/package counts
