/**
 * CursorPagination Component
 *
 * Componente de paginação baseada em cursor para navegação prev/next
 * Compatível com o sistema de cursor pagination do backend
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export interface CursorPaginationProps {
  hasMore: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onFirst?: () => void;
  isLoading?: boolean;
  totalReturned?: number;
  limit?: number;
  currentPage?: number;
  className?: string;
}

export function CursorPagination({
  hasMore,
  hasPrevious,
  onNext,
  onPrevious,
  onFirst,
  isLoading = false,
  totalReturned,
  limit,
  currentPage,
  className = '',
}: CursorPaginationProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Left side - Info */}
      <div className="flex items-center gap-3 text-sm">
        {currentPage !== undefined && (
          <Badge variant="secondary" className="font-mono">
            Página {currentPage}
          </Badge>
        )}
        <div className="text-muted-foreground">
          {totalReturned !== undefined && (
            <span>
              Mostrando <strong>{totalReturned}</strong> {totalReturned === 1 ? 'registro' : 'registros'}
              {limit && ` (até ${limit} por página)`}
            </span>
          )}
        </div>
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-2">
        {/* First page button (optional) */}
        {onFirst && hasPrevious && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFirst}
            disabled={!hasPrevious || isLoading}
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious || isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Status indicator */}
        <div className="px-3 py-1 text-xs text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Carregando...</span>
          ) : (
            <span className="text-muted-foreground/60">
              {hasMore ? '•••' : 'Última'}
            </span>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasMore || isLoading}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">Próxima</span>
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
