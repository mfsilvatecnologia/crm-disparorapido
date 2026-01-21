import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Users,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Segment } from '../types/segments';

interface SegmentCardProps {
  segment: Segment;
  onEdit?: (segment: Segment) => void;
  onDuplicate?: (segment: Segment) => void;
  onDelete?: (segment: Segment) => void;
  onRefresh?: (segment: Segment) => void;
  onExport?: (segment: Segment) => void;
  onViewLeads?: (segment: Segment) => void;
  onViewAnalytics?: (segment: Segment) => void;
  className?: string;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  onEdit,
  onDuplicate,
  onDelete,
  onRefresh,
  onExport,
  onViewLeads,
  onViewAnalytics,
  className
}) => {
  const getTipoColor = (tipo: Segment['tipo']) => {
    switch (tipo) {
      case 'demografico':
        return 'bg-blue-100 text-blue-800';
      case 'comportamental':
        return 'bg-green-100 text-green-800';
      case 'geografico':
        return 'bg-orange-100 text-orange-800';
      case 'psicografico':
        return 'bg-blue-100 text-blue-800';
      case 'personalizado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: segment.cor || '#64748b' }}
              />
              <h3 className="font-semibold text-lg truncate">{segment.nome}</h3>
              {!segment.ativo && (
                <Badge variant="secondary" className="text-xs">Inativo</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getTipoColor(segment.tipo)}>
                {segment.tipo}
              </Badge>

              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {segment.contadorLeads.toLocaleString('pt-BR')} leads
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onViewLeads && (
                <DropdownMenuItem onClick={() => onViewLeads(segment)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Leads
                </DropdownMenuItem>
              )}
              {onViewAnalytics && (
                <DropdownMenuItem onClick={() => onViewAnalytics(segment)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(segment)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(segment)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              )}
              {onRefresh && (
                <DropdownMenuItem onClick={() => onRefresh(segment)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar Contagem
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onExport && (
                <DropdownMenuItem onClick={() => onExport(segment)}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(segment)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {segment.descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {segment.descricao}
            </p>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Criado em {formatDate(segment.criadoEm)}</p>
            {segment.estimativaAtualizacao && (
              <p>Próxima atualização: {formatDate(segment.estimativaAtualizacao)}</p>
            )}
          </div>

          {segment.tags && segment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {segment.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {segment.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{segment.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {segment.condicoes.length} condição{segment.condicoes.length !== 1 ? 'ões' : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};