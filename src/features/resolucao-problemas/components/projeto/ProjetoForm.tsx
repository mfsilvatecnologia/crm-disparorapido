import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/shared/components/ui/form'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import type { CreateProjetoRequest } from '../../types/api.types'
import { projetoCreateSchema, type ProjetoCreateInput } from '../../validators/projetoValidator'
import { ClienteAutocomplete } from '../shared/ClienteAutocomplete'
import { UserSelector } from '../shared/UserSelector'

interface ProjetoFormProps {
  onSubmit: (data: CreateProjetoRequest) => Promise<void> | void
  isLoading?: boolean
}

const formatDateInput = (value: unknown) => {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return ''
}

const toApiDate = (value: unknown) => {
  if (!value) return value
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string') return value.slice(0, 10)
  return value
}

export function ProjetoForm({
  onSubmit,
  isLoading
}: ProjetoFormProps) {
  const form = useForm<ProjetoCreateInput>({
    resolver: zodResolver(projetoCreateSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      cliente_id: '',
      responsavel_id: '',
      data_inicio: undefined,
      data_prevista_conclusao: null
    }
  })

  const handleSubmit = async (data: ProjetoCreateInput) => {
    const payload: CreateProjetoRequest = {
      ...data,
      data_inicio: String(toApiDate(data.data_inicio)),
      data_prevista_conclusao: data.data_prevista_conclusao
        ? String(toApiDate(data.data_prevista_conclusao))
        : null
    }

    await onSubmit(payload)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid="projeto-form"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titulo *</FormLabel>
                <FormControl>
                  <Input placeholder="Titulo do projeto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cliente_id"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Lead *</FormLabel>
                <FormControl>
                  <ClienteAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione o lead"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="responsavel_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsavel *</FormLabel>
                <FormControl>
                  <UserSelector
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione o responsavel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de inicio *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    name={field.name}
                    value={formatDateInput(field.value)}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(value ? new Date(value) : undefined)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data_prevista_conclusao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Previsao de conclusao</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    name={field.name}
                    value={formatDateInput(field.value)}
                    onChange={(event) => {
                      const value = event.target.value
                      field.onChange(value ? new Date(value) : null)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descricao *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o problema a ser resolvido"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar projeto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
