-- Adiciona os campos 'unit' (Unidade) e 'yield' (Rendimento) à tabela base_recipes
-- Migração criada em: 2025-11-16

ALTER TABLE base_recipes
ADD COLUMN unit TEXT DEFAULT 'gramas',
ADD COLUMN yield DECIMAL(10,2);

-- Adicionar comentários às colunas para documentação
COMMENT ON COLUMN base_recipes.unit IS 'Unidade de medida da base de preparo (gramas, kg, ml, litros, unidades)';
COMMENT ON COLUMN base_recipes.yield IS 'Rendimento da base de preparo (quantidade produzida)';
