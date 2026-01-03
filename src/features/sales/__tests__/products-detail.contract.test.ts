/**
 * Contract Test: GET /api/products/:id
 * 
 * Validates the API contract for fetching a single product by ID
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockProduct = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Plano Pro',
  description: 'Para empresas em crescimento com necessidades avançadas',
  priceMonthly: 19900,
  billingCycle: 'MONTHLY',
  features: [
    '10.000 leads por mês',
    '5 usuários simultâneos',
    'Relatórios avançados',
    'Suporte prioritário',
    'Exportação de dados',
    'API de integração'
  ],
  maxSessions: 5,
  maxLeads: 10000,
  trialDays: 14,
  isActive: true,
  isMostPopular: true,
  position: 1,
  asaasProductId: 'prod_test_456',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-15T10:30:00.000Z',
  deletedAt: null
};

const server = setupServer(
  http.get('http://localhost:3000/api/products/:id', ({ params }) => {
    const { id } = params;
    
    if (id === '123e4567-e89b-12d3-a456-426614174000') {
      return HttpResponse.json({
        success: true,
        data: mockProduct
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Produto não encontrado'
        }
      },
      { status: 404 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/products/:id', () => {
  it('should return single product with complete details', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const product = body.data;
    expect(product).toEqual(mockProduct);
  });

  it('should include all required product fields', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();
    const product = body.data;

    // Required fields
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('priceMonthly');
    expect(product).toHaveProperty('billingCycle');
    expect(product).toHaveProperty('features');
    expect(product).toHaveProperty('maxSessions');
    expect(product).toHaveProperty('trialDays');
    expect(product).toHaveProperty('isActive');
    expect(product).toHaveProperty('isMostPopular');
    expect(product).toHaveProperty('position');
    expect(product).toHaveProperty('createdAt');
    expect(product).toHaveProperty('updatedAt');
  });

  it('should return 404 for non-existent product', async () => {
    const response = await fetch('http://localhost:3000/api/products/non-existent-id');
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('success', false);
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
    expect(body.error).toHaveProperty('message');
  });

  it('should include detailed features list', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();
    const product = body.data;

    expect(Array.isArray(product.features)).toBe(true);
    expect(product.features.length).toBeGreaterThan(3); // More detailed for single product
    
    product.features.forEach((feature: string) => {
      expect(typeof feature).toBe('string');
      expect(feature.length).toBeGreaterThan(0);
    });
  });

  it('should include pricing and billing information', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();
    const product = body.data;

    expect(product.priceMonthly).toBe(19900);
    expect(product.billingCycle).toBe('MONTHLY');
    expect(['MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(product.billingCycle);
  });

  it('should include trial configuration', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();
    const product = body.data;

    expect(product.trialDays).toBe(14);
    expect(product.trialDays).toBeGreaterThanOrEqual(0);
    expect(product.trialDays).toBeLessThanOrEqual(90);
  });

  it('should include usage limits', async () => {
    const response = await fetch('http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000');
    const body = await response.json();
    const product = body.data;

    expect(product.maxSessions).toBe(5);
    expect(product.maxLeads).toBe(10000);
    
    expect(typeof product.maxSessions).toBe('number');
    expect(product.maxSessions).toBeGreaterThan(0);
    
    // maxLeads can be null for unlimited
    if (product.maxLeads !== null) {
      expect(typeof product.maxLeads).toBe('number');
      expect(product.maxLeads).toBeGreaterThan(0);
    }
  });
});
