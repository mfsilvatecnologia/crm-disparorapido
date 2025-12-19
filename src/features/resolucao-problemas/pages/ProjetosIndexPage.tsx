import { ProjetoList } from '../components/projeto/ProjetoList'

export function ProjetosIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Projetos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe os projetos de resolucao de problemas.
        </p>
      </div>
      <ProjetoList />
    </div>
  )
}
