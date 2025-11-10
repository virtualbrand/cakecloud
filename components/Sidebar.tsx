'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Calculator,
  TrendingUp,
  Calendar,
  UserCheck,
  Shield,
  HelpCircle,
  MessageSquare
} from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calculator, label: 'Precificação', href: '/pricing' },
  { icon: Package, label: 'Produtos', href: '/products' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/orders' },
  { icon: Users, label: 'Clientes', href: '/customers' },
  { icon: TrendingUp, label: 'Performance', href: '/performance' },
  { icon: UserCheck, label: 'Funcionários', href: '/employees' },
  { icon: Shield, label: 'Segurança', href: '/security' },
]

const bottomMenuItems = [
  { icon: HelpCircle, label: 'Ajuda', href: '/help' },
  { icon: MessageSquare, label: 'Feedback', href: '/feedback' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">🍰</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CakeCloud</span>
        </Link>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${active 
                    ? 'bg-gray-900 text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-gray-200 p-3">
        <div className="space-y-1">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${active 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
