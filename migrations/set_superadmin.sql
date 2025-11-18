-- Script para tornar admin@admin.com um superadmin

-- Primeiro, vamos buscar o ID do usuário
-- Execute este SELECT para ver o ID:
SELECT id, email FROM auth.users WHERE email = 'admin@admin.com';

-- Depois, atualize o perfil com o role de superadmin
UPDATE profiles 
SET role = 'superadmin',
    workspace_id = id  -- superadmin tem seu próprio workspace
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@admin.com'
);

-- Verificar se funcionou (juntando com auth.users para pegar o email)
SELECT p.id, u.email, p.role, p.workspace_id, p.full_name
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@admin.com';
