export interface FingerprintComponents {
  canvas: string
  webgl: string
  userAgent: string
  screenWidth: number
  screenHeight: number
  timezone: string
  language: string
  platform: string
  colorDepth: number
  pixelRatio: number
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    canvas.width = 200
    canvas.height = 50
    ctx.textBaseline = 'top'
    ctx.font = '16px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(10, 10, 150, 30)
    ctx.fillStyle = '#069'
    ctx.fillText('RainInvesting FP v1', 12, 12)
    ctx.strokeStyle = '#0f0'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(200, 50)
    ctx.stroke()
    return canvas.toDataURL().slice(-32)
  } catch {
    return ''
  }
}

function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return ''
    const gl2 = gl as WebGLRenderingContext
    const debugInfo = gl2.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''
    const vendor = gl2.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl2.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    return `${vendor}|${renderer}`
  } catch {
    return ''
  }
}

export function getDeviceFingerprint(): FingerprintComponents {
  return {
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  }
}
