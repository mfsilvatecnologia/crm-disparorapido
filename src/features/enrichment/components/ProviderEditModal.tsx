import React from 'react';
import type { Provider } from '../types/enrichment';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  priority: z.number().min(1, 'Prioridade deve ser > 0'),
  rateLimitPerMin: z.number().min(1, 'Rate limit deve ser > 0'),
});

type FormValues = z.infer<typeof schema>;

export interface ProviderEditModalProps {
  open: boolean;
  provider: Provider | null;
  onClose: () => void;
  onSave: (values: FormValues) => Promise<void> | void;
}

export const ProviderEditModal: React.FC<ProviderEditModalProps> = ({ open, provider, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: provider?.priority ?? 1,
      rateLimitPerMin: provider?.rateLimitPerMin ?? 60,
    },
  });

  React.useEffect(() => {
    if (provider) {
      reset({ priority: provider.priority, rateLimitPerMin: provider.rateLimitPerMin });
    }
  }, [provider, reset]);

  if (!open || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded p-4 w-full max-w-sm">
        <div className="font-semibold mb-2">Editar Provider</div>
        <form
          onSubmit={handleSubmit(async (vals) => {
            await onSave(vals);
            onClose();
          })}
          className="space-y-3"
        >
          <div>
            <label className="text-sm">Prioridade</label>
            <input type="number" className="w-full border rounded p-2"
              {...register('priority', { valueAsNumber: true })} />
            {errors.priority && (
              <div className="text-xs text-red-600">{errors.priority.message as string}</div>
            )}
          </div>
          <div>
            <label className="text-sm">Rate limit por minuto</label>
            <input type="number" className="w-full border rounded p-2"
              {...register('rateLimitPerMin', { valueAsNumber: true })} />
            {errors.rateLimitPerMin && (
              <div className="text-xs text-red-600">{errors.rateLimitPerMin.message as string}</div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-3 py-2 border rounded" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
