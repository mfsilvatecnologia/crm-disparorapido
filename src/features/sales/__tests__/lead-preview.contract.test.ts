/**
 * Contract Test: GET /api/v1/leads/:id/preview
 * 
 * Validates the API contract for lead preview (masked data)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockLeadPreview = {
  id: 'lead_123',
  empresaNome: 'Tech Solutions LTDA',
  segmento: 'Tecnologia',
  cidade: 'São Paulo',
  estado: 'SP',
  telefone: '(11) 9****-****', // Masked
  email: 'c******@*****.com', // Masked
  custoCreditosCentavos: 1000,
  statusMarketplace: 'publico',
  descricao: 'Empresa de desenvolvimento de software',
  tamanho: 'Médio Porte',
  anoFundacao: 2015
};

const server = setupServer(
  http.get('http://localhost:3000/api/v1/leads/:id/preview', ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

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

    if (id === 'lead_not_found') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead não encontrado'
          }
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockLeadPreview
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/v1/leads/:id/preview', () => {
  it('should return lead preview with masked data', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const lead = body.data;
    expect(lead).toHaveProperty('id');
    expect(lead).toHaveProperty('empresaNome');
    expect(lead).toHaveProperty('telefone');
    expect(lead).toHaveProperty('email');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview');

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should return 404 for non-existent lead', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_not_found/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('should mask phone number in preview', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    expect(lead.telefone).toContain('*');
    // Should maintain phone format
    expect(lead.telefone).toMatch(/\(\d{2}\)\s?\d?\*{4}-\*{4}/);
  });

  it('should mask email in preview', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    expect(lead.email).toContain('*');
    // Should show first char and domain with masking
    expect(lead.email).toMatch(/\w\*+@\*+\.\w+/);
  });

  it('should include basic company information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    expect(lead).toHaveProperty('empresaNome');
    expect(lead).toHaveProperty('segmento');
    expect(lead).toHaveProperty('cidade');
    expect(lead).toHaveProperty('estado');
    
    // These should NOT be masked
    expect(lead.empresaNome).not.toContain('*');
    expect(lead.segmento).not.toContain('*');
  });

  it('should include credit cost', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    expect(lead).toHaveProperty('custoCreditosCentavos');
    expect(typeof lead.custoCreditosCentavos).toBe('number');
    expect(lead.custoCreditosCentavos).toBeGreaterThan(0);
  });

  it('should include marketplace status', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    expect(lead).toHaveProperty('statusMarketplace');
    expect(['publico', 'vendido', 'privado', 'indisponivel'])
      .toContain(lead.statusMarketplace);
  });

  it('should include additional public information', async () => {
    const response = await fetch('http://localhost:3000/api/v1/leads/lead_123/preview', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const lead = body.data;

    // Optional fields that can be shown in preview
    if (lead.descricao) {
      expect(typeof lead.descricao).toBe('string');
    }
    if (lead.tamanho) {
      expect(typeof lead.tamanho).toBe('string');
    }
    if (lead.anoFundacao) {
      expect(typeof lead.anoFundacao).toBe('number');
      expect(lead.anoFundacao).toBeGreaterThan(1900);
      expect(lead.anoFundacao).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });
});
