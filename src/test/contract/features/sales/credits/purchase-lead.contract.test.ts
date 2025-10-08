/**
 * Contract Test: POST /api/v1/credits/purchase-lead
 * 
 * Validates the API contract for purchasing lead access with credits
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('http://localhost:3000/api/v1/credits/purchase-lead', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const body = await request.json() as any;

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

    if (!body.leadId) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'leadId é obrigatório',
            details: { field: 'leadId' }
          }
        },
        { status: 400 }
      );
    }

    // Simulate insufficient balance
    if (body.leadId === 'lead_insufficient_balance') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: 'Saldo de créditos insuficiente',
            details: {
              required: 1000,
              available: 500
            }
          }
        },
        { status: 400 }
      );
    }

    // Simulate already purchased
    if (body.leadId === 'lead_already_purchased') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_PURCHASED',
            message: 'Lead já foi comprado anteriormente',
            details: {
              purchaseDate: '2025-09-15T10:30:00.000Z',
              accessId: 'access_123'
            }
          }
        },
        { status: 400 }
      );
    }

    // Success response
    return HttpResponse.json(
      {
        success: true,
        data: {
          accessId: 'access_456',
          leadId: body.leadId,
          empresaId: 'company_123',
          custoPagoCentavos: 1000,
          tipoAcesso: 'comprado',
          lead: {
            id: body.leadId,
            empresaNome: 'Empresa Exemplo LTDA',
            segmento: 'Tecnologia',
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 98765-4321', // Unmasked
            email: 'contato@empresa.com', // Unmasked
            custoCreditosCentavos: 1000
          },
          novoSaldo: 49000,
          dataHora: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: POST /api/v1/credits/purchase-lead', () => {
  it('should purchase lead successfully with valid request', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_123',
        empresaId: 'company_123'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const purchase = body.data;
    expect(purchase).toHaveProperty('accessId');
    expect(purchase).toHaveProperty('leadId');
    expect(purchase).toHaveProperty('custoPagoCentavos');
    expect(purchase).toHaveProperty('lead');
    expect(purchase).toHaveProperty('novoSaldo');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadId: 'lead_123'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should validate required leadId', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(body.error.message).toContain('leadId');
  });

  it('should return error for insufficient balance', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_insufficient_balance'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'INSUFFICIENT_BALANCE');
    expect(body.error).toHaveProperty('details');
    expect(body.error.details).toHaveProperty('required');
    expect(body.error.details).toHaveProperty('available');
  });

  it('should prevent duplicate purchase', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_already_purchased'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'ALREADY_PURCHASED');
    expect(body.error).toHaveProperty('details');
    expect(body.error.details).toHaveProperty('purchaseDate');
    expect(body.error.details).toHaveProperty('accessId');
  });

  it('should return unmasked lead data after purchase', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_123'
      })
    });

    const body = await response.json();
    const lead = body.data.lead;

    // Should have full unmasked data
    expect(lead).toHaveProperty('telefone');
    expect(lead).toHaveProperty('email');
    expect(lead.telefone).not.toContain('*');
    expect(lead.email).not.toContain('*');
    expect(lead.email).toContain('@');
  });

  it('should debit credits and return new balance', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_123'
      })
    });

    const body = await response.json();
    const purchase = body.data;

    expect(purchase).toHaveProperty('custoPagoCentavos');
    expect(typeof purchase.custoPagoCentavos).toBe('number');
    expect(purchase.custoPagoCentavos).toBeGreaterThan(0);
    
    expect(purchase).toHaveProperty('novoSaldo');
    expect(typeof purchase.novoSaldo).toBe('number');
    expect(purchase.novoSaldo).toBeGreaterThanOrEqual(0);
  });

  it('should include access type information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_123'
      })
    });

    const body = await response.json();
    const purchase = body.data;

    expect(purchase).toHaveProperty('tipoAcesso');
    expect(['comprado', 'trial', 'bonus']).toContain(purchase.tipoAcesso);
  });

  it('should include timestamp of purchase', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/purchase-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        leadId: 'lead_123'
      })
    });

    const body = await response.json();
    const purchase = body.data;

    expect(purchase).toHaveProperty('dataHora');
    expect(new Date(purchase.dataHora).toISOString()).toBe(purchase.dataHora);
  });
});
