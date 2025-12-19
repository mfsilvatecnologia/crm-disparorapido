import { useParams } from 'react-router-dom'
import { ProjetoDetalhes } from '../components/projeto/ProjetoDetalhes'
import { useProjeto } from '../hooks/useProjeto'

export function ProjetoDetalhesPage() {
  const { id } = useParams()
  const { data, isLoading, isError } = useProjeto(id)

  if (!id) {
    return <div className="text-sm text-muted-foreground">Projeto nao encontrado.</div>
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando projeto...</div>
  }

  if (isError || !data) {
    return <div className="text-sm text-destructive">Erro ao carregar projeto.</div>
  }

  return <ProjetoDetalhes projeto={data} />
}
