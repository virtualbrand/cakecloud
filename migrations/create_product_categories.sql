-- Criar tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_product_categories_user_id ON product_categories(user_id);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para product_categories
CREATE POLICY "Users can view their own categories" 
  ON product_categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" 
  ON product_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
  ON product_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
  ON product_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_product_categories_updated_at 
  BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remover constraint CHECK da tabela final_products se existir
DO $$ 
BEGIN
  ALTER TABLE final_products DROP CONSTRAINT IF EXISTS final_products_category_check;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Alterar coluna category em final_products para aceitar qualquer texto
ALTER TABLE final_products ALTER COLUMN category TYPE TEXT;
ALTER TABLE final_products ALTER COLUMN category SET NOT NULL;

-- Inserir categorias padrão para usuários existentes (opcional)
-- Você pode descomentar se quiser inserir categorias padrão para todos os usuários
/*
INSERT INTO product_categories (user_id, name)
SELECT DISTINCT user_id, 'Bolo'
FROM final_products
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO product_categories (user_id, name)
SELECT DISTINCT user_id, 'Cupcake'
FROM final_products
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO product_categories (user_id, name)
SELECT DISTINCT user_id, 'Cookie'
FROM final_products
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO product_categories (user_id, name)
SELECT DISTINCT user_id, 'Torta'
FROM final_products
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO product_categories (user_id, name)
SELECT DISTINCT user_id, 'Outro'
FROM final_products
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, name) DO NOTHING;
*/
