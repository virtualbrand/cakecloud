-- Migration: Add type column to ingredients table
-- This migration adds a 'type' column to categorize ingredients as 'ingredientes' or 'materiais'

-- Add type column to ingredients table
ALTER TABLE ingredients 
ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'ingredientes';

-- Add check constraint to ensure only valid types
ALTER TABLE ingredients
ADD CONSTRAINT ingredients_type_check 
CHECK (type IN ('ingredientes', 'materiais'));

-- Update column comment for clarity
COMMENT ON COLUMN ingredients.type IS 'Type of ingredient: ingredientes (food ingredients) or materiais (materials/packaging)';
