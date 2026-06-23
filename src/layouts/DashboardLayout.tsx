import { Outlet } from 'react-router-dom'

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-zinc-900 text-white flex-shrink-0">
        <div className="p-4 font-bold text-emerald-400">PNAE</div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
