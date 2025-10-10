import React from 'react'
import { User, Bot } from 'lucide-react'

type Props = { automatico: boolean }

export function TimelineMarker({ automatico }: Props) {
  return (
    <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-background">
      {automatico ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
    </div>
  )
}

export default TimelineMarker

