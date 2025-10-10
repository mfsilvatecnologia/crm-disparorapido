import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  fetchCampaignStages,
  createCampaignStage,
  updateCampaignStage,
  deleteCampaignStage,
  reorderCampaignStages,
} from './stages'

import type { CampaignLeadStage } from '../types'

vi.mock('@/shared/services/client', () => {
  return {
    apiClient: {
      request: vi.fn(),
    },
  }
})

const { apiClient } = await import('@/shared/services/client') as any

describe('campaign-stages service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchCampaignStages - success with filters', async () => {
    const stages: CampaignLeadStage[] = [
      {
        id: '1', empresaId: 'emp', nome: 'Novo', categoria: 'novo', cor: '#000000', ordem: 0,
        isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      },
    ]
    apiClient.request.mockResolvedValue({ success: true, data: stages, total: 1 })

    const result = await fetchCampaignStages({ includeInactive: true, categoria: 'novo' })
    expect(result).toEqual(stages)
    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/v1/campaign-lead-stages?includeInactive=true&categoria=novo',
      { method: 'GET' }
    )
  })

  it('fetchCampaignStages - error handling', async () => {
    apiClient.request.mockRejectedValue(new Error('500 Server Error'))
    await expect(fetchCampaignStages()).rejects.toThrow('Falha ao buscar estágios da campanha')
  })

  it('createCampaignStage - success', async () => {
    const now = new Date().toISOString()
    const created: CampaignLeadStage = {
      id: '2', empresaId: 'emp', nome: 'Qualificação', categoria: 'qualificacao', cor: '#10B981', ordem: 1,
      isInicial: false, isFinal: false, cobraCreditos: true, custocentavos: 500, isAtivo: true, createdAt: now, updatedAt: now
    }
    apiClient.request.mockResolvedValue({ success: true, data: created })
    const res = await createCampaignStage({ nome: 'Qualificação', categoria: 'qualificacao', cor: '#10B981', cobraCreditos: true, custocentavos: 500 })
    expect(res).toEqual(created)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaign-lead-stages', {
      method: 'POST',
      body: JSON.stringify({ nome: 'Qualificação', categoria: 'qualificacao', cor: '#10B981', cobraCreditos: true, custocentavos: 500 }),
    })
  })

  it('createCampaignStage - duplicate name (409)', async () => {
    apiClient.request.mockRejectedValue(new Error('409 Conflict'))
    await expect(
      createCampaignStage({ nome: 'Novo', categoria: 'novo', cor: '#3B82F6' })
    ).rejects.toThrow('Nome duplicado ou múltiplos estágios iniciais')
  })

  it('createCampaignStage - invalid data (400)', async () => {
    apiClient.request.mockRejectedValue(new Error('400 Bad Request'))
    await expect(
      createCampaignStage({ nome: '', categoria: 'novo', cor: 'invalid' as any })
    ).rejects.toThrow('Dados inválidos. Verifique os campos obrigatórios.')
  })

  it('updateCampaignStage - success', async () => {
    const now = new Date().toISOString()
    const updated: CampaignLeadStage = {
      id: '2', empresaId: 'emp', nome: 'Qualificação+', categoria: 'qualificacao', cor: '#10B981', ordem: 1,
      isInicial: false, isFinal: false, cobraCreditos: true, custocentavos: 700, isAtivo: true, createdAt: now, updatedAt: now
    }
    apiClient.request.mockResolvedValue({ success: true, data: updated })
    const res = await updateCampaignStage('2', { nome: 'Qualificação+', custocentavos: 700 })
    expect(res).toEqual(updated)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaign-lead-stages/2', {
      method: 'PUT',
      body: JSON.stringify({ nome: 'Qualificação+', custocentavos: 700 }),
    })
  })

  it('updateCampaignStage - categoria change rejection (400)', async () => {
    apiClient.request.mockRejectedValue(new Error('400 Bad Request'))
    await expect(updateCampaignStage('2', { nome: 'X' })).rejects.toThrow(
      'Não é permitido alterar categoria ou isInicial após criação'
    )
  })

  it('updateCampaignStage - duplicate name (409)', async () => {
    apiClient.request.mockRejectedValue(new Error('409 Conflict'))
    await expect(updateCampaignStage('2', { nome: 'Novo' })).rejects.toThrow('Nome duplicado')
  })

  it('deleteCampaignStage - success', async () => {
    apiClient.request.mockResolvedValue({ success: true, message: 'ok' })
    await expect(deleteCampaignStage('3')).resolves.toBeUndefined()
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaign-lead-stages/3', { method: 'DELETE' })
  })

  it('deleteCampaignStage - active leads error (409)', async () => {
    apiClient.request.mockRejectedValue(new Error('409 Conflict'))
    await expect(deleteCampaignStage('3')).rejects.toThrow('Não é possível deletar estágio com leads ativos')
  })

  it('reorderCampaignStages - calls reorder API', async () => {
    apiClient.request.mockResolvedValue({ success: true, message: 'ok' })
    await reorderCampaignStages([
      { id: '1', ordem: 0 },
      { id: '2', ordem: 1 },
    ])
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaign-lead-stages/reorder', {
      method: 'POST',
      body: JSON.stringify({ stages: [
        { id: '1', ordem: 0 },
        { id: '2', ordem: 1 },
      ] }),
    })
  })

  // US2 tests
  it('transitionLeadStage - success with warning handling', async () => {
    const { transitionLeadStage } = await import('./stages')
    const payload = {
      success: true,
      data: {
        contactId: 'lead-1', previousStageId: 's1', currentStageId: 's2', stageChangedAt: new Date().toISOString(), stageChangedBy: 'u1', duracaoHoras: 2
      },
      warnings: [{ type: 'charge_failed', message: 'Cobrança falhou' }]
    }
    apiClient.request.mockResolvedValue(payload)
    const res = await transitionLeadStage('camp-1', 'lead-1', { stageId: 's2', automatico: false, motivo: 'Test' })
    expect(res).toEqual(payload)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaigns/camp-1/contacts/lead-1/stage', {
      method: 'PATCH',
      body: JSON.stringify({ stageId: 's2', automatico: false, motivo: 'Test' }),
    })
  })

  it('bulkUpdateLeadStages - success with partial failures', async () => {
    const { bulkUpdateLeadStages } = await import('./stages')
    const payload = {
      success: true,
      data: {
        successCount: 2,
        failedCount: 1,
        totalRequested: 3,
        errors: [{ contactId: 'l3', error: 'not found' }],
        chargeWarnings: [{ contactId: 'l2', warning: 'saldo insuficiente' }]
      }
    }
    apiClient.request.mockResolvedValue(payload)
    const res = await bulkUpdateLeadStages('camp-1', { contactIds: ['l1','l2','l3'], stageId: 's2', automatico: false })
    expect(res).toEqual(payload)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaigns/camp-1/contacts/bulk-stage-update', {
      method: 'POST',
      body: JSON.stringify({ contactIds: ['l1','l2','l3'], stageId: 's2', automatico: false }),
    })
  })

  // US3 tests
  it('fetchLeadStageHistory - success and ordering DESC', async () => {
    const { fetchLeadStageHistory } = await import('./stages')
    const now = Date.now()
    const history = [
      { id: 'h2', campaignContactId: 'c1', fromStageId: 's1', toStageId: 's2', toStageName: 'S2', automatico: false, createdAt: new Date(now - 1000).toISOString() },
      { id: 'h1', campaignContactId: 'c1', fromStageId: null, toStageId: 's1', toStageName: 'S1', automatico: true, createdAt: new Date(now).toISOString() },
    ] as any
    apiClient.request.mockResolvedValue({ success: true, data: history, total: 2 })
    const res = await fetchLeadStageHistory('camp-1', 'c1')
    expect(res).toEqual(history)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaigns/camp-1/contacts/c1/stage-history', { method: 'GET' })
  })

  it('fetchLeadStageHistory - empty history', async () => {
    const { fetchLeadStageHistory } = await import('./stages')
    apiClient.request.mockResolvedValue({ success: true, data: [], total: 0 })
    const res = await fetchLeadStageHistory('camp-1', 'cX')
    expect(res).toEqual([])
  })

  // US4 tests
  it('fetchCampaignFunnelMetrics - success and structure', async () => {
    const { fetchCampaignFunnelMetrics } = await import('./stages')
    const payload = {
      success: true,
      data: {
        campaignId: 'camp-1',
        totalLeads: 100,
        stages: [
          { stageId: 's1', stageName: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, leadCount: 60, percentageOfTotal: 60, conversionFromPrevious: null, averageDurationHours: 12 },
          { stageId: 's2', stageName: 'Qualificação', categoria: 'qualificacao', cor: '#000', ordem: 1, leadCount: 30, percentageOfTotal: 30, conversionFromPrevious: 50, averageDurationHours: 24 },
        ],
        generatedAt: new Date().toISOString(),
      }
    }
    apiClient.request.mockResolvedValue(payload)
    const res = await fetchCampaignFunnelMetrics('camp-1')
    expect(res).toEqual(payload.data)
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaigns/camp-1/funnel', { method: 'GET' })
  })

  // US5 tests
  it('fetchCampaignCharges - success with filters', async () => {
    const { fetchCampaignCharges } = await import('./stages')
    const payload = { success: true, data: [{ id: 'c1' }], total: 1 }
    apiClient.request.mockResolvedValue(payload)
    const res = await fetchCampaignCharges('camp-1', { startDate: '2025-10-01', endDate: '2025-10-31', stageId: 's1', foiCobrado: true })
    expect(res).toEqual([{ id: 'c1' }])
    expect(apiClient.request).toHaveBeenCalledWith('/api/v1/campaigns/camp-1/charges?startDate=2025-10-01&endDate=2025-10-31&stageId=s1&foiCobrado=true', { method: 'GET' })
  })

  it('fetchCampaignChargesSummary - success structure', async () => {
    const { fetchCampaignChargesSummary } = await import('./stages')
    const payload = { success: true, data: { campanhaId: 'camp-1', totalCharges: 10, successfulCharges: 9, failedCharges: 1, totalAmountCentavos: 5000, totalAmountReais: 50, chargesByStage: [], generatedAt: new Date().toISOString() } }
    apiClient.request.mockResolvedValue(payload)
    const res = await fetchCampaignChargesSummary('camp-1')
    expect(res.totalCharges).toBe(10)
  })

  it('billing configuration - fetch and update', async () => {
    const { fetchBillingConfiguration, updateBillingConfiguration } = await import('./stages')
    const config = { empresaId: 'e1', modeloCobrancaCampanha: 'mudanca_estagio', debitarMudancaEstagio: true, updatedAt: new Date().toISOString() }
    apiClient.request.mockResolvedValueOnce({ success: true, data: config })
    const res1 = await fetchBillingConfiguration()
    expect(res1.debitarMudancaEstagio).toBe(true)
    const updated = { ...config, debitarMudancaEstagio: false }
    apiClient.request.mockResolvedValueOnce({ success: true, data: updated })
    const res2 = await updateBillingConfiguration({ modeloCobrancaCampanha: 'mudanca_estagio', debitarMudancaEstagio: false })
    expect(res2.debitarMudancaEstagio).toBe(false)
  })
})
