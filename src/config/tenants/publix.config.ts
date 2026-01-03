import { TenantConfig } from './types';

/**
 * Publix.IA Tenant Configuration
 */
export const publixConfig: TenantConfig = {
  id: 'publix',
  name: 'Publix.IA',

  domains: [
    'publix.ia.br',
    'www.publix.ia.br',
    'localhost:8081', // Development (different port)
  ],

  branding: {
    companyName: 'Publix.IA',
    companyTagline: 'Publicidade Inteligente e Automatizada',
    logo: '/logos/publix/logo.svg',
    logoLight: '/logos/publix/logo-light.svg',
    favicon: '/logos/publix/favicon.ico',

    socialMedia: {
      linkedin: 'https://linkedin.com/company/publix-ia',
      instagram: 'https://instagram.com/publix.ia',
      facebook: 'https://facebook.com/publix.ia',
    },

    supportEmail: 'suporte@publix.ia.br',
    supportPhone: '+55 11 8765-4321',
  },

  theme: {
    // Primary brand colors - Purple/Violet theme
    primary: '#7c3aed', // Violet 600
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#a855f7', // Purple 500
    accentForeground: '#ffffff',

    // Gradient for hero sections
    gradientFrom: '#6d28d9', // Violet 700
    gradientVia: '#7c3aed',  // Violet 600
    gradientTo: '#8b5cf6',   // Violet 500
  },

  features: {
    // Publix inicia apenas com Dashboard - todas features bloqueadas
    enableBasicFeatures: true,
    enableCRM: true,
    enableCampaigns: true,
    enablePipeline: false,
    enableScraping: true,
    enableAnalytics: false,
    enableMarketplace: false,
    enableBilling: false,
    enableWorkers: false,
    enablePlanos: true,
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  },
};
