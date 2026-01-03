/**
 * API Contract Tests: Activities
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const RAW_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_BASE_URL.endsWith('/api/v1') ? RAW_BASE_URL : `${RAW_BASE_URL}/api/v1`;

const activitySchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  tipo: z.enum(['call', 'meeting', 'email', 'note']),
  descricao: z.string(),
  data_hora: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
});

describe('Activities API Contract', () => {
  let authToken: string;
  let customerId: string | null = null;
  let activityId: string | null = null;

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
      throw new Error('Nenhum cliente disponivel para criar atividade');
    }
    return customerId;
  }

  it('POST /customers/{customerId}/activities cria atividade', async () => {
    const id = await ensureCustomerId();
    const payload = {
      tipo: 'call',
      descricao: 'Ligacao de acompanhamento',
      data_hora: new Date().toISOString(),
    };

    const response = await fetch(`${API_BASE_URL}/customers/${id}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    const parsed = activitySchema.parse(data.data ?? data);
    activityId = parsed.id;
  });

  it('GET /customers/{customerId}/activities lista atividades', async () => {
    const id = await ensureCustomerId();
    const response = await fetch(`${API_BASE_URL}/customers/${id}/activities`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    const payload = data.data ?? data;
    z.array(activitySchema).parse(payload);
  });

  it('PATCH /activities/{id} atualiza atividade', async () => {
    if (!activityId) {
      throw new Error('Atividade nao foi criada');
    }

    const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ descricao: 'Ligacao atualizada' }),
    });

    expect(response.status).toBe(200);
  });

  it('DELETE /activities/{id} remove atividade', async () => {
    if (!activityId) {
      throw new Error('Atividade nao foi criada');
    }

    const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect([200, 204]).toContain(response.status);
  });
});
