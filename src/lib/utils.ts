import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, digits = 2): string {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: digits })
}
