import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, LayoutDashboard, Search, Star, Settings, FlaskConical } from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: TrendingUp },
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/analysis', label: '股票分析', icon: Search },
  { path: '/watchlist', label: '自选股', icon: Star },
  { path: '/test/analysis', label: '算法测试', icon: FlaskConical },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-bg-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-emerald-400 font-bold text-xl">
            <TrendingUp className="w-6 h-6" />
            <span>雨的成长投资</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400'
                      : 'text-text-muted hover:text-text hover:bg-bg-hover'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
          {/* Mobile menu placeholder */}
          <div className="md:hidden text-text-muted text-sm">
            <Search className="w-5 h-5" />
          </div>
        </div>
      </div>
    </nav>
  )
}
