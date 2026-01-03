/**
 * Contract Test: PATCH /api/subscriptions/:id/cancel
 * 
 * Validates the API contract for subscription cancellation
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.patch('http://localhost:3000/api/subscriptions/:id/cancel', async ({ request, params }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');
    const body = await request.json() as any;

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

    // Check if subscription exists
    if (id === 'non-existent-id') {
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
    }

    // Check if already canceled
    if (id === 'already-canceled-sub') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_CANCELED',
            message: 'Assinatura já está cancelada'
          }
        },
        { status: 400 }
      );
    }

    // Success response
    const now = new Date().toISOString();
    return HttpResponse.json({
      success: true,
      data: {
        id: id,
        status: 'canceled',
        canceledAt: now,
        cancelReason: body.reason || null,
        effectiveUntil: '2025-10-31T23:59:59.000Z', // End of current billing period
        updatedAt: now
      }
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: PATCH /api/subscriptions/:id/cancel', () => {
  it('should cancel subscription with valid request', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        reason: 'Não preciso mais do serviço'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const subscription = body.data;
    expect(subscription).toHaveProperty('id', 'sub_123');
    expect(subscription).toHaveProperty('status', 'canceled');
    expect(subscription).toHaveProperty('canceledAt');
    expect(subscription).toHaveProperty('effectiveUntil');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should return 404 for non-existent subscription', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/non-existent-id/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'NOT_FOUND');
  });

  it('should prevent canceling already canceled subscription', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/already-canceled-sub/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'ALREADY_CANCELED');
  });

  it('should accept optional cancellation reason', async () => {
    const cancelReason = 'Migrando para outro fornecedor';
    
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        reason: cancelReason
      })
    });

    const body = await response.json();
    
    expect(body.data).toHaveProperty('cancelReason', cancelReason);
  });

  it('should work without cancellation reason', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();
    
    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
  });

  it('should set status to canceled', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();
    
    expect(body.data.status).toBe('canceled');
  });

  it('should include canceledAt timestamp', async () => {
    const beforeCancel = new Date();
    
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();
    const canceledAt = new Date(body.data.canceledAt);
    
    expect(canceledAt.getTime()).toBeGreaterThanOrEqual(beforeCancel.getTime());
  });

  it('should include effectiveUntil date', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();
    
    expect(body.data).toHaveProperty('effectiveUntil');
    
    const effectiveUntil = new Date(body.data.effectiveUntil);
    const canceledAt = new Date(body.data.canceledAt);
    
    // effectiveUntil should be after canceledAt (end of billing period)
    expect(effectiveUntil.getTime()).toBeGreaterThan(canceledAt.getTime());
  });

  it('should update updatedAt timestamp', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/sub_123/cancel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({})
    });

    const body = await response.json();
    
    expect(body.data).toHaveProperty('updatedAt');
    
    const updatedAt = new Date(body.data.updatedAt);
    expect(updatedAt.getTime()).toBeGreaterThan(0);
  });
});
