import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { description, amount, date, fromAccount, toAccount, observation, tags } = body

    // Validate
    if (!fromAccount || !toAccount) {
      return NextResponse.json({ error: 'Contas de origem e destino são obrigatórias' }, { status: 400 })
    }

    if (fromAccount === toAccount) {
      return NextResponse.json({ error: 'As contas devem ser diferentes' }, { status: 400 })
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
    }

    // Create two transactions: despesa (from) and receita (to)
    const transferDescription = description || 'Transferência'
    
    // Despesa (saída da conta origem)
    const { data: despesa, error: despesaError } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: user.id,
        description: `${transferDescription} (saída)`,
        amount: -Math.abs(amount), // Negative for despesa
        type: 'despesa',
        date,
        account_id: fromAccount,
        is_paid: true, // Transfers are immediately executed
        observation,
        tags: tags || []
      })
      .select()
      .single()

    if (despesaError) {
      console.error('Error creating despesa:', despesaError)
      return NextResponse.json({ error: 'Erro ao criar transação de saída' }, { status: 500 })
    }

    // Receita (entrada na conta destino)
    const { data: receita, error: receitaError } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: user.id,
        description: `${transferDescription} (entrada)`,
        amount: Math.abs(amount), // Positive for receita
        type: 'receita',
        date,
        account_id: toAccount,
        is_paid: true, // Transfers are immediately executed
        observation,
        tags: tags || []
      })
      .select()
      .single()

    if (receitaError) {
      console.error('Error creating receita:', receitaError)
      // Try to rollback despesa
      await supabase
        .from('financial_transactions')
        .delete()
        .eq('id', despesa.id)
      
      return NextResponse.json({ error: 'Erro ao criar transação de entrada' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      despesa, 
      receita,
      message: 'Transferência criada com sucesso'
    })
  } catch (error) {
    console.error('Error in POST /api/financeiro/transfers:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
