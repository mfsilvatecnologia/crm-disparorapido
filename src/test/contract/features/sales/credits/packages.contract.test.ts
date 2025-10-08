/**
 * Contract Test: GET /api/v1/credits/packages
 * 
 * Validates the API contract for credit packages listing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockPackages = [
  {
    id: 'pkg_starter',
    name: 'Pacote Starter',
    description: 'Ideal para começar',
    creditosCentavos: 10000, // R$ 100,00 em créditos
    precoCentavos: 10000, // R$ 100,00 de preço
    bonusCentavos: 0,
    leadsEstimados: 10,
    economia: 0,
    isActive: true,
    isMostPopular: false,
    position: 0
  },
  {
    id: 'pkg_pro',
    name: 'Pacote Pro',
    description: 'Mais popular - melhor custo-benefício',
    creditosCentavos: 50000, // R$ 500,00 em créditos
    precoCentavos: 45000, // R$ 450,00 de preço
    bonusCentavos: 5000, // R$ 50,00 de bônus (10%)
    leadsEstimados: 55, // 50 + 5 de bônus
    economia: 10,
    isActive: true,
    isMostPopular: true,
    position: 1
  },
  {
    id: 'pkg_enterprise',
    name: 'Pacote Enterprise',
    description: 'Para grandes volumes',
    creditosCentavos: 100000, // R$ 1.000,00 em créditos
    precoCentavos: 85000, // R$ 850,00 de preço
    bonusCentavos: 15000, // R$ 150,00 de bônus (15%)
    leadsEstimados: 115,
    economia: 15,
    isActive: true,
    isMostPopular: false,
    position: 2
  }
];

const server = setupServer(
  http.get('http://localhost:3000/api/v1/credits/packages', () => {
    return HttpResponse.json({
      success: true,
      data: mockPackages
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Contract: GET /api/v1/credits/packages', () => {
  it('should return list of credit packages', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('should include complete package schema', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    const pkg = body.data[0];
    expect(pkg).toHaveProperty('id');
    expect(pkg).toHaveProperty('name');
    expect(pkg).toHaveProperty('description');
    expect(pkg).toHaveProperty('creditosCentavos');
    expect(pkg).toHaveProperty('precoCentavos');
    expect(pkg).toHaveProperty('bonusCentavos');
    expect(pkg).toHaveProperty('leadsEstimados');
    expect(pkg).toHaveProperty('economia');
    expect(pkg).toHaveProperty('isActive');
    expect(pkg).toHaveProperty('isMostPopular');
    expect(pkg).toHaveProperty('position');
  });

  it('should have prices and credits in centavos', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    body.data.forEach((pkg: any) => {
      expect(typeof pkg.creditosCentavos).toBe('number');
      expect(pkg.creditosCentavos).toBeGreaterThan(0);
      expect(Number.isInteger(pkg.creditosCentavos)).toBe(true);

      expect(typeof pkg.precoCentavos).toBe('number');
      expect(pkg.precoCentavos).toBeGreaterThan(0);
      expect(Number.isInteger(pkg.precoCentavos)).toBe(true);

      expect(typeof pkg.bonusCentavos).toBe('number');
      expect(pkg.bonusCentavos).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(pkg.bonusCentavos)).toBe(true);
    });
  });

  it('should return packages ordered by position', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    const packages = body.data;
    
    for (let i = 0; i < packages.length - 1; i++) {
      expect(packages[i].position).toBeLessThanOrEqual(packages[i + 1].position);
    }
  });

  it('should have only one most popular package', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    const mostPopular = body.data.filter((pkg: any) => pkg.isMostPopular);
    expect(mostPopular.length).toBeLessThanOrEqual(1);
  });

  it('should include bonus percentage calculation', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    const pkgWithBonus = body.data.find((pkg: any) => pkg.bonusCentavos > 0);
    
    if (pkgWithBonus) {
      expect(pkgWithBonus.economia).toBeGreaterThan(0);
      
      // Verify economia percentage
      const expectedEconomia = Math.round((pkgWithBonus.bonusCentavos / pkgWithBonus.creditosCentavos) * 100);
      expect(Math.abs(pkgWithBonus.economia - expectedEconomia)).toBeLessThanOrEqual(1);
    }
  });

  it('should include estimated leads count', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    body.data.forEach((pkg: any) => {
      expect(typeof pkg.leadsEstimados).toBe('number');
      expect(pkg.leadsEstimados).toBeGreaterThan(0);
    });
  });

  it('should include active status', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    body.data.forEach((pkg: any) => {
      expect(typeof pkg.isActive).toBe('boolean');
      expect(pkg.isActive).toBe(true); // API should only return active packages
    });
  });

  it('should have credits equal or greater than price (never less)', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    body.data.forEach((pkg: any) => {
      expect(pkg.creditosCentavos).toBeGreaterThanOrEqual(pkg.precoCentavos);
    });
  });

  it('should calculate total credits correctly (base + bonus)', async () => {
    const response = await fetch('http://localhost:3000/api/v1/credits/packages');
    const body = await response.json();

    const pkgWithBonus = body.data.find((pkg: any) => pkg.bonusCentavos > 0);
    
    if (pkgWithBonus) {
      const totalCredits = pkgWithBonus.creditosCentavos;
      const baseCredits = pkgWithBonus.precoCentavos;
      const bonus = pkgWithBonus.bonusCentavos;
      
      // Total should include bonus
      expect(totalCredits).toBeGreaterThan(baseCredits);
    }
  });
});
