import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { ProjetoForm } from '../components/projeto/ProjetoForm'
import { useCreateProjeto } from '../hooks/useProjeto'
import type { CreateProjetoRequest } from '../types/api.types'

export function ProjetoNovoPage() {
  const createMutation = useCreateProjeto()
  const [successMessage, setSuccessMessage] = React.useState('')

  const handleSubmit = async (data: CreateProjetoRequest) => {
    try {
      await createMutation.mutateAsync(data)
      setSuccessMessage('Projeto criado com sucesso. Metodologia pendente.')
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Novo projeto</h1>
        <p className="text-sm text-muted-foreground">
          Crie um projeto e defina a metodologia posteriormente.
        </p>
      </div>

      {successMessage ? (
        <Alert>
          <AlertTitle>Projeto criado com sucesso</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <ProjetoForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
