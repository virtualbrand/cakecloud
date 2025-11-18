-- Migration: Remove status constraint from orders table
-- Description: Removes the CHECK constraint on status field to allow dynamic status values from Agenda settings

-- Find and drop the constraint (Supabase auto-generates constraint names)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint name
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'orders'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'Status constraint not found or already removed';
    END IF;
END $$;

-- Comment the change
COMMENT ON COLUMN orders.status IS 'Status dinâmico - pode ser qualquer valor configurado em Agenda Settings ou status fixo de Pedidos';
