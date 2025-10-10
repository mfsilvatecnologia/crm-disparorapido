import { DEFAULT_STAGE_COLORS } from '../types/constants'
import type { StageCategory } from '../types/stage.types'

export function formatCentavosToReais(value?: number | null): string {
  const amount = typeof value === 'number' ? value / 100 : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export function formatDurationHours(value?: number | null): string {
  if (value === null || value === undefined) return '—'
  const hours = Math.floor(value)
  const minutes = Math.round((value - hours) * 60)
  const parts: string[] = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  return parts.length ? parts.join(' ') : '0m'
}

export function formatStageColor(categoria: StageCategory, color?: string): string {
  if (color && /^#[0-9A-F]{6}$/i.test(color)) return color
  return DEFAULT_STAGE_COLORS[categoria]
}

