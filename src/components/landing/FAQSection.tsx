import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export function FAQSection() {
  const faqs = [
    {
      question: 'Os dados são realmente atualizados?',
      answer: 'Sim, nossa tecnologia verifica e atualiza informações diariamente. Garantimos precisão mínima de 95%. Nossa tecnologia de scraping funciona 24/7 coletando dados de múltiplas fontes públicas e verificando a veracidade das informações.'
    },
    {
      question: 'Como posso integrar com meu CRM atual?',
      answer: 'Oferecemos integração nativa com Pipedrive, HubSpot, Salesforce e RD Station. Também temos API REST completa para integrações customizadas. Nossa equipe técnica oferece suporte completo para implementação.'
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Absolutamente. Sem fidelidade ou multa por cancelamento. Você pode pausar ou cancelar pela própria plataforma a qualquer momento. Manterá acesso aos dados já adquiridos até o final do período pago.'
    },
    {
      question: 'Os leads funcionam para qualquer segmento?',
      answer: 'Focamos em B2B brasileiro. Temos excelente cobertura em tecnologia, serviços, consultoria, e-commerce e varejo. Nosso banco de dados é constantemente expandido para cobrir novos segmentos e regiões.'
    },
    {
      question: 'Vocês respeitam a LGPD?',
      answer: '100%. Coletamos apenas dados públicos corporativos e seguimos todas as diretrizes da LGPD. Não trabalhamos com dados pessoais sensíveis e respeitamos todos os direitos dos titulares dos dados.'
    },
    {
      question: 'Qual a diferença entre os planos?',
      answer: 'A principal diferença está na quantidade de leads inclusos, recursos de busca e integrações disponíveis. O Professional inclui IA para busca avançada e webhooks. O Enterprise oferece dados customizados e suporte dedicado.'
    },
    {
      question: 'Como funciona o teste grátis?',
      answer: 'Teste grátis de 7 dias com acesso completo ao plano escolhido. Não pedimos cartão de crédito. Você pode cancelar a qualquer momento durante o teste sem custos. Após 7 dias, a cobrança é ativada automaticamente.'
    },
    {
      question: 'Os leads extras custam quanto?',
      answer: 'Leads extras custam R$ 2,50 cada, independente do plano. Você só paga pelos leads que realmente acessar. Oferecemos pacotes com desconto para volumes maiores. Consulte nossa equipe comercial.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Esclarecemos as principais dúvidas sobre o LeadsRapido para remover qualquer objeção.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="border border-border rounded-lg px-6 bg-card hover:bg-card/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="text-center mt-12 p-8 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-muted-foreground mb-6">
              Nossa equipe de especialistas está pronta para ajudar você a escolher o melhor plano.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:suporte@leadsrapido.com"
                className="text-primary hover:text-primary/80 font-medium"
              >
                suporte@leadsrapido.com
              </a>
              <span className="hidden sm:block text-muted-foreground">•</span>
              <a 
                href="tel:+5511999999999"
                className="text-primary hover:text-primary/80 font-medium"
              >
                +55 11 9999-9999
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}