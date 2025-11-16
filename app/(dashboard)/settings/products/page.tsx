'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

export default function ProductsSettingsPage() {
  // Inicializar com valores do localStorage
  const [showLossFactorIngredients, setShowLossFactorIngredients] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        return settings.showLossFactorIngredients ?? true
      }
    }
    return true
  })

  const [showLossFactorBases, setShowLossFactorBases] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        return settings.showLossFactorBases ?? true
      }
    }
    return true
  })

  const [showLossFactorProducts, setShowLossFactorProducts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        return settings.showLossFactorProducts ?? true
      }
    }
    return true
  })

  // Salvar configurações no localStorage quando houver mudanças
  const updateSetting = (key: string, value: boolean) => {
    const currentSettings = localStorage.getItem('productSettings')
    const settings = currentSettings ? JSON.parse(currentSettings) : {}
    settings[key] = value
    localStorage.setItem('productSettings', JSON.stringify(settings))
  }

  const handleIngredientsToggle = (checked: boolean) => {
    setShowLossFactorIngredients(checked)
    updateSetting('showLossFactorIngredients', checked)
  }

  const handleBasesToggle = (checked: boolean) => {
    setShowLossFactorBases(checked)
    updateSetting('showLossFactorBases', checked)
  }

  const handleProductsToggle = (checked: boolean) => {
    setShowLossFactorProducts(checked)
    updateSetting('showLossFactorProducts', checked)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Produtos</h2>
      <p className="text-gray-600 mb-6">
        Configure a visibilidade e comportamento dos campos nos formulários de produtos.
      </p>

      {/* Seção de Fator de Perda */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Fator de Perda</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure a visibilidade do campo &quot;Fator de Perda&quot; nos diferentes níveis de cadastro de produtos.
        </p>

        <div className="space-y-4">
          {/* Insumo / Matéria-prima */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="loss-factor-ingredients" className="text-sm font-medium text-gray-900 cursor-pointer">
                Insumo / Matéria-prima
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Exibir campo de fator de perda ao cadastrar insumos
              </p>
            </div>
            <Switch
              id="loss-factor-ingredients"
              checked={showLossFactorIngredients}
              onCheckedChange={handleIngredientsToggle}
            />
          </div>

          {/* Base de preparo */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="loss-factor-bases" className="text-sm font-medium text-gray-900 cursor-pointer">
                Base de preparo
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Exibir campo de fator de perda ao cadastrar bases de preparo
              </p>
            </div>
            <Switch
              id="loss-factor-bases"
              checked={showLossFactorBases}
              onCheckedChange={handleBasesToggle}
            />
          </div>

          {/* Produto final */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="loss-factor-products" className="text-sm font-medium text-gray-900 cursor-pointer">
                Produto final
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Exibir campo de fator de perda ao cadastrar produtos finais
              </p>
            </div>
            <Switch
              id="loss-factor-products"
              checked={showLossFactorProducts}
              onCheckedChange={handleProductsToggle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
