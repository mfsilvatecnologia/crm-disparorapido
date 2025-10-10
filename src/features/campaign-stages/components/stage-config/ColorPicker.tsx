import React from 'react'

type Props = {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: Props) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-12 p-0 border rounded"
      aria-label="Selecionar cor do estágio"
    />
  )
}

export default ColorPicker

