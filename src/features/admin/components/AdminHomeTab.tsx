import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Wallet, Plug, UserCheck } from 'lucide-react';

const quickLinks = [
  {
    title: 'Afiliados',
    description: 'Repasses, comissões e gestão do programa',
    tab: 'afiliados',
    icon: UserCheck,
  },
  {
    title: 'Clientes',
    description: 'Cadastro, assinaturas e confirmação de e-mail',
    tab: 'clientes',
    icon: Users,
  },
  {
    title: 'Financeiro',
    description: 'MRR, pagamentos e indicadores',
    tab: 'financeiro',
    icon: Wallet,
  },
  {
    title: 'Integrações',
    description: 'Webhooks n8n e disparos',
    tab: 'integracoes',
    icon: Plug,
  },
] as const;

export function AdminHomeTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel administrativo</CardTitle>
          <CardDescription>
            Acesso rápido às áreas de gestão da plataforma Disparo Rápido.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.tab} to={`/app/admin?tab=${link.tab}`} className="block">
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <link.icon className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <CardDescription className="mt-1">{link.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
