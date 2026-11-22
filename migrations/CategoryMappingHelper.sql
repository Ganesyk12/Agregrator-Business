-- Helper Script: Map Vendor Categories to Category IDs
-- This script helps identify and map vendors with unassigned categories

-- 1. Show vendors with unassigned categories
-- These vendors have a category string but no id_category set
SELECT
    v.id_vendor,
    v.business_name,
    v.category AS vendor_category_string,
    c.name AS matched_category_name,
    c.id_category
FROM vendors v
LEFT JOIN Category c ON c.name = v.category
WHERE v.category IS NOT NULL
  AND v.category != ''
  AND v.id_category IS NULL;

-- 2. Show which categories exist in the database
-- This helps verify the category names are correct
SELECT id_category, name, slug, status, sort_order
FROM Category
WHERE status = 'active'
ORDER BY sort_order;

-- 3. Fix specific category mappings (manual review required)
-- Uncomment and modify these queries to update specific vendors

-- Example: Force update vendors with "Photography" category
/*
UPDATE vendors
SET id_category = 1, category = NULL
WHERE category = 'Photography' AND id_category IS NULL;
*/

-- Example: Force update vendors with "Makeup Artist" category
/*
UPDATE vendors
SET id_category = 2, category = NULL
WHERE category = 'Makeup Artist' AND id_category IS NULL;
*/

-- Example: Force update vendors with "Bouquet Flowers" category
/*
UPDATE vendors
SET id_category = 3, category = NULL
WHERE category = 'Bouquet Flowers' AND id_category IS NULL;
*/

-- 4. Generate SQL updates for manual review
-- This creates SQL statements for each unassigned vendor that you can review manually
SELECT
    'UPDATE vendors SET id_category = ' || c.id_category ||
    ', category = NULL WHERE id_vendor = ' || v.id_vendor || ';' as sql_update
FROM vendors v
LEFT JOIN Category c ON c.name = v.category
WHERE v.category IS NOT NULL
  AND v.category != ''
  AND v.id_category IS NULL;

-- 5. Verify the migration worked correctly
SELECT
    v.id_vendor,
    v.business_name,
    v.category AS original_category,
    c.id_category AS new_category_id,
    c.name AS matched_category
FROM vendors v
LEFT JOIN Category c ON c.name = v.category
WHERE v.id_category IS NOT NULL OR v.category IS NOT NULL;

-- 6. Count vendors by category
SELECT
    c.name AS category_name,
    COUNT(v.id_vendor) AS vendor_count
FROM Category c
LEFT JOIN vendors v ON v.id_category = c.id_category AND v.status != 'inactive'
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;
