-- Migration: Add type column to ingredients table
-- This migration adds a 'type' column to categorize ingredients as 'ingredientes' or 'materiais'

-- Add type column to ingredients table only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingredients' AND column_name = 'type'
  ) THEN
    ALTER TABLE ingredients 
    ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'ingredientes';
  END IF;
END $$;

-- Add check constraint to ensure only valid types (only if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'ingredients_type_check'
  ) THEN
    ALTER TABLE ingredients
    ADD CONSTRAINT ingredients_type_check 
    CHECK (type IN ('ingredientes', 'materiais'));
  END IF;
END $$;

-- Update column comment for clarity
COMMENT ON COLUMN ingredients.type IS 'Type of ingredient: ingredientes (food ingredients) or materiais (materials/packaging)';

