import React from 'react';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';

export function SocialProof() {
  const companies = [
    'TechSolutions', 'InnovaCorp', 'DigitalPro', 'SalesForce', 'MarketingHub', 'GrowthCo', 'LeadGen', 'CRMPlus'
  ];

  const metrics = [
    { value: '340%', label: 'mais conversões' },
    { value: '15 min', label: 'vs 4h por lead' },
    { value: 'R$ 2,50', label: 'vs R$ 25 por lead' }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Company Logos */}
        <div className="text-center mb-16">
          <p className="text-muted-foreground mb-8">Empresas que confiam no LeadsRapido</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-background rounded-lg border opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium text-muted-foreground">{company}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Testimonial */}
        <Card className="max-w-4xl mx-auto p-8 bg-background border">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-4">
              <blockquote className="text-xl text-foreground leading-relaxed">
                "Aumentamos nossa conversão em 340% com os leads do LeadsRapido. 
                A qualidade dos dados é incomparável."
              </blockquote>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">CS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">Carlos Silva</p>
                  <p className="text-sm text-muted-foreground">Diretor Comercial - TechSolutions</p>
                </div>
              </div>
            </div>
            
            {/* Impact Metrics */}
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}