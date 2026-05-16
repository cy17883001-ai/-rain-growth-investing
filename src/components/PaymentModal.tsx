import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Zap, Calendar, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onActivate: (code: string) => Promise<{ success: boolean; message: string }>
  freeUsesRemaining: number
  isActivated: boolean
  activatedUntil: string | null
}

const PLANS = [
  { type: '1hour', label: '1小时', price: '39', icon: Clock, desc: '短期深度分析' },
  { type: '1day', label: '1天', price: '299', icon: Zap, desc: '全天无限使用', popular: true },
  { type: '1week', label: '1周', price: '3,599', icon: Calendar, desc: '周度跟踪复盘' },
  { type: '1month', label: '1个月', price: '3,999', icon: ShieldCheck, desc: '完整投研周期' },
]

export default function PaymentModal({
  isOpen,
  onClose,
  onActivate,
  freeUsesRemaining,
  isActivated,
  activatedUntil,
}: PaymentModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleActivate = async () => {
    if (!code.trim() || loading) return
    setLoading(true)
    setResult(null)
    const res = await onActivate(code.trim().toUpperCase())
    setResult(res)
    setLoading(false)
    if (res.success) {
      setTimeout(() => {
        onClose()
        setCode('')
        setResult(null)
      }, 1500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleActivate()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-bg-card rounded-2xl shadow-2xl shadow-black/40 max-w-4xl w-full overflow-hidden border border-bg-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
              <h2 className="text-lg font-bold text-text">解锁完整功能</h2>
              <button onClick={onClose} className="p-2 hover:bg-bg-hover rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-6 flex flex-col items-center justify-center bg-bg-elevated/50 border-r border-bg-border">
                <div className="text-center mb-4">
                  <p className="text-sm text-text-muted mb-1">添加微信好友</p>
                  <p className="text-sm font-medium text-text">获取激活码解锁完整功能</p>
                </div>
                <div className="w-[280px] h-[280px] bg-bg-card rounded-xl border border-bg-border shadow-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/wechat-qr.png"
                    alt="微信二维码"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE2MTgxZiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNWY2MzY4IiBmb250LXNpemU9IjE0Ij7lsI/pmojlnIvlkI7lj5bor4Y8L3RleHQ+PC9zdmc+'
                    }}
                  />
                </div>
                <p className="text-xs text-text-dim mt-3">扫码添加，备注"雨的投资"</p>

                {!isActivated && (
                  <div className="mt-4 px-4 py-2 bg-amber-950/30 border border-warning/20 rounded-lg">
                    <p className="text-sm text-warning">
                      剩余免费次数：<span className="font-bold">{freeUsesRemaining}</span> / 10
                    </p>
                  </div>
                )}

                {isActivated && activatedUntil && (
                  <div className="mt-4 px-4 py-2 bg-emerald-950/30 border border-emerald-600/20 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-emerald-400">
                      已激活，有效期至 {new Date(activatedUntil).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.type}
                      className={`relative rounded-xl border p-3 transition-all ${
                        plan.popular
                          ? 'border-emerald-600/40 bg-emerald-950/20'
                          : 'border-bg-border hover:border-emerald-600/30 bg-bg-elevated/50'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">推荐</span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <plan.icon className={`w-4 h-4 ${plan.popular ? 'text-emerald-400' : 'text-text-muted'}`} />
                        <span className="text-sm font-semibold text-text">{plan.label}</span>
                      </div>
                      <div className="text-xl font-bold text-text"><span className="text-gold-400">¥</span>{plan.price}</div>
                      <div className="text-xs text-text-dim">{plan.desc}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text">输入激活码</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={handleKeyDown}
                      placeholder="YU-XXXX-XXXX-XXXX"
                      className="flex-1 px-4 py-3 rounded-xl border border-bg-border bg-bg-elevated text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all text-sm tracking-wider uppercase"
                    />
                    <button
                      onClick={handleActivate}
                      disabled={loading || !code.trim()}
                      className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm whitespace-nowrap shadow-lg shadow-emerald-900/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      激活
                    </button>
                  </div>

                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm border ${
                        result.success
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/30'
                          : 'bg-red-950/50 text-red-300 border-danger/30'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      {result.message}
                    </motion.div>
                  )}
                </div>

                <p className="text-xs text-text-dim text-center">
                  激活码一经使用即绑定当前设备，不可转让。如需更换设备请联系客服。
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
