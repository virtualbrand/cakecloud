-- =====================================================
-- MÓDULO DE PRECIFICAÇÃO - CAKECLOUD
-- Schema para Insumos, Bases de Preparo e Produtos Finais
-- =====================================================

-- Tabela de Insumos / Matérias-Primas
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  unit TEXT CHECK (unit IN ('gramas', 'kg', 'ml', 'litros', 'unidades')) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL, -- custo médio total
  unit_price DECIMAL(10,6) NOT NULL, -- custo por unidade (calculado)
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100), -- porcentagem de perda
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Bases de Preparo (Receitas Base)
CREATE TABLE base_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_cost DECIMAL(10,2) DEFAULT 0,
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens das Bases de Preparo
CREATE TABLE base_recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_recipe_id UUID REFERENCES base_recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE RESTRICT NOT NULL,
  ingredient_name TEXT NOT NULL, -- denormalizado para histórico
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,6) NOT NULL, -- custo unitário no momento
  loss_factor DECIMAL(5,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL, -- custo total do item (quantity * unit_cost * (1 + loss_factor/100))
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Produtos Finais
CREATE TABLE final_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('cake', 'cupcake', 'cookie', 'pie', 'other')) NOT NULL,
  total_cost DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2),
  profit_margin DECIMAL(5,2), -- margem de lucro em porcentagem
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens dos Produtos Finais
CREATE TABLE final_product_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES final_products(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT CHECK (item_type IN ('ingredient', 'base_recipe')) NOT NULL,
  item_id UUID NOT NULL, -- pode referenciar ingredients ou base_recipes
  item_name TEXT NOT NULL, -- denormalizado para histórico
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,6) NOT NULL, -- custo unitário no momento
  loss_factor DECIMAL(5,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_base_recipe_items_base_id ON base_recipe_items(base_recipe_id);
CREATE INDEX idx_base_recipe_items_ingredient_id ON base_recipe_items(ingredient_id);
CREATE INDEX idx_final_product_items_product_id ON final_product_items(product_id);
CREATE INDEX idx_final_product_items_item_id ON final_product_items(item_id);
CREATE INDEX idx_final_products_category ON final_products(category);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_base_recipes_name ON base_recipes(name);
CREATE INDEX idx_final_products_name ON final_products(name);

-- Função para calcular custo unitário automaticamente
CREATE OR REPLACE FUNCTION calculate_unit_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.unit_price = NEW.unit_cost / NEW.volume;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular unit_price ao inserir/atualizar ingrediente
CREATE TRIGGER calculate_ingredient_unit_price
  BEFORE INSERT OR UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION calculate_unit_price();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_recipes_updated_at BEFORE UPDATE ON base_recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_final_products_updated_at BEFORE UPDATE ON final_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular custo total de uma base de preparo
CREATE OR REPLACE FUNCTION calculate_base_recipe_cost(base_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total_cost), 0) INTO total
  FROM base_recipe_items
  WHERE base_recipe_id = base_id;
  
  RETURN total;
END;
$$ language 'plpgsql';

-- Função para calcular custo total de um produto final
CREATE OR REPLACE FUNCTION calculate_final_product_cost(product_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(total_cost), 0) INTO total
  FROM final_product_items
  WHERE final_product_items.product_id = calculate_final_product_cost.product_id;
  
  RETURN total;
END;
$$ language 'plpgsql';

-- Row Level Security (RLS)
-- ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE base_recipes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE base_recipe_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE final_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE final_product_items ENABLE ROW LEVEL SECURITY;

-- Dados de Exemplo - Insumos
INSERT INTO ingredients (name, volume, unit, unit_cost, loss_factor) VALUES
  ('Açúcar', 5000, 'gramas', 19.00, 2),
  ('Farinha de Trigo', 1000, 'gramas', 46.00, 2),
  ('Água Filtrada', 1000, 'gramas', 0.01, 0),
  ('Margarina', 500, 'gramas', 9.00, 2),
  ('Bicarbonato', 1000, 'gramas', 17.00, 2),
  ('Pasta Pistache', 160, 'gramas', 95.00, 2),
  ('Limão', 1000, 'gramas', 6.00, 2),
  ('Cacau em pó', 1000, 'gramas', 38.00, 2),
  ('Chocolate Meio Amargo', 2050, 'gramas', 140.00, 2),
  ('Leite', 1000, 'gramas', 4.50, 2),
  ('Ovos', 6, 'unidades', 1.02, 2);

-- Exemplo de Base de Preparo
INSERT INTO base_recipes (name, description, loss_factor) VALUES
  ('Massa de Chocolate 3x 3.450g', 'Massa base para bolos de chocolate', 2);

-- Exemplo de Itens da Base (usar IDs reais dos ingredientes)
-- INSERT INTO base_recipe_items (base_recipe_id, ingredient_id, ingredient_name, quantity, unit, unit_cost, loss_factor, total_cost)
-- SELECT 
--   (SELECT id FROM base_recipes WHERE name = 'Massa de Chocolate 3x 3.450g'),
--   id,
--   name,
--   720,
--   'gramas',
--   unit_price,
--   0,
--   720 * unit_price
-- FROM ingredients WHERE name = 'Farinha de Trigo';

-- Views úteis para relatórios
CREATE OR REPLACE VIEW v_ingredients_summary AS
SELECT 
  id,
  name,
  volume,
  unit,
  unit_cost,
  unit_price,
  loss_factor,
  ROUND(unit_price * (1 + loss_factor/100), 6) as unit_price_with_loss
FROM ingredients
ORDER BY name;

CREATE OR REPLACE VIEW v_base_recipes_with_cost AS
SELECT 
  br.id,
  br.name,
  br.description,
  br.loss_factor,
  COALESCE(SUM(bri.total_cost), 0) as calculated_cost,
  br.total_cost,
  COUNT(bri.id) as item_count
FROM base_recipes br
LEFT JOIN base_recipe_items bri ON br.id = bri.base_recipe_id
GROUP BY br.id, br.name, br.description, br.loss_factor, br.total_cost
ORDER BY br.name;

CREATE OR REPLACE VIEW v_final_products_with_margin AS
SELECT 
  fp.id,
  fp.name,
  fp.category,
  fp.total_cost,
  fp.sale_price,
  fp.profit_margin,
  CASE 
    WHEN fp.sale_price > 0 THEN fp.sale_price - fp.total_cost
    ELSE 0
  END as profit_amount,
  COUNT(fpi.id) as item_count
FROM final_products fp
LEFT JOIN final_product_items fpi ON fp.id = fpi.product_id
GROUP BY fp.id, fp.name, fp.category, fp.total_cost, fp.sale_price, fp.profit_margin
ORDER BY fp.name;
