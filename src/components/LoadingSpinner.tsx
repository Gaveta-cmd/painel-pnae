export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`${sizes[size]} border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin`} />
  )
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  )
}
