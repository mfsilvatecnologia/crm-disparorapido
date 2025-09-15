import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Building2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api/client';
import type { Empresa } from '@/lib/api/schemas';

interface EmpresaSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EmpresaSelector({
  value,
  onValueChange,
  placeholder = "Selecione uma empresa...",
  className,
  disabled = false,
}: EmpresaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: empresas, isLoading } = useQuery({
    queryKey: ['empresas', 'selector', searchTerm],
    queryFn: () => apiClient.getEmpresas({ 
      search: searchTerm || undefined,
      limit: 50 
    }),
    enabled: open,
  });

  const selectedEmpresa = empresas?.items.find(empresa => empresa.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {selectedEmpresa ? (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedEmpresa.nome}</span>
              {selectedEmpresa.segmento && (
                <Badge variant="secondary" className="text-xs">
                  {selectedEmpresa.segmento}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Carregando empresas...</span>
                </div>
              ) : (
                "Nenhuma empresa encontrada."
              )}
            </CommandEmpty>
            <CommandGroup>
              {empresas?.items.map((empresa) => (
                <CommandItem
                  key={empresa.id}
                  value={empresa.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? undefined : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === empresa.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{empresa.nome}</span>
                      {empresa.segmento && (
                        <Badge variant="outline" className="text-xs">
                          {empresa.segmento}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {empresa.email}
                      {empresa.cidade && empresa.estado && (
                        <span className="ml-2">• {empresa.cidade}, {empresa.estado}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}