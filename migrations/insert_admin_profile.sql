-- Inserir perfil completo para admin@admin.com

INSERT INTO profiles (
  id,
  full_name,
  role,
  workspace_id,
  created_at,
  updated_at
) VALUES (
  '73b0ae92-8f64-4552-8b08-97d234dfd345',
  'Admin',
  'superadmin',
  '73b0ae92-8f64-4552-8b08-97d234dfd345',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Admin',
  role = 'superadmin',
  workspace_id = '73b0ae92-8f64-4552-8b08-97d234dfd345',
  updated_at = NOW();

-- Verificar
SELECT 
  p.id, 
  u.email, 
  p.full_name, 
  p.role, 
  p.workspace_id
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at;
