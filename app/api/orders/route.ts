import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verifica autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca pedidos do usuário
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('delivery_date', { ascending: true })

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Erro no GET /api/orders:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verifica autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { customer, customer_id, product, product_id, delivery_date, status, phone, value, notes } = body

    // Validações
    if (!customer || !product || !delivery_date) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: customer, product, delivery_date' },
        { status: 400 }
      )
    }

    // Parse do valor (formato brasileiro: R$ 1.000,00)
    let parsedValue = null
    if (value) {
      try {
        const cleanValue = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
        parsedValue = parseFloat(cleanValue)
      } catch (e) {
        console.error('Erro ao fazer parse do valor:', e)
      }
    }

    // Insere o pedido
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer,
        customer_id,
        product,
        product_id,
        delivery_date,
        status: status || 'pending',
        phone,
        value: parsedValue,
        notes
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar pedido:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro no POST /api/orders:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verifica autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 })
    }

    const body = await request.json()
    const { customer, customer_id, product, product_id, delivery_date, status, phone, value, notes } = body

    // Parse do valor (formato brasileiro: R$ 1.000,00)
    let parsedValue = null
    if (value) {
      try {
        const cleanValue = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
        parsedValue = parseFloat(cleanValue)
      } catch (e) {
        console.error('Erro ao fazer parse do valor:', e)
      }
    }

    // Atualiza o pedido
    const { data, error } = await supabase
      .from('orders')
      .update({
        customer,
        customer_id,
        product,
        product_id,
        delivery_date,
        status,
        phone,
        value: parsedValue,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar pedido:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no PATCH /api/orders:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verifica autenticação
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do pedido é obrigatório' }, { status: 400 })
    }

    // Deleta o pedido
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar pedido:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pedido deletado com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/orders:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
