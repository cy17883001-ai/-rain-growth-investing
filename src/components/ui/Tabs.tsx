import { createContext, useContext } from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used inside <Tabs>')
  return ctx
}

export function Tabs({ value, onValueChange, children, className }: {
  value: string
  onValueChange: (v: string) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex h-11 items-center justify-center rounded-xl bg-bg-elevated p-1 border border-bg-border', className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selected, onChange } = useTabs()
  const isActive = selected === value

  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none',
        isActive
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-text-muted hover:text-text hover:bg-bg-hover',
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selected } = useTabs()
  if (selected !== value) return null

  return (
    <div className={cn('mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      {children}
    </div>
  )
}
