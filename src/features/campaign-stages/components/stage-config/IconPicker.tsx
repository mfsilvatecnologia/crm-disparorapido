import React from 'react'

type Props = {
  value?: string
  onChange: (value?: string) => void
}

// Minimal placeholder; integrate lucide-react list later
export function IconPicker({ value, onChange }: Props) {
  return (
    <input
      type="text"
      value={value || ''}
      placeholder="nome do ícone (lucide)"
      onChange={(e) => onChange(e.target.value || undefined)}
      className="border rounded px-2 py-1 text-sm w-full"
      aria-label="Selecionar ícone"
    />
  )
}

export default IconPicker

