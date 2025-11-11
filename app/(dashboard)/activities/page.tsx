'use client'

import { useState } from 'react'
import { Activity, User, Package, ShoppingCart, Settings, Filter, Search, Calendar, Download, LucideIcon } from 'lucide-react'

type ActivityType = {
  id: string
  icon: LucideIcon
  action: string
  description: string
  user: string
  time: string
  date: string
  category: 'pedido' | 'produto' | 'cliente' | 'configuracao'
}

export default function ActivitiesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const activities: ActivityType[] = [
    {
      id: '1',
      icon: ShoppingCart,
      action: 'Pedido criado',
      description: 'Bolo de Chocolate 2kg para Maria Silva',
      user: 'Jaisson',
      time: 'Há 2 horas',
      date: '10 Nov 2025',
      category: 'pedido',
    },
    {
      id: '2',
      icon: Package,
      action: 'Produto atualizado',
      description: 'Preço do Bolo de Morango alterado de R$ 80,00 para R$ 85,00',
      user: 'Jaisson',
      time: 'Há 5 horas',
      date: '10 Nov 2025',
      category: 'produto',
    },
    {
      id: '3',
      icon: User,
      action: 'Cliente cadastrado',
      description: 'João Santos adicionado aos clientes',
      user: 'Jaisson',
      time: 'Ontem',
      date: '9 Nov 2025',
      category: 'cliente',
    },
    {
      id: '4',
      icon: Settings,
      action: 'Configurações alteradas',
      description: 'Preferências de ordenação atualizadas',
      user: 'Jaisson',
      time: 'Há 2 dias',
      date: '8 Nov 2025',
      category: 'configuracao',
    },
    {
      id: '5',
      icon: ShoppingCart,
      action: 'Pedido concluído',
      description: 'Torta de Limão entregue para Ana Costa',
      user: 'Jaisson',
      time: 'Há 3 dias',
      date: '7 Nov 2025',
      category: 'pedido',
    },
    {
      id: '6',
      icon: Package,
      action: 'Produto criado',
      description: 'Novo produto: Bolo Red Velvet',
      user: 'Jaisson',
      time: 'Há 4 dias',
      date: '6 Nov 2025',
      category: 'produto',
    },
    {
      id: '7',
      icon: ShoppingCart,
      action: 'Pedido cancelado',
      description: 'Pedido #1234 cancelado pelo cliente',
      user: 'Jaisson',
      time: 'Há 5 dias',
      date: '5 Nov 2025',
      category: 'pedido',
    },
    {
      id: '8',
      icon: User,
      action: 'Cliente atualizado',
      description: 'Telefone de Maria Silva alterado',
      user: 'Jaisson',
      time: 'Há 6 dias',
      date: '4 Nov 2025',
      category: 'cliente',
    },
  ]

  const getCategoryColor = (category: ActivityType['category']) => {
    const colors = {
      pedido: 'bg-blue-100 text-blue-700',
      produto: 'bg-purple-100 text-purple-700',
      cliente: 'bg-green-100 text-green-700',
      configuracao: 'bg-orange-100 text-orange-700',
    }
    return colors[category]
  }

  const getCategoryLabel = (category: ActivityType['category']) => {
    const labels = {
      pedido: 'Pedido',
      produto: 'Produto',
      cliente: 'Cliente',
      configuracao: 'Configuração',
    }
    return labels[category]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-[var(--color-old-rose)]" />
                Atividades
              </h1>
              <p className="text-gray-600 mt-2">Histórico completo de ações realizadas no sistema</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro de Data */}
            <div>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Período
                </span>
                <span className="text-gray-400">▼</span>
              </button>
            </div>

            {/* Filtro de Categoria */}
            <div>
              <button className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-2 text-gray-700">
                  <Filter className="w-4 h-4" />
                  Categoria
                </span>
                <span className="text-gray-400">▼</span>
              </button>
            </div>
          </div>

          {/* Chips de Filtros Ativos (para futuro) */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Filtros ativos:</span>
            <span className="text-sm text-gray-400">Nenhum</span>
          </div>
        </div>

        {/* Lista de Atividades */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Ícone */}
                    <div className="w-12 h-12 rounded-full bg-[var(--color-lavender-blush)] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-[var(--color-old-rose)]" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900">
                              {activity.action}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(activity.category)}`}>
                              {getCategoryLabel(activity.category)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {activity.user}
                            </span>
                            <span>•</span>
                            <span>{activity.time}</span>
                            <span>•</span>
                            <span>{activity.date}</span>
                          </div>
                        </div>

                        {/* Ações */}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paginação */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">1-8</span> de <span className="font-semibold">24</span> atividades
              </p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  Anterior
                </button>
                <button className="px-4 py-2 bg-[var(--color-old-rose)] text-white rounded-lg hover:bg-[var(--color-rosy-brown)] transition-colors">
                  Próxima
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
