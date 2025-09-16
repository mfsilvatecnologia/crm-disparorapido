// Contract Test: POST /api/v1/admin/sessions/{sessionId}/terminate
// This test MUST FAIL before implementing the API client
// Tests the session termination endpoint based on auth-permissions.json contract

import { describe, it, expect } from 'vitest'
import { terminateSession } from '../../lib/api/sessions'

describe('Contract Test: POST /api/v1/admin/sessions/{sessionId}/terminate', () => {
  it('should terminate session with correct contract structure', async () => {
    const sessionId = 'session-123'
    const terminateRequest = {
      reason: 'Suspicious activity detected',
      notify_user: true
    }

    // This test will FAIL until terminateSession is implemented
    const result = await terminateSession('admin-jwt-token', sessionId, terminateRequest)

    // Validate response based on auth-permissions.json contract
    expect(result).toHaveProperty('success', true)
    // The contract specifies a 200 response but doesn't define the response body structure
    // So we just validate that the request completes successfully
  })

  it('should handle termination without user notification', async () => {
    const sessionId = 'session-456'
    const terminateRequest = {
      reason: 'Administrative action',
      notify_user: false
    }

    // This will FAIL until terminateSession supports notify_user parameter
    const result = await terminateSession('admin-jwt-token', sessionId, terminateRequest)

    expect(result).toHaveProperty('success', true)
  })

  it('should require reason parameter', async () => {
    const sessionId = 'session-123'
    const terminateRequest = {
      // Missing required reason parameter
      notify_user: true
    }

    // This will FAIL until terminateSession validates required parameters
    await expect(
      terminateSession('admin-jwt-token', sessionId, terminateRequest as any)
    ).rejects.toThrow()
  })

  it('should handle non-existent session', async () => {
    const sessionId = 'non-existent-session'
    const terminateRequest = {
      reason: 'Test termination',
      notify_user: false
    }

    // This will FAIL until terminateSession handles 404 errors
    await expect(
      terminateSession('admin-jwt-token', sessionId, terminateRequest)
    ).rejects.toThrow()
  })

  it('should require X-Device-Id header', async () => {
    const sessionId = 'session-123'
    const terminateRequest = {
      reason: 'Test termination',
      notify_user: true
    }

    // This will FAIL until terminateSession validates required headers
    await expect(
      terminateSession('admin-jwt-token', sessionId, terminateRequest, { skipDeviceHeader: true })
    ).rejects.toThrow()
  })

  it('should require admin or company admin permissions', async () => {
    const sessionId = 'session-123'
    const terminateRequest = {
      reason: 'Unauthorized termination attempt',
      notify_user: true
    }

    // This will FAIL until terminateSession handles permission errors
    await expect(
      terminateSession('user-jwt-token', sessionId, terminateRequest)
    ).rejects.toThrow()
  })

  it('should handle authentication errors', async () => {
    const sessionId = 'session-123'
    const terminateRequest = {
      reason: 'Test with invalid auth',
      notify_user: true
    }

    // This will FAIL until terminateSession handles auth errors
    await expect(
      terminateSession('invalid-token', sessionId, terminateRequest)
    ).rejects.toThrow()
  })
})