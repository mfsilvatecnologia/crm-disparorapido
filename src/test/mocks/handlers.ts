import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:3000/api/v1'

export const handlers = [
  http.get(`${API_BASE_URL}/auth/permissions`, ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 'user-123',
          email: 'admin@empresa.com',
          nome: 'Admin User',
          telefone: '(11) 99999-9999',
          ativo: true,
          role: 'admin',
          empresa_id: 'emp-123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        role: {
          id: 'role-123',
          nome: 'admin',
          descricao: 'Administrador do sistema',
          permissoes: {
            all: true
          },
          created_at: '2024-01-01T00:00:00Z'
        },
        permissions: {
          canCreateUsers: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canViewAllLeads: true,
          canCreateLeads: true,
          canEditLeads: true,
          canDeleteLeads: true,
          canManageCampaigns: true,
          canViewReports: true,
          canAccessAdmin: true,
          scopeToOrganization: false
        },
        organization: {
          id: 'emp-123',
          nome: 'Empresa Teste',
          cnpj: '12.345.678/0001-90',
          email: 'contato@empresa.com',
          saldo_creditos: 1000,
          api_key: 'test-api-key'
        }
      },
      cached: false,
      expiresIn: 300
    })
  }),
  http.get(`${API_BASE_URL}/admin/roles`, ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (token === 'user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      data: []
    })
  }),
  http.post(`${API_BASE_URL}/admin/roles`, async ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (token === 'user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    const newRole = await request.json()
    if (!newRole.descricao || !newRole.permissoes) {
      return new HttpResponse(null, { status: 400 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'role-456',
        nome: 'custom_role',
        descricao: 'Custom role for testing',
        permissoes: {
          leads: 'read',
          campanhas: 'read'
        },
        created_at: '2024-01-01T00:00:00Z'
      }
    })
  }),
  http.get(`${API_BASE_URL}/admin/audit-logs`, ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    if (token === 'user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        logs: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 1
        }
      }
    })
  }),
  http.post(`${API_BASE_URL}/auth/permissions/validate`, async ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    const { permission } = await request.json()

    if (token === 'restricted-token') {
      return HttpResponse.json({
        success: true,
        data: {
          hasPermission: false,
          permission,
          reason: 'Your role does not have this permission'
        }
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        hasPermission: true,
        permission
      }
    })
  }),
  http.put(`${API_BASE_URL}/admin/users/:userId/role`, async ({ request, params }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const { userId } = params

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    if (token === 'regular-user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (userId === 'non-existent-user') {
      return new HttpResponse(null, { status: 404 })
    }

    const { role } = await request.json()
    if (token === 'empresa_admin-jwt-token' && role === 'admin') {
      return new HttpResponse(null, { status: 403 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: userId,
          role: role
        },
        previousRole: 'empresa_user',
        newRole: role,
        updatedAt: '2024-01-01T00:00:00Z'
      }
    })
  }),
  http.get(`${API_BASE_URL}/admin/sessions`, ({ request }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const deviceId = request.headers.get('X-Device-Id')

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    if (token === 'user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (!deviceId) {
      return new HttpResponse(null, { status: 400 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        sessions: [],
        total: 0,
        active_sessions: 0,
        session_limit: 10,
        current_usage_percentage: 0
      }
    })
  }),
  http.post(`${API_BASE_URL}/admin/sessions/:sessionId/terminate`, async ({ request, params }) => {
    const token = request.headers.get('Authorization')?.split(' ')[1]
    const { sessionId } = params

    if (token === 'invalid-token') {
      return new HttpResponse(null, { status: 401 })
    }

    if (token === 'user-jwt-token') {
      return new HttpResponse(null, { status: 403 })
    }

    if (sessionId === 'non-existent-session') {
      return new HttpResponse(null, { status: 404 })
    }

    const { reason } = await request.json()
    if (!reason) {
      return new HttpResponse(null, { status: 400 })
    }

    return HttpResponse.json({ success: true })
  }),
  http.get(`${API_BASE_URL}/sessions/active`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        sessions: []
      }
    })
  })
]