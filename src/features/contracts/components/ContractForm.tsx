import React, { useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { CONTRACT_STATUSES, CONTRACT_STATUS_LABELS, CURRENCY_CODES, CURRENCY_LABELS } from '../lib/constants';
import { createContractSchema, type CreateContractInput } from '../lib/validations';

interface ContractFormProps {
  defaultValues?: Partial<CreateContractInput>;
  onSubmit: (data: CreateContractInput) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function ContractForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar contrato',
  isSubmitting = false,
  onCancel,
}: ContractFormProps) {
  const numeroId = useId();
  const valorId = useId();
  const dataInicioId = useId();
  const dataFimId = useId();
  const servicosId = useId();
  const condicoesId = useId();
  const moedaId = useId();
  const statusId = useId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      numero: '',
      valor: 0,
      dataInicio: '',
      dataFim: '',
      servicos: '',
      condicoes: '',
      moeda: 'BRL',
      status: 'VIGENTE',
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={numeroId}>
            Número do Contrato
          </label>
          <Input
            id={numeroId}
            placeholder="Ex: CTR-2025-001"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={moedaId}>
            Moeda
          </label>
          <Controller
            name="moeda"
            control={control}
            render={({ field }) => (
              <Select value={field.value || 'BRL'} onValueChange={field.onChange}>
                <SelectTrigger id={moedaId}>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CURRENCY_LABELS[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={statusId}>
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value || 'VIGENTE'} onValueChange={field.onChange}>
                <SelectTrigger id={statusId}>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {CONTRACT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
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
        <label className="text-sm font-medium" htmlFor={servicosId}>
          Serviços
        </label>
        <Textarea
          id={servicosId}
          rows={3}
          placeholder="Descrição dos serviços contratados"
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
          Condições Especiais (Opcional)
        </label>
        <Textarea
          id={condicoesId}
          rows={2}
          placeholder="Ex: Renovação automática com reajuste de 10%"
          {...register('condicoes')}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
