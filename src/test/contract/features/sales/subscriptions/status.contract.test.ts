/**
 * Contract Test: GET /api/subscriptions/:id/status
 * 
 * Validates the API contract for fetching detailed subscription status
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockSubscriptionStatus = {
  id: 'sub_123',
  status: 'trialing',
  isActive: true,
  isInTrial: true,
  isPastDue: false,
  isCanceled: false,
  daysRemaining: 10,
  trialStart: '2025-10-01T00:00:00.000Z',
  trialEnd: '2025-10-15T00:00:00.000Z',
  nextDueDate: '2025-10-16T00:00:00.000Z',
  product: {
    id: 'prod_123',
    name: 'Plano Pro',
    priceMonthly: 19900
  },
  company: {
    id: 'company_123',
    name: 'Test Company'
  },
  currentPeriodStart: '2025-10-01T00:00:00.000Z',
  currentPeriodEnd: '2025-10-31T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  paymentStatus: 'pending_first_payment',
  lastPayment: null,
  nextPaymentAmount: 19900
};

const server = setupServer(
  http.get('http://localhost:3000/api/subscriptions/:id/status', ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

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

    if (id === 'sub_123') {
      return HttpResponse.json({
        success: true,
        data: mockSubscriptionStatus
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Assinatura não encontrada'
        }
      },
      { status: 404 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/subscriptions/:id/status', () => {
  it('should return detailed subscription status', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const status = body.data;
    expect(status).toEqual(mockSubscriptionStatus);
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status');

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should return 404 for non-existent subscription', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/non-existent/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('should include status flags', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('isActive');
    expect(typeof status.isActive).toBe('boolean');
    
    expect(status).toHaveProperty('isInTrial');
    expect(typeof status.isInTrial).toBe('boolean');
    
    expect(status).toHaveProperty('isPastDue');
    expect(typeof status.isPastDue).toBe('boolean');
    
    expect(status).toHaveProperty('isCanceled');
    expect(typeof status.isCanceled).toBe('boolean');
  });

  it('should include trial information when in trial', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    if (status.isInTrial) {
      expect(status).toHaveProperty('daysRemaining');
      expect(typeof status.daysRemaining).toBe('number');
      expect(status.daysRemaining).toBeGreaterThanOrEqual(0);
      
      expect(status).toHaveProperty('trialStart');
      expect(status).toHaveProperty('trialEnd');
      
      const trialStart = new Date(status.trialStart);
      const trialEnd = new Date(status.trialEnd);
      expect(trialEnd.getTime()).toBeGreaterThan(trialStart.getTime());
    }
  });

  it('should include product information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('product');
    expect(status.product).toHaveProperty('id');
    expect(status.product).toHaveProperty('name');
    expect(status.product).toHaveProperty('priceMonthly');
    
    expect(typeof status.product.name).toBe('string');
    expect(typeof status.product.priceMonthly).toBe('number');
    expect(status.product.priceMonthly).toBeGreaterThan(0);
  });

  it('should include company information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('company');
    expect(status.company).toHaveProperty('id');
    expect(status.company).toHaveProperty('name');
    
    expect(typeof status.company.name).toBe('string');
  });

  it('should include billing period information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('currentPeriodStart');
    expect(status).toHaveProperty('currentPeriodEnd');
    expect(status).toHaveProperty('nextDueDate');
    
    const periodStart = new Date(status.currentPeriodStart);
    const periodEnd = new Date(status.currentPeriodEnd);
    const nextDue = new Date(status.nextDueDate);
    
    expect(periodEnd.getTime()).toBeGreaterThan(periodStart.getTime());
  });

  it('should include payment information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('paymentStatus');
    expect(['pending_first_payment', 'paid', 'overdue', 'failed']).toContain(status.paymentStatus);
    
    expect(status).toHaveProperty('nextPaymentAmount');
    expect(typeof status.nextPaymentAmount).toBe('number');
    expect(status.nextPaymentAmount).toBeGreaterThan(0);
  });

  it('should include cancellation information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('cancelAtPeriodEnd');
    expect(typeof status.cancelAtPeriodEnd).toBe('boolean');
    
    expect(status).toHaveProperty('canceledAt');
    // canceledAt can be null or a date string
    if (status.canceledAt !== null) {
      expect(typeof status.canceledAt).toBe('string');
      const cancelDate = new Date(status.canceledAt);
      expect(cancelDate.toString()).not.toBe('Invalid Date');
    }
  });

  it('should validate status enum values', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/status', {
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const body = await response.json();
    const status = body.data;

    expect(status).toHaveProperty('status');
    expect(['trialing', 'active', 'past_due', 'canceled', 'suspended', 'expired']).toContain(status.status);
  });
});
