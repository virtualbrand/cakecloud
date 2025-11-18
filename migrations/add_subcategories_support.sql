-- Add parent_id field to support subcategories
ALTER TABLE financial_categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES financial_categories(id) ON DELETE CASCADE;

-- Add index for parent_id lookups
CREATE INDEX IF NOT EXISTS idx_financial_categories_parent_id ON financial_categories(parent_id);

-- Add order field to maintain custom sorting
ALTER TABLE financial_categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update constraint to allow same name for subcategories (different parents)
ALTER TABLE financial_categories 
DROP CONSTRAINT IF EXISTS unique_category_per_user;

-- New constraint: unique names only at the same level (same parent)
ALTER TABLE financial_categories 
ADD CONSTRAINT unique_category_per_user_and_parent 
UNIQUE (user_id, name, type, parent_id);

-- Initialize sort_order for existing categories
UPDATE financial_categories
SET sort_order = 0
WHERE sort_order IS NULL;
