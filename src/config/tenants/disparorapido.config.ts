import { TenantConfig } from './types';

/**
 * Disparo Rápido Tenant Configuration
 */
export const disparorapidoConfig: TenantConfig = {
  id: 'disparorapido',
  name: 'Disparo Rápido',

  domains: [
    'disparorapido.com.br',
    'www.disparorapido.com.br',
    'localhost:8082', // Development (different port)
  ],

  branding: {
    companyName: 'Disparo Rápido',
    companyTagline: 'Envios em Massa no WhatsApp',
    logo: '/logos/disparorapido/logo.svg',
    logoLight: '/logos/disparorapido/logo-light.svg',
    favicon: '/logos/disparorapido/favicon.ico',

    socialMedia: {
      // Add social media links when available
    },

    supportEmail: 'contato@disparorapido.com.br',
    supportPhone: undefined, // WhatsApp support available on website
  },

  theme: {
    // Primary brand colors - Green theme (based on website)
    primary: '#22c55e', // Green 500 (matching the green from logo and CTA buttons)
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#10b981', // Emerald 500
    accentForeground: '#ffffff',

    // Gradient for hero sections - Green gradient
    gradientFrom: '#16a34a', // Green 600
    gradientVia: '#22c55e',  // Green 500
    gradientTo: '#4ade80',   // Green 400
  },

  features: {
    // Disparo Rápido features configuration
    enableBasicFeatures: true,
    enableCampaigns: true,
    enablePipeline: false,
    enableScraping: true,
    enableAnalytics: true,
    enableMarketplace: false,
    enableBilling: true,
    enableWorkers: true,
    enablePlanos: true,
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  },
};
