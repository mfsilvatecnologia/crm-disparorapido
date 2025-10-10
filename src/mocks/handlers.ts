import { http, HttpResponse } from 'msw'

// In-memory mock data for campaigns (development only)
type Campaign = {
  id: string
  nome: string
  descricao?: string
  tipo: 'scraping_web' | 'lista_importada' | 'api_externa' | 'manual'
  status: 'rascunho' | 'ativa' | 'pausada' | 'concluida' | 'cancelada'
  createdAt: string
  updatedAt: string
}

let campaigns: Campaign[] = [
  {
    id: 'camp-001',
    nome: 'Prospeccão Q1 - Tecnologia',
    descricao: 'Geração de leads para startups de tecnologia em SP',
    tipo: 'scraping_web',
    status: 'ativa',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-002',
    nome: 'Lista Importada - Eventos',
    descricao: 'Leads coletados no evento XYZ',
    tipo: 'lista_importada',
    status: 'pausada',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'camp-003',
    nome: 'Outbound Manual - SMBs',
    tipo: 'manual',
    status: 'rascunho',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const handlers = [
  // Credit balance (to avoid console errors in dev)
  http.get('*/api/v1/credits/balance', async () => {
    return HttpResponse.json({ balance: 1200, lastUpdated: new Date().toISOString() })
  }),

  // Campaign lead stages (for funnel/config pages)
  http.get('*/api/v1/campaign-lead-stages', async () => {
    const now = new Date().toISOString()
    const stages = [
      { id: 's_novo', empresaId: 'emp-123', nome: 'Novo', categoria: 'novo', cor: '#3B82F6', ordem: 0, isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, createdAt: now, updatedAt: now },
      { id: 's_qual', empresaId: 'emp-123', nome: 'Qualificação', categoria: 'qualificacao', cor: '#10B981', ordem: 1, isInicial: false, isFinal: false, cobraCreditos: true, custocentavos: 500, descricaoCobranca: 'Validação de lead', isAtivo: true, createdAt: now, updatedAt: now },
      { id: 's_neg', empresaId: 'emp-123', nome: 'Negociação', categoria: 'negociacao', cor: '#F59E0B', ordem: 2, isInicial: false, isFinal: false, cobraCreditos: false, isAtivo: true, createdAt: now, updatedAt: now },
      { id: 's_ganho', empresaId: 'emp-123', nome: 'Ganho', categoria: 'ganho', cor: '#10B981', ordem: 3, isInicial: false, isFinal: true, cobraCreditos: false, isAtivo: true, createdAt: now, updatedAt: now },
      { id: 's_perdido', empresaId: 'emp-123', nome: 'Perdido', categoria: 'perdido', cor: '#EF4444', ordem: 4, isInicial: false, isFinal: true, cobraCreditos: false, isAtivo: true, createdAt: now, updatedAt: now },
    ]
    return HttpResponse.json({ success: true, data: stages, total: stages.length })
  }),
  // List campaigns
  http.get('*/api/v1/campanhas', async () => {
    return HttpResponse.json({
      success: true,
      data: {
        campanhas: campaigns,
        total: campaigns.length,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    })
  }),

  // Get single campaign
  http.get('*/api/v1/campanhas/:id', async ({ params }) => {
    const { id } = params as { id: string }
    const found = campaigns.find((c) => c.id === id)
    if (!found) {
      return HttpResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })
    }
    return HttpResponse.json(found)
  }),

  // Create campaign
  http.post('*/api/v1/campanhas', async ({ request }) => {
    const body = await request.json() as any
    const id = `camp-${Math.random().toString(36).slice(2, 8)}`
    const now = new Date().toISOString()
    const created: Campaign = {
      id,
      nome: body?.nome || 'Nova Campanha',
      descricao: body?.descricao,
      tipo: body?.tipo || 'manual',
      status: 'rascunho',
      createdAt: now,
      updatedAt: now,
    }
    campaigns = [created, ...campaigns]
    return HttpResponse.json({ success: true, data: created })
  }),

  // List campaign contacts
  http.get('*/api/v1/campanhas/:id/contacts', async ({ params, request }) => {
    const { id } = params as { id: string }
    const url = new URL(request.url)
    const ordering = url.searchParams.get('ordering_strategy') || 'alphabetical'
    const list = campaignContacts[id] || []
    const data = ordering === 'random' ? shuffle([...list]) : [...list].sort((a, b) => a.contactId.localeCompare(b.contactId))
    return HttpResponse.json({ success: true, data })
  }),

  // Add contacts to campaign
  http.post('*/api/v1/campanhas/:id/contacts', async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = (await request.json()) as { contact_ids?: string[] }
    const ids = body?.contact_ids || []
    const now = new Date()
    const items = ids.map((cid, idx) => createMockContact(id, cid, now, idx))
    campaignContacts[id] = [...(campaignContacts[id] || []), ...items]
    return HttpResponse.json({ success: true, data: campaignContacts[id] })
  }),

  // Remove contact from campaign
  http.delete('*/api/v1/campanhas/:id/contacts/:contactId', async ({ params }) => {
    const { id, contactId } = params as { id: string; contactId: string }
    const list = campaignContacts[id] || []
    const next = list.filter((c) => c.contactId !== contactId)
    campaignContacts[id] = next
    return HttpResponse.json({ success: true, message: 'removed' })
  }),

  // Funnel metrics for a campaign
  http.get('*/api/v1/campaigns/:campaignId/funnel', async ({ params }) => {
    const { campaignId } = params as { campaignId: string }
    const totalLeads = (campaignContacts[campaignId]?.length || 0) || 100
    const stages = [
      { stageId: 's_novo', stageName: 'Novo', categoria: 'novo', cor: '#3B82F6', ordem: 0, leadCount: Math.round(totalLeads * 0.5), percentageOfTotal: 50, conversionFromPrevious: null, averageDurationHours: 12 },
      { stageId: 's_qual', stageName: 'Qualificação', categoria: 'qualificacao', cor: '#10B981', ordem: 1, leadCount: Math.round(totalLeads * 0.3), percentageOfTotal: 30, conversionFromPrevious: 60, averageDurationHours: 24 },
      { stageId: 's_neg', stageName: 'Negociação', categoria: 'negociacao', cor: '#F59E0B', ordem: 2, leadCount: Math.round(totalLeads * 0.15), percentageOfTotal: 15, conversionFromPrevious: 50, averageDurationHours: 36 },
      { stageId: 's_ganho', stageName: 'Ganho', categoria: 'ganho', cor: '#10B981', ordem: 3, leadCount: Math.round(totalLeads * 0.04), percentageOfTotal: 4, conversionFromPrevious: 26.6, averageDurationHours: 48 },
      { stageId: 's_perdido', stageName: 'Perdido', categoria: 'perdido', cor: '#EF4444', ordem: 4, leadCount: Math.max(0, totalLeads - (Math.round(totalLeads * 0.5) + Math.round(totalLeads * 0.3) + Math.round(totalLeads * 0.15) + Math.round(totalLeads * 0.04))), percentageOfTotal: 1, conversionFromPrevious: 10, averageDurationHours: 30 },
    ]
    return HttpResponse.json({ success: true, data: { campaignId, totalLeads, stages, generatedAt: new Date().toISOString() } })
  }),

  // Stage history for a campaign contact
  http.get('*/api/v1/campaigns/:campaignId/contacts/:contactId/stage-history', async ({ params }) => {
    const { contactId } = params as { campaignId: string; contactId: string }
    const now = Date.now()
    const history = [
      { id: `${contactId}-h5`, campaignContactId: contactId, fromStageId: 's_neg', toStageId: 's_ganho', fromStageName: 'Negociação', toStageName: 'Ganho', motivo: 'Fechamento', automatico: false, userName: 'Ana', duracaoHoras: 12, createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString() },
      { id: `${contactId}-h4`, campaignContactId: contactId, fromStageId: 's_qual', toStageId: 's_neg', fromStageName: 'Qualificação', toStageName: 'Negociação', motivo: 'Proposta enviada', automatico: false, userName: 'Carlos', duracaoHoras: 24, createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString() },
      { id: `${contactId}-h3`, campaignContactId: contactId, fromStageId: 's_novo', toStageId: 's_qual', fromStageName: 'Novo', toStageName: 'Qualificação', motivo: 'Contato retornou', automatico: true, duracaoHoras: 36, createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString() },
      { id: `${contactId}-h2`, campaignContactId: contactId, fromStageId: null, toStageId: 's_novo', fromStageName: undefined, toStageName: 'Novo', automatico: true, createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString() },
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return HttpResponse.json({ success: true, data: history, total: history.length })
  }),

  // Transition single contact stage
  http.patch('*/api/v1/campaigns/:campaignId/contacts/:contactId/stage', async ({ params, request }) => {
    const { campaignId, contactId } = params as { campaignId: string; contactId: string }
    const body = (await request.json()) as { stageId: string; motivo?: string; automatico?: boolean }
    const list = campaignContacts[campaignId] || []
    const idx = list.findIndex((c) => c.contactId === contactId)
    let previousStageId: string | null = null
    if (idx >= 0) {
      previousStageId = list[idx].currentStageId || null
      list[idx] = {
        ...list[idx],
        currentStageId: body.stageId,
        dataUltimaAtualizacao: new Date().toISOString(),
      }
      campaignContacts[campaignId] = list
    }

    const warnings: Array<{ type: 'charge_failed' | 'validation_warning'; message: string }> = []
    // Simulate charge warning when moving to a charging stage
    if (body.stageId === 's_qual') {
      if (Math.random() < 0.3) {
        warnings.push({ type: 'charge_failed', message: 'Cobrança de R$ 5,00 falhou: Saldo insuficiente' })
      }
    }

    return HttpResponse.json({
      success: true,
      data: {
        contactId,
        previousStageId,
        currentStageId: body.stageId,
        stageChangedAt: new Date().toISOString(),
        stageChangedBy: body.automatico ? null : 'user-dev-001',
        duracaoHoras: previousStageId ? 12 : null,
      },
      ...(warnings.length ? { warnings } : {}),
    })
  }),

  // Bulk update contact stages
  http.post('*/api/v1/campaigns/:campaignId/contacts/bulk-stage-update', async ({ params, request }) => {
    const { campaignId } = params as { campaignId: string }
    const body = (await request.json()) as { contactIds: string[]; stageId: string; motivo?: string; automatico?: boolean }
    const list = campaignContacts[campaignId] || []
    let successCount = 0
    let failedCount = 0
    const errors: Array<{ contactId: string; error: string }> = []
    const chargeWarnings: Array<{ contactId: string; warning: string }> = []

    body.contactIds.forEach((cid) => {
      const idx = list.findIndex((c) => c.contactId === cid)
      if (idx >= 0) {
        list[idx] = { ...list[idx], currentStageId: body.stageId, dataUltimaAtualizacao: new Date().toISOString() }
        successCount++
        if (body.stageId === 's_qual' && Math.random() < 0.3) {
          chargeWarnings.push({ contactId: cid, warning: 'Cobrança falhou: Saldo insuficiente' })
        }
      } else {
        failedCount++
        errors.push({ contactId: cid, error: 'Contato não encontrado' })
      }
    })

    campaignContacts[campaignId] = list

    return HttpResponse.json({
      success: true,
      data: {
        successCount,
        failedCount,
        totalRequested: body.contactIds.length,
        errors,
        chargeWarnings,
      },
    })
  }),
]

// In-memory campaign contacts store
type CampaignContact = {
  id: string
  campaignId: string
  contactId: string
  contactType: 'lead' | 'company_contact'
  status: 'enrolled' | 'active' | 'completed' | 'paused' | 'failed' | 'unsubscribed'
  stepAtual: number
  ultimaInteracao?: string
  metricas: {
    emailsEnviados: number
    emailsAbertos: number
    linksClicados: number
    respostas: number
  }
  dataInscricao: string
  dataUltimaAtualizacao: string
  currentStageId?: string
}

const campaignContacts: Record<string, CampaignContact[]> = {
  'camp-001': [
    createMockContact('camp-001', 'lead-001'),
    createMockContact('camp-001', 'lead-002'),
    createMockContact('camp-001', 'lead-003'),
  ],
  'camp-002': [
    createMockContact('camp-002', 'lead-101', new Date(Date.now() - 86400000)),
  ],
}

function createMockContact(campaignId: string, contactId: string, date: Date = new Date(), seed = 0): CampaignContact {
  const base = Math.abs(hash(contactId + seed))
  const pick = <T,>(arr: T[]) => arr[base % arr.length]
  return {
    id: `${campaignId}:${contactId}`,
    campaignId,
    contactId,
    contactType: pick(['lead', 'company_contact'] as const),
    status: pick(['enrolled', 'active', 'completed', 'paused'] as const),
    stepAtual: (base % 5) + 1,
    ultimaInteracao: new Date(date.getTime() - 1000 * 60 * (base % 1440)).toISOString(),
    metricas: {
      emailsEnviados: base % 20,
      emailsAbertos: base % 15,
      linksClicados: base % 10,
      respostas: base % 5,
    },
    dataInscricao: date.toISOString(),
    dataUltimaAtualizacao: new Date(date.getTime() + 1000 * 60 * 5).toISOString(),
    currentStageId: pick(['s_novo', 's_qual', 's_neg', 's_ganho', 's_perdido']),
  }
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return h
}
