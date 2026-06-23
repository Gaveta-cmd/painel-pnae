import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Color = 'emerald' | 'cyan' | 'blue' | 'amber' | 'red' | 'purple'

const colorMap: Record<Color, { card: string; icon: string; badge: string }> = {
  emerald: {
    card: 'bg-emerald-500 shadow-emerald-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-emerald-400/20 text-emerald-100',
  },
  cyan: {
    card: 'bg-cyan-500 shadow-cyan-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-cyan-400/20 text-cyan-100',
  },
  blue: {
    card: 'bg-blue-500 shadow-blue-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-blue-400/20 text-blue-100',
  },
  amber: {
    card: 'bg-amber-500 shadow-amber-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-amber-400/20 text-amber-100',
  },
  red: {
    card: 'bg-red-500 shadow-red-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-red-400/20 text-red-100',
  },
  purple: {
    card: 'bg-purple-500 shadow-purple-900/30',
    icon: 'bg-white/20 border-white/30',
    badge: 'bg-purple-400/20 text-purple-100',
  },
}

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  change?: number
  color?: Color
  delay?: number
}

export function StatCard({ icon: Icon, title, value, change, color = 'emerald', delay = 0 }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${colors.card} rounded-2xl p-5 flex flex-col justify-between min-h-[140px] shadow-lg border border-white/15 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 ${colors.icon} border rounded-2xl flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  )
}
