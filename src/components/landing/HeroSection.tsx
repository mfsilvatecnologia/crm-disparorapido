import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Shield, Lock, Clock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-32">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-bold text-foreground">LeadsRapido</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Recursos</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">Preços</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Urgency Badge */}
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              🔥 Oferta limitada: 50 leads grátis para novos usuários
            </Badge>

            {/* Headlines */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Encontre Seus Próximos <span className="text-primary">Clientes</span> em Segundos
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Base de leads B2B atualizada diariamente com dados verificados. 
                Pare de perder tempo com prospecção manual.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4">
                  Começar Teste Grátis
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4">
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof */}
            <p className="text-muted-foreground">
              ⭐ Usado por <span className="font-semibold text-foreground">500+ empresas</span> de vendas
            </p>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">LGPD Compliance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">99.9% Uptime</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-card border rounded-lg shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">Dashboard de Leads</h3>
                <Badge variant="secondary">Em tempo real</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium text-card-foreground">TechSolutions Ltda</p>
                    <p className="text-sm text-muted-foreground">Tecnologia • São Paulo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Qualidade: 95%</p>
                    <p className="text-sm text-muted-foreground">R$ 2,50</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium text-card-foreground">InnovaCorp</p>
                    <p className="text-sm text-muted-foreground">Consultoria • Rio de Janeiro</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Qualidade: 92%</p>
                    <p className="text-sm text-muted-foreground">R$ 2,50</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium text-card-foreground">Digital Ventures</p>
                    <p className="text-sm text-muted-foreground">E-commerce • Minas Gerais</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Qualidade: 98%</p>
                    <p className="text-sm text-muted-foreground">R$ 2,50</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}