'use client'

import { useState, useEffect } from 'react'
import { X, Repeat, MessageSquare, Paperclip, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'receita' | 'despesa'
  onSuccess?: () => void
}

type RecurrenceType = 'fixa' | 'parcelada' | null

interface Account {
  id: string
  name: string
  type: string
}

interface Category {
  id: string
  name: string
  type: string
  color: string
}

export default function TransactionModal({ isOpen, onClose, type, onSuccess }: TransactionModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('0,00')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [account, setAccount] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(null)
  const [installments, setInstallments] = useState('2')
  const [installmentPeriod, setInstallmentPeriod] = useState<'Meses' | 'Semanas'>('Meses')
  const [observation, setObservation] = useState('')
  const [activeTab, setActiveTab] = useState<'repetir' | 'observacao' | 'anexo' | 'tags'>('repetir')
  const [isPaid, setIsPaid] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Data from API
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch accounts and categories
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [accountsData, categoriesData] = await Promise.all([
            fetch('/api/financeiro/accounts').then(res => res.json()),
            fetch(`/api/financeiro/categories?type=${type}`).then(res => res.json()),
          ])
          setAccounts(accountsData.accounts || [])
          setCategories(categoriesData.categories || [])
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [isOpen, type])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Use a timeout to reset after the modal is fully closed
      const timer = setTimeout(() => {
        setDescription('')
        setAmount('0,00')
        setDate(new Date().toISOString().split('T')[0])
        setAccount('')
        setCategory('')
        setTags([])
        setTagInput('')
        setRecurrenceType(null)
        setInstallments('2')
        setInstallmentPeriod('Meses')
        setObservation('')
        setActiveTab('repetir')
        setIsPaid(true)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const numericValue = parseInt(value || '0')
    const formatted = (numericValue / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setAmount(formatted)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!description || !amount || parseFloat(amount.replace(',', '.')) === 0) {
      alert('Preencha a descrição e o valor')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/financeiro/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          description,
          amount: amount.replace(',', '.'),
          date,
          accountId: account || null,
          categoryId: category || null,
          isPaid,
          observation,
          tags,
          recurrenceType,
          installments: recurrenceType === 'parcelada' ? installments : null,
          installmentPeriod: recurrenceType === 'parcelada' ? installmentPeriod : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar transação')
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Erro ao salvar transação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isReceita = type === 'receita'
  const title = isReceita ? 'Nova receita' : 'Nova despesa'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-bg-modal)] rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--color-bg-modal)] flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Salário, Compras..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 placeholder:text-gray-500 bg-white"
              />
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    R$
                  </span>
                  <Input
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0,00"
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 bg-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isPaid ? (
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Conta/Cartão e Categoria */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conta/Cartão
                </label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 bg-white">
                    <SelectValue placeholder="Buscar a conta/cartã" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name}
                      </SelectItem>
                    ))}
                    {accounts.length === 0 && (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        Nenhuma conta cadastrada
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 bg-white">
                    <SelectValue placeholder="Buscar a categoria.." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    {categories.length === 0 && (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        Nenhuma categoria cadastrada
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags - Always Visible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Digite uma tag e pressione Enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 placeholder:text-gray-500 bg-white"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-200 -mx-6 px-6 pt-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('repetir')}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:text-gray-900 transition"
                >
                  <Repeat className="w-4 h-4" />
                  <span className="text-sm">Repetir</span>
                </button>
                <button
                  onClick={() => setActiveTab('observacao')}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:text-gray-900 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Observação</span>
                </button>
                <button
                  onClick={() => setActiveTab('anexo')}
                  className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:text-gray-900 transition"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">Anexo</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[120px]">
                {activeTab === 'repetir' && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrence"
                        checked={recurrenceType === 'fixa'}
                        onChange={() => setRecurrenceType('fixa')}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">é uma {isReceita ? 'receita' : 'despesa'} fixa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="recurrence"
                        checked={recurrenceType === 'parcelada'}
                        onChange={() => setRecurrenceType('parcelada')}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">é um lançamento parcelado em</span>
                    </label>

                    {recurrenceType === 'parcelada' && (
                        <div className="ml-6 mt-2">
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="2"
                            value={installments}
                            onChange={(e) => setInstallments(e.target.value)}
                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 bg-white"
                          />
                          <Select value={installmentPeriod} onValueChange={(value: 'Meses' | 'Semanas') => setInstallmentPeriod(value)}>
                            <SelectTrigger className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Meses">Meses</SelectItem>
                              <SelectItem value="Semanas">Semanas</SelectItem>
                            </SelectContent>
                          </Select>
                          <button
                            onClick={() => setRecurrenceType(null)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Serão lançadas {installments} parcelas de R$ {amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          Em caso de divisão não exata, a sobra será somada à primeira parcela.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'observacao' && (
                  <div>
                  <Textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Adicione uma observação..."
                    className="w-full min-h-[100px] resize-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B3736B] focus:border-transparent text-gray-900 placeholder:text-gray-500 bg-white"
                  />
                  </div>
                )}

                {activeTab === 'anexo' && (
                  <div className="flex items-center justify-center h-[100px] border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Clique para adicionar anexo</p>
                      <p className="text-xs text-gray-400 mt-1">No file chosen</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-success w-full"
          >
            {isSubmitting ? (
              <span>Salvando...</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check w-4 h-4" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Salvar {isReceita ? 'Receita' : 'Despesa'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
