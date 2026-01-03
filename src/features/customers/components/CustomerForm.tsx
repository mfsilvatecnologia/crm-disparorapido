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
import { updateCustomerSchema, type UpdateCustomerInput } from '../lib/validations';
import { CUSTOMER_SEGMENTS } from '../lib/constants';

interface CustomerFormProps {
  defaultValues?: Partial<UpdateCustomerInput>;
  onSubmit: (data: UpdateCustomerInput) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar cliente',
  isSubmitting = false,
  onCancel,
}: CustomerFormProps) {
  const nomeId = useId();
  const segmentoId = useId();
  const emailId = useId();
  const telefoneId = useId();
  const enderecoId = useId();
  const notasId = useId();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateCustomerInput>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      notas: '',
      ...defaultValues,
    },
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={nomeId}>
            Nome
          </label>
          <Input
            id={nomeId}
            placeholder="Nome do cliente"
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
          <label className="text-sm font-medium" htmlFor={segmentoId}>
            Segmento
          </label>
          <Controller
            name="segmento"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? 'none'}
                onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
              >
                <SelectTrigger
                  id={segmentoId}
                  aria-invalid={!!errors.segmento}
                  aria-describedby={errors.segmento ? `${segmentoId}-error` : undefined}
                >
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem segmento</SelectItem>
                  {CUSTOMER_SEGMENTS.map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.segmento ? (
            <p id={`${segmentoId}-error`} className="text-xs text-destructive">
              {errors.segmento.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={emailId}>
            Email
          </label>
          <Input
            id={emailId}
            type="email"
            placeholder="Email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <p id={`${emailId}-error`} className="text-xs text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={telefoneId}>
            Telefone
          </label>
          <Input id={telefoneId} placeholder="Telefone" {...register('telefone')} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={enderecoId}>
          Endereco
        </label>
        <Input id={enderecoId} placeholder="Endereco completo" {...register('endereco')} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={notasId}>
          Notas
        </label>
        <Textarea id={notasId} rows={4} placeholder="Observacoes internas" {...register('notas')} />
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
