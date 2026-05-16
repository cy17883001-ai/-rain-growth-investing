import { motion } from 'framer-motion'
import { Settings2, Bell, Shield, Database } from 'lucide-react'
import { Card } from '../components/ui/Card'

const settingSections = [
  { icon: Bell, title: '通知设置', desc: '配置股价预警、财报提醒等通知方式' },
  { icon: Shield, title: '账户安全', desc: '修改密码、管理登录设备和 API 密钥' },
  { icon: Database, title: '数据管理', desc: '导出分析数据、清理缓存和本地存储' },
  { icon: Settings2, title: '系统偏好', desc: '主题、语言、默认分析指标等通用设置' },
]

export default function Settings() {
  return (
    <div className="space-y-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text">
        设置
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-4">
        {settingSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="cursor-pointer"
          >
            <Card className="hover:border-emerald-600/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-950 rounded-lg flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-1">{section.title}</h3>
                  <p className="text-sm text-text-muted">{section.desc}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
