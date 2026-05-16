import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, TrendingUp } from 'lucide-react'
import axios from 'axios'

interface SearchResult {
  symbol: string
  name: string
  market: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function SearchBar({
  onSelect,
  placeholder = '输入股票代码或名称',
}: {
  onSelect?: (symbol: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    try {
      const { data } = await axios.get(`${API_BASE}/stocks/search`, {
        params: { q },
        signal: abortRef.current.signal,
      })
      setResults(data.data || [])
      setOpen(true)
      setActiveIndex(-1)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (symbol: string) => {
    setQuery(symbol)
    setOpen(false)
    onSelect?.(symbol)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          handleSelect(results[activeIndex].symbol)
        } else if (results.length > 0) {
          handleSelect(results[0].symbol)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-bg-border bg-bg-card text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 transition-all shadow-lg shadow-black/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-bg-card rounded-xl border border-bg-border shadow-2xl overflow-hidden">
          <ul className="max-h-72 overflow-y-auto py-1">
            {results.map((item, index) => (
              <li
                key={`${item.symbol}-${index}`}
                onClick={() => handleSelect(item.symbol)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  index === activeIndex ? 'bg-emerald-600/15' : 'hover:bg-bg-hover'
                }`}
              >
                <div className="w-8 h-8 bg-emerald-600/15 rounded-lg flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{item.name}</div>
                  <div className="text-xs text-text-muted">
                    {item.symbol} · {item.market.toUpperCase()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-bg-card rounded-xl border border-bg-border shadow-2xl py-4 text-center text-sm text-text-muted">
          未找到相关股票
        </div>
      )}
    </div>
  )
}
