/**
 * Contract Test: GET /api/v1/leads/marketplace
 * 
 * Validates the API contract for marketplace leads listing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockMarketplaceLeads = [
  {
    id: 'lead_001',
    empresaNome: 'Tech Solutions LTDA',
    segmento: 'Tecnologia',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '(11) 9****-****', // Masked
    email: 'c******@*****.com', // Masked
    custoCreditosCentavos: 1000,
    statusMarketplace: 'publico'
  },
  {
    id: 'lead_002',
    empresaNome: 'Comercial ABC',
    segmento: 'Comércio',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    telefone: '(21) 9****-****', // Masked
    email: 'v******@*****.com', // Masked
    custoCreditosCentavos: 800,
    statusMarketplace: 'publico'
  }
];

const server = setupServer(
  http.get('http://localhost:3000/api/v1/leads/marketplace', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const url = new URL(request.url);
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const segmento = url.searchParams.get('segmento');
    const cidade = url.searchParams.get('cidade');
    const estado = url.searchParams.get('estado');

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

    // Filter leads
    let filteredLeads = [...mockMarketplaceLeads];
    
    if (segmento) {
      filteredLeads = filteredLeads.filter(l => l.segmento === segmento);
    }
    if (cidade) {
      filteredLeads = filteredLeads.filter(l => l.cidade.toLowerCase().includes(cidade.toLowerCase()));
    }
    if (estado) {
      filteredLeads = filteredLeads.filter(l => l.estado === estado);
    }

    // Pagination
    const total = filteredLeads.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLeads = filteredLeads.slice(start, end);

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

describe('Contract: GET /api/v1/leads/marketplace', () => {
  it('should return marketplace leads with correct schema', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace', {
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
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace');

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should return leads with masked phone and email', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    expect(leads.length).toBeGreaterThan(0);
    
    leads.forEach((lead: any) => {
      expect(lead).toHaveProperty('telefone');
      expect(lead).toHaveProperty('email');
      
      // Should be masked
      expect(lead.telefone).toContain('*');
      expect(lead.email).toContain('*');
    });
  });

  it('should include lead basic information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace', {
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
    expect(lead).toHaveProperty('custoCreditosCentavos');
    expect(lead).toHaveProperty('statusMarketplace');
  });

  it('should include credit cost', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data.leads[0];

    expect(typeof lead.custoCreditosCentavos).toBe('number');
    expect(lead.custoCreditosCentavos).toBeGreaterThan(0);
    expect(Number.isInteger(lead.custoCreditosCentavos)).toBe(true);
  });

  it('should include marketplace status', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(['publico', 'vendido', 'privado', 'indisponivel'])
        .toContain(lead.statusMarketplace);
    });
  });

  it('should support pagination', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace?page=1&limit=10', {
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

  it('should filter by segmento', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace?segmento=Tecnologia', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(lead.segmento).toBe('Tecnologia');
    });
  });

  it('should filter by cidade', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace?cidade=São Paulo', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(lead.cidade.toLowerCase()).toContain('são paulo'.toLowerCase());
    });
  });

  it('should filter by estado', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace?estado=SP', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(lead.estado).toBe('SP');
    });
  });

  it('should support multiple filters', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/marketplace?segmento=Tecnologia&estado=SP', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const leads = body.data.leads;

    leads.forEach((lead: any) => {
      expect(lead.segmento).toBe('Tecnologia');
      expect(lead.estado).toBe('SP');
    });
  });
});
