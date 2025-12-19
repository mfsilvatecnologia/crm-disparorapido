import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Search, Loader2, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/shared/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/utils/utils'
import { apiClient } from '@/shared/services/client'
import type { Lead } from '@/shared/services/schemas'

interface ClienteAutocompleteProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function ClienteAutocomplete({
  value,
  onChange,
  placeholder = 'Selecione um lead...',
  className,
  disabled
}: ClienteAutocompleteProps) {
  const getLeadLabel = (lead: Lead) =>
    lead.nomeContato || lead.nomeEmpresa || lead.email || 'Lead sem nome'
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>(undefined)

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['leads', 'selector', searchTerm],
    queryFn: () =>
      apiClient.getLeads({
        search: searchTerm || undefined,
        limit: 50,
        page: 1
      }),
    enabled: open
  })

  const items = clientes?.items ?? []
  const selectedCliente = items.find((cliente) => cliente.id === value)
  const displayLabel = selectedCliente ? getLeadLabel(selectedCliente) : selectedLabel

  React.useEffect(() => {
    if (!value) {
      setSelectedLabel(undefined)
      return
    }

    if (selectedCliente) {
      setSelectedLabel(getLeadLabel(selectedCliente))
    }
  }, [value, selectedCliente])

  const handleSelect = (cliente: Lead) => {
    if (!cliente.id) return
    onChange(cliente.id)
    setSelectedLabel(getLeadLabel(cliente))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          {displayLabel ? (
            <span className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{displayLabel}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Carregando leads...' : 'Nenhum lead encontrado.'}
            </CommandEmpty>
            <CommandGroup>
              {items.map((cliente) => (
                <CommandItem
                  key={cliente.id ?? cliente.email ?? cliente.nomeContato ?? ''}
                  value={cliente.id ?? ''}
                  onSelect={() => handleSelect(cliente)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === cliente.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{getLeadLabel(cliente)}</span>
                    {cliente.email ? (
                      <span className="text-xs text-muted-foreground">{cliente.email}</span>
                    ) : null}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
