import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { getDeviceFingerprint } from '../utils/fingerprint'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface UsageState {
  freeUsesRemaining: number
  freeUsesTotal: number
  isActivated: boolean
  activatedUntil: string | null
  canUse: boolean
  loading: boolean
  error: string | null
}

export function useUsage() {
  const [state, setState] = useState<UsageState>({
    freeUsesRemaining: 10,
    freeUsesTotal: 10,
    isActivated: false,
    activatedUntil: null,
    canUse: true,
    loading: true,
    error: null,
  })

  const fetchStatus = useCallback(async () => {
    try {
      const fp = getDeviceFingerprint()
      const { data } = await axios.post(`${API_BASE}/payment/status`, fp)
      const d = data.data
      setState({
        freeUsesRemaining: d.freeUsesRemaining,
        freeUsesTotal: d.freeUsesTotal,
        isActivated: d.isActivated,
        activatedUntil: d.activatedUntil,
        canUse: d.canUse,
        loading: false,
        error: null,
      })
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : '获取状态失败'
      setState((s) => ({ ...s, loading: false, error: msg }))
    }
  }, [])

  const activateCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const fp = getDeviceFingerprint()
      const { data } = await axios.post(`${API_BASE}/payment/activate`, { ...fp, code })
      await fetchStatus()
      return { success: data.success, message: data.data.message }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        return { success: false, message: err.response.data?.message || '激活失败' }
      }
      return { success: false, message: '网络错误' }
    }
  }, [fetchStatus])

  const consumeUse = useCallback(async (): Promise<{ ok: boolean; exhausted: boolean; error?: string }> => {
    try {
      const fp = getDeviceFingerprint()
      const { data } = await axios.post(`${API_BASE}/payment/consume`, fp)
      setState((s) => ({
        ...s,
        freeUsesRemaining: data.data.freeUsesRemaining,
        canUse: data.data.canUse,
        error: null,
      }))
      return { ok: true, exhausted: false }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setState((s) => ({ ...s, canUse: false, error: null }))
        return { ok: false, exhausted: true }
      }
      // Server error or network issue — don't treat as "no uses left"
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || err.message : '服务暂时不可用'
      setState((s) => ({ ...s, error: msg }))
      return { ok: false, exhausted: false, error: msg }
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return { ...state, fetchStatus, activateCode, consumeUse }
}
