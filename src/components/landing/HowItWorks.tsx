import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { UserCheck, Search, Eye, TrendingUp } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: UserCheck,
      title: 'Defina o Perfil',
      description: 'Escolha o segmento ideal do seu cliente (setor, região, tamanho)',
      visual: 'Filtros inteligentes'
    },
    {
      number: 2,
      icon: Search,
      title: 'Encontre Leads',
      description: 'Nossa IA encontra empresas que se encaixam no seu perfil',
      visual: 'Busca automatizada'
    },
    {
      number: 3,
      icon: Eye,
      title: 'Acesse Contatos',
      description: 'Veja dados completos: telefone, email, CNPJ, endereço',
      visual: 'Dados verificados'
    },
    {
      number: 4,
      icon: TrendingUp,
      title: 'Feche Vendas',
      description: 'Integre com seu CRM e comece a vender imediatamente',
      visual: 'Integração CRM'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simplicidade do Processo
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            De filtros à venda em 4 passos simples. Nosso dashboard mostra busca → resultados → detalhes → integração.
          </p>
        </div>

        {/* Timeline Visual */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -translate-y-1/2 z-0"></div>
          
          {steps.map((step, index) => (
            <Card key={index} className="relative z-10 group hover:shadow-lg transition-all duration-300 bg-background border">
              <CardContent className="p-6 text-center space-y-4">
                {/* Step Number */}
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl font-bold text-primary-foreground">{step.number}</span>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <step.icon className="w-6 h-6 text-primary bg-background rounded-full p-1 border-2 border-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>

                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {step.visual}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-background border shadow-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Dashboard Preview</h3>
                  <Badge variant="outline" className="border-green-200 text-green-700">Live Demo</Badge>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Filtros Aplicados</p>
                    <p className="font-medium text-foreground">Tecnologia • SP • 10-50 funcionários</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Leads Encontrados</p>
                    <p className="font-medium text-foreground">1.247 empresas verificadas</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="font-medium text-foreground">R$ 3.117,50 (1.247 × R$ 2,50)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}