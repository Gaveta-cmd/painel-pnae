type BadgeColor = 'emerald' | 'cyan' | 'blue' | 'amber' | 'red' | 'gray' | 'purple' | 'orange'

const badgeStyles: Record<BadgeColor, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  gray: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
}

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  className?: string
}

export function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${badgeStyles[color]} ${className}`}
    >
      {children}
    </span>
  )
}
