import { describe, it, expect, vi, beforeEach } from 'vitest'

// Integration skeleton for Stage CRUD workflow (US1)
// NOTE: This test suite is a placeholder; wire MSW handlers and UI later.

vi.mock('@/shared/services/client', () => ({
  apiClient: { request: vi.fn() },
}))

const { apiClient } = await import('@/shared/services/client') as any
const services = await import('@/features/campaign-stages/services/stages')

describe('[Integration] Stage CRUD workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create → read → update → delete flow', async () => {
    // Create
    apiClient.request.mockResolvedValueOnce({ success: true, data: { id: 'a', empresaId: 'e', nome: 'Novo', categoria: 'novo', cor: '#3B82F6', icone: undefined, ordem: 0, isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } })
    const created = await services.createCampaignStage({ nome: 'Novo', categoria: 'novo', cor: '#3B82F6', isInicial: true })
    expect(created.id).toBe('a')

    // List
    apiClient.request.mockResolvedValueOnce({ success: true, data: [created], total: 1 })
    const list = await services.fetchCampaignStages()
    expect(list.length).toBeGreaterThan(0)

    // Update
    const updated = { ...created, nome: 'Novo Lead' }
    apiClient.request.mockResolvedValueOnce({ success: true, data: updated })
    const resUpdate = await services.updateCampaignStage(created.id, { nome: 'Novo Lead' })
    expect(resUpdate.nome).toBe('Novo Lead')

    // Delete
    apiClient.request.mockResolvedValueOnce({ success: true, message: 'ok' })
    await expect(services.deleteCampaignStage(created.id)).resolves.toBeUndefined()
  })
})

