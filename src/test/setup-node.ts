import './mocks/localStorage';
import { server } from './mocks/server'
import { vi } from 'vitest'

// MSW server setup
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock de device.ts
vi.mock('../shared/utils/device', () => ({
  getOrCreateDeviceId: vi.fn(() => 'mock-device-id'),
  getDeviceFingerprint: vi.fn(() => 'mock-fingerprint'),
  getDeviceInfo: vi.fn(() => ({
    userAgent: 'Test User Agent',
    language: 'en-US',
    platform: 'Test Platform',
    screenResolution: '1920x1080',
    colorDepth: 24,
    timezone: 'UTC',
    timezoneOffset: 0
  })),
  clearDeviceData: vi.fn(),
  validateDeviceFingerprint: vi.fn(() => true),
  getClientType: vi.fn(() => 'web'),
  detectDeviceChanges: vi.fn(() => ({
    fingerprintChanged: false,
    userAgentChanged: false,
    riskLevel: 'low'
  }))
}))
