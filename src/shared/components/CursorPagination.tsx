/**
 * CursorPagination Component
 *
 * Componente de paginação baseada em cursor para navegação prev/next
 * Compatível com o sistema de cursor pagination do backend
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export interface CursorPaginationProps {
  hasMore: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  totalReturned?: number;
  limit?: number;
  className?: string;
}

export function CursorPagination({
  hasMore,
  hasPrevious,
  onNext,
  onPrevious,
  isLoading = false,
  totalReturned,
  limit,
  className = '',
}: CursorPaginationProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {totalReturned !== undefined && (
          <span>
            {totalReturned} {totalReturned === 1 ? 'item' : 'itens'}
            {limit && ` (max ${limit} por página)`}
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasMore || isLoading}
          className="flex items-center gap-1"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Simple variant with minimal info
 */
export function SimpleCursorPagination({
  hasMore,
  hasPrevious,
  onNext,
  onPrevious,
  isLoading = false,
}: Pick<CursorPaginationProps, 'hasMore' | 'hasPrevious' | 'onNext' | 'onPrevious' | 'isLoading'>) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious || isLoading}
        title="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-xs text-muted-foreground px-2">
        {isLoading ? 'Carregando...' : ' '}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!hasMore || isLoading}
        title="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
