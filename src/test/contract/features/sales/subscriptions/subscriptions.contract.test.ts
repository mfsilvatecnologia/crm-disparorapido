/**
 * Contract Test: GET /api/subscriptions/current
 * 
 * Validates the API contract for fetching current subscription status
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockSubscription = {
  id: 'sub_123',
  companyId: 'company_123',
  productId: 'product_456',
  status: 'trialing',
  trialStart: '2025-10-01T00:00:00.000Z',
  trialEnd: '2025-10-15T00:00:00.000Z',
  nextDueDate: '2025-10-16T00:00:00.000Z',
  amount: 19900, // R$ 199,00 em centavos
  billingCycle: 'MONTHLY',
  asaasSubscriptionId: 'asaas_sub_789',
  product: {
    id: 'product_456',
    name: 'Plano Pro',
    priceMonthly: 19900,
    features: ['10.000 leads', '5 usuários', 'Relatórios avançados'],
    maxSessions: 5,
    maxLeads: 10000
  },
  paymentHistory: [
    {
      id: 'payment_001',
      amount: 19900,
      status: 'pending',
      dueDate: '2025-10-16T00:00:00.000Z',
      createdAt: '2025-10-01T00:00:00.000Z'
    }
  ],
  createdAt: '2025-10-01T00:00:00.000Z',
  updatedAt: '2025-10-01T00:00:00.000Z'
};

const server = setupServer(
  http.get('http://localhost:3000/api/subscriptions/current', ({ request }) => {
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

    return HttpResponse.json({
      success: true,
      data: mockSubscription
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/subscriptions/current', () => {
  it('should return current subscription with complete details', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const subscription = body.data;
    expect(subscription).toHaveProperty('id');
    expect(subscription).toHaveProperty('companyId');
    expect(subscription).toHaveProperty('productId');
    expect(subscription).toHaveProperty('status');
    expect(subscription).toHaveProperty('amount');
    expect(subscription).toHaveProperty('billingCycle');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current');
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should include subscription status', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription.status).toBeDefined();
    expect(['trialing', 'active', 'past_due', 'canceled', 'suspended', 'expired']).toContain(subscription.status);
  });

  it('should include trial dates when in trial period', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    if (subscription.status === 'trialing') {
      expect(subscription).toHaveProperty('trialStart');
      expect(subscription).toHaveProperty('trialEnd');
      
      const trialStart = new Date(subscription.trialStart);
      const trialEnd = new Date(subscription.trialEnd);
      
      expect(trialEnd.getTime()).toBeGreaterThan(trialStart.getTime());
    }
  });

  it('should include next due date', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('nextDueDate');
    
    const nextDueDate = new Date(subscription.nextDueDate);
    expect(nextDueDate.getTime()).toBeGreaterThan(0);
  });

  it('should include product details', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('product');
    expect(subscription.product).toHaveProperty('id');
    expect(subscription.product).toHaveProperty('name');
    expect(subscription.product).toHaveProperty('priceMonthly');
    expect(subscription.product).toHaveProperty('features');
    expect(Array.isArray(subscription.product.features)).toBe(true);
  });

  it('should include payment history', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('paymentHistory');
    expect(Array.isArray(subscription.paymentHistory)).toBe(true);
    
    if (subscription.paymentHistory.length > 0) {
      const payment = subscription.paymentHistory[0];
      expect(payment).toHaveProperty('id');
      expect(payment).toHaveProperty('amount');
      expect(payment).toHaveProperty('status');
      expect(payment).toHaveProperty('dueDate');
      expect(['pending', 'confirmed', 'received', 'overdue', 'refunded']).toContain(payment.status);
    }
  });

  it('should include billing information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('amount');
    expect(typeof subscription.amount).toBe('number');
    expect(subscription.amount).toBeGreaterThan(0);
    
    expect(subscription).toHaveProperty('billingCycle');
    expect(['MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(subscription.billingCycle);
  });

  it('should include Asaas subscription ID', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('asaasSubscriptionId');
    expect(typeof subscription.asaasSubscriptionId).toBe('string');
    expect(subscription.asaasSubscriptionId.length).toBeGreaterThan(0);
  });

  it('should include timestamps', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/current', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const subscription = body.data;

    expect(subscription).toHaveProperty('createdAt');
    expect(subscription).toHaveProperty('updatedAt');
    
    const createdAt = new Date(subscription.createdAt);
    const updatedAt = new Date(subscription.updatedAt);
    
    expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
  });
});
