import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  School,
  Users,
  Apple,
  CalendarDays,
  Package,
  Truck,
  BarChart3,
  LogOut,
  Menu,
  X,
  Utensils,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const navGroups = [
  {
    label: 'Principal',
    items: [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    label: 'Gestão',
    items: [
      { to: '/escolas', icon: School, label: 'Escolas' },
      { to: '/alunos', icon: Users, label: 'Alunos' },
      { to: '/alimentos', icon: Apple, label: 'Alimentos' },
    ],
  },
  {
    label: 'Operações',
    items: [
      { to: '/cardapios', icon: CalendarDays, label: 'Cardápios' },
      { to: '/estoque', icon: Package, label: 'Estoque' },
      { to: '/fornecedores', icon: Truck, label: 'Fornecedores' },
    ],
  },
  {
    label: 'Análises',
    items: [{ to: '/relatorios', icon: BarChart3, label: 'Relatórios' }],
  },
]

const roleBadgeColors: Record<string, string> = {
  ADMIN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  NUTRICIONISTA: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  DIRETOR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONSULTOR: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleColor = roleBadgeColors[usuario?.role ?? ''] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
  const initials = usuario?.nome?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'US'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Painel PNAE</p>
            <p className="text-zinc-500 text-xs">Gestão Escolar</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 bg-zinc-800 rounded-xl px-3 py-2.5">
          <div className="w-9 h-9 bg-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{usuario?.nome ?? 'Usuário'}</p>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${roleColor}`}>
              {usuario?.role ?? 'USER'}
            </span>
          </div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scroll-hide px-2 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest px-4 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all group ${
                      isActive
                        ? 'bg-emerald-600/20 text-white border-l-2 border-emerald-500 pl-[14px]'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/escolas': 'Escolas',
  '/alunos': 'Alunos',
  '/alimentos': 'Alimentos',
  '/cardapios': 'Cardápios',
  '/estoque': 'Estoque',
  '/fornecedores': 'Fornecedores',
  '/relatorios': 'Relatórios',
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { usuario } = useAuthStore()

  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'Painel'

  const roleColor = roleBadgeColors[usuario?.role ?? ''] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-[280px] flex-shrink-0 bg-zinc-900 flex-col beautiful-shadow z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-zinc-900 z-40 lg:hidden flex flex-col"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-zinc-900">{currentTitle}</h1>
          </div>
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${roleColor}`}>
            {usuario?.role}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
