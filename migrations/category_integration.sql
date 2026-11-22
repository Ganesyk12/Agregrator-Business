-- Migration 1: Add category fields
-- This adds slug, icon, description, sort_order, user_created, user_modified to Category

ALTER TABLE Category
ADD COLUMN slug VARCHAR(120) UNIQUE,
ADD COLUMN icon VARCHAR(100),
ADD COLUMN description TEXT,
ADD COLUMN sort_order INT DEFAULT 0,
ADD COLUMN user_created VARCHAR(255),
ADD COLUMN user_modified VARCHAR(255);

-- Add index for better filtering performance
CREATE INDEX idx_category_slug ON Category(slug);
CREATE INDEX idx_category_status ON Category(status);
CREATE INDEX idx_category_sort_order ON Category(sort_order);

-- Migration 2: Update vendor table
-- This changes category (String) to id_category (Int FK)

ALTER TABLE vendors
ADD COLUMN id_category INT NULL,
ADD CONSTRAINT fk_vendor_category
  FOREIGN KEY (id_category) REFERENCES Category(id_category)
  ON DELETE SET NULL;

CREATE INDEX idx_vendor_category ON vendors(id_category);

-- Migration 3: Insert default categories
-- Insert base categories if not exist

INSERT INTO Category (name, slug, icon, description, status, sort_order)
SELECT 'Photography', 'photography', '📷', 'Professional photography services', 'active', 1
WHERE NOT EXISTS (SELECT 1 FROM Category WHERE name = 'Photography');

INSERT INTO Category (name, slug, icon, description, status, sort_order)
SELECT 'Makeup Artist', 'makeup-artist', '💄', 'Makeup and styling services', 'active', 2
WHERE NOT EXISTS (SELECT 1 FROM Category WHERE name = 'Makeup Artist');

INSERT INTO Category (name, slug, icon, description, status, sort_order)
SELECT 'Bouquet Flowers', 'bouquet-flowers', '💐', 'Floral arrangements and bouquets', 'active', 3
WHERE NOT EXISTS (SELECT 1 FROM Category WHERE name = 'Bouquet Flowers');

-- Migration 4: Map existing vendors to categories
-- This matches vendor.category strings to Category.id_category

-- For vendors with category name that exists in Category table
UPDATE vendors
SET id_category = (
  SELECT id_category
  FROM Category
  WHERE Category.name = vendors.category
)
WHERE id_category IS NULL AND category IS NOT NULL;

-- Mark vendors with non-existent categories as NULL
UPDATE vendors
SET id_category = NULL
WHERE id_category IS NULL AND category IS NOT NULL;

-- Migration 5: Add vendor_id foreign key to vendor_category relationship
-- This ensures categories have count of vendors

ALTER TABLE Category
ADD COLUMN vendor_count INT DEFAULT 0;

-- Update vendor counts after migration
UPDATE Category
SET vendor_count = (
  SELECT COUNT(*)
  FROM vendors
  WHERE vendors.id_category = Category.id_category
);

-- Migration 6: Add vendor_id foreign key to portfolio (optional)
-- Portfolio can reference category through vendor or directly

ALTER TABLE portfolios
ADD COLUMN id_category INT NULL,
ADD CONSTRAINT fk_portfolio_category
  FOREIGN KEY (id_category) REFERENCES Category(id_category)
  ON DELETE SET NULL;

CREATE INDEX idx_portfolio_category ON portfolios(id_category);

-- Migration 7: Add vendor_id foreign key to package (optional)
ALTER TABLE packages
ADD COLUMN id_category INT NULL,
ADD CONSTRAINT fk_package_category
  FOREIGN KEY (id_category) REFERENCES Category(id_category)
  ON DELETE SET NULL;

CREATE INDEX idx_package_category ON packages(id_category);
