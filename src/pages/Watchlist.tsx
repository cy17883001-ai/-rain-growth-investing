import { motion } from 'framer-motion'
import { Star, Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'

export default function Watchlist() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
          自选股
        </motion.h1>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 transition-colors text-sm shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-4 h-4" />
          添加股票
        </motion.button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="overflow-hidden">
          <div className="p-12 text-center">
            <Star className="w-12 h-12 text-text-dim mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text mb-2">暂无自选股</h3>
            <p className="text-sm text-text-muted">添加您关注的股票，方便持续跟踪分析</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
