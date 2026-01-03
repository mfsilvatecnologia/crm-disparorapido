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
import { createOpportunitySchema, type CreateOpportunityInput } from '../lib/validations';
import { OPPORTUNITY_STAGES } from '../lib/constants';

interface OpportunityFormProps {
  defaultValues?: Partial<CreateOpportunityInput>;
  onSubmit: (data: CreateOpportunityInput) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function OpportunityForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar oportunidade',
  isSubmitting = false,
  onCancel,
}: OpportunityFormProps) {
  const nomeId = useId();
  const descricaoId = useId();
  const valorId = useId();
  const probabilidadeId = useId();
  const estagioId = useId();
  const dataId = useId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateOpportunityInput>({
    resolver: zodResolver(createOpportunitySchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorEstimado: 0,
      probabilidade: 50,
      estagio: 'Lead',
      expectedCloseDate: '',
      leadId: null,
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={nomeId}>
          Nome
        </label>
        <Input
          id={nomeId}
          placeholder="Nome da oportunidade"
          aria-invalid={!!errors.nome}
          aria-describedby={errors.nome ? `${nomeId}-error` : undefined}
          {...register('nome')}
        />
        {errors.nome ? (
          <p id={`${nomeId}-error`} className="text-xs text-destructive">
            {errors.nome.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={descricaoId}>
          Descricao
        </label>
        <Textarea
          id={descricaoId}
          placeholder="Descricao da oportunidade"
          rows={4}
          aria-invalid={!!errors.descricao}
          aria-describedby={errors.descricao ? `${descricaoId}-error` : undefined}
          {...register('descricao')}
        />
        {errors.descricao ? (
          <p id={`${descricaoId}-error`} className="text-xs text-destructive">
            {errors.descricao.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={valorId}>
            Valor estimado
          </label>
          <Input
            id={valorId}
            type="number"
            step="0.01"
            aria-invalid={!!errors.valorEstimado}
            aria-describedby={errors.valorEstimado ? `${valorId}-error` : undefined}
            {...register('valorEstimado')}
          />
          {errors.valorEstimado ? (
            <p id={`${valorId}-error`} className="text-xs text-destructive">
              {errors.valorEstimado.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={probabilidadeId}>
            Probabilidade (%)
          </label>
          <Input
            id={probabilidadeId}
            type="number"
            min={0}
            max={100}
            aria-invalid={!!errors.probabilidade}
            aria-describedby={errors.probabilidade ? `${probabilidadeId}-error` : undefined}
            {...register('probabilidade')}
          />
          {errors.probabilidade ? (
            <p id={`${probabilidadeId}-error`} className="text-xs text-destructive">
              {errors.probabilidade.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={estagioId}>
            Estagio
          </label>
          <Controller
            name="estagio"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={estagioId}
                  aria-invalid={!!errors.estagio}
                  aria-describedby={errors.estagio ? `${estagioId}-error` : undefined}
                >
                  <SelectValue placeholder="Selecione o estagio" />
                </SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.estagio ? (
            <p id={`${estagioId}-error`} className="text-xs text-destructive">
              {errors.estagio.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={dataId}>
            Data prevista
          </label>
          <Input
            id={dataId}
            type="date"
            aria-invalid={!!errors.expectedCloseDate}
            aria-describedby={errors.expectedCloseDate ? `${dataId}-error` : undefined}
            {...register('expectedCloseDate')}
          />
          {errors.expectedCloseDate ? (
            <p id={`${dataId}-error`} className="text-xs text-destructive">
              {errors.expectedCloseDate.message}
            </p>
          ) : null}
        </div>
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
