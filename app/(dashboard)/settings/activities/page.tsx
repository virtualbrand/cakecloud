'use client'

import { Activity, User, Package, ShoppingCart, Settings } from 'lucide-react'

export default function ActivitiesPage() {
  const activities = [
    {
      icon: ShoppingCart,
      action: 'Pedido criado',
      description: 'Bolo de Chocolate 2kg para Maria Silva',
      time: 'Há 2 horas',
      date: '10 Nov 2025',
    },
    {
      icon: Package,
      action: 'Produto atualizado',
      description: 'Preço do Bolo de Morango alterado',
      time: 'Há 5 horas',
      date: '10 Nov 2025',
    },
    {
      icon: User,
      action: 'Cliente cadastrado',
      description: 'João Santos adicionado aos clientes',
      time: 'Ontem',
      date: '9 Nov 2025',
    },
    {
      icon: Settings,
      action: 'Configurações alteradas',
      description: 'Preferências de ordenação atualizadas',
      time: 'Há 2 dias',
      date: '8 Nov 2025',
    },
    {
      icon: ShoppingCart,
      action: 'Pedido concluído',
      description: 'Torta de Limão entregue para Ana Costa',
      time: 'Há 3 dias',
      date: '7 Nov 2025',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
        <p className="text-gray-600 mt-1">Histórico de ações realizadas no sistema</p>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <div key={index} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-lavender-blush)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[var(--color-old-rose)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{activity.time} • {activity.date}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-6 border-t border-gray-200 text-center">
        <button className="text-sm text-[var(--color-old-rose)] hover:text-[var(--color-rosy-brown)] font-medium">
          Ver todas as atividades
        </button>
      </div>
    </div>
  )
}
