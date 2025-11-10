'use client'

import { Bell, Mail, MessageSquare, Calendar } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    {
      icon: Bell,
      title: 'Novos Pedidos',
      description: 'Receba notificações quando um novo pedido for criado',
      email: true,
      push: true,
    },
    {
      icon: Calendar,
      title: 'Lembretes de Entrega',
      description: 'Notificações sobre pedidos próximos da data de entrega',
      email: true,
      push: false,
    },
    {
      icon: MessageSquare,
      title: 'Mensagens de Clientes',
      description: 'Quando um cliente enviar uma mensagem',
      email: false,
      push: true,
    },
    {
      icon: Mail,
      title: 'Relatórios Semanais',
      description: 'Resumo semanal das vendas e pedidos',
      email: true,
      push: false,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h2>
      <p className="text-gray-600 mb-6">
        Gerencie como e quando você recebe notificações
      </p>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const Icon = notification.icon
          return (
            <div key={notification.title} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[var(--color-lavender-blush)] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[var(--color-old-rose)]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={notification.email}
                    className="w-4 h-4 text-[var(--color-old-rose)] rounded focus:ring-[var(--color-old-rose)]"
                  />
                  <span className="text-sm text-gray-700">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={notification.push}
                    className="w-4 h-4 text-[var(--color-old-rose)] rounded focus:ring-[var(--color-old-rose)]"
                  />
                  <span className="text-sm text-gray-700">Push</span>
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-end mt-6">
        <button className="btn-success">
          Salvar alterações
        </button>
      </div>
    </div>
  )
}
