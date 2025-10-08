/**
 * Shared MSW Handlers for Sales Contract Tests
 * 
 * Centralized request handlers to avoid multiple server instances
 */

import { http, HttpResponse } from 'msw';

// Mock Products
export const mockProducts = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Plano Básico',
    priceMonthly: 4900,
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
    priceMonthly: 19900,
    billingCycle: 'MONTHLY',
    features: ['10.000 leads', '5 usuários', 'Relatórios avançados'],
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
  }
];

// Sales API Handlers
export const salesHandlers = [
  // GET /api/products
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
  }),

  // GET /api/products/:id
  http.get('http://localhost:3000/api/products/:id', ({ params }) => {
    const { id } = params;
    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
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
    }

    return HttpResponse.json({
      success: true,
      data: product
    });
  }),

  // Add more handlers as needed...
];
