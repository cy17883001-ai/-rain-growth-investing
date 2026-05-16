import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-bg-border bg-bg-elevated/50 py-4 text-center text-sm text-text-dim">
        雨的成长投资分析系统 - 基于 Peter Lynch 和菲利普·费雪的成长投资理论
      </footer>
    </div>
  )
}
