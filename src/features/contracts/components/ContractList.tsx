import React, { useState } from 'react';
import { ContractCard } from './ContractCard';
import { ContractForm } from './ContractForm';
import { RenewContractDialog } from './RenewContractDialog';
import { useContracts, useCreateContract, useRenewContract, useUpdateContract } from '../api/contracts';
import type { Contract } from '../types/contract';
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

interface ContractListProps {
  customerId: string;
}

export function ContractList({ customerId }: ContractListProps) {
  const { toast } = useToast();
  const { data: contracts = [], isLoading, isError, error } = useContracts(customerId);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const renewMutation = useRenewContract();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync({ customerId, ...data });
      toast({ title: 'Contrato criado', description: 'Contrato registrado com sucesso.' });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao criar contrato',
        description: err instanceof Error ? err.message : 'Nao foi possivel criar o contrato.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingContract) return;
    try {
      await updateMutation.mutateAsync({ customerId, id: editingContract.id, ...data });
      toast({ title: 'Contrato atualizado', description: 'Contrato atualizado com sucesso.' });
      setEditingContract(null);
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao atualizar contrato',
        description: err instanceof Error ? err.message : 'Nao foi possivel atualizar o contrato.',
        variant: 'destructive',
      });
    }
  };

  const handleRenew = async (data: any) => {
    if (!renewingContract) return;
    try {
      await renewMutation.mutateAsync({ customerId, id: renewingContract.id, ...data });
      toast({ title: 'Contrato renovado', description: 'Contrato renovado com sucesso.' });
      setRenewingContract(null);
    } catch (err) {
      toast({
        title: 'Erro ao renovar contrato',
        description: err instanceof Error ? err.message : 'Nao foi possivel renovar o contrato.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={`contract-skeleton-${item}`} className="rounded-lg border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar contratos: {(error as Error)?.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contratos</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingContract(null)}>Novo contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? 'Editar contrato' : 'Novo contrato'}</DialogTitle>
            </DialogHeader>
            <ContractForm
              onSubmit={editingContract ? handleUpdate : handleCreate}
              submitLabel={editingContract ? 'Salvar alteracoes' : 'Criar contrato'}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              defaultValues={
                editingContract
                  ? {
                      numero: editingContract.numero,
                      valor: editingContract.valor,
                      dataInicio: editingContract.dataInicio.slice(0, 10),
                      dataFim: editingContract.dataFim.slice(0, 10),
                      servicos: editingContract.servicos,
                      condicoes: editingContract.condicoes ?? '',
                      moeda: editingContract.moeda ?? 'BRL',
                      status: editingContract.status,
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onEdit={(selected) => {
              setEditingContract(selected);
              setDialogOpen(true);
            }}
            onRenew={(selected) => setRenewingContract(selected)}
          />
        ))}
      </div>

      <RenewContractDialog
        onSubmit={handleRenew}
        isSubmitting={renewMutation.isPending}
        open={!!renewingContract}
        onOpenChange={(open) => {
          if (!open) {
            setRenewingContract(null);
          }
        }}
        defaultValues={
          renewingContract
            ? {
                numero: generateRenewalNumber(renewingContract.numero),
                dataInicio: renewingContract.dataFim.slice(0, 10),
                dataFim: calculateRenewalEndDate(renewingContract.dataFim),
                valor: renewingContract.valor,
                servicos: renewingContract.servicos,
                condicoes: renewingContract.condicoes ?? '',
              }
            : undefined
        }
      />
    </div>
  );
}

/** Generate a suggested renewal number based on the old contract number */
function generateRenewalNumber(oldNumero: string): string {
  const year = new Date().getFullYear();
  // Try to extract base and increment suffix
  const match = oldNumero.match(/^(.+?)-R(\d+)$/);
  if (match) {
    const base = match[1];
    const renewalNum = parseInt(match[2], 10) + 1;
    return `${base}-R${renewalNum}`;
  }
  return `${oldNumero}-R1`;
}

/** Calculate suggested end date (1 year from the old contract end date) */
function calculateRenewalEndDate(oldEndDate: string): string {
  const date = new Date(oldEndDate);
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}
