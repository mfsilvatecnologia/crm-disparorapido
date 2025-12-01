import { TenantConfig } from './types';

/**
 * Disparo Rápido Tenant Configuration
 */
export const disparorapidoConfig: TenantConfig = {
  id: 'disparo-rapido',
  name: 'Disparo Rápido',

  domains: [
    'disparorapido.com.br',
    'www.disparorapido.com.br',
    'localhost:3002', // Development
  ],

  branding: {
    companyName: 'Disparo Rápido',
    companyTagline: 'Faça Envios em Massa no WhatsApp com apenas 3 cliques',
    logo: '/logos/disparo-rapido/logo.svg',
    logoLight: '/logos/disparo-rapido/logo-light.svg',
    favicon: '/logos/disparo-rapido/favicon.ico',

    supportEmail: 'contato@disparorapido.com.br',
  },

  theme: {
    // Primary brand colors - Green theme
    primary: '#25D366', // WhatsApp Green
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#0ea5e9', // Sky 500
    accentForeground: '#ffffff',

    // Gradient for hero sections
    gradientFrom: '#128C7E', // Teal Green
    gradientVia: '#25D366',  // WhatsApp Green
    gradientTo: '#DCF8C6',   // Light Green
  },

  features: {
    enableBasicFeatures: true,
    enableCampaigns: false,
    enablePipeline: false,
    enableScraping: false,
    enableAnalytics: false,
    enableMarketplace: false,
    enableBilling: true,
    enableWorkers: false,
    enablePlanos: true,
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  },
};