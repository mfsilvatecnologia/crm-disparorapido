import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingState({ 
  message = 'Carregando...', 
  size = 'md',
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function FullPageLoadingState({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message={message} size="lg" />
    </div>
  );
}

export function InlineLoadingState({ message }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{message || 'Carregando...'}</span>
    </div>
  );
}