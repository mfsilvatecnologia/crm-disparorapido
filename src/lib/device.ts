// Device Management Utilities
// For session tracking and device fingerprinting with API-first architecture

/**
 * Gets or creates a unique device ID for session management
 * Stores the ID in localStorage for persistence across browser sessions
 */
export function getOrCreateDeviceId(): string {
  const key = import.meta.env.VITE_DEVICE_ID_KEY || 'leadsrapido_device_id'
  let deviceId = localStorage.getItem(key)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(key, deviceId)
  }

  return deviceId
}

/**
 * Generates a device fingerprint based on browser characteristics
 * Used for additional security validation in session management
 */
export function getDeviceFingerprint(): string {
  try {
    // Create canvas fingerprint
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context not available')
    }

    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Device fingerprint', 2, 2)

    const canvasFingerprint = canvas.toDataURL()

    // Collect browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      navigator.languages?.join(',') || '',
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '',
      navigator.deviceMemory?.toString() || '',
      canvasFingerprint
    ].join('|')

    // Create hash of fingerprint data
    return btoa(fingerprint).slice(0, 32)
  } catch (error) {
    console.warn('Error generating device fingerprint:', error)
    // Fallback to simpler fingerprint
    return btoa([
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset()
    ].join('|')).slice(0, 32)
  }
}

/**
 * Gets current device information for session context
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset()
  }
}

/**
 * Clears device-related data from localStorage
 * Used during logout or when resetting session
 */
export function clearDeviceData(): void {
  const keys = [
    import.meta.env.VITE_DEVICE_ID_KEY || 'leadsrapido_device_id',
    import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token',
    import.meta.env.VITE_REFRESH_TOKEN_KEY || 'leadsrapido_refresh_token'
  ]

  keys.forEach(key => {
    localStorage.removeItem(key)
  })
}

/**
 * Validates if current device matches stored fingerprint
 * Used for detecting device changes in security-sensitive operations
 */
export function validateDeviceFingerprint(storedFingerprint: string): boolean {
  const currentFingerprint = getDeviceFingerprint()
  return currentFingerprint === storedFingerprint
}

/**
 * Gets the current client type based on environment
 */
export function getClientType(): 'web' | 'extension' {
  // Check if running in Chrome extension context
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return 'extension'
  }

  // Check for other extension indicators
  if (window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'moz-extension:') {
    return 'extension'
  }

  return 'web'
}

/**
 * Detects significant device/browser changes that might indicate security risk
 */
export function detectDeviceChanges(sessionInfo: {
  device_fingerprint: string
  user_agent: string
  ip_address?: string
}): {
  fingerprintChanged: boolean
  userAgentChanged: boolean
  riskLevel: 'low' | 'medium' | 'high'
} {
  const currentFingerprint = getDeviceFingerprint()
  const currentUserAgent = navigator.userAgent

  const fingerprintChanged = currentFingerprint !== sessionInfo.device_fingerprint
  const userAgentChanged = currentUserAgent !== sessionInfo.user_agent

  let riskLevel: 'low' | 'medium' | 'high' = 'low'

  if (fingerprintChanged && userAgentChanged) {
    riskLevel = 'high'
  } else if (fingerprintChanged || userAgentChanged) {
    riskLevel = 'medium'
  }

  return {
    fingerprintChanged,
    userAgentChanged,
    riskLevel
  }
}

// Global window interface for Chrome extension access
declare global {
  interface Window {
    getDeviceId: () => string
    getDeviceFingerprint: () => string
  }
}

// Expose functions for Chrome extension access
if (typeof window !== 'undefined') {
  window.getDeviceId = getOrCreateDeviceId
  window.getDeviceFingerprint = getDeviceFingerprint
}