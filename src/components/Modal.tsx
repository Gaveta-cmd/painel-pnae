import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl overflow-hidden beautiful-shadow`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg p-1 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
