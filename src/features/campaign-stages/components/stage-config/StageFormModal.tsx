import React from 'react'
import type { StageFormState } from '../../types/ui.types'
import ColorPicker from './ColorPicker'
import IconPicker from './IconPicker'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema simplificado para o formulário
const FormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  categoria: z.enum(['novo', 'contato', 'qualificacao', 'negociacao', 'ganho', 'perdido']),
  cor: z.string(),
  icone: z.string().optional(),
  isInicial: z.boolean().optional(),
  isFinal: z.boolean().optional(),
  cobraCreditos: z.boolean().optional(),
  custoCentavos: z.number().optional(),
  descricaoCobranca: z.string().optional(),
})

type Props = {
  open: boolean
  initial?: Partial<StageFormState>
  onClose: () => void
  onSubmit: (data: StageFormState) => void
}

export function StageFormModal({ open, initial, onClose, onSubmit }: Props) {
  const isEdit = !!initial?.id
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StageFormState>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nome: initial?.nome || '',
      categoria: (initial?.categoria as any) || 'novo',
      cor: initial?.cor || '#3B82F6',
      icone: initial?.icone,
      isInicial: initial?.isInicial || false,
      isFinal: initial?.isFinal || false,
      cobraCreditos: initial?.cobraCreditos || false,
      custoCentavos: initial?.custoCentavos,
      descricaoCobranca: initial?.descricaoCobranca,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        nome: initial?.nome || '',
        categoria: (initial?.categoria as any) || 'novo',
        cor: initial?.cor || '#3B82F6',
        icone: initial?.icone,
        isInicial: initial?.isInicial || false,
        isFinal: initial?.isFinal || false,
        cobraCreditos: initial?.cobraCreditos || false,
        custoCentavos: initial?.custoCentavos,
        descricaoCobranca: initial?.descricaoCobranca,
      })
    }
  }, [open, initial, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded p-4 shadow w-[480px]">
        <div className="font-medium mb-3">{initial?.id ? 'Editar estágio' : 'Novo estágio'}</div>
        <form className="grid gap-3" onSubmit={handleSubmit((data) => onSubmit(data))}>
          <label className="grid gap-1 text-sm">
            <span>Nome</span>
            <input className="border rounded px-2 py-1" {...register('nome')} />
            {errors.nome && <span className="text-xs text-red-600">{String(errors.nome.message)}</span>}
          </label>

          <label className="grid gap-1 text-sm">
            <span>Categoria</span>
            <select className="border rounded px-2 py-1" {...register('categoria')} disabled={isEdit}>
              <option value="novo">Novo</option>
              <option value="contato">Contato</option>
              <option value="qualificacao">Qualificação</option>
              <option value="negociacao">Negociação</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
            {isEdit && <span className="text-[11px] text-muted-foreground">Este campo não pode ser alterado após a criação.</span>}
          </label>

          <div className="grid grid-cols-[auto,1fr] gap-3 items-center">
            <span className="text-sm">Cor</span>
            <ColorPicker value={watch('cor')} onChange={(cor) => setValue('cor', cor)} />
          </div>

          <label className="grid gap-1 text-sm">
            <span>Ícone</span>
            <IconPicker value={watch('icone')} onChange={(icone) => setValue('icone', icone)} />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isInicial')} disabled={isEdit} /> Estágio inicial
            {isEdit && <span className="text-[11px] text-muted-foreground">Não pode ser alterado após a criação.</span>}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('isFinal')} /> Estágio final
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('cobraCreditos')} /> Cobrar créditos
          </label>

          {watch('cobraCreditos') && (
            <label className="grid gap-1 text-sm">
              <span>Custo (centavos)</span>
              <input type="number" className="border rounded px-2 py-1" {...register('custoCentavos', { valueAsNumber: true })} />
              {errors.custoCentavos && <span className="text-xs text-red-600">{String(errors.custoCentavos.message)}</span>}
            </label>
          )}

          <label className="grid gap-1 text-sm">
            <span>Descrição da cobrança</span>
            <input className="border rounded px-2 py-1" {...register('descricaoCobranca')} />
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-3 py-1 border rounded" onClick={onClose}>Cancelar</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StageFormModal
