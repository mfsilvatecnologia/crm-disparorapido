import { Progress } from '@/shared/components/ui/progress'

interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className="space-y-1">
      {label ? <div className="text-xs text-muted-foreground">{label}</div> : null}
      <Progress value={safeValue} />
    </div>
  )
}
