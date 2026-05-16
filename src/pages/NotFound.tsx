import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="w-16 h-16 text-gold-400 mb-6" />
      <h1 className="text-4xl font-bold text-text mb-4">404</h1>
      <p className="text-lg text-text-muted mb-8">页面未找到</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
      >
        <Home className="w-5 h-5" />
        返回首页
      </Link>
    </div>
  )
}
