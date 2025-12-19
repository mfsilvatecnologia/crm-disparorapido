import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown, Search, Loader2, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/shared/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/utils/utils'
import { apiClient } from '@/shared/services/client'
import type { User as Usuario } from '@/shared/services/schemas'

interface UserSelectorProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const getUserLabel = (usuario: Usuario) =>
  usuario.nome || usuario.name || usuario.email

export function UserSelector({
  value,
  onChange,
  placeholder = 'Selecione um responsavel...',
  className,
  disabled
}: UserSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>(undefined)

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios', 'selector', searchTerm],
    queryFn: () =>
      apiClient.getUsers({
        search: searchTerm || undefined,
        limit: 50,
        page: 1
      }),
    enabled: open
  })

  const items = usuarios?.items ?? []
  const selectedUser = items.find((usuario) => usuario.id === value)
  const displayLabel = selectedUser ? getUserLabel(selectedUser) : selectedLabel

  React.useEffect(() => {
    if (!value) {
      setSelectedLabel(undefined)
      return
    }

    if (selectedUser) {
      setSelectedLabel(getUserLabel(selectedUser))
    }
  }, [value, selectedUser])

  const handleSelect = (usuario: Usuario) => {
    onChange(usuario.id)
    setSelectedLabel(getUserLabel(usuario))
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
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Carregando usuarios...' : 'Nenhum usuario encontrado.'}
            </CommandEmpty>
            <CommandGroup>
              {items.map((usuario) => (
                <CommandItem
                  key={usuario.id}
                  value={usuario.id}
                  onSelect={() => handleSelect(usuario)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === usuario.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{getUserLabel(usuario)}</span>
                    <span className="text-xs text-muted-foreground">{usuario.email}</span>
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
