'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, User, Users, Crown, UserCheck, Info } from 'lucide-react'
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
} from "@/components/ui/alert-dialog"

interface Member {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string
  created_at: string
}

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<'admin' | 'member'>('member')
  const [creating, setCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<{ id: string, name: string } | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/users/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userEmail || !userEmail.includes('@')) {
      showToast({
        title: 'E-mail inválido',
        message: 'Por favor, insira um e-mail válido',
        variant: 'error',
        duration: 3000,
      })
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/users/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          role: userRole,
          full_name: userName || userEmail.split('@')[0]
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        showToast({
          title: 'Usuário criado!',
          message: `${userName || userEmail} foi adicionado. Senha temporária: ${data.temporaryPassword}`,
          variant: 'success',
          duration: 10000,
        })
        setUserEmail('')
        setUserName('')
        setUserRole('member')
        fetchMembers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar usuário')
      }
    } catch (error: any) {
      showToast({
        title: 'Erro ao criar usuário',
        message: error.message,
        variant: 'error',
        duration: 4000,
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/users/members?id=${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast({
          title: 'Membro removido!',
          message: 'O membro foi removido do workspace',
          variant: 'success',
          duration: 3000,
        })
        fetchMembers()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao remover membro')
      }
    } catch (error: any) {
      showToast({
        title: 'Erro ao remover membro',
        message: error.message,
        variant: 'error',
        duration: 4000,
      })
    }
  }

  const confirmDelete = () => {
    if (!memberToDelete) return

    handleDeleteMember(memberToDelete.id)
    setDeleteDialogOpen(false)
    setMemberToDelete(null)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3" />
            Super Admin
          </span>
        )
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <UserCheck className="w-3 h-3" />
            Administrador
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User className="w-3 h-3" />
            Membro
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Criar novo usuário */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Adicionar Usuário</h2>
          <div className="group relative">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-[330px] bg-white text-[var(--color-licorice)] text-sm rounded-lg shadow-lg z-50 border border-gray-200" style={{ padding: '25px 15px 30px 20px' }}>
              Adicione pessoas para colaborar no seu workspace. Administradores têm controle total, enquanto membros têm permissões específicas.
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Crie um novo usuário para adicionar ao seu workspace
        </p>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nome completo (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-sm bg-white"
              />
            </div>
            <div>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-sm bg-white"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as 'admin' | 'member')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-sm bg-white"
            >
              <option value="member">Membro</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              type="submit"
              disabled={creating || !userEmail}
              className="btn-success disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-1" />
              {creating ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de membros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Membros do Time</h2>
          <span className="text-sm text-gray-500">({members.length})</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Nenhum membro encontrado</div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{member.full_name || 'Sem nome'}</div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                  <div>
                    {getRoleBadge(member.role)}
                  </div>
                </div>
                {member.role !== 'admin' && member.role !== 'superadmin' && (
                  <button
                    onClick={() => {
                      setMemberToDelete({
                        id: member.id,
                        name: member.full_name || member.email
                      })
                      setDeleteDialogOpen(true)
                    }}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover membro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {memberToDelete?.name} do workspace? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-outline-grey">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="btn-danger"
              onClick={confirmDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
