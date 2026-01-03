/**
 * API Contract Tests: Opportunities
 *
 * Estes testes validam que a API backend está em conformidade com o contrato
 * esperado pelo frontend. Devem ser executados com `npm run test:contract`.
 *
 * Filosofia TDD:
 * 1. Estes testes devem FALHAR inicialmente (Red)
 * 2. Implementação do consumo da API deve fazer eles passarem (Green)
 * 3. Refatoração mantendo testes verdes (Refactor)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { z } from 'zod';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Schema esperado para Opportunity
const opportunitySchema = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid().nullable(),
  nome: z.string(),
  descricao: z.string().nullable(),
  valor_estimado: z.number(),
  probabilidade: z.number().int().min(0).max(100),
  estagio: z.enum(['Lead', 'Qualificado', 'Proposta', 'Negociacao', 'Ganha', 'Perdida']),
  status: z.enum(['active', 'won', 'lost']),
  expected_close_date: z.string(), // ISO 8601
  motivo_perdida: z.string().nullable(),
  created_at: z.string(), // ISO 8601
  updated_at: z.string(), // ISO 8601
});

const opportunitiesResponseSchema = z.object({
  data: z.array(opportunitySchema),
  nextCursor: z.string().nullable(),
  total: z.number().int(),
});

describe('Opportunities API Contract', () => {
  let authToken: string;
  let createdOpportunityId: string;

  beforeAll(async () => {
    // TODO: Autenticar e obter token
    // authToken = await getAuthToken();
    authToken = 'mock-token'; // Placeholder
  });

  describe('POST /opportunities', () => {
    it('deve criar nova oportunidade com campos obrigatórios', async () => {
      const payload = {
        nome: 'Oportunidade Teste Contract',
        valor_estimado: 50000,
        probabilidade: 75,
        estagio: 'Qualificado',
        expected_close_date: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(`${API_BASE_URL}/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('data');

      // Validar schema da resposta
      const opportunity = opportunitySchema.parse(data.data);
      expect(opportunity.nome).toBe(payload.nome);
      expect(opportunity.valor_estimado).toBe(payload.valor_estimado);

      createdOpportunityId = opportunity.id;
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const invalidPayload = {
        nome: '', // Nome vazio (inválido)
        valor_estimado: -1000, // Valor negativo (inválido)
      };

      const response = await fetch(`${API_BASE_URL}/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /opportunities', () => {
    it('deve retornar lista de oportunidades com paginação cursor-based', async () => {
      const response = await fetch(`${API_BASE_URL}/opportunities?limit=20`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();

      // Validar schema da resposta
      const parsed = opportunitiesResponseSchema.parse(data);
      expect(Array.isArray(parsed.data)).toBe(true);
      expect(parsed).toHaveProperty('nextCursor');
      expect(parsed).toHaveProperty('total');
    });

    it('deve suportar filtros de stage', async () => {
      const response = await fetch(
        `${API_BASE_URL}/opportunities?stage=Qualificado&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      const parsed = opportunitiesResponseSchema.parse(data);

      // Verificar que todos os resultados têm o stage filtrado
      parsed.data.forEach((opp) => {
        expect(opp.estagio).toBe('Qualificado');
      });
    });

    it('deve suportar paginação com cursor', async () => {
      // Primeira página
      const firstResponse = await fetch(`${API_BASE_URL}/opportunities?limit=5`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const firstData = await firstResponse.json();
      const firstParsed = opportunitiesResponseSchema.parse(firstData);

      if (firstParsed.nextCursor) {
        // Segunda página
        const secondResponse = await fetch(
          `${API_BASE_URL}/opportunities?limit=5&cursor=${firstParsed.nextCursor}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        expect(secondResponse.status).toBe(200);

        const secondData = await secondResponse.json();
        const secondParsed = opportunitiesResponseSchema.parse(secondData);

        // Verificar que são resultados diferentes
        const firstIds = firstParsed.data.map((o) => o.id);
        const secondIds = secondParsed.data.map((o) => o.id);
        expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
      }
    });
  });

  describe('GET /opportunities/{id}', () => {
    it('deve retornar detalhes de uma oportunidade específica', async () => {
      if (!createdOpportunityId) {
        throw new Error('Oportunidade não foi criada no teste anterior');
      }

      const response = await fetch(
        `${API_BASE_URL}/opportunities/${createdOpportunityId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');

      const opportunity = opportunitySchema.parse(data.data);
      expect(opportunity.id).toBe(createdOpportunityId);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await fetch(`${API_BASE_URL}/opportunities/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /opportunities/{id}', () => {
    it('deve atualizar campos da oportunidade', async () => {
      if (!createdOpportunityId) {
        throw new Error('Oportunidade não foi criada');
      }

      const updatePayload = {
        probabilidade: 85,
        estagio: 'Proposta',
      };

      const response = await fetch(
        `${API_BASE_URL}/opportunities/${createdOpportunityId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      const opportunity = opportunitySchema.parse(data.data);

      expect(opportunity.probabilidade).toBe(85);
      expect(opportunity.estagio).toBe('Proposta');
    });
  });

  describe('POST /opportunities/{id}/win', () => {
    it('deve marcar oportunidade como ganha e criar cliente', async () => {
      if (!createdOpportunityId) {
        throw new Error('Oportunidade não foi criada');
      }

      const response = await fetch(
        `${API_BASE_URL}/opportunities/${createdOpportunityId}/win`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('opportunity');
      expect(data.data).toHaveProperty('customer');

      // Validar que oportunidade foi marcada como ganha
      const opportunity = opportunitySchema.parse(data.data.opportunity);
      expect(opportunity.status).toBe('won');
      expect(opportunity.estagio).toBe('Ganha');

      // Validar que customer foi criado
      expect(data.data.customer).toHaveProperty('id');
      expect(data.data.customer.id).toBeTruthy();
    });

    it('deve retornar 400 se oportunidade já foi ganha/perdida', async () => {
      if (!createdOpportunityId) {
        throw new Error('Oportunidade não foi criada');
      }

      // Tentar ganhar novamente
      const response = await fetch(
        `${API_BASE_URL}/opportunities/${createdOpportunityId}/win`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status).toBe(400);
    });
  });

  describe('POST /opportunities/{id}/lose', () => {
    let loseOpportunityId: string;

    beforeAll(async () => {
      // Criar oportunidade para perder
      const payload = {
        nome: 'Oportunidade para Perder',
        valor_estimado: 10000,
        probabilidade: 30,
        estagio: 'Lead',
        expected_close_date: new Date().toISOString().split('T')[0],
      };

      const response = await fetch(`${API_BASE_URL}/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      loseOpportunityId = data.data.id;
    });

    it('deve marcar oportunidade como perdida com motivo', async () => {
      const losePayload = {
        motivo_perdida: 'Cliente escolheu concorrente',
      };

      const response = await fetch(
        `${API_BASE_URL}/opportunities/${loseOpportunityId}/lose`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(losePayload),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      const opportunity = opportunitySchema.parse(data.data);

      expect(opportunity.status).toBe('lost');
      expect(opportunity.estagio).toBe('Perdida');
      expect(opportunity.motivo_perdida).toBe(losePayload.motivo_perdida);
    });
  });
});
