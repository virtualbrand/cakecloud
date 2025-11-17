'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { X, Plus, Info } from 'lucide-react'
import { showToast } from '@/app/(dashboard)/layout'

interface Category {
  id: string
  name: string
}

export default function ProductsSettingsPage() {
  // Categorias do banco de dados
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await fetch('/api/products/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      showToast({
        title: 'Erro',
        message: 'Erro ao carregar categorias',
        variant: 'error',
        duration: 3000,
      })
    } finally {
      setLoadingCategories(false)
    }
  }

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
    
    showToast({
      title: checked ? 'Fator de perda ativado' : 'Fator de perda desativado',
      message: checked 
        ? 'O campo de fator de perda será exibido ao cadastrar insumos'
        : 'O campo de fator de perda foi ocultado para insumos',
      variant: 'success',
      duration: 3000,
    })
  }

  const handleBasesToggle = (checked: boolean) => {
    setShowLossFactorBases(checked)
    updateSetting('showLossFactorBases', checked)
    
    showToast({
      title: checked ? 'Fator de perda ativado' : 'Fator de perda desativado',
      message: checked 
        ? 'O campo de fator de perda será exibido ao cadastrar bases de preparo'
        : 'O campo de fator de perda foi ocultado para bases de preparo',
      variant: 'success',
      duration: 3000,
    })
  }

  const handleProductsToggle = (checked: boolean) => {
    setShowLossFactorProducts(checked)
    updateSetting('showLossFactorProducts', checked)
    
    showToast({
      title: checked ? 'Fator de perda ativado' : 'Fator de perda desativado',
      message: checked 
        ? 'O campo de fator de perda será exibido ao cadastrar produtos finais'
        : 'O campo de fator de perda foi ocultado para produtos finais',
      variant: 'success',
      duration: 3000,
    })
  }

  // Funções para gerenciar categorias
  const addCategory = async () => {
    if (!newCategory.trim()) return
    
    // Verifica se já existe
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      showToast({
        title: 'Atenção',
        message: 'Esta categoria já existe',
        variant: 'error',
        duration: 3000,
      })
      return
    }
    
    try {
      const response = await fetch('/api/products/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      })
      
      if (response.ok) {
        const newCat = await response.json()
        setCategories([...categories, newCat])
        setNewCategory('')
        
        showToast({
          title: 'Categoria adicionada!',
          message: `A categoria "${newCat.name}" foi adicionada com sucesso`,
          variant: 'success',
          duration: 3000,
        })
      } else {
        throw new Error('Erro ao adicionar categoria')
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
      showToast({
        title: 'Erro',
        message: 'Erro ao adicionar categoria',
        variant: 'error',
        duration: 3000,
      })
    }
  }

  const removeCategory = async (categoryId: string, categoryName: string) => {
    try {
      const response = await fetch(`/api/products/categories?id=${categoryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        
        showToast({
          title: 'Categoria removida!',
          message: `A categoria "${categoryName}" foi removida`,
          variant: 'success',
          duration: 3000,
        })
      } else {
        throw new Error('Erro ao remover categoria')
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error)
      showToast({
        title: 'Erro',
        message: 'Erro ao remover categoria',
        variant: 'error',
        duration: 3000,
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCategory()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Produtos</h2>
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-[330px] bg-white text-[var(--color-licorice)] text-sm rounded-lg shadow-lg z-50 border border-gray-200" style={{ padding: '25px 15px 30px 20px' }}>
            Configure a visibilidade e comportamento dos campos nos formulários de produtos.
          </div>
        </div>
      </div>

      {/* Seção de Categorias */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Categorias de Produtos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Gerencie as categorias disponíveis para classificar seus produtos finais.
        </p>

        {/* Lista de categorias */}
        <div className="flex flex-wrap gap-2 mb-4">
          {loadingCategories ? (
            <p className="text-sm text-gray-500">Carregando categorias...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma categoria cadastrada</p>
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[var(--color-lavender-blush)] text-[var(--color-old-rose)] border-[var(--color-old-rose)]"
              >
                <span className="text-xs font-medium">{category.name}</span>
                <button
                  onClick={() => removeCategory(category.id, category.name)}
                  className="hover:opacity-70"
                  title="Remover categoria"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Adicionar nova categoria */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nova categoria"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-sm bg-white"
          />
          <button
            onClick={addCategory}
            disabled={!newCategory.trim() || categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed relative top-[-2px]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Seção de Fator de Perda */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Fator de Perda</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure a visibilidade do campo &quot;Fator de Perda&quot; nos diferentes níveis de cadastro de produtos.
        </p>

        <div className="space-y-4">
          {/* Insumos */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label htmlFor="loss-factor-ingredients" className="text-sm font-medium text-gray-900 cursor-pointer">
                Insumos
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
