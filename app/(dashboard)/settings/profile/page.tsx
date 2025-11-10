'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Camera, Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ProfileData = {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  avatar_url: string | null
}

const formatPhone = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")
  
  // Se não tem números, retorna vazio
  if (!numbers) return ""
  
  // Se tem apenas 1 dígito, retorna sem formatação
  if (numbers.length === 1) return `(${numbers}`
  
  // Se tem 2 dígitos, adiciona apenas o parêntese inicial
  if (numbers.length === 2) return `(${numbers}`
  
  // A partir de 3 dígitos, adiciona o parêntese e espaço
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  }
  
  // Entre 7 e 10 dígitos: (99) 9999-9999
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`
  }
  
  // Mais de 10 dígitos: (99) 99999-9999
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

const formatCEP = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")
  
  // Se não tem números, retorna vazio
  if (!numbers) return ""
  
  // Limita a 8 dígitos
  const limited = numbers.slice(0, 8)
  
  // Formata: 00000-000
  if (limited.length <= 5) {
    return limited
  }
  
  return `${limited.slice(0, 5)}-${limited.slice(5, 8)}`
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    avatar_url: null
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setMessage({ type: 'error', text: 'Erro ao carregar perfil' })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfileData({
          id: user.id,
          email: user.email || '',
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          avatar_url: data.avatar_url || null
        })
        
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.avatar_url)
          setAvatarPreview(publicUrl)
        }
      } else {
        setProfileData(prev => ({
          ...prev,
          id: user.id,
          email: user.email || ''
        }))
      }
    } catch {
      console.error('Erro ao carregar perfil')
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Aplica formatação de telefone
    if (name === 'phone') {
      const formatted = formatPhone(value)
      setProfileData(prev => ({ ...prev, [name]: formatted }))
    } else if (name === 'zip_code') {
      const formatted = formatCEP(value)
      setProfileData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setProfileData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'A imagem deve ter no máximo 2MB' })
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      // Verifica se o usuário está autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        setMessage({ type: 'error', text: 'Usuário não autenticado' })
        setSaving(false)
        return
      }
      
      let avatarUrl = profileData.avatar_url

      // Upload da foto se houver
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
          console.error('Erro no upload:', uploadError)
          setMessage({ type: 'error', text: `Erro ao fazer upload da imagem: ${uploadError.message}` })
          setSaving(false)
          return
        }

        // Remove foto antiga se existir
        if (avatarUrl && avatarUrl !== fileName) {
          await supabase.storage.from('avatars').remove([avatarUrl])
        }

        avatarUrl = fileName
      }

      // Atualiza ou insere o perfil
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zip_code,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao atualizar perfil:', error)
        setMessage({ type: 'error', text: `Erro ao salvar perfil: ${error.message}` })
        setSaving(false)
        return
      }

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setAvatarFile(null)
      
      // Recarrega o perfil para pegar a URL pública atualizada
      await loadProfile()
      
      // Dispara evento para atualizar o avatar na sidebar
      if (avatarUrl) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarUrl)
        
        const event = new CustomEvent('avatar-updated', { 
          detail: { avatarUrl: publicUrl } 
        })
        window.dispatchEvent(event)
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      setMessage({ type: 'error', text: 'Erro inesperado ao salvar perfil. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setProfileData(prev => ({ ...prev, avatar_url: null }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-old-rose)]"></div>
      </div>
    )
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

      <form onSubmit={handleSubmit} className="p-6">
        {/* Avatar Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto de Perfil</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <Image 
                    src={avatarPreview} 
                    alt="Avatar" 
                    width={128}
                    height={128}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                <Camera className="w-4 h-4" />
                <span>Alterar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG ou GIF (máx. 2MB)</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">O e-mail não pode ser alterado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="Rua, número, complemento"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="Cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  name="state"
                  value={profileData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={profileData.zip_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-old-rose)] focus:border-transparent"
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadProfile()}
            disabled={saving}
          >
            Cancelar
          </Button>
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
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
