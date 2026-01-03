import React, { useEffect, useId, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from '../lib/constants';
import { createActivitySchema, type CreateActivityInput } from '../lib/validations';

interface ActivityFormProps {
  defaultValues?: Partial<CreateActivityInput>;
  onSubmit: (data: CreateActivityInput) => Promise<void> | void;
  onAutoSave?: (data: CreateActivityInput) => void;
  autoSave?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function ActivityForm({
  defaultValues,
  onSubmit,
  onAutoSave,
  autoSave = false,
  submitLabel = 'Salvar atividade',
  isSubmitting = false,
  onCancel,
}: ActivityFormProps) {
  const tipoId = useId();
  const dataId = useId();
  const descricaoId = useId();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateActivityInput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      tipo: 'call',
      descricao: '',
      dataHora: '',
      ...defaultValues,
    },
  });

  const debounceRef = useRef<number | null>(null);
  const watchedValues = watch();

  useEffect(() => {
    if (!autoSave || !onAutoSave) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      onAutoSave(watchedValues);
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [autoSave, onAutoSave, watchedValues]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={tipoId}>
            Tipo
          </label>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={tipoId}
                  aria-invalid={!!errors.tipo}
                  aria-describedby={errors.tipo ? `${tipoId}-error` : undefined}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ACTIVITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo ? (
            <p id={`${tipoId}-error`} className="text-xs text-destructive">
              {errors.tipo.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={dataId}>
            Data e hora
          </label>
          <Input
            id={dataId}
            type="datetime-local"
            aria-invalid={!!errors.dataHora}
            aria-describedby={errors.dataHora ? `${dataId}-error` : undefined}
            {...register('dataHora')}
          />
          {errors.dataHora ? (
            <p id={`${dataId}-error`} className="text-xs text-destructive">
              {errors.dataHora.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={descricaoId}>
          Descricao
        </label>
        <Textarea
          id={descricaoId}
          rows={4}
          placeholder="Detalhes da atividade"
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
