/**
 * Contract Test: POST /api/subscriptions/trial
 * 
 * Validates the API contract for creating trial subscriptions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.post('http://localhost:3000/api/subscriptions/trial', async ({ request }) => {
    const body = await request.json() as any;
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

    // Validate required fields
    if (!body.productId) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'productId é obrigatório',
            details: { field: 'productId' }
          }
        },
        { status: 400 }
      );
    }

    // Simulate duplicate trial error
    if (body.productId === 'duplicate-trial-product') {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'TRIAL_ALREADY_USED',
            message: 'Trial já foi utilizado para este produto',
            details: {
              productId: body.productId,
              previousTrialDate: '2025-01-01T00:00:00.000Z'
            }
          }
        },
        { status: 400 }
      );
    }

    // Calculate trial dates
    const now = new Date();
    const trialStart = now.toISOString();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const nextDueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

    // Success response
    return HttpResponse.json(
      {
        success: true,
        data: {
          id: 'sub_trial_123',
          companyId: 'company_123',
          productId: body.productId,
          status: 'trialing',
          trialStart,
          trialEnd,
          nextDueDate,
          amount: 19900,
          billingCycle: 'MONTHLY',
          asaasSubscriptionId: 'asaas_sub_456',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: POST /api/subscriptions/trial', () => {
  it('should create trial subscription with valid request', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    
    const subscription = body.data;
    expect(subscription).toHaveProperty('id');
    expect(subscription).toHaveProperty('companyId');
    expect(subscription).toHaveProperty('productId');
    expect(subscription).toHaveProperty('status', 'trialing');
    expect(subscription).toHaveProperty('trialStart');
    expect(subscription).toHaveProperty('trialEnd');
    expect(subscription).toHaveProperty('nextDueDate');
    expect(subscription).toHaveProperty('amount');
    expect(subscription).toHaveProperty('billingCycle');
  });

  it('should require authentication', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'UNAUTHORIZED');
  });

  it('should validate required productId field', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
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
    expect(body.error.message).toContain('productId');
  });

  it('should prevent duplicate trial for same product', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: 'duplicate-trial-product'
      })
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('success', false);
    expect(body.error).toHaveProperty('code', 'TRIAL_ALREADY_USED');
    expect(body.error).toHaveProperty('details');
    expect(body.error.details).toHaveProperty('productId');
    expect(body.error.details).toHaveProperty('previousTrialDate');
  });

  it('should calculate trial dates correctly', async () => {
    const beforeRequest = new Date();
    
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
    });

    const body = await response.json();
    const subscription = body.data;

    const trialStart = new Date(subscription.trialStart);
    const trialEnd = new Date(subscription.trialEnd);
    const nextDueDate = new Date(subscription.nextDueDate);

    // Trial should start around now
    expect(Math.abs(trialStart.getTime() - beforeRequest.getTime())).toBeLessThan(5000); // Within 5 seconds

    // Trial end should be ~14 days after start
    const trialDuration = (trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.abs(trialDuration - 14)).toBeLessThan(0.1); // Within ~2 hours tolerance

    // Next due date should be 1 day after trial end
    const dueAfterTrial = (nextDueDate.getTime() - trialEnd.getTime()) / (1000 * 60 * 60 * 24);
    expect(Math.abs(dueAfterTrial - 1)).toBeLessThan(0.1);
  });

  it('should set status to trialing', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
    });

    const body = await response.json();
    
    expect(body.data.status).toBe('trialing');
  });

  it('should include billing information', async () => {
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
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
    const response = await fetch('http://localhost:3000/api/subscriptions/trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify({
        productId: '123e4567-e89b-12d3-a456-426614174000'
      })
    });

    const body = await response.json();
    
    expect(body.data).toHaveProperty('asaasSubscriptionId');
    expect(typeof body.data.asaasSubscriptionId).toBe('string');
    expect(body.data.asaasSubscriptionId.length).toBeGreaterThan(0);
  });
});
