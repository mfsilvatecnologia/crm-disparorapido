import React from 'react'
import { useBillingConfiguration, useUpdateBillingConfiguration } from '../../hooks/useCharges'

export function ChargeConfigForm() {
  const { data, isLoading } = useBillingConfiguration()
  const update = useUpdateBillingConfiguration()
  const [debitar, setDebitar] = React.useState(false)
  const [modelo, setModelo] = React.useState<'mudanca_estagio' | 'acesso_lead' | 'execucao_agente'>('mudanca_estagio')

  React.useEffect(() => {
    if (data) {
      setDebitar(!!data.debitarMudancaEstagio)
      setModelo(data.modeloCobrancaCampanha)
    }
  }, [data])

  if (isLoading) return <div>Carregando configurações...</div>

  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Configurações de Cobrança</div>
      <label className="grid gap-1 text-sm mb-2">
        <span>Modelo de cobrança</span>
        <select className="border rounded px-2 py-1" value={modelo} onChange={(e) => setModelo(e.target.value as any)}>
          <option value="mudanca_estagio">Mudança de estágio</option>
          <option value="acesso_lead">Acesso ao lead</option>
          <option value="execucao_agente">Execução de agente</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={debitar} onChange={(e) => setDebitar(e.target.checked)} /> Debitar créditos ao mover para estágio com cobrança
      </label>
      <div className="mt-3 flex justify-end">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded"
          onClick={() => update.mutate({ modeloCobrancaCampanha: modelo, debitarMudancaEstagio: debitar })}
          disabled={update.isPending}
        >Salvar</button>
      </div>
    </div>
  )
}

export default ChargeConfigForm

