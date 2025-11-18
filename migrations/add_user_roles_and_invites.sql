-- Adicionar campos de role e workspace à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'member')),
ADD COLUMN IF NOT EXISTS workspace_id UUID,
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Criar índice para workspace_id
CREATE INDEX IF NOT EXISTS idx_profiles_workspace_id ON profiles(workspace_id);

-- Criar tabela de convites
CREATE TABLE IF NOT EXISTS user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  workspace_id UUID NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Policies para user_invites
CREATE POLICY "Users can view invites in their workspace"
  ON user_invites FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create invites"
  ON user_invites FOR INSERT
  WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update invites in their workspace"
  ON user_invites FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can delete invites in their workspace"
  ON user_invites FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Atualizar policies de profiles para permitir admins verem membros do workspace
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view profiles in their workspace"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id OR
    workspace_id IN (
      SELECT workspace_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Criar tabela de permissões (para granularidade futura)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('orders', 'customers', 'products', 'messages', 'agenda', 'financial', 'activities', 'settings')),
  can_view BOOLEAN DEFAULT true,
  can_create BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id, module)
);

-- Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Policies para user_permissions
CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage permissions in their workspace"
  ON user_permissions FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Função para gerar workspace_id automaticamente para novos usuários
CREATE OR REPLACE FUNCTION set_workspace_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se não tem workspace_id, significa que é um novo admin criando sua conta
  IF NEW.workspace_id IS NULL AND NEW.role = 'admin' THEN
    NEW.workspace_id := NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir workspace_id automaticamente
DROP TRIGGER IF EXISTS set_workspace_on_insert ON profiles;
CREATE TRIGGER set_workspace_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_workspace_for_new_user();

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_invites_workspace_id ON user_invites(workspace_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_email ON user_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_invites_token ON user_invites(token);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_workspace ON user_permissions(user_id, workspace_id);
