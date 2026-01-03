/**
 * API Contract Tests: Customers
 *
 * Validates backend responses expected by the CRM frontend.
 * Execute with `npm run test:contract` (see vitest.config.contract.ts).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const RAW_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_BASE_URL.endsWith('/api/v1') ? RAW_BASE_URL : `${RAW_BASE_URL}/api/v1`;

const customerSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  cnpj: z.string().nullable(),
  segmento: z.string().nullable(),
  status: z.enum(['ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO']),
  endereco: z.string().nullable(),
  telefone: z.string().nullable(),
  email: z.string().nullable(),
  notas: z.string().nullable(),
  health_score: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const customersResponseSchema = z.object({
  data: z.array(customerSchema),
  nextCursor: z.string().nullable(),
  total: z.number().int(),
});

const timelineEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
});

const healthScoreSchema = z.object({
  score: z.number(),
  factors: z.object({
    engagement: z.number(),
    contractValue: z.number(),
    activityRecency: z.number(),
  }),
  status: z.enum(['healthy', 'at_risk', 'critical', 'insufficient_data']),
});

describe('Customers API Contract', () => {
  let authToken: string;
  let existingCustomerId: string | null = null;

  beforeAll(async () => {
    // TODO: Autenticar e obter token
    authToken = 'mock-token';
  });

  describe('GET /customers', () => {
    it('deve retornar lista de clientes com paginação', async () => {
      const response = await fetch(`${API_BASE_URL}/customers?limit=20`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      const parsed = customersResponseSchema.parse(data);
      existingCustomerId = parsed.data[0]?.id ?? null;
    });
  });

  describe('GET /customers/{id}', () => {
    it('deve retornar detalhes de um cliente', async () => {
      if (!existingCustomerId) {
        throw new Error('Nenhum cliente disponível para teste');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${existingCustomerId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      const payload = data.data ?? data;
      customerSchema.parse(payload);
    });
  });

  describe('PATCH /customers/{id}', () => {
    it('deve atualizar dados do cliente', async () => {
      if (!existingCustomerId) {
        throw new Error('Nenhum cliente disponível para teste');
      }

      const payload = { telefone: '+55 11 99999-0000' };

      const response = await fetch(`${API_BASE_URL}/customers/${existingCustomerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /customers/{id}/status', () => {
    it('deve atualizar status do cliente', async () => {
      if (!existingCustomerId) {
        throw new Error('Nenhum cliente disponível para teste');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${existingCustomerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: 'EmRisco' }),
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /customers/{id}/timeline', () => {
    it('deve retornar timeline do cliente', async () => {
      if (!existingCustomerId) {
        throw new Error('Nenhum cliente disponível para teste');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${existingCustomerId}/timeline`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      const payload = data.data ?? data;
      z.array(timelineEventSchema).parse(payload);
    });
  });

  describe('GET /customers/{id}/health-score', () => {
    it('deve retornar health score do cliente', async () => {
      if (!existingCustomerId) {
        throw new Error('Nenhum cliente disponível para teste');
      }

      const response = await fetch(`${API_BASE_URL}/customers/${existingCustomerId}/health-score`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      const payload = data.data ?? data;
      healthScoreSchema.parse(payload);
    });
  });
});
