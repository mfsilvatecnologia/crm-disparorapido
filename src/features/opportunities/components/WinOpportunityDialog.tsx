import React, { useState } from 'react';
import { useWinOpportunity } from '../api/opportunities';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useToast } from '@/shared/hooks/use-toast';
import type { WinOpportunityPayload, WinOpportunityResponse } from '../types/opportunity';

/**
 * Aplica máscara de CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) automaticamente
 */
function formatCpfCnpj(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .substring(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
}

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return numbers
      .substring(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
}

interface WinOpportunityDialogProps {
  opportunityId: string;
  opportunityName?: string;
  valorEstimado?: number;
  onWon?: (payload: WinOpportunityResponse) => void;
}

export function WinOpportunityDialog({ 
  opportunityId, 
  opportunityName = '',
  valorEstimado = 0,
  onWon 
}: WinOpportunityDialogProps) {
  const { toast } = useToast();
  const winMutation = useWinOpportunity();
  const [open, setOpen] = useState(false);

  // Datas padrão: hoje e 1 ano depois
  const today = new Date().toISOString().split('T')[0];
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<WinOpportunityPayload>({
    customerNome: opportunityName,
    customerEmail: '',
    customerTelefone: '',
    customerCnpj: '',
    categoria: 'STANDARD',
    contractValue: valorEstimado,
    contractStartDate: today,
    contractRenewalDate: nextYear,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerNome.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do cliente é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.contractValue <= 0) {
      toast({
        title: 'Erro de validação',
        description: 'O valor do contrato deve ser maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await winMutation.mutateAsync({
        opportunityId,
        ...formData,
      });
      toast({
        title: 'Oportunidade ganha!',
        description: 'Cliente e contrato criados com sucesso.',
      });
      setOpen(false);
      onWon?.(result);
    } catch (error) {
      toast({
        title: 'Erro ao converter oportunidade',
        description: error instanceof Error ? error.message : 'Não foi possível converter a oportunidade.',
        variant: 'destructive',
      });
    }
  };

  const updateField = <K extends keyof WinOpportunityPayload>(
    field: K,
    value: WinOpportunityPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Marcar como ganha</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Converter Oportunidade em Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente e do contrato para finalizar a venda.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <h4 className="text-sm font-medium text-muted-foreground">Dados do Cliente</h4>
            
            <div className="grid gap-2">
              <Label htmlFor="customerNome">Nome do Cliente *</Label>
              <Input
                id="customerNome"
                value={formData.customerNome}
                onChange={(e) => updateField('customerNome', e.target.value)}
                placeholder="Nome completo ou razão social"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerEmail">E-mail</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail ?? ''}
                  onChange={(e) => updateField('customerEmail', e.target.value || null)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customerTelefone">Telefone</Label>
                <Input
                  id="customerTelefone"
                  value={formData.customerTelefone ?? ''}
                  onChange={(e) => updateField('customerTelefone', formatPhone(e.target.value) || null)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerCnpj">CNPJ</Label>
                <Input
                  id="customerCnpj"
                  value={formData.customerCnpj ?? ''}
                  onChange={(e) => updateField('customerCnpj', formatCpfCnpj(e.target.value) || null)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => updateField('categoria', value as WinOpportunityPayload['categoria'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OURO">Ouro</SelectItem>
                    <SelectItem value="PRATA">Prata</SelectItem>
                    <SelectItem value="BRONZE">Bronze</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h4 className="mt-2 text-sm font-medium text-muted-foreground">Dados do Contrato</h4>

            <div className="grid gap-2">
              <Label htmlFor="contractValue">Valor do Contrato (R$) *</Label>
              <Input
                id="contractValue"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.contractValue}
                onChange={(e) => updateField('contractValue', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contractStartDate">Data de Início *</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) => updateField('contractStartDate', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contractRenewalDate">Data de Renovação *</Label>
                <Input
                  id="contractRenewalDate"
                  type="date"
                  value={formData.contractRenewalDate}
                  onChange={(e) => updateField('contractRenewalDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={winMutation.isPending}>
              {winMutation.isPending ? 'Processando...' : 'Confirmar Venda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
