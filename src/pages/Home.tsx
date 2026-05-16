import { motion } from 'framer-motion'
import { TrendingUp, Search, BarChart3, Shield, Zap, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ParticleBackground from '../components/ParticleBackground'

const features = [
  { icon: Search, title: '智能选股', desc: '基于 Peter Lynch 的 PEG 比率、盈利增长率等核心指标，筛选优质成长股。', color: '#059669' },
  { icon: BarChart3, title: '深度分析', desc: '结合菲利普·费雪的 15 点投资原则，全方位定性定量分析。', color: '#D4AF37' },
  { icon: TrendingUp, title: '成长追踪', desc: '持续监控持仓股票的盈利增长、营收增长和 ROE 等关键指标。', color: '#059669' },
  { icon: Shield, title: '风险评估', desc: '识别财务风险、估值泡沫和竞争优势衰退信号，规避价值陷阱。', color: '#D4AF37' },
  { icon: Zap, title: '护城河评估', desc: '七维护城河评分体系，量化企业竞争优势的可持续性。', color: '#059669' },
]

export default function Home() {
  const navigate = useNavigate()
  const handleSearch = (symbol: string) => {
    if (symbol) navigate(`/analysis/${symbol}`)
  }

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-600/30 bg-emerald-950/50 text-emerald-300 text-sm mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-gold-400" />
            <span>基于 Peter Lynch and 菲利普·费雪投资理论</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-emerald-300 to-gold-400">雨的成长投资</span>
            <br />
            <span className="text-text">分析系统</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            构建系统化的成长股筛选与分析框架，<span className="text-emerald-400">让每一次投资决策都有据可依</span>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="w-full max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-emerald-600 to-gold-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative bg-bg-elevated border border-bg-border rounded-2xl p-2 flex items-center gap-3 shadow-2xl">
                <Search className="w-5 h-5 text-text-muted ml-3" />
                <SearchBar onSelect={handleSearch} placeholder="输入股票代码或名称开始分析..." />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex flex-wrap items-center justify-center gap-3 mt-6 text-sm text-text-dim">
            <span>热门：</span>
            {['贵州茅台', '宁德时代', '比亚迪', '中芯国际'].map((name) => (
              <button key={name} onClick={() => handleSearch(name)} className="px-3 py-1 rounded-full border border-bg-border hover:border-emerald-600/50 hover:text-emerald-400 transition-colors text-xs">{name}</button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className="relative px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold text-center mb-12">核心功能</motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="group relative rounded-2xl border border-bg-border bg-bg-card p-6 overflow-hidden hover:border-emerald-600/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: feature.color }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${feature.color}15` }}>
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center rounded-3xl border border-emerald-600/20 bg-emerald-950/30 p-10 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-4">开始你的成长投资之旅</h2>
          <p className="text-text-muted mb-8">输入股票代码，立即获取基于经典投资理论的深度分析报告</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/analysis')} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-emerald-500 transition-colors shadow-xl shadow-emerald-900/30">
            立即分析
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>
    </div>
  )
}
