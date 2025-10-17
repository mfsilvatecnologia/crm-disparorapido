import { TenantConfig } from './types';

/**
 * Vendas.IA Tenant Configuration
 */
export const vendasConfig: TenantConfig = {
  id: 'vendas',
  name: 'Vendas.IA',

  domains: [
    'vendas.ia.br',
    'www.vendas.ia.br',
    'localhost:8080', // Development
  ],

  branding: {
    companyName: 'Vendas.IA',
    companyTagline: 'Inteligência Artificial para Vendas',
    logo: '/logos/vendas/logo.svg',
    logoLight: '/logos/vendas/logo-light.svg',
    favicon: '/logos/vendas/favicon.ico',

    socialMedia: {
      linkedin: 'https://linkedin.com/company/vendas-ia',
      instagram: 'https://instagram.com/vendas.ia',
    },

    supportEmail: 'suporte@vendas.ia.br',
    supportPhone: '+55 11 1234-5678',
  },

  theme: {
    // Primary brand colors - Blue theme
    primary: '#2563eb', // Blue 600
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#0ea5e9', // Sky 500
    accentForeground: '#ffffff',

    // Gradient for hero sections
    gradientFrom: '#1e40af', // Blue 800
    gradientVia: '#2563eb',  // Blue 600
    gradientTo: '#3b82f6',   // Blue 500
  },

  features: {
    enableBasicFeatures: true,
    enableCampaigns: true,
    enablePipeline: true,
    enableScraping: true,
    enableAnalytics: true,
    enableMarketplace: true,
    enableBilling: true,
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  },
};
