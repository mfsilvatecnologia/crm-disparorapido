import { useMemo, useState } from 'react';
import { Share2, Copy, ClipboardCheck, Mail, MessageCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';

interface ShareLinkCardProps {
  link?: string;
  fallbackCode?: string;
  isLoading?: boolean;
}

export function ShareLinkCard({ link, fallbackCode, isLoading }: ShareLinkCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareLink = useMemo(() => {
    if (link) return link;
    if (fallbackCode && typeof window !== 'undefined') {
      const baseUrl = `${window.location.origin}/precos`;
      return `${baseUrl}?ref=${fallbackCode}`;
    }
    return '';
  }, [link, fallbackCode]);

  const handleCopy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({ title: 'Link copiado', description: 'O link de indicação foi copiado com sucesso.' });
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShareWhatsApp = () => {
    if (!shareLink) return;
    const message = encodeURIComponent(
      `Conheça o LeadsRapido! Use meu link para ganhar benefícios: ${shareLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!shareLink) return;
    const subject = encodeURIComponent('Convite LeadsRapido');
    const body = encodeURIComponent(
      `Olá!\n\nGostaria de indicar o LeadsRapido, uma plataforma incrível para gestão de leads.\n\nUse este link: ${shareLink}\n\nAbraços!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle>Link de Indicação</CardTitle>
        <CardDescription>Compartilhe seu link personalizado com potenciais clientes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input readOnly value={shareLink} className="font-mono" placeholder="Carregando link..." />
              <Button variant="secondary" size="icon" onClick={handleCopy} aria-label="Copiar link">
                {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleShareWhatsApp} size="sm">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
              </Button>
              <Button variant="outline" onClick={handleShareEmail} size="sm">
                <Mail className="h-4 w-4 mr-2" /> Email
              </Button>
              <Button variant="default" onClick={handleCopy} size="sm">
                <Share2 className="h-4 w-4 mr-2" /> Copiar Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
