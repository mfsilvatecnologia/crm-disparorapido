/**
 * PaymentActions Component
 * Action buttons for cancel and refund with confirmation dialogs
 */

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Loader2, Ban, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PaymentActionsProps } from '../../types';
import { useCancelPayment } from '../../hooks/payments/useCancelPayment';
import { useRefundPayment } from '../../hooks/payments/useRefundPayment';

/**
 * PaymentActions Component
 */
export function PaymentActions({ payment }: PaymentActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const cancelMutation = useCancelPayment();
  const refundMutation = useRefundPayment();

  const canCancel = payment.status === 'pending';
  const canRefund = payment.status === 'completed';

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        id: payment.id,
        reason: cancelReason || undefined,
      });
      
      toast.success('Pagamento cancelado com sucesso');
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao cancelar pagamento'
      );
    }
  };

  const handleRefund = async () => {
    try {
      await refundMutation.mutateAsync({
        id: payment.id,
        reason: refundReason || undefined,
      });
      
      toast.success('Pagamento reembolsado com sucesso');
      setRefundDialogOpen(false);
      setRefundReason('');
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Erro ao reembolsar pagamento'
      );
    }
  };

  if (!canCancel && !canRefund) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Cancel Button */}
      {canCancel && (
        <>
          <Button
            variant="outline"
            onClick={() => setCancelDialogOpen(true)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancelar Pagamento
          </Button>

          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancelar Pagamento</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja cancelar este pagamento? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">
                  Motivo (opcional)
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Informe o motivo do cancelamento..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {cancelReason.length}/500 caracteres
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={cancelMutation.isPending}
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Cancelamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Refund Button */}
      {canRefund && (
        <>
          <Button
            variant="outline"
            onClick={() => setRefundDialogOpen(true)}
            disabled={refundMutation.isPending}
          >
            {refundMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Reembolsar
          </Button>

          <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reembolsar Pagamento</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja reembolsar este pagamento? O valor será devolvido ao cliente.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="refund-reason">
                  Motivo (opcional)
                </Label>
                <Textarea
                  id="refund-reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Informe o motivo do reembolso..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {refundReason.length}/500 caracteres
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRefundDialogOpen(false)}
                  disabled={refundMutation.isPending}
                >
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRefund}
                  disabled={refundMutation.isPending}
                >
                  {refundMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Reembolso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
