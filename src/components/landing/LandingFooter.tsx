import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '../ui/separator';
import { Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Contato', href: '/contato' },
      { label: 'Blog', href: '/blog' },
      { label: 'Carreiras', href: '/carreiras' }
    ],
    product: [
      { label: 'API Docs', href: '/docs' },
      { label: 'Status Page', href: '/status' },
      { label: 'Integrações', href: '/integracoes' },
      { label: 'Segurança', href: '/seguranca' }
    ],
    legal: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
      { label: 'LGPD', href: '/lgpd' },
      { label: 'Cookies', href: '/cookies' }
    ]
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">LeadsRapido</span>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              A plataforma SaaS líder em geração de leads B2B qualificados no Brasil. 
              Dados sempre atualizados para sua equipe de vendas.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href="mailto:suporte@leadsrapido.com" className="text-muted-foreground hover:text-primary">
                  suporte@leadsrapido.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href="tel:+5511999999999" className="text-muted-foreground hover:text-primary">
                  +55 11 9999-9999
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">São Paulo, SP - Brasil</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground">Produto</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Login Link */}
            <div className="pt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors text-sm font-medium"
              >
                Acessar Plataforma
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © {currentYear} LeadsRapido. Todos os direitos reservados.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>CNPJ: 12.345.678/0001-90</span>
            <span>•</span>
            <span>Desenvolvido no Brasil 🇧🇷</span>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>LGPD Compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Uptime 99.9%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Dados Verificados</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}