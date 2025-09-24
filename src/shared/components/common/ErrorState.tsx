import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Erro ao carregar dados',
  message = 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`container mx-auto p-6 ${className}`}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function InlineErrorState({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        {message}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}