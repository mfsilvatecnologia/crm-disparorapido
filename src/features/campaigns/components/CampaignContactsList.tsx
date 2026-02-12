import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Trash2, Search, Users, AlertCircle, Clock, History } from 'lucide-react'
import LeadStageHistory from '@/features/campaign-stages/components/history/LeadStageHistory'
import { useCampaignContacts, useRemoveContactFromCampaign } from '../hooks/useCampaigns'
import type { CampaignContact, CampaignContactsParams } from '../types/campaigns'

interface CampaignContactsListProps {
  campaignId: string
}

export function CampaignContactsList({ campaignId }: CampaignContactsListProps) {
  const [params, setParams] = useState<CampaignContactsParams>({
    ordering_strategy: 'alphabetical'
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: contacts, isLoading, error } = useCampaignContacts(campaignId, params)
  const [historyContactId, setHistoryContactId] = useState<string | null>(null)
  const removeContactMutation = useRemoveContactFromCampaign()

  const handleRemoveContact = (contactId: string) => {
    if (window.confirm('Tem certeza que deseja remover este contato da campanha?')) {
      removeContactMutation.mutate({ campaignId, contactId })
    }
  }

  const getStatusColor = (status: CampaignContact['status']) => {
    const colors = {
      enrolled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      paused: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      unsubscribed: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: CampaignContact['status']) => {
    const labels = {
      enrolled: 'Inscrito',
      active: 'Ativo',
      completed: 'Concluído',
      paused: 'Pausado',
      failed: 'Falhou',
      unsubscribed: 'Cancelado',
    }
    return labels[status] || status
  }

  const filteredContacts = contacts?.filter(contact => {
    if (!searchTerm) return true
    return (
      contact.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contactId.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Erro ao carregar contatos: {error.message}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contatos da Campanha
            </CardTitle>
            <CardDescription>
              Gerencie os contatos que fazem parte desta campanha
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredContacts?.length || 0} contatos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por ID do contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={params.ordering_strategy}
            onValueChange={(value: 'alphabetical' | 'random') => 
              setParams({ ...params, ordering_strategy: value })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Alfabética</SelectItem>
              <SelectItem value="random">Aleatória</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de contatos */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Carregando contatos...</span>
              </div>
            </div>
          ) : filteredContacts?.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum contato encontrado na campanha.</p>
            </div>
          ) : (
            filteredContacts?.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(contact.status)}>
                      {getStatusLabel(contact.status)}
                    </Badge>
                    <span className="font-medium">ID: {contact.contactId}</span>
                    <span className="text-sm text-gray-500">
                      Tipo: {contact.contactType === 'lead' ? 'Lead' : 'Contato da Empresa'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Step atual: {contact.stepAtual}</span>
                    <span>Inscrito em: {new Date(contact.dataInscricao).toLocaleDateString()}</span>
                    {contact.ultimaInteracao && (
                      <span>Última interação: {new Date(contact.ultimaInteracao).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Emails enviados: {contact.metricas.emailsEnviados}</span>
                    <span>Abertos: {contact.metricas.emailsAbertos}</span>
                    <span>Cliques: {contact.metricas.linksClicados}</span>
                    <span>Respostas: {contact.metricas.respostas}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistoryContactId(contact.contactId)}
                  >
                    <History className="w-4 h-4 mr-1" /> Histórico
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveContact(contact.contactId)}
                    disabled={removeContactMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
    {historyContactId && (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
        <div className="bg-white dark:bg-neutral-900 rounded shadow w-[640px] max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-medium">Histórico de estágios</div>
            <button className="text-sm" onClick={() => setHistoryContactId(null)}>Fechar</button>
          </div>
          <div className="p-4">
            <LeadStageHistory campaignId={campaignId} contactId={historyContactId} />
          </div>
        </div>
      </div>
    )}
    </>
  )
}
