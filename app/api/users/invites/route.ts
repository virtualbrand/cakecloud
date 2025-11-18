import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('workspace_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 })
    }

    const { email, role = 'member', full_name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })
    }

    // Criar usuário diretamente no auth (senha temporária será gerada)
    const temporaryPassword = randomBytes(16).toString('hex')
    
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirma o email
      user_metadata: {
        full_name: full_name || email.split('@')[0]
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário: ' + authError.message }, { status: 400 })
    }

    if (!newUser.user) {
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    // Criar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: full_name || email.split('@')[0],
        role: role,
        workspace_id: profile.workspace_id,
        invited_by: user.id
      })

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Tentar deletar o usuário criado se falhar ao criar o perfil
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: 'Erro ao criar perfil do usuário' }, { status: 500 })
    }

    return NextResponse.json({
      id: newUser.user.id,
      email: newUser.user.email,
      role: role,
      full_name: full_name || email.split('@')[0],
      temporaryPassword: temporaryPassword
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}
