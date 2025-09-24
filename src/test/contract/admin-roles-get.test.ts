// Contract Test: GET /api/v1/admin/roles
// This test MUST FAIL before implementing the API client
// Tests the admin roles listing endpoint based on auth-permissions.json contract

import { describe, it, expect } from 'vitest'
import { fetchRoles } from '../../shared/services/roles'

describe('Contract Test: GET /api/v1/admin/roles', () => {
  it('should return roles list with correct contract structure', async () => {
    // This test will FAIL until fetchRoles is implemented
    const result = await fetchRoles('admin-jwt-token')

    // Validate response based on auth-permissions.json contract
    expect(result).toHaveProperty('success', true)
    expect(result).toHaveProperty('data')
    expect(Array.isArray(result.data)).toBe(true)

    // Validate role structure if roles exist
    if (result.data.length > 0) {
      const role = result.data[0]
      expect(role).toHaveProperty('id')
      expect(role).toHaveProperty('nome')
      expect(role).toHaveProperty('descricao')
      expect(role).toHaveProperty('permissoes')
      expect(role).toHaveProperty('created_at')
    }
  })

  it('should require admin permissions', async () => {
    // This will FAIL until fetchRoles handles permission errors
    await expect(
      fetchRoles('user-jwt-token')
    ).rejects.toThrow()
  })

  it('should handle authentication errors', async () => {
    // This will FAIL until fetchRoles handles auth errors
    await expect(
      fetchRoles('invalid-token')
    ).rejects.toThrow()
  })
})