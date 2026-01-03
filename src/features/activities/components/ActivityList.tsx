import React, { useState } from 'react';
import { ActivityCard } from './ActivityCard';
import { ActivityForm } from './ActivityForm';
import { useActivities, useCreateActivity, useDeleteActivity, useUpdateActivity } from '../api/activities';
import type { Activity } from '../types/activity';
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

interface ActivityListProps {
  customerId: string;
}

export function ActivityList({ customerId }: ActivityListProps) {
  const { toast } = useToast();
  const { data: activities = [], isLoading, isError, error } = useActivities(customerId);
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleCreate = async (data: { tipo: Activity['tipo']; descricao: string; dataHora: string }) => {
    try {
      await createMutation.mutateAsync({ customerId, ...data });
      toast({ title: 'Atividade criada', description: 'Atividade registrada com sucesso.' });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao criar atividade',
        description: err instanceof Error ? err.message : 'Nao foi possivel criar a atividade.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: { tipo: Activity['tipo']; descricao: string; dataHora: string }) => {
    if (!editingActivity) return;
    try {
      await updateMutation.mutateAsync({ customerId, id: editingActivity.id, ...data });
      toast({ title: 'Atividade atualizada', description: 'Atividade atualizada com sucesso.' });
      setEditingActivity(null);
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Erro ao atualizar atividade',
        description: err instanceof Error ? err.message : 'Nao foi possivel atualizar a atividade.',
        variant: 'destructive',
      });
    }
  };

  const handleAutoSave = (data: { tipo: Activity['tipo']; descricao: string; dataHora: string }) => {
    if (!editingActivity) return;
    updateMutation.mutate({ customerId, id: editingActivity.id, ...data });
  };

  const handleDelete = async (activity: Activity) => {
    try {
      await deleteMutation.mutateAsync({ id: activity.id, customerId });
      toast({ title: 'Atividade removida', description: 'Atividade removida com sucesso.' });
    } catch (err) {
      toast({
        title: 'Erro ao remover atividade',
        description: err instanceof Error ? err.message : 'Nao foi possivel remover a atividade.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={`activity-skeleton-${item}`} className="rounded-lg border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar atividades: {(error as Error)?.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atividades</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingActivity(null)}>Nova atividade</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingActivity ? 'Editar atividade' : 'Nova atividade'}</DialogTitle>
            </DialogHeader>
            <ActivityForm
              onSubmit={editingActivity ? handleUpdate : handleCreate}
              onAutoSave={editingActivity ? handleAutoSave : undefined}
              autoSave={!!editingActivity}
              submitLabel={editingActivity ? 'Salvar alteracoes' : 'Criar atividade'}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              defaultValues={
                editingActivity
                  ? {
                      tipo: editingActivity.tipo,
                      descricao: editingActivity.descricao,
                      dataHora: editingActivity.dataHora,
                    }
                  : undefined
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={(selected) => {
              setEditingActivity(selected);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
