-- Migration: Add title column to orders table
-- Description: Adds an optional title field to allow alternative order titles
-- Date: 2025-11-18

-- Add title column to orders table
ALTER TABLE orders
ADD COLUMN title TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN orders.title IS 'Alternative order title. When set, will be displayed as "Title - Customer Name"';
