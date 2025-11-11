'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Tag, FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
}

interface TagItem {
  id: string
  name: string
  color: string
}

export default function OrdersSettingsPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Bolos', color: 'pink' },
    { id: '2', name: 'Doces', color: 'purple' },
    { id: '3', name: 'Salgados', color: 'orange' },
  ])
  
  const [tags, setTags] = useState<TagItem[]>([
    { id: '1', name: 'Urgente', color: 'red' },
    { id: '2', name: 'Personalizado', color: 'blue' },
    { id: '3', name: 'Festa', color: 'yellow' },
    { id: '4', name: 'Aniversário', color: 'green' },
  ])

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('pink')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('blue')

  const colors = [
    { name: 'pink', label: 'Rosa', class: 'bg-pink-100 text-pink-800 border-pink-200' },
    { name: 'purple', label: 'Roxo', class: 'bg-purple-100 text-purple-800 border-purple-200' },
    { name: 'blue', label: 'Azul', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    { name: 'green', label: 'Verde', class: 'bg-green-100 text-green-800 border-green-200' },
    { name: 'yellow', label: 'Amarelo', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { name: 'orange', label: 'Laranja', class: 'bg-orange-100 text-orange-800 border-orange-200' },
    { name: 'red', label: 'Vermelho', class: 'bg-red-100 text-red-800 border-red-200' },
    { name: 'gray', label: 'Cinza', class: 'bg-gray-100 text-gray-800 border-gray-200' },
  ]

  const getColorClass = (color: string) => {
    return colors.find(c => c.name === color)?.class || 'bg-gray-100 text-gray-800'
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      color: newCategoryColor,
    }
    
    setCategories([...categories, newCategory])
    setNewCategoryName('')
    setNewCategoryColor('pink')
  }

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id))
  }

  const addTag = () => {
    if (!newTagName.trim()) return
    
    const newTag: TagItem = {
      id: Date.now().toString(),
      name: newTagName,
      color: newTagColor,
    }
    
    setTags([...tags, newTag])
    setNewTagName('')
    setNewTagColor('blue')
  }

  const removeTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Categorias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Categorias de Pedidos</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Organize seus pedidos por categorias para facilitar a visualização e filtragem.
        </p>

        {/* Lista de Categorias */}
        <div className="space-y-3 mb-6">
          {categories.map(category => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Badge className={`${getColorClass(category.color)} border`}>
                  {category.name}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCategory(category.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Categoria */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Adicionar Nova Categoria</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="categoryName">Nome</Label>
              <Input
                id="categoryName"
                placeholder="Ex: Bolos, Doces, Salgados..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
            </div>
            <div className="w-40">
              <Label htmlFor="categoryColor">Cor</Label>
              <select
                id="categoryColor"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {colors.map(color => (
                  <option key={color.name} value={color.name}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addCategory} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Tags de Pedidos</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Crie tags para adicionar informações extras aos pedidos, como prioridade ou tipo de evento.
        </p>

        {/* Lista de Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <div
              key={tag.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getColorClass(tag.color)}`}
            >
              <span className="text-sm font-medium">{tag.name}</span>
              <button
                onClick={() => removeTag(tag.id)}
                className="hover:opacity-70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Tag */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Adicionar Nova Tag</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="tagName">Nome</Label>
              <Input
                id="tagName"
                placeholder="Ex: Urgente, Festa, Aniversário..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
            </div>
            <div className="w-40">
              <Label htmlFor="tagColor">Cor</Label>
              <select
                id="tagColor"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {colors.map(color => (
                  <option key={color.name} value={color.name}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={addTag} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
