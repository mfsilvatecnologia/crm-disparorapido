/**
 * Contract Test: GET /api/v1/leads/purchased
 * 
 * Validates the API contract for listing purchased leads (unmasked)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockPurchasedLeads = [
  {
    id: 'lead_001',
    empresaNome: 'Tech Solutions LTDA',
    segmento: 'Tecnologia',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 98765-4321', // UNMASKED
    email: 'contato@techsolutions.com', // UNMASKED
    custoCreditosCentavos: 1000,
    statusMarketplace: 'vendido',
    acesso: {
      id: 'access_001',
      tipoAcesso: 'comprado',
      custoPagoCentavos: 1000,
      dataCompra: '2025-10-01T10:30:00.000Z',
      visualizacoesCount: 5,
      limiteVisualizacoes: null
    }
  },
  {
    id: 'lead_002',
    empresaNome: 'Comercial ABC',
    segmento: 'Comércio',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    telefone: '(21) 99876-5432', // UNMASKED
    email: 'vendas@comercialabc.com', // UNMASKED
    custoCreditosCentavos: 800,
    statusMarketplace: 'vendido',
    acesso: {
      id: 'access_002',
      tipoAcesso: 'comprado',
      custoPagoCentavos: 800,
      dataCompra: '2025-09-28T15:45:00.000Z',
      visualizacoesCount: 12,
      limiteVisualizacoes: null
    }
  }
];

const server = setupServer(
  http.get('http://localhost:3000/api/v1/leads/purchased', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const url = new URL(request.url);
    
    const empresaId = url.searchParams.get('empresaId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token de autenticação não fornecido'
          }
        },
        { status: 401 }
      );
    }

    if (!empresaId) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'empresaId é obrigatório',
            details: { field: 'empresaId' }
          }
        },
        { status: 400 }
      );
    }

    // Pagination
    const total = mockPurchasedLeads.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLeads = mockPurchasedLeads.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        leads: paginatedLeads,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/v1/leads/purchased', () => {
  it('should return purchased leads with unmasked data', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('leads');
    expect(body.data).toHaveProperty('pagination');
    expect(Array.isArray(body.data.leads)).toBe(true);
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123');

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should require empresaId parameter', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should return leads with UNMASKED phone numbers', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    expect(leads.length).toBeGreaterThan(0);
    
    leads.forEach((lead: any) => {
      expect(lead).toHaveProperty('telefone');
      // Should NOT be masked
      expect(lead.telefone).not.toContain('*');
      // Should be a valid phone format
      expect(lead.telefone).toMatch(/\(\d{2}\)\s?\d{4,5}-?\d{4}/);
    });
  });

  it('should return leads with UNMASKED emails', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(lead).toHaveProperty('email');
      // Should NOT be masked
      expect(lead.email).not.toContain('*');
      // Should be a valid email
      expect(lead.email).toContain('@');
      expect(lead.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it('should include access information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data.leads[0];

    expect(lead).toHaveProperty('acesso');
    expect(lead.acesso).toHaveProperty('id');
    expect(lead.acesso).toHaveProperty('tipoAcesso');
    expect(lead.acesso).toHaveProperty('custoPagoCentavos');
    expect(lead.acesso).toHaveProperty('dataCompra');
    expect(lead.acesso).toHaveProperty('visualizacoesCount');
  });

  it('should include purchase details', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const access = body.data.leads[0].acesso;

    expect(['comprado', 'trial', 'bonus']).toContain(access.tipoAcesso);
    expect(typeof access.custoPagoCentavos).toBe('number');
    expect(access.custoPagoCentavos).toBeGreaterThanOrEqual(0);
    expect(new Date(access.dataCompra).toISOString()).toBe(access.dataCompra);
  });

  it('should include view count tracking', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const access = body.data.leads[0].acesso;

    expect(typeof access.visualizacoesCount).toBe('number');
    expect(access.visualizacoesCount).toBeGreaterThanOrEqual(0);
    
    // limiteVisualizacoes can be null (unlimited) or a number
    if (access.limiteVisualizacoes !== null) {
      expect(typeof access.limiteVisualizacoes).toBe('number');
      expect(access.limiteVisualizacoes).toBeGreaterThan(0);
    }
  });

  it('should support pagination', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123&page=1&limit=10', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const pagination = body.data.pagination;

    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('totalPages');
    expect(pagination).toHaveProperty('hasNext');
    expect(pagination).toHaveProperty('hasPrev');
    
    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.total).toBe('number');
    expect(typeof pagination.hasNext).toBe('boolean');
    expect(typeof pagination.hasPrev).toBe('boolean');
  });

  it('should include all lead information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data.leads[0];

    expect(lead).toHaveProperty('id');
    expect(lead).toHaveProperty('empresaNome');
    expect(lead).toHaveProperty('segmento');
    expect(lead).toHaveProperty('cidade');
    expect(lead).toHaveProperty('estado');
    expect(lead).toHaveProperty('telefone');
    expect(lead).toHaveProperty('email');
    expect(lead).toHaveProperty('custoCreditosCentavos');
    expect(lead).toHaveProperty('statusMarketplace');
  });

  it('should show vendido status for purchased leads', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/purchased?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      // Purchased leads should typically have 'vendido' status
      expect(['vendido', 'privado']).toContain(lead.statusMarketplace);
    });
  });
});
