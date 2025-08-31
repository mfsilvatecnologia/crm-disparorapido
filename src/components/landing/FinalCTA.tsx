import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, CreditCard, Clock } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Headlines */}
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Pronto Para 10x Seus Resultados de Vendas?
            </h2>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Junte-se a 500+ empresas que já transformaram sua prospecção
            </p>
          </div>

          {/* Urgency */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200 px-4 py-2 text-base">
              ⏰ Oferta limitada: expires em 24h
            </Badge>
          </div>

          {/* Main CTA */}
          <div className="space-y-4">
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-bold px-12 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Começar Teste Grátis Agora
              </Button>
            </Link>
            
            {/* Sub-text */}
            <p className="text-primary-foreground/60">
              7 dias grátis • Sem cartão de crédito
            </p>
          </div>

          {/* Guarantees */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            <div className="flex flex-col items-center space-y-3 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
              <Shield className="w-8 h-8 text-primary-foreground" />
              <div className="text-center">
                <h3 className="font-semibold text-primary-foreground">30 dias de garantia</h3>
                <p className="text-sm text-primary-foreground/70">ou seu dinheiro de volta</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
              <CreditCard className="w-8 h-8 text-primary-foreground" />
              <div className="text-center">
                <h3 className="font-semibold text-primary-foreground">Sem compromisso</h3>
                <p className="text-sm text-primary-foreground/70">Cancele quando quiser</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3 p-6 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
              <Clock className="w-8 h-8 text-primary-foreground" />
              <div className="text-center">
                <h3 className="font-semibold text-primary-foreground">Setup imediato</h3>
                <p className="text-sm text-primary-foreground/70">Comece a usar em minutos</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-primary-foreground/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/70">Empresas ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">1M+</div>
              <div className="text-sm text-primary-foreground/70">Leads disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">340%</div>
              <div className="text-sm text-primary-foreground/70">Melhoria média</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">99.9%</div>
              <div className="text-sm text-primary-foreground/70">Uptime garantido</div>
            </div>
          </div>

          {/* Final Message */}
          <div className="pt-8">
            <p className="text-primary-foreground/60 text-sm">
              Mais de 2.000 vendas fechadas este mês através dos nossos leads
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}