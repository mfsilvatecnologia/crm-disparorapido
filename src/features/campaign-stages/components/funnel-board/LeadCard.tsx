import React from 'react'
import { User, Phone, Mail, Building2, Clock, CheckCircle2 } from 'lucide-react'
import type { LeadCardData } from '../../types/ui.types'

type Props = {
  lead: LeadCardData
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Sem registro'
  
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) return `${diffDays}d atrás`
  if (diffHours > 0) return `${diffHours}h atrás`
  if (diffMinutes > 0) return `${diffMinutes}min atrás`
  return 'Agora mesmo'
}

function formatPhone(phone: string | null): string {
  if (!phone) return ''
  // Simple Brazilian phone formatting
  const numbers = phone.replace(/\D/g, '')
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export function LeadCard({ lead, selected, onToggleSelect }: Props) {
  const lastInteraction = lead.stageChangedAt || lead.addedAt
  
  return (
    <div 
      className={`
        relative rounded-lg border p-4 bg-white dark:bg-neutral-900 
        shadow-sm hover:shadow-md transition-all duration-200
        ${selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-gray-300'}
      `}
      data-testid={`lead-${lead.id}`}
    >
      {/* Header com nome e checkbox */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
              {lead.nome || 'Contato sem nome'}
            </h3>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={() => onToggleSelect?.(lead.id)}
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${selected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 hover:border-blue-400'
              }
            `}
            aria-label={`Selecionar ${lead.nome || 'contato'}`}
          >
            {selected && <CheckCircle2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Informações de contato */}
      <div className="space-y-2 mb-3">
        {lead.telefone && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{formatPhone(lead.telefone)}</span>
          </div>
        )}
        
        {lead.email && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
        
        {lead.empresa && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.empresa}</span>
          </div>
        )}
      </div>

      {/* Última interação */}
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>Última atividade: {formatTimeAgo(lastInteraction)}</span>
        </div>
      </div>
    </div>
  )
}

export default LeadCard

