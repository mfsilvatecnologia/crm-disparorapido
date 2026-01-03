import React, { useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OpportunityList } from '../components/OpportunityList';
import { OpportunityForm } from '../components/OpportunityForm';
import { useCreateOpportunity } from '../api/opportunities';
import { useOpportunityFilters } from '../hooks/useOpportunityFilters';
import type { OpportunityStage, OpportunityStatus } from '../types/opportunity';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STATUS_LABELS } from '../lib/constants';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';

export function OpportunitiesPage() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => {
    const stageParam = searchParams.get('stage');
    const statusParam = searchParams.get('status');

    return {
      search: searchParams.get('search') || undefined,
      stage: OPPORTUNITY_STAGES.includes(stageParam as OpportunityStage)
        ? (stageParam as OpportunityStage)
        : undefined,
      status: Object.keys(OPPORTUNITY_STATUS_LABELS).includes(statusParam || '')
        ? (statusParam as OpportunityStatus)
        : undefined,
    };
  }, [searchParams]);

  const { filters, updateFilter, setFilters } = useOpportunityFilters(initialFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchId = useId();
  const stageId = useId();
  const statusId = useId();

  const createMutation = useCreateOpportunity();

  const handleCreate = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: 'Oportunidade criada',
        description: 'A oportunidade foi registrada com sucesso.',
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar oportunidade',
        description: error instanceof Error ? error.message : 'Nao foi possivel criar a oportunidade.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.status) params.set('status', filters.status);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleReset = () => {
    setFilters({});
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Oportunidades</h1>
          <p className="text-sm text-muted-foreground">Acompanhe o pipeline de vendas.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova oportunidade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar oportunidade</DialogTitle>
            </DialogHeader>
            <OpportunityForm
              onSubmit={handleCreate}
              submitLabel="Criar oportunidade"
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="text-sm font-medium" htmlFor={searchId}>
            Buscar
          </label>
          <Input
            id={searchId}
            placeholder="Buscar por nome"
            value={filters.search ?? ''}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={stageId}>
            Estagio
          </label>
          <Select
            value={filters.stage ?? 'all'}
            onValueChange={(value) => updateFilter('stage', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id={stageId}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {OPPORTUNITY_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={statusId}>
            Status
          </label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id={statusId}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset}>
            Limpar filtros
          </Button>
        </div>
      </div>

      <OpportunityList filters={filters} showPipeline />
    </div>
  );
}
