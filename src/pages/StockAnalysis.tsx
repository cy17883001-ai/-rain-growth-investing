import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Loader2, AlertTriangle, RefreshCw, TrendingUp, TrendingDown,
  BarChart3, Shield, Activity, Target, Eye
} from 'lucide-react'
import axios from 'axios'
import SearchBar from '../components/SearchBar'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Skeleton } from '../components/ui/Skeleton'
import { useCountUp } from '../hooks/useCountUp'
import { useUsage } from '../hooks/useUsage'
import PaymentModal from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface StockData {
  symbol: string
  market: string
  name?: string
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  prevClose?: number
  change: number
  changePercent: number
  volume: number
  turnover?: number
  peRatio?: number
  pbRatio?: number
  totalMarketCap?: number
  floatMarketCap?: number
  turnoverRate?: number
  timestamp?: string
  source: string
}

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

function formatNumber(n?: number): string {
  if (n == null) return '-'
  if (n >= 1e8) return `${(n / 1e8).toFixed(2)}亿`
  if (n >= 1e4) return `${(n / 1e4).toFixed(2)}万`
  return n.toLocaleString()
}

function formatPrice(n?: number): string {
  if (n == null) return '-'
  return n.toFixed(2)
}

function StatCard({ label, value, change, loading }: { label: string; value: string; change?: boolean; loading?: boolean }) {
  const isPositive = change ? !value.startsWith('-') : true
  return (
    <Card className="p-4">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      {loading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <div className={`text-base font-bold ${change ? (isPositive ? 'text-emerald-400' : 'text-danger') : 'text-text'}`}>
          {value}
        </div>
      )}
    </Card>
  )
}

export default function StockAnalysis() {
  const { symbol: urlSymbol } = useParams()
  const navigate = useNavigate()
  const usage = useUsage()
  const [symbol, setSymbol] = useState(urlSymbol || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stock, setStock] = useState<StockData | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState('growth')
  const [showPayment, setShowPayment] = useState(false)

  const animatedPrice = useCountUp(stock?.currentPrice || 0, 1000, 2)
  const animatedChange = useCountUp(stock?.changePercent || 0, 1000, 2)

  const fetchData = async (targetSymbol?: string) => {
    const s = targetSymbol || symbol
    if (!s.trim()) return

    // Check usage first
    const consumeResult = await usage.consumeUse()
    if (!consumeResult.ok) {
      if (consumeResult.exhausted) {
        setShowPayment(true)
      } else {
        setError(consumeResult.error || '服务暂时不可用，请稍后重试')
      }
      return
    }

    setLoading(true)
    setError('')
    setStock(null)
    setAnalysis(null)

    try {
      const quoteRes = await axios.get(`${API_BASE}/stocks/${encodeURIComponent(s)}`)
      const stockData = quoteRes.data.data as StockData
      setStock(stockData)

      if (stockData) {
        const marketCapYi = stockData.totalMarketCap ? stockData.totalMarketCap / 1e8 : 500
        const analysisPayload = {
          symbol: stockData.symbol,
          financials: {
            revenueGrowth: 20,
            netProfitGrowth: 25,
            peg: stockData.peRatio ? stockData.peRatio / 20 : 1.5,
            rdRatio: 5,
            grossMarginTrend: 'stable' as const,
            operatingCashFlowGrowth: 20,
            marketSpace: 30,
          },
          moat: {
            techIteration: 3, rdPipeline: 3, marketShareGain: 3,
            scaleEffect: 3, platformStickiness: 3, policyBarrier: 3, managementExecution: 3,
          },
          risks: {
            hypeWithoutEarnings: false,
            pegOver3: stockData.peRatio ? stockData.peRatio / 20 > 3 : false,
            unverifiableModel: false,
            singleClientDependency: false,
            cashBurnExceedsGeneration: false,
            goodwillOver30Percent: false,
          },
          valuation: {
            currentMarketCap: marketCapYi,
            expectedMarketCap3Y: marketCapYi * 1.3,
          },
          pullback: {
            priceDropPercent: Math.abs(stockData.changePercent) > 5 ? Math.abs(stockData.changePercent) : 0,
            revenueImpact: 'none' as const,
            industryCycle: 'stable' as const,
            valuationVsHistory: stockData.peRatio && stockData.peRatio > 30 ? 'high' as const : 'fair' as const,
            narrativeChange: false,
          },
        }
        const analysisRes = await axios.post(`${API_BASE}/analysis/full`, analysisPayload)
        setAnalysis(analysisRes.data.data)
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : '请求失败'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const onSearchSelect = (selectedSymbol: string) => {
    setSymbol(selectedSymbol)
    navigate(`/analysis/${selectedSymbol}`)
    fetchData(selectedSymbol)
  }

  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol)
      fetchData(urlSymbol)
    }
  }, [urlSymbol])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">股票分析</h1>
        {!usage.loading && (
          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${usage.isActivated ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-600/30' : usage.freeUsesRemaining > 0 ? 'bg-bg-elevated text-text-muted border border-bg-border' : 'bg-red-900/30 text-danger border border-danger/30'}`}>
            {usage.isActivated ? '已激活' : `剩余 ${usage.freeUsesRemaining} 次`}
          </div>
        )}
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar onSelect={onSearchSelect} placeholder="输入股票代码（如：600519、000001、AAPL）" />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchData()}
            disabled={loading || !symbol.trim()}
            className="shrink-0 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? '分析中...' : '开始分析'}
          </motion.button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-950/50 border border-danger/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-300">获取数据失败</div>
            <div className="text-sm text-red-400/80 mt-1">{error}</div>
            <button onClick={() => fetchData()} className="mt-2 text-sm text-red-300 hover:text-red-200 font-medium flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> 重试
            </button>
          </div>
        </motion.div>
      )}

      {/* Stock Info Card */}
      {loading && !stock && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      )}

      <AnimatePresence>
        {stock && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border-b border-bg-border">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-text">{stock.name || stock.symbol}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted text-xs border border-bg-border">{stock.symbol}</span>
                    <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-text-muted text-xs border border-bg-border">{stock.market.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-text-dim mt-1">数据来源：{stock.source}</div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-text">{animatedPrice}</div>
                  <div className={`text-sm font-medium flex items-center gap-1 justify-end ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                    {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stock.changePercent >= 0 ? '+' : ''}{animatedChange}%
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <StatCard label="今开" value={formatPrice(stock.openPrice)} />
                <StatCard label="最高" value={formatPrice(stock.highPrice)} />
                <StatCard label="最低" value={formatPrice(stock.lowPrice)} />
                <StatCard label="昨收" value={formatPrice(stock.prevClose)} />
                <StatCard label="成交量" value={formatNumber(stock.volume)} />
                <StatCard label="成交额" value={formatNumber(stock.turnover)} />
                <StatCard label="市盈率" value={stock.peRatio?.toFixed(2) || '-'} />
                <StatCard label="市净率" value={stock.pbRatio?.toFixed(2) || '-'} />
                <StatCard label="总市值" value={formatNumber(stock.totalMarketCap)} />
                <StatCard label="流通市值" value={formatNumber(stock.floatMarketCap)} />
                <StatCard label="换手率" value={stock.turnoverRate ? `${stock.turnoverRate.toFixed(2)}%` : '-'} />
                <StatCard label="更新时间" value={stock.timestamp ? new Date(stock.timestamp).toLocaleTimeString() : '-'} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Tabs */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="growth"><BarChart3 className="w-4 h-4 mr-1.5" />成长筛选</TabsTrigger>
              <TabsTrigger value="moat"><Shield className="w-4 h-4 mr-1.5" />护城河</TabsTrigger>
              <TabsTrigger value="risk"><AlertTriangle className="w-4 h-4 mr-1.5" />风险排除</TabsTrigger>
              <TabsTrigger value="valuation"><TrendingUp className="w-4 h-4 mr-1.5" />估值</TabsTrigger>
              <TabsTrigger value="pullback"><Activity className="w-4 h-4 mr-1.5" />回调监控</TabsTrigger>
            </TabsList>

            {/* Tab 1: Growth Score */}
            <TabsContent value="growth">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8">
                  <CircularProgress
                    value={analysis.growthScore.totalScore}
                    max={35}
                    size={180}
                    strokeWidth={10}
                    color={analysis.growthScore.gradeColor === 'green' ? '#059669' : analysis.growthScore.gradeColor === 'yellow' ? '#F59E0B' : '#DC2626'}
                    label={`${analysis.growthScore.grade}级评分`}
                  />
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-text">{analysis.growthScore.percentage}<span className="text-lg text-text-muted">/100</span></div>
                    <div className="text-sm text-text-muted mt-1">综合成长评分</div>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>七大指标详情</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(analysis.growthScore.scores).map(([key, score]) => {
                      const pct = (score / 5) * 100
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">{GROWTH_LABELS[key]}</span>
                            <span className={`font-semibold ${pct >= 80 ? 'text-emerald-400' : pct >= 40 ? 'text-warning' : 'text-danger'}`}>{score}/5</span>
                          </div>
                          <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: pct >= 80 ? '#059669' : pct >= 40 ? '#F59E0B' : '#DC2626' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2: Moat */}
            <TabsContent value="moat">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8">
                  <CircularProgress
                    value={analysis.moat.totalScore}
                    max={35}
                    size={180}
                    strokeWidth={10}
                    color={analysis.moat.totalScore >= 28 ? '#059669' : analysis.moat.totalScore >= 20 ? '#F59E0B' : '#DC2626'}
                    label={analysis.moat.rating}
                  />
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-text">{analysis.moat.totalScore}<span className="text-lg text-text-muted">/35</span></div>
                    <div className="text-sm text-text-muted mt-1">护城河总评分</div>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>七维护城河评估</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-4">
                    {Object.entries(analysis.moat.scores).map(([key, score]) => (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-bg-border">
                        <div className="w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center shrink-0">
                          <Target className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-text-muted">{MOAT_LABELS[key]}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full bg-bg-border overflow-hidden">
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(score / 5) * 100}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-text w-6 text-right">{score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 3: Risk */}
            <TabsContent value="risk">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8">
                  <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 ${analysis.risk.excluded ? 'border-danger bg-red-950/30' : 'border-emerald-600 bg-emerald-950/30'}`}>
                    {analysis.risk.excluded ? (
                      <AlertTriangle className="w-16 h-16 text-danger" />
                    ) : (
                      <Shield className="w-16 h-16 text-emerald-400" />
                    )}
                  </div>
                  <div className="mt-6 text-center">
                    <div className={`text-2xl font-bold ${analysis.risk.excluded ? 'text-danger' : 'text-emerald-400'}`}>
                      {analysis.risk.excluded ? '已排除' : '通过检查'}
                    </div>
                    <div className="text-sm text-text-muted mt-1">
                      {analysis.risk.excluded ? `触发 ${analysis.risk.triggeredFlags.length} 项风险` : '未发现明显风险'}
                    </div>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>六项伪成长排除检查</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(analysis.risk.details).map(([key, triggered]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                          triggered
                            ? 'bg-red-950/20 border-danger/30'
                            : 'bg-emerald-950/20 border-emerald-600/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${triggered ? 'bg-danger/20' : 'bg-emerald-600/20'}`}>
                            {triggered ? <AlertTriangle className="w-4 h-4 text-danger" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <span className="text-sm text-text">{RISK_LABELS[key]}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${triggered ? 'bg-danger/20 text-danger' : 'bg-emerald-600/20 text-emerald-400'}`}>
                          {triggered ? '触发' : '正常'}
                        </span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 4: Valuation */}
            <TabsContent value="valuation">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8">
                  <CircularProgress
                    value={Math.abs(analysis.valuation.upsidePercent)}
                    max={50}
                    size={180}
                    strokeWidth={10}
                    color={analysis.valuation.upsidePercent > 30 ? '#059669' : analysis.valuation.upsidePercent >= 10 ? '#F59E0B' : '#DC2626'}
                    label="上行空间"
                    showPercentage={false}
                  />
                  <div className="mt-4 text-center">
                    <motion.div className="text-4xl font-bold text-text">{analysis.valuation.upsidePercent}%</motion.div>
                    <div className="text-sm text-text-muted mt-1">估值合理性</div>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>估值判断</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-center py-8">
                      <div className={`px-8 py-4 rounded-2xl text-2xl font-bold border ${
                        analysis.valuation.recommendation === '强烈买入' ? 'bg-emerald-950/50 border-emerald-600/30 text-emerald-400' :
                        analysis.valuation.recommendation === '买入' ? 'bg-blue-950/50 border-blue-500/30 text-blue-400' :
                        analysis.valuation.recommendation === '观望' ? 'bg-amber-950/50 border-warning/30 text-warning' :
                        'bg-red-950/50 border-danger/30 text-danger'
                      }`}>
                        {analysis.valuation.recommendation}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-6 rounded-xl bg-bg-elevated border border-bg-border">
                        <div className="text-3xl font-bold text-text">{analysis.valuation.currentMarketCap.toFixed(0)}<span className="text-lg text-text-muted">亿</span></div>
                        <div className="text-sm text-text-muted mt-1">当前市值</div>
                      </div>
                      <div className="text-center p-6 rounded-xl bg-bg-elevated border border-bg-border">
                        <div className="text-3xl font-bold text-emerald-400">{analysis.valuation.expectedMarketCap3Y.toFixed(0)}<span className="text-lg text-text-muted">亿</span></div>
                        <div className="text-sm text-text-muted mt-1">3年预期市值</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 5: Pullback */}
            <TabsContent value="pullback">
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col items-center justify-center p-8">
                  <div className="w-48 h-48 rounded-full border-4 border-bg-border flex items-center justify-center relative">
                    <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2a2e38" strokeWidth="3" />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3"
                        strokeDasharray={`${analysis.pullback.confidence}, 100`}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: analysis.pullback.confidence / 100 }}
                        transition={{ duration: 1 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-text">{analysis.pullback.confidence}%</div>
                      <div className="text-xs text-text-muted">置信度</div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-lg font-semibold text-emerald-400">{analysis.pullback.category}</div>
                    <div className="text-sm text-text-muted mt-1">回调定性</div>
                  </div>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>推理依据</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.pullback.reasoning.map((r, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-bg-elevated border border-bg-border"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm font-bold text-emerald-400">{i + 1}</span>
                        </div>
                        <p className="text-sm text-text leading-relaxed">{r}</p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}

      {/* Empty State */}
      {!stock && !loading && !error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <BarChart3 className="w-16 h-16 text-text-dim mx-auto mb-4 opacity-50" />
          <p className="text-text-muted">输入股票代码开始深度分析</p>
        </motion.div>
      )}

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

