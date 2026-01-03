import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOpportunity, useUpdateOpportunity } from '../api/opportunities';
import { OpportunityDetail } from '../components/OpportunityDetail';
import { OpportunityForm } from '../components/OpportunityForm';
import { WinOpportunityDialog } from '../components/WinOpportunityDialog';
import { LoseOpportunityDialog } from '../components/LoseOpportunityDialog';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function OpportunityDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: opportunity, isLoading, isError, error } = useOpportunity(id);
  const updateMutation = useUpdateOpportunity();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="rounded-lg border border-border p-6 space-y-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar oportunidade: {(error as Error)?.message}
      </p>
    );
  }

  const handleUpdate = async (data: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      await updateMutation.mutateAsync({ ...data, id: opportunity.id });
      toast({
        title: 'Oportunidade atualizada',
        description: 'As informacoes foram salvas com sucesso.',
      });
      setEditOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao atualizar oportunidade',
        description: err instanceof Error ? err.message : 'Nao foi possivel atualizar a oportunidade.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Detalhes da oportunidade</h1>
          <p className="text-sm text-muted-foreground">Gerencie o progresso da oportunidade.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WinOpportunityDialog
            opportunityId={opportunity.id}
            opportunityName={opportunity.nome}
            valorEstimado={opportunity.valorEstimado}
            onWon={(payload) => {
              if (payload.customer?.id) {
                navigate(`/app/crm/customers/${payload.customer.id}`);
              }
            }}
          />
          <LoseOpportunityDialog opportunityId={opportunity.id} />
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Editar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar oportunidade</DialogTitle>
              </DialogHeader>
              <OpportunityForm
                onSubmit={handleUpdate}
                submitLabel="Salvar alteracoes"
                isSubmitting={updateMutation.isPending}
                defaultValues={{
                  nome: opportunity.nome,
                  descricao: opportunity.descricao ?? '',
                  valorEstimado: opportunity.valorEstimado,
                  probabilidade: opportunity.probabilidade,
                  estagio: opportunity.estagio,
                  expectedCloseDate: opportunity.expectedCloseDate.slice(0, 10),
                  leadId: opportunity.leadId ?? undefined,
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <OpportunityDetail opportunity={opportunity} />
    </div>
  );
}
