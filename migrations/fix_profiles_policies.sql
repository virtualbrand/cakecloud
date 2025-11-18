-- Corrigir políticas recursivas da tabela profiles

-- Remover a política problemática
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON profiles;

-- Criar política sem recursão (usando diretamente os campos da linha atual)
CREATE POLICY "Users can view profiles in their workspace"
  ON profiles FOR SELECT
  USING (
    -- Usuário pode ver seu próprio perfil
    auth.uid() = id 
    OR
    -- Ou pode ver perfis do mesmo workspace (compara diretamente os workspace_id)
    workspace_id IN (
      SELECT p.workspace_id 
      FROM profiles p 
      WHERE p.id = auth.uid()
      LIMIT 1
    )
  );

-- Garantir que usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verificar as policies existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
