-- Migration: Add type field to orders table
-- Description: Adds a type field to differentiate between regular orders and agenda tasks

-- Add type field with default value 'order'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'order' CHECK (type IN ('order', 'task'));

-- Update existing records to be 'order' type
UPDATE orders SET type = 'order' WHERE type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);

-- Comment the column
COMMENT ON COLUMN orders.type IS 'Tipo do registro: order (pedido) ou task (tarefa da agenda)';
