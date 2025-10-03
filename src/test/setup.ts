import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Check if window is available (browser environment)
if (typeof window !== 'undefined') {
  // Mock do window.location
  Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
})

  // Mock de window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
}

// Mock de ResizeObserver
if (typeof global !== 'undefined') {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock de IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

// Mock do Supabase
vi.mock('../shared/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}))

// Mock de device.ts
vi.mock('../shared/utils/device', () => ({
  getOrCreateDeviceId: vi.fn(() => 'mock-device-id'),
  generateDeviceFingerprint: vi.fn(async () => 'mock-fingerprint'),
  clearDeviceData: vi.fn(),
  getDeviceInfo: vi.fn(() => ({
    userAgent: 'Test User Agent',
    language: 'en-US',
    platform: 'Test Platform',
    screenResolution: '1920x1080',
    colorDepth: 24,
    timezone: 'UTC',
    timezoneOffset: 0
  })),
  validateDeviceFingerprint: vi.fn(() => true),
  getClientType: vi.fn(() => 'web'),
  detectDeviceChanges: vi.fn(() => ({
    fingerprintChanged: false,
    userAgentChanged: false,
    riskLevel: 'low'
  }))
}))
