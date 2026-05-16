import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import axios from 'axios'
import { useUsage } from '../hooks/useUsage'
import PaymentModal from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface AnalysisResult {
  growthScore: {
    scores: Record<string, number>
    totalScore: number
    percentage: number
    grade: string
    gradeColor: string
  }
  moat: {
    scores: Record<string, number>
    totalScore: number
    rating: string
  }
  risk: {
    excluded: boolean
    triggeredFlags: string[]
    details: Record<string, boolean>
  }
  valuation: {
    upsidePercent: number
    recommendation: string
    currentMarketCap: number
    expectedMarketCap3Y: number
  }
  pullback: {
    category: string
    confidence: number
    reasoning: string[]
  }
  overallVerdict: string
}

const GRADE_COLORS: Record<string, string> = {
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  '强烈买入': '#10b981',
  '买入': '#3b82f6',
  '观望': '#f59e0b',
  '排除': '#ef4444',
}

const PULLBACK_COLORS = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981']

export default function AnalysisTest() {
  const usage = useUsage()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const handleTest = async () => {
    // 1. Consume a free use or check activation
    const consumed = await usage.consumeUse()
    if (!consumed) {
      setShowPayment(true)
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/analysis/full`, TEST_PAYLOAD)
      setResult(data.data)
    } catch {
      alert('分析请求失败，请确保后端已启动')
    } finally {
      setLoading(false)
    }
  }

  if (!result) {
    return (
      <div className="space-y-8">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
          分析算法验证
        </motion.h1>

        <div className="flex items-center gap-4">
          {!usage.loading && (
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              usage.isActivated
                ? 'bg-green-100 text-green-700'
                : usage.freeUsesRemaining > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {usage.isActivated
                ? `已激活 · 有效期至 ${usage.activatedUntil ? new Date(usage.activatedUntil).toLocaleString() : ''}`
                : `剩余免费次数：${usage.freeUsesRemaining} / ${usage.freeUsesTotal}`}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center space-y-4"
        >
          <p className="text-text-muted">
            点击下方按钮，使用预设的测试数据运行全部5个分析模块，验证算法正确性。
          </p>
          <button
            onClick={handleTest}
            disabled={loading || usage.loading}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? '计算中...' : '运行算法测试'}
          </button>
        </motion.div>

        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onActivate={usage.activateCode}
          freeUsesRemaining={usage.freeUsesRemaining}
          isActivated={usage.isActivated}
          activatedUntil={usage.activatedUntil}
        />
      </div>
    )
  }

  const growthData = Object.entries(result.growthScore.scores).map(([k, v]) => ({
    name: GROWTH_LABELS[k] || k,
    score: v,
    fullMark: 5,
  }))

  const moatData = Object.entries(result.moat.scores).map(([k, v]) => ({
    subject: MOAT_LABELS[k] || k,
    score: v,
    fullMark: 5,
  }))

  const riskData = Object.entries(result.risk.details).map(([k, v]) => ({
    name: RISK_LABELS[k] || k,
    value: v ? 1 : 0,
    label: v ? '触发' : '正常',
  }))

  const valuationData = [
    { name: '当前市值', value: result.valuation.currentMarketCap },
    { name: '3年预期市值', value: result.valuation.expectedMarketCap3Y },
  ]

  const pullbackData = [
    { name: '暂时性回调', value: result.pullback.category === '暂时性回调' ? result.pullback.confidence : 10 },
    { name: '周期性洗牌', value: result.pullback.category === '周期性洗牌' ? result.pullback.confidence : 10 },
    { name: '逻辑证伪', value: result.pullback.category === '逻辑证伪' ? result.pullback.confidence : 10 },
    { name: '估值消化', value: result.pullback.category === '估值消化' ? result.pullback.confidence : 10 },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
          分析算法验证结果
        </motion.h1>
        <div className="flex items-center gap-3">
          {!usage.loading && (
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              usage.isActivated
                ? 'bg-green-100 text-green-700'
                : usage.freeUsesRemaining > 0
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {usage.isActivated
                ? `已激活`
                : `剩余 ${usage.freeUsesRemaining} 次`}
            </div>
          )}
          <button
            onClick={handleTest}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? '计算中...' : '重新测试'}
          </button>
        </div>
      </div>

      {/* 综合结论 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <h2 className="font-semibold text-text mb-2">综合判断</h2>
        <p className="text-sm text-text-muted">{result.overallVerdict}</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 模块1：成长评分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">模块1：成长筛选看板</h3>
            <span
              className="px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: GRADE_COLORS[result.growthScore.gradeColor] }}
            >
              {result.growthScore.grade}级 {result.growthScore.percentage}分
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} layout="vertical" margin={{ left: 80, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 模块2：护城河 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">模块2：成长护城河</h3>
            <span className="text-sm font-medium text-primary">
              {result.moat.rating} ({result.moat.totalScore}/35)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={moatData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar name="得分" dataKey="score" stroke="#1e40af" fill="#1e40af" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 模块3：风险排除 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">模块3：伪成长排除</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                result.risk.excluded ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {result.risk.excluded ? '已排除' : '通过'}
            </span>
          </div>
          <div className="space-y-2">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-text">{item.name}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${item.value ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 模块4：估值 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">模块4：成长确定性</h3>
            <span
              className="px-3 py-1 rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: RECOMMENDATION_COLORS[result.valuation.recommendation] }}
            >
              {result.valuation.recommendation}
            </span>
          </div>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-text mb-2">
              {result.valuation.upsidePercent}%
            </div>
            <div className="text-sm text-text-muted">估值合理性（上行空间）</div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valuationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 模块5：回调监控 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">模块5：前瞻布局监控</h3>
            <span className="text-sm font-medium text-primary">
              {result.pullback.category} (置信度 {result.pullback.confidence}%)
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pullbackData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pullbackData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PULLBACK_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-text-muted mb-2">推理依据</h4>
              {result.pullback.reasoning.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-text">
                  <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-xs text-primary shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onActivate={usage.activateCode}
        freeUsesRemaining={usage.freeUsesRemaining}
        isActivated={usage.isActivated}
        activatedUntil={usage.activatedUntil}
      />
    </div>
  )
}

const GROWTH_LABELS: Record<string, string> = {
  revenueGrowth: '营收增长率',
  netProfitGrowth: '净利润增长率',
  peg: 'PEG',
  rdRatio: '研发投入占比',
  grossMarginTrend: '毛利率趋势',
  operatingCashFlowGrowth: '经营现金流增长',
  marketSpace: '市场空间',
}

const MOAT_LABELS: Record<string, string> = {
  techIteration: '技术迭代',
  rdPipeline: '研发管线',
  marketShareGain: '市占率提升',
  scaleEffect: '规模效应',
  platformStickiness: '平台粘性',
  policyBarrier: '政策壁垒',
  managementExecution: '管理层执行力',
}

const RISK_LABELS: Record<string, string> = {
  hypeWithoutEarnings: '概念炒作无业绩',
  pegOver3: 'PEG>3 估值透支',
  unverifiableModel: '商业模式不可验证',
  singleClientDependency: '依赖单一客户',
  cashBurnExceedsGeneration: '烧钱超造血',
  goodwillOver30Percent: '商誉/净资产>30%',
}

const TEST_PAYLOAD = {
  symbol: 'TEST-STOCK',
  financials: {
    revenueGrowth: 35,
    netProfitGrowth: 42,
    peg: 0.85,
    rdRatio: 12,
    grossMarginTrend: 'up',
    operatingCashFlowGrowth: 40,
    marketSpace: 60,
  },
  moat: {
    techIteration: 4,
    rdPipeline: 5,
    marketShareGain: 4,
    scaleEffect: 3,
    platformStickiness: 4,
    policyBarrier: 3,
    managementExecution: 5,
  },
  risks: {
    hypeWithoutEarnings: false,
    pegOver3: false,
    unverifiableModel: false,
    singleClientDependency: false,
    cashBurnExceedsGeneration: false,
    goodwillOver30Percent: false,
  },
  valuation: {
    currentMarketCap: 500,
    expectedMarketCap3Y: 800,
  },
  pullback: {
    priceDropPercent: 18,
    revenueImpact: 'none',
    industryCycle: 'stable',
    valuationVsHistory: 'high',
    narrativeChange: false,
  },
}
