import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import type { StatusCadastroAfiliado } from '../types';

type AffiliateCadastroStatusBannerProps = {
  statusCadastro?: StatusCadastroAfiliado;
  motivoRejeicao?: string | null;
  permiteCorrecaoCadastro?: boolean | null;
};

export function AffiliateCadastroStatusBanner({
  statusCadastro,
  motivoRejeicao,
  permiteCorrecaoCadastro,
}: AffiliateCadastroStatusBannerProps) {
  if (statusCadastro === 'PENDENTE') {
    return (
      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
        <Clock className="h-4 w-4 text-amber-700" />
        <AlertTitle>Aguardando aprovação</AlertTitle>
        <AlertDescription>
          Seu cadastro de afiliado foi recebido e está em análise. O link de indicação será liberado após a
          aprovação da nossa equipe.
        </AlertDescription>
      </Alert>
    );
  }

  if (statusCadastro === 'REJEITADO') {
    const podeCorrigir = permiteCorrecaoCadastro !== false;

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cadastro não aprovado</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Sua solicitação de afiliado não foi aprovada.
            {podeCorrigir
              ? ' Corrija os dados abaixo e reenvie para nova análise.'
              : ' Entre em contato com o suporte se tiver dúvidas.'}
          </p>
          {motivoRejeicao ? (
            <p className="text-sm">
              <span className="font-medium">Motivo informado:</span> {motivoRejeicao}
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export function isAffiliateCadastroApproved(statusCadastro?: StatusCadastroAfiliado): boolean {
  return !statusCadastro || statusCadastro === 'APROVADO';
}
