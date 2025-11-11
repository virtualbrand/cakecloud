-- Adiciona user_id à tabela final_products se ainda não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'final_products' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE final_products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_final_products_user_id ON final_products(user_id);
  END IF;
END $$;

-- Enable RLS para final_products se ainda não estiver habilitado
ALTER TABLE final_products ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own products" ON final_products;
DROP POLICY IF EXISTS "Users can insert their own products" ON final_products;
DROP POLICY IF EXISTS "Users can update their own products" ON final_products;
DROP POLICY IF EXISTS "Users can delete their own products" ON final_products;

-- Políticas RLS para final_products
CREATE POLICY "Users can view their own products"
  ON final_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON final_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON final_products FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON final_products FOR DELETE
  USING (auth.uid() = user_id);
