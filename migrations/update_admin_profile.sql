-- Atualizar perfil do admin@admin.com com nome completo

UPDATE profiles 
SET 
  full_name = 'Admin',
  role = 'superadmin',
  workspace_id = '73b0ae92-8f64-4552-8b08-97d234dfd345',
  updated_at = NOW()
WHERE id = '73b0ae92-8f64-4552-8b08-97d234dfd345';

-- Verificar se foi atualizado
SELECT 
  p.id, 
  u.email, 
  p.full_name, 
  p.role, 
  p.workspace_id,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = '73b0ae92-8f64-4552-8b08-97d234dfd345';
