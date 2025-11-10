'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState({
    orderSort: 'desc',
    defaultView: 'monthly',
    showDailyBalance: false,
    startFromZero: false,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Aqui você salvaria as preferências no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'Preferências salvas com sucesso!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar preferências. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {message && (
        <div className={`m-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Ordenação dos Lançamentos */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Ordenação dos seus Pedidos</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ordem (baseada na data) que suas transações serão listadas na tela de Pedidos
              </p>
            </div>
            <div className="ml-6 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orderSort"
                  value="desc"
                  checked={preferences.orderSort === 'desc'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, orderSort: e.target.value }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Decrescente</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orderSort"
                  value="asc"
                  checked={preferences.orderSort === 'asc'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, orderSort: e.target.value }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Crescente</span>
              </label>
            </div>
          </div>
        </div>

        {/* Período de Navegação Padrão */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Período de navegação padrão</h3>
              <p className="text-sm text-gray-600 mt-1">
                Para quem faz muitos pedidos durante o mês, o ideal é escolher semanal ou diário
              </p>
            </div>
            <div className="ml-6 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultView"
                  value="daily"
                  checked={preferences.defaultView === 'daily'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Diário</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultView"
                  value="weekly"
                  checked={preferences.defaultView === 'weekly'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Semanal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultView"
                  value="monthly"
                  checked={preferences.defaultView === 'monthly'}
                  onChange={(e) => setPreferences(prev => ({ ...prev, defaultView: e.target.value }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Mensal</span>
              </label>
            </div>
          </div>
        </div>

        {/* Saldo Diário */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Saldo diário</h3>
              <p className="text-sm text-gray-600 mt-1">
                Mostra saldos listados na tela de Pedidos ao final de cada dia
              </p>
            </div>
            <div className="ml-6 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="showDailyBalance"
                  value="yes"
                  checked={preferences.showDailyBalance}
                  onChange={() => setPreferences(prev => ({ ...prev, showDailyBalance: true }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="showDailyBalance"
                  value="no"
                  checked={!preferences.showDailyBalance}
                  onChange={() => setPreferences(prev => ({ ...prev, showDailyBalance: false }))}
                  className="w-4 h-4 text-[var(--color-old-rose)] focus:ring-[var(--color-old-rose)]"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>
        </div>

        {/* Começar do Zero */}
        <div className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Começar do zero</h3>
              <p className="text-sm text-gray-600 mt-1">
                Aqui você pode zerar sua conta, deletando toda sua movimentação financeira. 
                Suas contas, clientes e produtos cadastrados permanecerão intactos.
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                disabled={preferences.startFromZero}
                className="px-4 py-2 text-sm font-medium text-[var(--color-old-rose)] hover:text-[var(--color-rosy-brown)] disabled:text-gray-400 disabled:cursor-not-allowed transition"
              >
                Excluir minhas transações
              </button>
            </div>
          </div>
        </div>

        {/* Excluir Conta */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Excluir conta</h3>
              <p className="text-sm text-gray-600 mt-1">
                Já é hora de dizer tchau? Aqui você pode excluir sua conta definitivamente
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition"
              >
                Excluir conta por completo
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="btn-success inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
