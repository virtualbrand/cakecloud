-- Migration: Add agenda task fields to orders table
-- Description: Adds support for task_name, images array, categories array, and tags array for Agenda tasks

-- Add task_name field
ALTER TABLE orders ADD COLUMN IF NOT EXISTS task_name TEXT;

-- Add images field (array of text URLs or base64 strings)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add categories field (array of category names)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Add tags field (array of tag names)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add indexes for better performance on array searches
CREATE INDEX IF NOT EXISTS idx_orders_task_name ON orders(task_name);
CREATE INDEX IF NOT EXISTS idx_orders_categories ON orders USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_orders_tags ON orders USING GIN(tags);

-- Comment the columns
COMMENT ON COLUMN orders.task_name IS 'Nome da tarefa para uso na Agenda';
COMMENT ON COLUMN orders.images IS 'Array de URLs ou base64 de imagens da tarefa';
COMMENT ON COLUMN orders.categories IS 'Array de categorias associadas à tarefa';
COMMENT ON COLUMN orders.tags IS 'Array de tags associadas à tarefa';
