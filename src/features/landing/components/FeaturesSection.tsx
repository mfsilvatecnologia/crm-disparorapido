import React from 'react';
import { RefreshCw, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

export function FeaturesSection() {
  const features = [
    {
      icon: RefreshCw,
      title: 'Base Atualizada Diariamente',
      description: 'Nossa tecnologia de scraping coleta e verifica dados 24/7 de múltiplas fontes',
      benefit: 'Nunca mais falar com empresas fechadas ou contatos desatualizados',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      title: 'Busca Por Segmento',
      description: 'Filtre por setor, região, tamanho da empresa, tecnologias usadas e mais',
      benefit: 'Foque apenas nos prospects com maior potencial de conversão',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'API + Webhooks + Export',
      description: 'Conecte diretamente com seu CRM ou exporte para planilhas com um clique',
      benefit: 'Mantenha seu workflow atual sem precisar mudar ferramentas',
      color: 'text-purple-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Como Funciona e Quais Problemas Resolve
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sabemos que encontrar leads qualificados é difícil. Nossa plataforma resolve os principais desafios da prospecção B2B.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors`}>
                    <feature.icon className={`w-6 h-6 ${feature.color} group-hover:text-primary transition-colors`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {feature.benefit}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}