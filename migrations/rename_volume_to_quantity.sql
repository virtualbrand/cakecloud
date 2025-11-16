-- Migration: Rename volume column to quantity in ingredients table
-- This migration renames the 'volume' column to 'quantity' to better represent the field purpose

-- Rename column in ingredients table
ALTER TABLE ingredients 
RENAME COLUMN volume TO quantity;

-- Update column comment for clarity
COMMENT ON COLUMN ingredients.quantity IS 'Quantity of the ingredient in the specified unit';
