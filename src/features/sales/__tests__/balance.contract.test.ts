/**
 * Contract Test: GET /api/v1/credits/balance
 * 
 * Validates the API contract for credit balance retrieval
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockCreditBalance = {
  empresaId: 'company_123',
  saldoAtual: 70000, // R$ 700,00 em centavos de crédito (100k + 5k - 45k + 10k)
  totalComprado: 100000,
  totalGasto: 45000,
  totalBonus: 5000,
  totalReembolsado: 10000,
  ultimaTransacao: {
    id: 'trans_123',
    tipo: 'compra',
    quantidade: 20000,
    descricao: 'Pacote Premium - 200 créditos',
    dataHora: '2025-10-01T10:30:00.000Z'
  },
  estatisticas: {
    leadsComprados: 45,
    creditoMedioPorLead: 1000,
    leadsEstimados: 70 // quantos leads podem comprar com saldo atual (70000 / 1000)
  }
};

const server = setupServer(
  http.get('http://localhost:3000/api/v1/credits/balance', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const url = new URL(request.url);
    const empresaId = url.searchParams.get('empresaId');

    // Check authentication
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

    // Check empresaId parameter
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

    // Success response
    return HttpResponse.json({
      success: true,
      data: mockCreditBalance
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/v1/credits/balance', () => {
  it('should return credit balance with correct schema', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const balance = body.data;
    expect(balance).toHaveProperty('empresaId');
    expect(balance).toHaveProperty('saldoAtual');
    expect(balance).toHaveProperty('totalComprado');
    expect(balance).toHaveProperty('totalGasto');
    expect(balance).toHaveProperty('totalBonus');
    expect(balance).toHaveProperty('totalReembolsado');
    expect(balance).toHaveProperty('ultimaTransacao');
    expect(balance).toHaveProperty('estatisticas');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123');

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should require empresaId parameter', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should include current balance in centavos', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const balance = body.data;

    expect(typeof balance.saldoAtual).toBe('number');
    expect(balance.saldoAtual).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(balance.saldoAtual)).toBe(true);
  });

  it('should include transaction totals', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const balance = body.data;

    expect(typeof balance.totalComprado).toBe('number');
    expect(typeof balance.totalGasto).toBe('number');
    expect(typeof balance.totalBonus).toBe('number');
    expect(typeof balance.totalReembolsado).toBe('number');

    // All should be non-negative
    expect(balance.totalComprado).toBeGreaterThanOrEqual(0);
    expect(balance.totalGasto).toBeGreaterThanOrEqual(0);
    expect(balance.totalBonus).toBeGreaterThanOrEqual(0);
    expect(balance.totalReembolsado).toBeGreaterThanOrEqual(0);
  });

  it('should include last transaction details', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const transaction = body.data.ultimaTransacao;

    if (transaction) {
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('tipo');
      expect(transaction).toHaveProperty('quantidade');
      expect(transaction).toHaveProperty('descricao');
      expect(transaction).toHaveProperty('dataHora');

      expect(['compra', 'uso', 'bonus', 'reembolso']).toContain(transaction.tipo);
      expect(typeof transaction.quantidade).toBe('number');
    }
  });

  it('should include usage statistics', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const stats = body.data.estatisticas;

    expect(stats).toHaveProperty('leadsComprados');
    expect(stats).toHaveProperty('creditoMedioPorLead');
    expect(stats).toHaveProperty('leadsEstimados');

    expect(typeof stats.leadsComprados).toBe('number');
    expect(typeof stats.creditoMedioPorLead).toBe('number');
    expect(typeof stats.leadsEstimados).toBe('number');

    expect(stats.leadsComprados).toBeGreaterThanOrEqual(0);
    expect(stats.leadsEstimados).toBeGreaterThanOrEqual(0);
  });

  it('should calculate balance correctly from totals', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const balance = body.data;

    // saldoAtual should equal: totalComprado + totalBonus - totalGasto + totalReembolsado
    const expectedBalance = balance.totalComprado + balance.totalBonus - balance.totalGasto + balance.totalReembolsado;
    
    expect(balance.saldoAtual).toBe(expectedBalance);
  });

  it('should calculate estimated leads from current balance', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/balance?empresaId=company_123', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const balance = body.data;

    // If we have average cost per lead, we can estimate
    if (balance.estatisticas.creditoMedioPorLead > 0) {
      const estimatedLeads = Math.floor(balance.saldoAtual / balance.estatisticas.creditoMedioPorLead);
      expect(balance.estatisticas.leadsEstimados).toBe(estimatedLeads);
    }
  });
});
