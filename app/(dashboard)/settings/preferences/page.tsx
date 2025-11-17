'use client'

import { useState } from 'react'
import { Check, Layout, BrushCleaning, Trash2 } from 'lucide-react'
import { showToast } from '@/app/(dashboard)/layout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Função para obter o valor inicial do localStorage
const getInitialMenuPosition = (): 'sidebar' | 'header' | 'footer' | 'right' => {
  if (typeof window === 'undefined') return 'sidebar'
  const saved = localStorage.getItem('menuPosition')
  return (saved as 'sidebar' | 'header' | 'footer' | 'right') || 'sidebar'
}

const getInitialShowDailyBalance = (): boolean => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('showDailyBalance')
  return saved === 'true'
}

export default function PreferencesPage() {
  const [menuPosition, setMenuPosition] = useState<'sidebar' | 'header' | 'footer' | 'right'>(getInitialMenuPosition)
  const [savedMenuPosition, setSavedMenuPosition] = useState<'sidebar' | 'header' | 'footer' | 'right'>(getInitialMenuPosition)
  const [showDailyBalance, setShowDailyBalance] = useState(getInitialShowDailyBalance)
  const [savedShowDailyBalance, setSavedShowDailyBalance] = useState(getInitialShowDailyBalance)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')

  const hasChanges = menuPosition !== savedMenuPosition || showDailyBalance !== savedShowDailyBalance
  const isResetConfirmed = resetConfirmText === 'ZERAR CONTA'

  const handleSave = () => {
    localStorage.setItem('menuPosition', menuPosition)
    localStorage.setItem('showDailyBalance', showDailyBalance.toString())
    
    // Disparar evento para atualizar o layout após salvar
    const event = new CustomEvent('menu-position-changed', {
      detail: { position: menuPosition }
    })
    window.dispatchEvent(event)
    
    setSavedMenuPosition(menuPosition)
    setSavedShowDailyBalance(showDailyBalance)

    const positionLabels = {
      sidebar: 'Lateral Esquerda',
      right: 'Lateral Direita',
      header: 'Cabeçalho',
      footer: 'Rodapé'
    }

    showToast({
      title: 'Preferências salvas!',
      message: `Menu posicionado em: ${positionLabels[menuPosition]}`,
      variant: 'success',
      duration: 3000,
    })
  }

  const handleResetAccount = () => {
    // Aqui você implementaria a lógica de zerar a conta
    console.log('Zerando conta...')
    setIsResetDialogOpen(false)
    setResetConfirmText('')
    showToast({
      title: 'Conta zerada!',
      message: 'Todas as transações financeiras foram removidas.',
      variant: 'success',
      duration: 3000,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 space-y-6">
        {/* Posição do Menu */}
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="w-5 h-5 text-gray-700" />
                <h3 className="text-base font-semibold text-gray-900">Posição do Menu</h3>
              </div>
              <p className="text-sm text-gray-600">
                Escolha onde deseja visualizar o menu de navegação principal
              </p>
            </div>
            <div className="ml-6 flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="menuPosition"
                  value="sidebar"
                  checked={menuPosition === 'sidebar'}
                  onChange={(e) => setMenuPosition(e.target.value as 'sidebar' | 'header' | 'footer' | 'right')}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Esquerda</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="menuPosition"
                  value="right"
                  checked={menuPosition === 'right'}
                  onChange={(e) => setMenuPosition(e.target.value as 'sidebar' | 'header' | 'footer' | 'right')}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Direita</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="menuPosition"
                  value="header"
                  checked={menuPosition === 'header'}
                  onChange={(e) => setMenuPosition(e.target.value as 'sidebar' | 'header' | 'footer' | 'right')}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Cabeçalho</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="menuPosition"
                  value="footer"
                  checked={menuPosition === 'footer'}
                  onChange={(e) => setMenuPosition(e.target.value as 'sidebar' | 'header' | 'footer' | 'right')}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Rodapé</span>
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
                  checked={showDailyBalance}
                  onChange={() => setShowDailyBalance(true)}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="showDailyBalance"
                  value="no"
                  checked={!showDailyBalance}
                  onChange={() => setShowDailyBalance(false)}
                  className="w-4 h-4 text-[#BE9089] focus:ring-[#BE9089]"
                />
                <span className="text-sm text-gray-700">Não</span>
              </label>
            </div>
          </div>
        </div>

        {/* Começar do Zero */}
        <div className="pb-6 border-b border-gray-200">
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
                onClick={() => setIsResetDialogOpen(true)}
                className="btn-ghost-danger"
              >
                <BrushCleaning className="w-4 h-4" />
                Excluir minhas transações
              </button>
            </div>
          </div>
        </div>

        {/* Excluir Conta */}
        <div className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Excluir conta</h3>
              <p className="text-sm text-gray-600 mt-1">
                Hora de dizer tchau? Aqui você pode excluir sua conta definitivamente
              </p>
            </div>
            <div className="ml-6">
              <button
                type="button"
                className="btn-ghost-danger"
              >
                <Trash2 className="w-4 h-4" />
                Excluir conta por completo
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Salvar alterações
          </button>
        </div>
      </div>

      {/* AlertDialog para Começar do Zero */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Começar do zero</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá deletar toda sua movimentação financeira. Suas contas, clientes e produtos cadastrados permanecerão intactos.
              <br /><br />
              Para confirmar, digite <strong>ZERAR CONTA</strong> no campo abaixo:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Digite ZERAR CONTA"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetConfirmText('')} className="rounded-full">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAccount}
              disabled={!isResetConfirmed}
              className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar e zerar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
