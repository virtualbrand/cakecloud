'use client'

export default function OrdersSettingsPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Pedidos</h2>
      <p className="text-gray-600">
        Configure preferências relacionadas aos pedidos, como status padrão, notificações automáticas para clientes,
        formatos de impressão, lembretes de entrega, etc.
      </p>
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          🚧 Em desenvolvimento - Em breve você poderá configurar todas as preferências de pedidos aqui.
        </p>
      </div>
    </div>
  )
}
