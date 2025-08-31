import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Check, Star } from 'lucide-react';

export function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: 'R$ 297',
      period: '/mês',
      description: 'Ideal para pequenas equipes de vendas',
      popular: false,
      features: [
        '200 leads inclusos',
        'Busca por filtros básicos',
        'Exportação CSV',
        'Suporte por email',
        'API básica (100 req/dia)'
      ]
    },
    {
      name: 'Professional',
      price: 'R$ 697',
      period: '/mês',
      description: 'Mais popular para equipes em crescimento',
      popular: true,
      features: [
        '500 leads inclusos',
        'Filtros avançados + IA',
        'Integração CRM (Pipedrive, HubSpot)',
        'Webhooks em tempo real',
        'API completa (1000 req/dia)',
        'Suporte prioritário'
      ]
    },
    {
      name: 'Enterprise',
      price: 'R$ 1.497',
      period: '/mês',
      description: 'Para grandes empresas com alto volume',
      popular: false,
      features: [
        '1.500 leads inclusos',
        'Dados customizados',
        'White-label disponível',
        'Account manager dedicado',
        'API ilimitada',
        'SLA 99.9% uptime'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Posso mudar de plano?',
      answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas no próximo ciclo de cobrança.'
    },
    {
      question: 'Como funciona a cobrança?',
      answer: 'A cobrança é mensal e inclui a quantidade de leads do plano. Leads extras são cobrados R$ 2,50 cada.'
    },
    {
      question: 'Há compromisso de fidelidade?',
      answer: 'Não há fidelidade. Você pode cancelar a qualquer momento e manter acesso até o final do período pago.'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Preços Transparentes e Escaláveis
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua empresa. Todos os planos incluem teste grátis de 7 dias.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'} hover:shadow-lg transition-all duration-300`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Mais Popular</span>
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="flex items-baseline justify-center mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3 pt-4">
                  <Link to="/login">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Teste 7 dias grátis
                    </Button>
                  </Link>
                  <p className="text-sm text-muted-foreground text-center">
                    Sem compromisso - cancele quando quiser
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* White Label */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 max-w-2xl mx-auto mb-16">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">White Label</h3>
            <p className="text-muted-foreground mb-6">
              Solução customizada com sua marca, domínio próprio e funcionalidades exclusivas.
            </p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Falar com Especialista
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">Perguntas Frequentes</h3>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}