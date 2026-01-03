/**
 * API Contract Tests: Contracts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const RAW_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_BASE_URL.endsWith('/api/v1') ? RAW_BASE_URL : `${RAW_BASE_URL}/api/v1`;

const contractSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  empresa_id: z.string().uuid().optional(),
  numero: z.string(),
  valor: z.number(),
  moeda: z.string().optional(),
  data_inicio: z.string(),
  data_fim: z.string(),
  servicos: z.string(),
  condicoes: z.string().nullable().optional(),
  status: z.enum(['VIGENTE', 'VENCIDO', 'RENOVADO', 'CANCELADO']),
  arquivo_url: z.string().nullable().optional(),
  contrato_anterior_id: z.string().uuid().nullable().optional(),
  days_until_end: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

describe('Contracts API Contract', () => {
  let authToken: string;
  let customerId: string | null = null;
  let contractId: string | null = null;

  beforeAll(async () => {
    authToken = 'mock-token';
  });

  async function ensureCustomerId() {
    if (customerId) return customerId;
    const response = await fetch(`${API_BASE_URL}/customers?limit=1`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await response.json();
    const payload = data.data ?? data;
    customerId = payload[0]?.id ?? null;
    if (!customerId) {
      throw new Error('Nenhum cliente disponivel para criar contrato');
    }
    return customerId;
  }

  it('POST /customers/{customerId}/contracts cria contrato', async () => {
    const id = await ensureCustomerId();
    const payload = {
      numero: 'CTR-2025-TEST-001',
      valor: 12000,
      moeda: 'BRL',
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      servicos: 'Serviço de consultoria anual',
      condicoes: 'Renovação automática',
      status: 'VIGENTE',
    };

    const response = await fetch(`${API_BASE_URL}/customers/${id}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    const parsed = contractSchema.parse(data.data ?? data);
    contractId = parsed.id;
  });

  it('GET /customers/{customerId}/contracts lista contratos', async () => {
    const id = await ensureCustomerId();
    const response = await fetch(`${API_BASE_URL}/customers/${id}/contracts`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    const payload = data.data ?? data;
    z.array(contractSchema).parse(payload);
  });

  it('PATCH /contracts/{id} atualiza contrato', async () => {
    if (!contractId) {
      throw new Error('Contrato nao foi criado');
    }
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ servicos: 'Serviço atualizado', condicoes: 'Novas condições' }),
    });

    expect(response.status).toBe(200);
  });

  it('GET /contracts/near-renewal lista contratos proximos', async () => {
    const response = await fetch(`${API_BASE_URL}/contracts/near-renewal`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);
  });

  it('POST /contracts/{id}/renew renova contrato', async () => {
    if (!contractId) {
      throw new Error('Contrato nao foi criado');
    }
    const payload = {
      numero: 'CTR-2026-TEST-001',
      valor: 15000,
      moeda: 'BRL',
      data_inicio: new Date().toISOString(),
      data_fim: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      servicos: 'Serviço de consultoria renovado',
    };
    const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/renew`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(200);
  });
});
