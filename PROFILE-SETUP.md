# Instruções para Configurar a Página de Perfil

## 1. Execute o SQL no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase-profiles.sql`
6. Clique em **Run** para executar

## 2. O que foi criado

### Tabela `profiles`
- `id`: UUID (referência ao usuário)
- `full_name`: Nome completo
- `phone`: Telefone
- `address`: Endereço
- `city`: Cidade
- `state`: Estado (UF)
- `zip_code`: CEP
- `avatar_url`: URL da foto de perfil
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Storage Bucket `avatars`
- Bucket público para armazenar fotos de perfil
- Tamanho máximo: 2MB por arquivo
- Formatos aceitos: JPG, PNG, GIF

### Políticas de Segurança (RLS)
- Usuários podem ver apenas seu próprio perfil
- Usuários podem atualizar apenas seu próprio perfil
- Usuários podem fazer upload apenas de sua própria foto

## 3. Como usar

1. Faça login na aplicação
2. Clique no seu avatar no sidebar
3. Selecione "Meu Perfil"
4. Preencha seus dados e faça upload de uma foto (opcional)
5. Clique em "Salvar Alterações"

## 4. Funcionalidades

- ✅ Upload de foto de perfil (até 2MB)
- ✅ Edição de nome completo
- ✅ Edição de telefone
- ✅ Edição de endereço completo (rua, cidade, estado, CEP)
- ✅ Email não editável (somente leitura)
- ✅ Prévia da foto antes do upload
- ✅ Remoção da foto de perfil
- ✅ Feedback visual de sucesso/erro
- ✅ Cancelar alterações e recarregar dados originais

## 5. Melhorias Futuras (Opcional)

- Integração com API de CEP para autocompletar endereço
- Compressão automática de imagens
- Cropper de imagem para escolher área da foto
- Validação de telefone brasileiro
- Histórico de alterações
