import React, { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { renewContractSchema, type RenewContractInput } from '../lib/validations';

interface RenewContractDialogProps {
  onSubmit: (data: RenewContractInput) => Promise<void> | void;
  isSubmitting?: boolean;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Default values to pre-fill the form (e.g., suggested numero and servicos from previous contract) */
  defaultValues?: Partial<RenewContractInput>;
}

export function RenewContractDialog({
  onSubmit,
  isSubmitting = false,
  trigger,
  open,
  onOpenChange,
  defaultValues,
}: RenewContractDialogProps) {
  const numeroId = useId();
  const dataInicioId = useId();
  const dataFimId = useId();
  const valorId = useId();
  const servicosId = useId();
  const condicoesId = useId();

  const { register, handleSubmit, formState: { errors } } = useForm<RenewContractInput>({
    resolver: zodResolver(renewContractSchema),
    defaultValues: {
      numero: defaultValues?.numero ?? '',
      dataInicio: defaultValues?.dataInicio ?? '',
      dataFim: defaultValues?.dataFim ?? '',
      valor: defaultValues?.valor ?? 0,
      servicos: defaultValues?.servicos ?? '',
      condicoes: defaultValues?.condicoes ?? '',
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Renovar contrato</DialogTitle>
          <DialogDescription>Defina os novos termos da renovação.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={numeroId}>
              Número do Novo Contrato
            </label>
            <Input
              id={numeroId}
              placeholder="Ex: CTR-2026-001"
              aria-invalid={!!errors.numero}
              aria-describedby={errors.numero ? `${numeroId}-error` : undefined}
              {...register('numero')}
            />
            {errors.numero ? (
              <p id={`${numeroId}-error`} className="text-xs text-destructive">
                {errors.numero.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={dataInicioId}>
                Data de Início
              </label>
              <Input
                id={dataInicioId}
                type="date"
                aria-invalid={!!errors.dataInicio}
                aria-describedby={errors.dataInicio ? `${dataInicioId}-error` : undefined}
                {...register('dataInicio')}
              />
              {errors.dataInicio ? (
                <p id={`${dataInicioId}-error`} className="text-xs text-destructive">
                  {errors.dataInicio.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={dataFimId}>
                Data de Fim
              </label>
              <Input
                id={dataFimId}
                type="date"
                aria-invalid={!!errors.dataFim}
                aria-describedby={errors.dataFim ? `${dataFimId}-error` : undefined}
                {...register('dataFim')}
              />
              {errors.dataFim ? (
                <p id={`${dataFimId}-error`} className="text-xs text-destructive">
                  {errors.dataFim.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={valorId}>
              Valor
            </label>
            <Input
              id={valorId}
              type="number"
              step="0.01"
              aria-invalid={!!errors.valor}
              aria-describedby={errors.valor ? `${valorId}-error` : undefined}
              {...register('valor')}
            />
            {errors.valor ? (
              <p id={`${valorId}-error`} className="text-xs text-destructive">
                {errors.valor.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={servicosId}>
              Serviços
            </label>
            <Textarea
              id={servicosId}
              rows={2}
              placeholder="Descrição dos serviços renovados"
              aria-invalid={!!errors.servicos}
              aria-describedby={errors.servicos ? `${servicosId}-error` : undefined}
              {...register('servicos')}
            />
            {errors.servicos ? (
              <p id={`${servicosId}-error`} className="text-xs text-destructive">
                {errors.servicos.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={condicoesId}>
              Condições (Opcional)
            </label>
            <Textarea
              id={condicoesId}
              rows={2}
              placeholder="Condições especiais do contrato renovado"
              {...register('condicoes')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Confirmar renovação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
