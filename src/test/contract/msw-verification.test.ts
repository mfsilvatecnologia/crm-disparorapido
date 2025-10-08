/**
 * Contract Test: GET /api/products (Simplified)
 * 
 * Validates the API contract for listing active subscription products
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data
const mockProducts = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Plano Básico',
    priceMonthly: 4900,
    billingCycle: 'MONTHLY',
    features: ['1.000 leads', '1 usuário'],
    maxSessions: 1,
    maxLeads: 1000,
    trialDays: 7,
    isActive: true,
    isMostPopular: false,
    position: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null
  }
];

// Setup MSW server with proper cleanup
const server = setupServer(
  http.get('http://localhost:3000/api/products', () => {
    return HttpResponse.json({
      success: true,
      data: mockProducts
    });
  })
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('Contract: GET /api/products (Simplified)', () => {
  it('should return list of products with correct schema', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    
    const product = body.data[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('priceMonthly');
    expect(typeof product.priceMonthly).toBe('number');
  });
});
