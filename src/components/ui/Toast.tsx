import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, X, Info } from 'lucide-react'
import type { Toast } from '../../hooks/useToast'

const iconMap = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
}

const colorMap = {
  default: 'border-bg-border bg-bg-card text-text',
  success: 'border-emerald-600/30 bg-emerald-950/80 text-emerald-300',
  error: 'border-danger/30 bg-red-950/80 text-red-300',
  warning: 'border-warning/30 bg-amber-950/80 text-amber-300',
}

export function ToastContainer({ toasts, removeToast }: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.variant || 'default']
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md min-w-[280px] max-w-[400px] ${colorMap[toast.variant || 'default']}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
                {toast.description && <div className="text-sm opacity-90 mt-0.5">{toast.description}</div>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
