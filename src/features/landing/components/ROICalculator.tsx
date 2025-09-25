import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Input } from '../ui/input';

export function ROICalculator() {
  const [leadsPerMonth, setLeadsPerMonth] = useState([200]);
  const [ticketMedio, setTicketMedio] = useState([10000]);
  const [taxaConversao, setTaxaConversao] = useState([3]);

  const calculateROI = useCallback(() => {
    const leads = leadsPerMonth[0];
    const ticket = ticketMedio[0];
    const conversao = taxaConversao[0] / 100;
    
    // Cálculos
    const vendas = leads * conversao;
    const receita = vendas * ticket;
    const custoLeads = leads * 2.5; // R$ 2,50 por lead
    const tempoEconomizado = leads * 3.5; // 3.5 horas economizadas por lead vs busca manual
    const custoPorHora = 50; // custo médio por hora de um vendedor
    const economiaHoras = tempoEconomizado * custoPorHora;
    const economiaTotal = economiaHoras - custoLeads;
    const roi = ((economiaTotal / custoLeads) * 100);

    return {
      vendas: Math.round(vendas),
      receita,
      custoLeads,
      tempoEconomizado: Math.round(tempoEconomizado),
      economiaTotal,
      roi: Math.round(roi)
    };
  }, [leadsPerMonth, ticketMedio, taxaConversao]);

  const results = calculateROI();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Calculadora de ROI
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra quanto você pode economizar e qual o retorno do investimento com o LeadsRapido.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Calculator Inputs */}
          <Card className="bg-background border shadow-lg">
            <CardHeader>
              <h3 className="text-2xl font-semibold text-foreground">Seus Dados</h3>
              <p className="text-muted-foreground">Ajuste os valores conforme sua realidade</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Leads per Month */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Quantos leads você precisa por mês?</Label>
                  <span className="text-primary font-semibold">{leadsPerMonth[0]}</span>
                </div>
                <Slider
                  value={leadsPerMonth}
                  onValueChange={setLeadsPerMonth}
                  max={1000}
                  min={50}
                  step={25}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>50</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Ticket Médio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Qual o ticket médio das suas vendas?</Label>
                  <span className="text-primary font-semibold">{formatCurrency(ticketMedio[0])}</span>
                </div>
                <Slider
                  value={ticketMedio}
                  onValueChange={setTicketMedio}
                  max={100000}
                  min={1000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R$ 1.000</span>
                  <span>R$ 100.000</span>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground font-medium">Qual sua taxa de conversão atual?</Label>
                  <span className="text-primary font-semibold">{taxaConversao[0]}%</span>
                </div>
                <Slider
                  value={taxaConversao}
                  onValueChange={setTaxaConversao}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1%</span>
                  <span>10%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <CardHeader>
              <h3 className="text-2xl font-semibold">Seus Resultados</h3>
              <p className="text-primary-foreground/80">Com o LeadsRapido você economiza:</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-foreground/10 rounded-lg">
                  <div className="text-2xl font-bold">{results.vendas}</div>
                  <div className="text-sm text-primary-foreground/80">vendas/mês</div>
                </div>
                <div className="text-center p-4 bg-primary-foreground/10 rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(results.receita)}</div>
                  <div className="text-sm text-primary-foreground/80">receita/mês</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-primary-foreground/20">
                <div className="flex justify-between items-center">
                  <span>Custo dos leads:</span>
                  <span className="font-semibold">{formatCurrency(results.custoLeads)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tempo economizado:</span>
                  <span className="font-semibold">{results.tempoEconomizado}h/mês</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Economia total:</span>
                  <span className="font-semibold">{formatCurrency(results.economiaTotal)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-primary-foreground/20">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{results.roi}%</div>
                  <div className="text-lg">ROI em 3 meses</div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-primary-foreground/80">
                  *Cálculo baseado em dados médios de clientes e R$ 50/hora para custo de vendedor
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}