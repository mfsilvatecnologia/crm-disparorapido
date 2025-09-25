import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { Plus, X, Users, Upload, AlertCircle } from 'lucide-react'
import { useAddContactsToCampaign } from '../hooks/useCampaigns'

interface AddContactsToCampaignProps {
  campaignId: string
}

export function AddContactsToCampaign({ campaignId }: AddContactsToCampaignProps) {
  const [contactIds, setContactIds] = useState<string[]>([])
  const [newContactId, setNewContactId] = useState('')
  const [bulkContactIds, setBulkContactIds] = useState('')
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual')

  const addContactsMutation = useAddContactsToCampaign()

  const handleAddContactId = () => {
    if (newContactId.trim() && !contactIds.includes(newContactId.trim())) {
      setContactIds([...contactIds, newContactId.trim()])
      setNewContactId('')
    }
  }

  const handleRemoveContactId = (id: string) => {
    setContactIds(contactIds.filter(contactId => contactId !== id))
  }

  const handleBulkAdd = () => {
    const ids = bulkContactIds
      .split(/[,\n]/)
      .map(id => id.trim())
      .filter(id => id.length > 0)
      .filter(id => !contactIds.includes(id))

    setContactIds([...contactIds, ...ids])
    setBulkContactIds('')
  }

  const handleSubmit = () => {
    if (contactIds.length === 0) {
      return
    }

    addContactsMutation.mutate(
      { campaignId, contactIds },
      {
        onSuccess: () => {
          setContactIds([])
          setNewContactId('')
          setBulkContactIds('')
        }
      }
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddContactId()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Contatos à Campanha
        </CardTitle>
        <CardDescription>
          Adicione contatos específicos à esta campanha usando seus IDs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Seletor de modo */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'individual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('individual')}
          >
            Individual
          </Button>
          <Button
            variant={mode === 'bulk' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('bulk')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Em Lote
          </Button>
        </div>

        {/* Modo individual */}
        {mode === 'individual' && (
          <div className="flex gap-2">
            <Input
              placeholder="Digite o ID do contato"
              value={newContactId}
              onChange={(e) => setNewContactId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddContactId}
              disabled={!newContactId.trim()}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Modo em lote */}
        {mode === 'bulk' && (
          <div className="space-y-2">
            <Textarea
              placeholder="Cole os IDs dos contatos aqui (separados por vírgula ou quebra de linha)"
              value={bulkContactIds}
              onChange={(e) => setBulkContactIds(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={handleBulkAdd}
              disabled={!bulkContactIds.trim()}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Adicionar IDs
            </Button>
          </div>
        )}

        {/* Lista de contatos selecionados */}
        {contactIds.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                Contatos selecionados ({contactIds.length})
              </h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setContactIds([])}
              >
                Limpar todos
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {contactIds.map((id) => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  <span>{id}</span>
                  <button
                    onClick={() => handleRemoveContactId(id)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Botão de submissão */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={contactIds.length === 0 || addContactsMutation.isPending}
            className="min-w-[120px]"
          >
            {addContactsMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Adicionando...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Adicionar {contactIds.length} contato{contactIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>

        {/* Mensagem de erro */}
        {addContactsMutation.isError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              {addContactsMutation.error?.message || 'Erro ao adicionar contatos'}
            </span>
          </div>
        )}

        {/* Informações úteis */}
        <div className="text-xs text-gray-500 space-y-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p><strong>Dicas:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Os IDs devem ser válidos e existir no sistema</li>
            <li>Contatos já inclusos na campanha serão ignorados</li>
            <li>No modo em lote, separe os IDs por vírgula ou quebra de linha</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}