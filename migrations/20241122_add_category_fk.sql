-- Backup existing vendor categories
-- Create a temporary table to store current vendor category data
CREATE TABLE vendors_category_backup AS
SELECT id_vendor, category
FROM vendors
WHERE category IS NOT NULL AND category != '';

-- Migration: Update vendor.category (String) to vendor.id_category (Int FK)

-- Step 1: Update category references to use the new categories
-- Note: This assumes categories exist in the Category table
-- If categories don't exist yet, you need to insert them first

-- For each vendor, try to match category by name
-- This will update vendors that already have a matching category
UPDATE vendors
SET id_category = (
  SELECT id_category
  FROM Category
  WHERE Category.name = vendors.category
)
WHERE id_category IS NULL;

-- Step 2: Set category to NULL for vendors with non-existent categories
-- These vendors need to be updated manually by the admin
UPDATE vendors
SET category = NULL
WHERE id_category IS NULL AND category IS NOT NULL;

-- Optional: Add constraint to ensure category is set
-- Comment out if you want to allow vendors without categories temporarily
-- ALTER TABLE vendors
-- ADD CONSTRAINT chk_vendor_category_not_null
-- CHECK (id_category IS NOT NULL);

-- Cleanup backup table (optional - remove after verification)
-- DROP TABLE vendors_category_backup;
