# Schema Update Proposal: Category Integration

## Current State
- Categories are hardcoded in 2 files
- Vendor category is string-based
- No relationship between vendors and categories
- Filters don't dynamically fetch from database

## Proposed Changes

### 1. Create `categories` Table

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  icon VARCHAR(100),
  description TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, slug, icon, description, sort_order) VALUES
('Photography', 'photography', '📷', 'Professional photography services', 1),
('Makeup Artist', 'makeup-artist', '💄', 'Makeup and styling services', 2),
('Bouquet Flowers', 'bouquet-flowers', '💐', 'Floral arrangements and bouquets', 3);
```

### 2. Update `vendors` Table

```sql
-- Add category_id foreign key
ALTER TABLE vendors
ADD COLUMN category_id INT NULL,
ADD CONSTRAINT fk_vendors_category
  FOREIGN KEY (category_id) REFERENCES categories(id);

-- Create index for better filtering performance
CREATE INDEX idx_vendors_category ON vendors(category_id);
```

### 3. Update `portfolios` Table

```sql
-- Add category_id foreign key (optional - for categorization)
ALTER TABLE portfolios
ADD COLUMN category_id INT NULL,
ADD CONSTRAINT fk_portfolios_category
  FOREIGN KEY (category_id) REFERENCES categories(id);

CREATE INDEX idx_portfolios_category ON portfolios(category_id);
```

### 4. Update `products` Table

```sql
-- Add category_id foreign key
ALTER TABLE products
ADD COLUMN category_id INT NULL,
ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category_id) REFERENCES categories(id);

CREATE INDEX idx_products_category ON products(category_id);
```

## Benefits

1. **Centralized Category Management**
   - Single source of truth for all categories
   - Easy to add/remove categories via UI/Backend
   - Consistent data across platform

2. **Better Filtering**
   - Categories fetched dynamically from database
   - Filter updates automatically when categories change
   - Consistent filter options in all sections

3. **Data Integrity**
   - Foreign key constraints ensure valid category selection
   - Categories can be disabled without deleting data
   - Support for category relationships

4. **Future Scalability**
   - Easy to add nested categories (sub-categories)
   - Can implement category hierarchy
   - Supports category statistics and analytics

## API Endpoints Needed

1. **GET /api/categories**
   - Fetch all active categories
   - Returns: `[{ id, name, slug, icon, description, count }]`

2. **GET /api/vendors/categories**
   - Count vendors per category
   - Useful for filter display

3. **GET /api/portfolios/categories**
   - Count portfolios per category

4. **GET /api/products/categories**
   - Count products per category

## Migration Notes

1. Run schema changes in proper order:
   - Create categories table first
   - Insert default categories
   - Update vendors, portfolios, products tables
   - Create indexes

2. Handle existing data:
   - Map existing strings to new category IDs
   - Example: 'Photography' → category_id = 1

3. Testing:
   - Test vendor filtering
   - Test portfolio filtering
   - Test partner category selection
   - Test multi-category support

## UI Changes Needed

1. **PartnerView.vue**
   - Replace hardcoded array with API fetch
   - Show category count
   - Add category description

2. **ExploreView.vue**
   - Fetch categories from API
   - Replace hardcoded categories
   - Show category availability counts

3. **Category Details**
   - Each category shows icon, name, description
   - Badge showing available items count

## Future Enhancements

1. Category descriptions in modal
2. Category search
3. Category sorting
4. Category filtering with multiple selection
5. Category statistics dashboard
