import React, { useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateCustomerStatus } from '../api/customers';
import { updateCustomerStatusSchema, type UpdateCustomerStatusInput } from '../lib/validations';
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_LABELS } from '../lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';

interface StatusChangeDialogProps {
  customerId: string;
  currentStatus: string;
}

export function StatusChangeDialog({ customerId, currentStatus }: StatusChangeDialogProps) {
  const statusId = useId();
  const { toast } = useToast();
  const updateStatus = useUpdateCustomerStatus();
  const form = useForm<UpdateCustomerStatusInput>({
    resolver: zodResolver(updateCustomerStatusSchema),
    defaultValues: { status: currentStatus as UpdateCustomerStatusInput['status'] },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await updateStatus.mutateAsync({ id: customerId, status: data.status });
      toast({
        title: 'Status atualizado',
        description: 'Status do cliente atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error instanceof Error ? error.message : 'Nao foi possivel atualizar o status.',
        variant: 'destructive',
      });
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Alterar status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar status</DialogTitle>
          <DialogDescription>Selecione o novo status do cliente.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium" htmlFor={statusId}>
            Status
          </label>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={statusId}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {CUSTOMER_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={updateStatus.isPending}>
              {updateStatus.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
