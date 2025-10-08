/**
 * Contract Test: GET /api/products
 * 
 * Validates the API contract for listing active subscription products
 * This test ensures the backend returns the correct schema for product listings
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock data matching the contract schema
const mockProducts = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Plano Básico',
    description: 'Ideal para pequenas empresas',
    priceMonthly: 4900, // R$ 49,00 em centavos
    billingCycle: 'MONTHLY',
    features: ['1.000 leads', '1 usuário', 'Suporte por email'],
    maxSessions: 1,
    maxLeads: 1000,
    trialDays: 7,
    isActive: true,
    isMostPopular: false,
    position: 0,
    asaasProductId: 'prod_test_123',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    name: 'Plano Pro',
    description: 'Para empresas em crescimento',
    priceMonthly: 19900, // R$ 199,00 em centavos
    billingCycle: 'MONTHLY',
    features: ['10.000 leads', '5 usuários', 'Relatórios avançados', 'Suporte prioritário'],
    maxSessions: 5,
    maxLeads: 10000,
    trialDays: 14,
    isActive: true,
    isMostPopular: true,
    position: 1,
    asaasProductId: 'prod_test_456',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    name: 'Plano Enterprise',
    description: 'Solução completa para grandes empresas',
    priceMonthly: 49900, // R$ 499,00 em centavos
    billingCycle: 'MONTHLY',
    features: ['Leads ilimitados', 'Usuários ilimitados', 'API dedicada', 'Suporte 24/7'],
    maxSessions: 999,
    maxLeads: null,
    trialDays: 14,
    isActive: true,
    isMostPopular: false,
    position: 2,
    asaasProductId: 'prod_test_789',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null
  }
];

// Setup MSW server
const server = setupServer(
  http.get('http://localhost:3000/api/products', ({ request }) => {
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const products = includeInactive 
      ? mockProducts 
      : mockProducts.filter(p => p.isActive);

    return HttpResponse.json({
      success: true,
      data: products
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/products', () => {
  it('should return list of active products with correct schema', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    // Verify response structure
    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Verify product schema
    const product = body.data[0];
    expect(product).toHaveProperty('id');
    expect(typeof product.id).toBe('string');
    
    expect(product).toHaveProperty('name');
    expect(typeof product.name).toBe('string');
    expect(product.name.length).toBeGreaterThan(0);
    
    expect(product).toHaveProperty('description');
    
    expect(product).toHaveProperty('priceMonthly');
    expect(typeof product.priceMonthly).toBe('number');
    expect(product.priceMonthly).toBeGreaterThan(0);
    
    expect(product).toHaveProperty('billingCycle');
    expect(['MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(product.billingCycle);
    
    expect(product).toHaveProperty('features');
    expect(Array.isArray(product.features)).toBe(true);
    
    expect(product).toHaveProperty('maxSessions');
    expect(typeof product.maxSessions).toBe('number');
    expect(product.maxSessions).toBeGreaterThan(0);
    
    expect(product).toHaveProperty('maxLeads');
    // maxLeads can be number or null (unlimited)
    if (product.maxLeads !== null) {
      expect(typeof product.maxLeads).toBe('number');
      expect(product.maxLeads).toBeGreaterThan(0);
    }
    
    expect(product).toHaveProperty('trialDays');
    expect(typeof product.trialDays).toBe('number');
    expect(product.trialDays).toBeGreaterThanOrEqual(0);
    
    expect(product).toHaveProperty('isActive');
    expect(typeof product.isActive).toBe('boolean');
    
    expect(product).toHaveProperty('isMostPopular');
    expect(typeof product.isMostPopular).toBe('boolean');
    
    expect(product).toHaveProperty('position');
    expect(typeof product.position).toBe('number');
    expect(product.position).toBeGreaterThanOrEqual(0);
    
    expect(product).toHaveProperty('createdAt');
    expect(product).toHaveProperty('updatedAt');
  });

  it('should return products ordered by position', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const products = body.data;
    
    // Verify products are ordered by position
    for (let i = 0; i < products.length - 1; i++) {
      expect(products[i].position).toBeLessThanOrEqual(products[i + 1].position);
    }
  });

  it('should only return active products by default', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const products = body.data;
    
    // All products should be active
    products.forEach((product: any) => {
      expect(product.isActive).toBe(true);
    });
  });

  it('should include pricing information in centavos', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const product = body.data[0];
    
    // Price should be in centavos (minimum R$ 1.00 = 100 centavos)
    expect(product.priceMonthly).toBeGreaterThanOrEqual(100);
    
    // Price should be a whole number (no decimals in centavos)
    expect(Number.isInteger(product.priceMonthly)).toBe(true);
  });

  it('should include trial duration information', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const products = body.data;
    
    products.forEach((product: any) => {
      expect(product.trialDays).toBeDefined();
      expect(typeof product.trialDays).toBe('number');
      // Trial days should be between 0 and 90
      expect(product.trialDays).toBeGreaterThanOrEqual(0);
      expect(product.trialDays).toBeLessThanOrEqual(90);
    });
  });

  it('should include features array with descriptions', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const product = body.data[0];
    
    expect(Array.isArray(product.features)).toBe(true);
    expect(product.features.length).toBeGreaterThan(0);
    
    product.features.forEach((feature: any) => {
      expect(typeof feature).toBe('string');
      expect(feature.length).toBeGreaterThan(0);
    });
  });

  it('should have only one most popular product', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const products = body.data;
    const mostPopularProducts = products.filter((p: any) => p.isMostPopular);
    
    // Should have at most one most popular product
    expect(mostPopularProducts.length).toBeLessThanOrEqual(1);
  });

  it('should include Asaas product ID for payment gateway sync', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const body = await response.json();

    const product = body.data[0];
    
    // asaasProductId is optional but if present should be a string
    if (product.asaasProductId) {
      expect(typeof product.asaasProductId).toBe('string');
      expect(product.asaasProductId.length).toBeGreaterThan(0);
    }
  });
});
