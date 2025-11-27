import { Clipboard, ClipboardCheck, CopyIcon, Info } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useToast } from '@/shared/hooks/use-toast';
import { AffiliateCode } from '../types';

interface AffiliateCodeCardProps {
  code?: AffiliateCode;
  isLoading?: boolean;
}

export function AffiliateCodeCard({ code, isLoading }: AffiliateCodeCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!code?.codigoAfiliado) return;
    await navigator.clipboard.writeText(code.codigoAfiliado);
    setCopied(true);
    toast({
      title: 'Código copiado',
      description: 'O código de afiliado foi copiado para sua área de transferência.',
    });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Seu Código de Afiliado</CardTitle>
          <CardDescription>Compartilhe este código para gerar comissões.</CardDescription>
        </div>
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground">
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>O código é único para sua empresa.</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input readOnly value={code?.codigoAfiliado || ''} className="font-mono text-lg" />
              <Button onClick={handleCopyCode} variant="secondary" size="icon" aria-label="Copiar código">
                {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={code?.ativo ? 'default' : 'secondary'}>
                {code?.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <span>
                Comissão padrão: {code?.comissaoPadraoValor}% ({code?.comissaoPadraoTipo === 'percentual' ? 'percentual' : 'fixo'})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CopyIcon className="h-4 w-4" />
              <span>Use este código em cadastros e compras para receber créditos automaticamente.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
