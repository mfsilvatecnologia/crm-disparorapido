import React, { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { createContactSchema, type CreateContactInput } from '../lib/validations';

interface ContactFormProps {
  defaultValues?: Partial<CreateContactInput>;
  onSubmit: (data: CreateContactInput) => Promise<void> | void;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function ContactForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Salvar contato',
  isSubmitting = false,
  onCancel,
}: ContactFormProps) {
  const nomeId = useId();
  const emailId = useId();
  const telefoneId = useId();
  const cargoId = useId();
  const departamentoId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContactInput>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
      departamento: '',
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
            placeholder="Nome do contato"
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={telefoneId}>
            Telefone
          </label>
          <Input id={telefoneId} placeholder="Telefone" {...register('telefone')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={cargoId}>
            Cargo
          </label>
          <Input id={cargoId} placeholder="Cargo" {...register('cargo')} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={departamentoId}>
          Departamento
        </label>
        <Input id={departamentoId} placeholder="Departamento" {...register('departamento')} />
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
