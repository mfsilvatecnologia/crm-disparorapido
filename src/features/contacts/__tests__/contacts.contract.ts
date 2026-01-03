/**
 * API Contract Tests: Contacts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const RAW_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = RAW_BASE_URL.endsWith('/api/v1') ? RAW_BASE_URL : `${RAW_BASE_URL}/api/v1`;

const contactSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  nome: z.string(),
  email: z.string().email(),
  telefone: z.string().nullable(),
  cargo: z.string().nullable(),
  departamento: z.string().nullable(),
  is_primary: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

describe('Contacts API Contract', () => {
  let authToken: string;
  let customerId: string | null = null;
  let contactId: string | null = null;

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
      throw new Error('Nenhum cliente disponivel para criar contato');
    }
    return customerId;
  }

  it('POST /customers/{customerId}/contacts cria contato', async () => {
    const id = await ensureCustomerId();
    const payload = {
      nome: 'Contato Teste',
      email: 'contato.teste@example.com',
      telefone: '+55 11 99999-0000',
    };

    const response = await fetch(`${API_BASE_URL}/customers/${id}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    const parsed = contactSchema.parse(data.data ?? data);
    contactId = parsed.id;
  });

  it('GET /customers/{customerId}/contacts lista contatos', async () => {
    const id = await ensureCustomerId();
    const response = await fetch(`${API_BASE_URL}/customers/${id}/contacts`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    const payload = data.data ?? data;
    z.array(contactSchema).parse(payload);
  });

  it('PATCH /customers/{customerId}/contacts/{id} atualiza contato', async () => {
    if (!contactId) {
      throw new Error('Contato nao foi criado');
    }
    const id = await ensureCustomerId();

    const response = await fetch(`${API_BASE_URL}/customers/${id}/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ cargo: 'Diretoria' }),
    });

    expect(response.status).toBe(200);
  });

  it('POST /customers/{customerId}/contacts/{id}/set-primary define contato principal', async () => {
    if (!contactId) {
      throw new Error('Contato nao foi criado');
    }
    const id = await ensureCustomerId();

    const response = await fetch(
      `${API_BASE_URL}/customers/${id}/contacts/${contactId}/set-primary`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    expect(response.status).toBe(200);
  });

  it('DELETE /customers/{customerId}/contacts/{id} remove contato', async () => {
    if (!contactId) {
      throw new Error('Contato nao foi criado');
    }
    const id = await ensureCustomerId();

    const response = await fetch(`${API_BASE_URL}/customers/${id}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect([200, 204]).toContain(response.status);
  });
});
