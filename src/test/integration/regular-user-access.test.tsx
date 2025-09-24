// Integration Test: Regular user has read-only access
// This test MUST FAIL before implementing the permission system

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../../shared/contexts/AuthContext'
import { usePermissions } from '../../shared/hooks/usePermissions'
import { PermissionGate } from '../../features/authentication/components/PermissionGate'

function RegularUserTestComponent() {
  const { hasPermission, isUser, permissions, isLoading } = usePermissions()

  if (isLoading) return <div>Loading permissions...</div>

  return (
    <div>
      <div data-testid="is-user">{isUser ? 'true' : 'false'}</div>
      <div data-testid="can-view-leads">{hasPermission('leads.view') ? 'true' : 'false'}</div>
      <div data-testid="can-create-users">{hasPermission('users.create') ? 'true' : 'false'}</div>

      <PermissionGate
        permission="users.create"
        fallback={<div data-testid="create-denied">Create User Denied</div>}
      >
        <div data-testid="create-user-button">Create User</div>
      </PermissionGate>
    </div>
  )
}

describe('Integration Test: Regular user has read-only access', () => {
  beforeEach(() => {
    // Mock authenticated regular user
    const regularUser = {
      id: 'user-789',
      email: 'user@empresa.com',
      role: 'user',
    }
    localStorage.setItem('leadsrapido_auth_token', 'user-jwt-token')
    localStorage.setItem('leadsrapido_refresh_token', 'user-refresh-token')
    localStorage.setItem('user', JSON.stringify(regularUser))
  })

  it('should restrict regular user to read-only permissions', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RegularUserTestComponent />
        </AuthProvider>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('is-user')).toHaveTextContent('true')
    expect(screen.getByTestId('can-create-users')).toHaveTextContent('false')
    expect(screen.getByTestId('create-denied')).toBeInTheDocument()
  })
})