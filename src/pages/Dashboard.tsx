import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Eye, Activity } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useCountUp } from '../hooks/useCountUp'

const stats = [
  { label: '自选股数量', value: 12, icon: Eye, change: '+2 本周', color: '#059669' },
  { label: '买入评级', value: 5, icon: TrendingUp, change: '1 新增', color: '#059669' },
  { label: '持有评级', value: 4, icon: Activity, change: '持平', color: '#D4AF37' },
  { label: '卖出/观望', value: 3, icon: TrendingDown, change: '-1 调出', color: '#DC2626' },
]

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const animatedValue = useCountUp(stat.value, 1000)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-muted">{stat.label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
          </div>
        </div>
        <div className="text-3xl font-bold text-text mb-1">{animatedValue}</div>
        <div className="text-xs" style={{ color: stat.color }}>{stat.change}</div>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
        投资仪表盘
      </motion.h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card>
          <h2 className="text-lg font-semibold text-text mb-4">最近分析记录</h2>
          <p className="text-text-muted text-sm">暂无分析记录，前往股票分析页面开始您的第一次分析。</p>
        </Card>
      </motion.div>
    </div>
  )
}
