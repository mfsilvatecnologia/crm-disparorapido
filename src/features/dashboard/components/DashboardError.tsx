import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';

interface DashboardErrorProps {
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Error state component for Dashboard
 * Displays when data fetching fails
 */
export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dashboard</AlertTitle>
        <AlertDescription>
          {error?.message || 'Ocorreu um erro ao carregar os dados do dashboard. Por favor, tente novamente.'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Não foi possível carregar os dados</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <p className="text-center text-muted-foreground max-w-md">
            Houve um problema ao buscar os dados do dashboard. Isso pode ter acontecido devido a um problema de conexão ou erro no servidor.
          </p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Optional: Show error details in development */}
      {import.meta.env.DEV && error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Detalhes do Erro (Dev Mode)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto p-4 bg-muted rounded">
              {JSON.stringify(
                {
                  message: error.message,
                  stack: error.stack,
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
