-- =====================================================
-- MÓDULO DE PRECIFICAÇÃO - CAKECLOUD (CORRIGIDO)
-- Schema para Insumos, Bases de Preparo e Produtos Finais
-- =====================================================

-- Tabela de Insumos / Matérias-Primas
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  volume DECIMAL(10,2) NOT NULL,
  unit TEXT CHECK (unit IN ('gramas', 'kg', 'ml', 'litros', 'unidades')) NOT NULL,
  average_cost DECIMAL(10,2) NOT NULL, -- custo médio total
  unit_cost DECIMAL(10,6) GENERATED ALWAYS AS (average_cost / volume) STORED, -- calculado automaticamente
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Bases de Preparo (Receitas Base)
CREATE TABLE IF NOT EXISTS public.base_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_cost DECIMAL(10,2) DEFAULT 0,
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens das Bases de Preparo
CREATE TABLE IF NOT EXISTS public.base_recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  base_recipe_id UUID REFERENCES public.base_recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE RESTRICT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Produtos Finais
CREATE TABLE IF NOT EXISTS public.final_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('cake', 'cupcake', 'cookie', 'pie', 'other')) NOT NULL,
  total_cost DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2),
  profit_margin DECIMAL(5,2),
  loss_factor DECIMAL(5,2) DEFAULT 0 CHECK (loss_factor >= 0 AND loss_factor <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens dos Produtos Finais
CREATE TABLE IF NOT EXISTS public.final_product_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  final_product_id UUID REFERENCES public.final_products(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT CHECK (item_type IN ('ingredient', 'base_recipe')) NOT NULL,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  base_recipe_id UUID REFERENCES public.base_recipes(id) ON DELETE RESTRICT,
  quantity DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT check_item_reference CHECK (
    (item_type = 'ingredient' AND ingredient_id IS NOT NULL AND base_recipe_id IS NULL) OR
    (item_type = 'base_recipe' AND base_recipe_id IS NOT NULL AND ingredient_id IS NULL)
  )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON public.ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_base_recipes_user_id ON public.base_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_final_products_user_id ON public.final_products(user_id);
CREATE INDEX IF NOT EXISTS idx_base_recipe_items_base_id ON public.base_recipe_items(base_recipe_id);
CREATE INDEX IF NOT EXISTS idx_base_recipe_items_ingredient_id ON public.base_recipe_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_final_product_items_product_id ON public.final_product_items(final_product_id);
CREATE INDEX IF NOT EXISTS idx_final_products_category ON public.final_products(category);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_ingredients_updated_at ON public.ingredients;
CREATE TRIGGER update_ingredients_updated_at 
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_base_recipes_updated_at ON public.base_recipes;
CREATE TRIGGER update_base_recipes_updated_at 
  BEFORE UPDATE ON public.base_recipes
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_final_products_updated_at ON public.final_products;
CREATE TRIGGER update_final_products_updated_at 
  BEFORE UPDATE ON public.final_products
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular custo total de uma base de preparo
CREATE OR REPLACE FUNCTION public.calculate_base_recipe_total_cost()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(10,2);
  base_loss_factor DECIMAL(5,2);
BEGIN
  -- Buscar o loss_factor da base
  SELECT loss_factor INTO base_loss_factor
  FROM public.base_recipes
  WHERE id = COALESCE(NEW.base_recipe_id, OLD.base_recipe_id);

  -- Calcular custo total dos itens
  SELECT COALESCE(SUM(
    bri.quantity * i.unit_cost * (1 + COALESCE(i.loss_factor, 0) / 100.0)
  ), 0) INTO total
  FROM public.base_recipe_items bri
  JOIN public.ingredients i ON bri.ingredient_id = i.id
  WHERE bri.base_recipe_id = COALESCE(NEW.base_recipe_id, OLD.base_recipe_id);

  -- Aplicar loss_factor da base
  total = total * (1 + COALESCE(base_loss_factor, 0) / 100.0);

  -- Atualizar o total_cost da base
  UPDATE public.base_recipes
  SET total_cost = total
  WHERE id = COALESCE(NEW.base_recipe_id, OLD.base_recipe_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para recalcular custo ao adicionar/remover/atualizar itens
DROP TRIGGER IF EXISTS recalculate_base_cost_on_item_change ON public.base_recipe_items;
CREATE TRIGGER recalculate_base_cost_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.base_recipe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_base_recipe_total_cost();

-- Função para calcular custo total de um produto final
CREATE OR REPLACE FUNCTION public.calculate_final_product_total_cost()
RETURNS TRIGGER AS $$
DECLARE
  total DECIMAL(10,2);
  product_loss_factor DECIMAL(5,2);
BEGIN
  -- Buscar o loss_factor do produto
  SELECT loss_factor INTO product_loss_factor
  FROM public.final_products
  WHERE id = COALESCE(NEW.final_product_id, OLD.final_product_id);

  -- Calcular custo total dos itens
  SELECT COALESCE(SUM(
    CASE 
      WHEN fpi.item_type = 'ingredient' THEN 
        fpi.quantity * i.unit_cost * (1 + COALESCE(i.loss_factor, 0) / 100.0)
      WHEN fpi.item_type = 'base_recipe' THEN 
        fpi.quantity * br.total_cost
      ELSE 0
    END
  ), 0) INTO total
  FROM public.final_product_items fpi
  LEFT JOIN public.ingredients i ON fpi.ingredient_id = i.id
  LEFT JOIN public.base_recipes br ON fpi.base_recipe_id = br.id
  WHERE fpi.final_product_id = COALESCE(NEW.final_product_id, OLD.final_product_id);

  -- Aplicar loss_factor do produto
  total = total * (1 + COALESCE(product_loss_factor, 0) / 100.0);

  -- Atualizar o total_cost do produto
  UPDATE public.final_products
  SET total_cost = total
  WHERE id = COALESCE(NEW.final_product_id, OLD.final_product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para recalcular custo ao adicionar/remover/atualizar itens
DROP TRIGGER IF EXISTS recalculate_product_cost_on_item_change ON public.final_product_items;
CREATE TRIGGER recalculate_product_cost_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.final_product_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_final_product_total_cost();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_product_items ENABLE ROW LEVEL SECURITY;

-- Policies para ingredients
CREATE POLICY "Users can view their own ingredients"
  ON public.ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredients"
  ON public.ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients"
  ON public.ingredients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients"
  ON public.ingredients FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para base_recipes
CREATE POLICY "Users can view their own base recipes"
  ON public.base_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own base recipes"
  ON public.base_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own base recipes"
  ON public.base_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own base recipes"
  ON public.base_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para base_recipe_items
CREATE POLICY "Users can view items of their own base recipes"
  ON public.base_recipe_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.base_recipes
    WHERE base_recipes.id = base_recipe_items.base_recipe_id
    AND base_recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert items to their own base recipes"
  ON public.base_recipe_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.base_recipes
    WHERE base_recipes.id = base_recipe_items.base_recipe_id
    AND base_recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update items of their own base recipes"
  ON public.base_recipe_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.base_recipes
    WHERE base_recipes.id = base_recipe_items.base_recipe_id
    AND base_recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items of their own base recipes"
  ON public.base_recipe_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.base_recipes
    WHERE base_recipes.id = base_recipe_items.base_recipe_id
    AND base_recipes.user_id = auth.uid()
  ));

-- Policies para final_products
CREATE POLICY "Users can view their own final products"
  ON public.final_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own final products"
  ON public.final_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own final products"
  ON public.final_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own final products"
  ON public.final_products FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para final_product_items
CREATE POLICY "Users can view items of their own final products"
  ON public.final_product_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.final_products
    WHERE final_products.id = final_product_items.final_product_id
    AND final_products.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert items to their own final products"
  ON public.final_product_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.final_products
    WHERE final_products.id = final_product_items.final_product_id
    AND final_products.user_id = auth.uid()
  ));

CREATE POLICY "Users can update items of their own final products"
  ON public.final_product_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.final_products
    WHERE final_products.id = final_product_items.final_product_id
    AND final_products.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items of their own final products"
  ON public.final_product_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.final_products
    WHERE final_products.id = final_product_items.final_product_id
    AND final_products.user_id = auth.uid()
  ));
