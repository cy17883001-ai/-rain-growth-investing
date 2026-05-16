import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  color?: string
  showPercentage?: boolean
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  className,
  label,
  color,
  showPercentage = true,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const defaultColor = percentage >= 80 ? '#059669' : percentage >= 60 ? '#F59E0B' : '#DC2626'
  const activeColor = color || defaultColor

  return (
    <div className={cn('relative flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2e38"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <motion.span
              className="text-2xl font-bold"
              style={{ color: activeColor }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      </div>
      {label && <span className="text-sm text-text-muted">{label}</span>}
    </div>
  )
}
