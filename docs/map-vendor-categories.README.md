# Auto Mapping Vendor Categories

✅ **Script Created:** `scripts/map-vendor-categories.js`

This script automatically maps vendor categories based on `category_name` matching.

## Steps to Run:

### Step 1: Make Script Executable
```bash
chmod +x scripts/map-vendor-categories.js
```

### Step 2: Create package.json Entry (if not exists)
```bash
# Add this to package.json scripts section:
"scripts": {
  "map-categories": "node scripts/map-vendor-categories.js"
}
```

### Step 3: Run the Mapping Script
```bash
npm run map-categories
```

## What the Script Does:

1. **Check Existing Categories**
   - Lists all active categories in database
   - Shows ID, name, and slug for each

2. **Find Vendors Without Category Mapping**
   - Shows all vendors that have `category` string but `id_category` is NULL
   - Displays vendor ID, name, and current category

3. **Automatic Mapping**
   - Matches vendor.category to Category.name
   - Updates vendor with correct `id_category`
   - Logs each successful mapping

4. **Report Unmapped Vendors**
   - Lists vendors where category doesn't match any in database
   - These need manual review and fix

5. **Statistics**
   - Total vendors with category
   - Successfully mapped
   - Needs manual fix
   - Vendor counts per category

## Output Example:

```
🔧 Starting Category Mapping...

📋 Step 1: Checking existing categories...
✅ Found 3 categories:
   - 1. Photography (photography)
   - 2. Makeup Artist (makeup-artist)
   - 3. Bouquet Flowers (bouquet-flowers)

📋 Step 2: Finding vendors without categories...
⚠️  Found 10 vendors without category mapping:
   - ID: 1, Business: Awesome Photos, Category: "Photography"
   - ID: 2, Business: Beauty Studio, Category: "Makeup Artist"
   ...

📋 Step 3: Mapping vendors to categories...
✅ Mapped: Awesome Photos -> Photography (ID: 1)
✅ Mapped: Beauty Studio -> Makeup Artist (ID: 2)
...

📊 Final Statistics:
   Total with category: 10
   ✅ Successfully mapped: 8
   ❌ Needs manual fix: 2

📊 Vendor counts per category:
   - Photography: 4 vendors
   - Makeup Artist: 3 vendors
   - Bouquet Flowers: 5 vendors

✅ Mapping complete!
```

## Manual Fixes (if needed):

If some vendors don't match any category, manually update them:

```sql
-- Example: Force update specific vendor
UPDATE vendors
SET id_category = 3
WHERE id_vendor = 10;

-- Or update by business name
UPDATE vendors
SET id_category = 1
WHERE business_name = 'Custom Vendor Name';
```

## Post-Mapping Verification:

```bash
# Verify all vendors have category
SELECT COUNT(*) FROM vendors WHERE id_category IS NOT NULL;

# Check vendor counts per category
SELECT c.name, COUNT(v.id_vendor) as vendor_count
FROM Category c
LEFT JOIN vendors v ON v.id_category = c.id_category
GROUP BY c.name
ORDER BY c.sort_order;
```

## Next Steps After Mapping:

1. ✅ Run `npm run map-categories`
2. ✅ Review unmapped vendors
3. ✅ Fix any mismatches manually
4. ✅ Update frontend code to fetch categories dynamically
5. ✅ Test filters in ExploreView
6. ✅ Test category selection in PartnerView
