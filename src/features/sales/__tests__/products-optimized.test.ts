/**
 * Contract Test: GET /api/products (Optimized)
 * 
 * Uses shared MSW server from setup-node.ts instead of creating a new one
 */

import { describe, it, expect } from 'vitest';

describe('Contract: GET /api/products', () => {
  it('should return list of active products with correct schema', async () => {
    const response = await fetch('http://localhost:3000/api/v1/products');
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
    
    expect(product).toHaveProperty('priceMonthly');
    expect(typeof product.priceMonthly).toBe('number');
    expect(product.priceMonthly).toBeGreaterThan(0);
    
    expect(product).toHaveProperty('billingCycle');
    expect(['MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(product.billingCycle);
    
    expect(product).toHaveProperty('features');
    expect(Array.isArray(product.features)).toBe(true);
    
    expect(product).toHaveProperty('maxSessions');
    expect(typeof product.maxSessions).toBe('number');
    
    expect(product).toHaveProperty('trialDays');
    expect(typeof product.trialDays).toBe('number');
    
    expect(product).toHaveProperty('isActive');
    expect(typeof product.isActive).toBe('boolean');
  });

  it('should return products ordered by position', async () => {
    const response = await fetch('http://localhost:3000/api/v1/products');
    const body = await response.json();

    const products = body.data;
    
    for (let i = 0; i < products.length - 1; i++) {
      expect(products[i].position).toBeLessThanOrEqual(products[i + 1].position);
    }
  });

  it('should only return active products by default', async () => {
    const response = await fetch('http://localhost:3000/api/v1/products');
    const body = await response.json();

    body.data.forEach((product: any) => {
      expect(product.isActive).toBe(true);
    });
  });
});
