-- =====================================================
-- CORREÇÃO: Cálculo de custo de base de preparo
-- Remove duplicação do fator de perda
-- =====================================================

-- Função corrigida para calcular custo total de uma base de preparo
-- Agora aplica apenas o loss_factor da base, não dos ingredientes
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

  -- Calcular custo total dos itens SEM aplicar loss_factor dos ingredientes
  -- Usamos apenas o custo unitário base
  SELECT COALESCE(SUM(
    bri.quantity * i.unit_cost
  ), 0) INTO total
  FROM public.base_recipe_items bri
  JOIN public.ingredients i ON bri.ingredient_id = i.id
  WHERE bri.base_recipe_id = COALESCE(NEW.base_recipe_id, OLD.base_recipe_id);

  -- Aplicar APENAS o loss_factor da base
  total = total * (1 + COALESCE(base_loss_factor, 0) / 100.0);

  -- Atualizar o total_cost da base
  UPDATE public.base_recipes
  SET total_cost = total
  WHERE id = COALESCE(NEW.base_recipe_id, OLD.base_recipe_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Recriar o trigger (para garantir que está usando a função atualizada)
DROP TRIGGER IF EXISTS recalculate_base_cost_on_item_change ON public.base_recipe_items;
CREATE TRIGGER recalculate_base_cost_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.base_recipe_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_base_recipe_total_cost();

-- Função corrigida para produtos finais também
-- Aplica apenas o loss_factor do produto, não dos ingredientes/bases
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

  -- Calcular custo total dos itens SEM aplicar loss_factor dos ingredientes
  SELECT COALESCE(SUM(
    CASE 
      WHEN fpi.item_type = 'ingredient' THEN 
        fpi.quantity * i.unit_cost
      WHEN fpi.item_type = 'base_recipe' THEN 
        fpi.quantity * br.total_cost
      ELSE 0
    END
  ), 0) INTO total
  FROM public.final_product_items fpi
  LEFT JOIN public.ingredients i ON fpi.ingredient_id = i.id
  LEFT JOIN public.base_recipes br ON fpi.base_recipe_id = br.id
  WHERE fpi.final_product_id = COALESCE(NEW.final_product_id, OLD.final_product_id);

  -- Aplicar APENAS o loss_factor do produto
  total = total * (1 + COALESCE(product_loss_factor, 0) / 100.0);

  -- Atualizar o total_cost do produto
  UPDATE public.final_products
  SET total_cost = total
  WHERE id = COALESCE(NEW.final_product_id, OLD.final_product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Recriar o trigger
DROP TRIGGER IF EXISTS recalculate_product_cost_on_item_change ON public.final_product_items;
CREATE TRIGGER recalculate_product_cost_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.final_product_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_final_product_total_cost();

-- Recalcular custos de todas as bases existentes
UPDATE public.base_recipes SET updated_at = NOW();

-- Recalcular custos de todos os produtos existentes
UPDATE public.final_products SET updated_at = NOW();
