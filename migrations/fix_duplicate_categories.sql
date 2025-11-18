-- 1. Primeiro, vamos ver quantas duplicatas existem
-- Execute este SELECT para verificar:
SELECT name, type, user_id, COUNT(*) as count
FROM financial_categories
GROUP BY name, type, user_id
HAVING COUNT(*) > 1
ORDER BY count DESC, name;

-- 2. Remove todas as categorias do sistema antigas (is_system=true)
-- pois elas não deveriam existir
DELETE FROM financial_categories
WHERE is_system = true;

-- 3. Remove categorias duplicadas do usuário, mantendo apenas a mais recente
DELETE FROM financial_categories a
USING (
  SELECT name, type, user_id, MAX(created_at) as max_created
  FROM financial_categories
  WHERE is_system = false
  GROUP BY name, type, user_id
  HAVING COUNT(*) > 1
) b
WHERE a.name = b.name 
  AND a.type = b.type
  AND a.user_id = b.user_id
  AND a.created_at < b.max_created
  AND a.is_system = false;

-- 4. Adiciona constraint para prevenir duplicatas futuras
ALTER TABLE financial_categories 
DROP CONSTRAINT IF EXISTS unique_category_per_user;

ALTER TABLE financial_categories 
ADD CONSTRAINT unique_category_per_user 
UNIQUE (user_id, name, type);

-- 5. Atualiza o campo icon para categorias que não têm
UPDATE financial_categories
SET icon = 'Lightbulb'
WHERE icon IS NULL;
