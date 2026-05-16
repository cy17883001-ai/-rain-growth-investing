import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings2, Bell, Shield, Database, ChevronRight, Save } from 'lucide-react'
import { Card } from '../components/ui/Card'

interface AppSettings {
  priceAlert: boolean
  reportAlert: boolean
  darkMode: boolean
  autoRefresh: boolean
  defaultMetric: 'pe' | 'pb' | 'roe'
  dataRetention: '7d' | '30d' | '90d' | 'forever'
}

const DEFAULT_SETTINGS: AppSettings = {
  priceAlert: true,
  reportAlert: false,
  darkMode: true,
  autoRefresh: true,
  defaultMetric: 'pe',
  dataRetention: '30d',
}

const SETTINGS_KEY = 'rain-growth-settings'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    saveSettings(settings)
    setSaved(true)
    const t = setTimeout(() => setSaved(false), 1200)
    return () => clearTimeout(t)
  }, [settings])

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggle = (key: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const clearCache = () => {
    localStorage.removeItem('rain-growth-cache')
    localStorage.removeItem('rain-growth-search-history')
    alert('缓存已清理')
  }

  return (
    <div className="space-y-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
        设置
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 通知设置 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text">通知设置</h3>
                <p className="text-xs text-text-muted">股价预警、财报提醒等</p>
              </div>
            </div>
            <ToggleItem label="股价异动提醒" checked={settings.priceAlert} onChange={() => toggle('priceAlert')} />
            <ToggleItem label="财报发布提醒" checked={settings.reportAlert} onChange={() => toggle('reportAlert')} />
          </Card>
        </motion.div>

        {/* 账户安全 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text">账户安全</h3>
                <p className="text-xs text-text-muted">设备管理与数据保留</p>
              </div>
            </div>
            <SelectItem
              label="数据保留时长"
              value={settings.dataRetention}
              options={[
                { value: '7d', label: '7天' },
                { value: '30d', label: '30天' },
                { value: '90d', label: '90天' },
                { value: 'forever', label: '永久' },
              ]}
              onChange={v => update('dataRetention', v as AppSettings['dataRetention'])}
            />
          </Card>
        </motion.div>

        {/* 数据管理 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text">数据管理</h3>
                <p className="text-xs text-text-muted">导出与清理本地数据</p>
              </div>
            </div>
            <button
              onClick={clearCache}
              className="w-full px-4 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-red-950/30 transition-colors text-sm font-medium"
            >
              清理本地缓存
            </button>
          </Card>
        </motion.div>

        {/* 系统偏好 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center shrink-0">
                <Settings2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-text">系统偏好</h3>
                <p className="text-xs text-text-muted">主题、默认指标等</p>
              </div>
            </div>
            <ToggleItem label="深色主题" checked={settings.darkMode} onChange={() => toggle('darkMode')} />
            <ToggleItem label="自动刷新数据" checked={settings.autoRefresh} onChange={() => toggle('autoRefresh')} />
            <SelectItem
              label="默认分析指标"
              value={settings.defaultMetric}
              options={[
                { value: 'pe', label: '市盈率 (PE)' },
                { value: 'pb', label: '市净率 (PB)' },
                { value: 'roe', label: '净资产收益率 (ROE)' },
              ]}
              onChange={v => update('defaultMetric', v as AppSettings['defaultMetric'])}
            />
          </Card>
        </motion.div>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-950/80 border border-emerald-600/30 text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 backdrop-blur-md"
        >
          <Save className="w-4 h-4" />
          设置已自动保存
        </motion.div>
      )}
    </div>
  )
}

function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-muted">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-600' : 'bg-bg-border'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}

function SelectItem({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-bg-border bg-bg-elevated text-sm text-text hover:border-emerald-600/30 transition-colors"
      >
        <span>{selected?.label}</span>
        <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 w-full mt-1 bg-bg-card border border-bg-border rounded-xl overflow-hidden shadow-xl"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                opt.value === value ? 'bg-emerald-950/50 text-emerald-400' : 'text-text-muted hover:bg-bg-hover'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
