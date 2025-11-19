-- Add color column to product_categories table
ALTER TABLE product_categories
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#E91E63';

-- Update existing categories with random colors if they don't have one
UPDATE product_categories
SET color = CASE 
  WHEN color IS NULL OR color = '' THEN 
    (ARRAY['#E91E63', '#673AB7', '#2196F3', '#03A9F4', '#C2185B', '#F44336', '#FF8A80', '#3F51B5', '#4CAF50', '#FFAB91', '#F8BBD0', '#FF9800', '#FFC107', '#8B4513', '#90CAF9', '#9E9E9E', '#4DB6AC', '#2E7D32', '#80CBC4', '#C62828', '#795548', '#f97316'])[floor(random() * 22 + 1)]
  ELSE color
END
WHERE color IS NULL OR color = '';
