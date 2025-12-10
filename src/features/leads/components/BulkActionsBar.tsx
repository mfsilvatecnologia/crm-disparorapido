import React, { useState } from 'react';
import { CheckSquare, Mail, Phone, MessageSquare, UserPlus, Tag as TagIcon, TrendingUp, Trash2, Download, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { Lead } from '@/shared/services/schemas';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedLeads: Lead[];
  onClearSelection: () => void;
  onStatusChange?: (status: string) => Promise<void>;
  onAssign?: (userId: string) => Promise<void>;
  onAddTags?: (tags: string[]) => Promise<void>;
  onExport?: () => void;
  onDelete?: () => Promise<void>;
  onAddToPipeline?: () => Promise<void>;
}

export function BulkActionsBar({
  selectedCount,
  selectedLeads,
  onClearSelection,
  onStatusChange,
  onAssign,
  onAddTags,
  onExport,
  onDelete,
  onAddToPipeline
}: BulkActionsBarProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (status: string) => {
    setIsProcessing(true);
    try {
      await onStatusChange?.(status);
      setShowStatusDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete?.();
      setShowDeleteDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalValue = selectedLeads.reduce((sum, lead) => sum + 2.50, 0); // R$2.50 por lead

  return (
    <>
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {selectedCount} {selectedCount === 1 ? 'lead selecionado' : 'leads selecionados'}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Valor total: R$ {totalValue.toFixed(2)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Limpar seleção
              </Button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusDialog(true)}
                className="text-xs"
              >
                <Star className="h-4 w-4 mr-1" />
                Alterar Status
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignDialog(true)}
                className="text-xs"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Atribuir
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagsDialog(true)}
                className="text-xs"
              >
                <TagIcon className="h-4 w-4 mr-1" />
                Adicionar Tags
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onAddToPipeline}
                className="text-xs"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Adicionar ao Pipeline
              </Button>

              <div className="h-6 w-px bg-gray-300" />

              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="text-xs"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status de {selectedCount} Leads</DialogTitle>
            <DialogDescription>
              Selecione o novo status para os leads selecionados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select onValueChange={handleStatusChange} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">🆕 Novo</SelectItem>
                <SelectItem value="qualificado">⭐ Qualificado</SelectItem>
                <SelectItem value="contatado">📞 Contatado</SelectItem>
                <SelectItem value="convertido">🎯 Convertido</SelectItem>
                <SelectItem value="descartado">❌ Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir {selectedCount} {selectedCount === 1 ? 'lead' : 'leads'}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              {isProcessing ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
