import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Metodologia } from '../../types/projeto.types'

interface MetodologiaSelectorProps {
  value?: Metodologia
  onChange: (value: Metodologia) => void
  disabled?: boolean
}

const options = [
  {
    value: Metodologia.MASP,
    label: 'MASP',
    description: 'Metodo de Analise e Solucao de Problemas'
  },
  {
    value: Metodologia.OITO_D,
    label: '8D',
    description: 'Eight Disciplines Problem Solving'
  },
  {
    value: Metodologia.A3,
    label: 'A3',
    description: 'A3 Problem Solving'
  }
]

export function MetodologiaSelector({ value, onChange, disabled }: MetodologiaSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as Metodologia)}
      className="grid gap-4"
    >
      {options.map((option) => {
        const id = `metodologia-${option.value}`
        return (
          <div key={option.value} className="flex items-start gap-3">
            <RadioGroupItem value={option.value} id={id} disabled={disabled} />
            <label htmlFor={id} className="grid gap-1 text-sm">
              <span className="font-medium">{option.label}</span>
              <span className="text-muted-foreground">{option.description}</span>
            </label>
          </div>
        )
      })}
    </RadioGroup>
  )
}
