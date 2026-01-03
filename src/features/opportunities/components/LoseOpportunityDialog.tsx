import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoseOpportunity } from '../api/opportunities';
import { loseOpportunitySchema, type LoseOpportunityInput } from '../lib/validations';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import type { Opportunity } from '../types/opportunity';

interface LoseOpportunityDialogProps {
  opportunityId: string;
  onLost?: (opportunity: Opportunity) => void;
}

export function LoseOpportunityDialog({ opportunityId, onLost }: LoseOpportunityDialogProps) {
  const { toast } = useToast();
  const loseMutation = useLoseOpportunity();
  const form = useForm<LoseOpportunityInput>({
    resolver: zodResolver(loseOpportunitySchema),
    defaultValues: { motivoPerdida: '' },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const updated = await loseMutation.mutateAsync({ opportunityId, ...data });
      toast({
        title: 'Oportunidade perdida',
        description: 'Oportunidade marcada como perdida.',
      });
      onLost?.(updated);
      form.reset();
    } catch (error) {
      toast({
        title: 'Erro ao marcar oportunidade',
        description: error instanceof Error ? error.message : 'Nao foi possivel atualizar a oportunidade.',
        variant: 'destructive',
      });
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Marcar como perdida</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar motivo da perda</DialogTitle>
          <DialogDescription>
            Informe o motivo da perda para manter o historico atualizado.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Textarea
              rows={4}
              placeholder="Descreva o motivo da perda"
              {...form.register('motivoPerdida')}
            />
            {form.formState.errors.motivoPerdida ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.motivoPerdida.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={loseMutation.isPending}
            >
              {loseMutation.isPending ? 'Salvando...' : 'Confirmar perda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
