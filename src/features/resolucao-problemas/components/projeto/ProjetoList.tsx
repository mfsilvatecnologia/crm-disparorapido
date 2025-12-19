import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { useProjetos } from '../../hooks/useProjetos'
import { Metodologia, ProjetoStatus } from '../../types/projeto.types'
import type { Projeto } from '../../types/projeto.types'
import { ProjetoCard } from './ProjetoCard'
import { EmptyState } from '../shared/EmptyState'

export const filterProjetos = (items: Projeto[], search: string) => {
  if (!search) return items
  const term = search.toLowerCase()
  return items.filter(
    (projeto) =>
      projeto.titulo.toLowerCase().includes(term) ||
      projeto.descricao.toLowerCase().includes(term)
  )
}

export function ProjetoList() {
  const navigate = useNavigate()
  const [busca, setBusca] = React.useState('')
  const [status, setStatus] = React.useState<'all' | ProjetoStatus>('all')
  const [metodologia, setMetodologia] = React.useState<'all' | Metodologia>('all')
  const [page, setPage] = React.useState(1)
  const limit = 20

  const { data, isLoading, isError, refetch } = useProjetos({
    page,
    limit,
    busca: busca || undefined,
    status: status === 'all' ? undefined : status,
    metodologia: metodologia === 'all' ? undefined : metodologia
  })

  const items = filterProjetos(data?.items ?? [], busca)
  const totalPages = data?.total_pages ?? 1

  React.useEffect(() => {
    setPage(1)
  }, [status, metodologia])

  const handleFilter = () => {
    setPage(1)
    refetch()
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando projetos...</div>
  }

  if (isError) {
    return <div className="text-sm text-destructive">Erro ao carregar projetos.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="grid gap-3 md:grid-cols-3 md:items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Busca</label>
            <Input
              name="busca"
              placeholder="Buscar por titulo ou descricao"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value={ProjetoStatus.PLANEJAMENTO}>Planejamento</SelectItem>
                <SelectItem value={ProjetoStatus.EM_ANDAMENTO}>Em andamento</SelectItem>
                <SelectItem value={ProjetoStatus.AGUARDANDO}>Aguardando</SelectItem>
                <SelectItem value={ProjetoStatus.CONCLUIDO}>Concluido</SelectItem>
                <SelectItem value={ProjetoStatus.CANCELADO}>Cancelado</SelectItem>
                <SelectItem value={ProjetoStatus.ARQUIVADO}>Arquivado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Metodologia</label>
            <Select value={metodologia} onValueChange={(value) => setMetodologia(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value={Metodologia.MASP}>MASP</SelectItem>
                <SelectItem value={Metodologia.OITO_D}>8D</SelectItem>
                <SelectItem value={Metodologia.A3}>A3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFilter}>
            Filtrar
          </Button>
          <Button onClick={() => navigate('/app/projetos/novo')}>Novo projeto</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nenhum projeto encontrado"
          description="Ajuste os filtros ou crie um novo projeto."
          action={<Button onClick={() => navigate('/app/projetos/novo')}>Criar projeto</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((projeto) => (
            <ProjetoCard
              key={projeto.id}
              projeto={projeto}
              onSelect={(id) => navigate(`/app/projetos/${id}`)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Resultados: {data?.total ?? items.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            Proxima
          </Button>
        </div>
      </div>
    </div>
  )
}
