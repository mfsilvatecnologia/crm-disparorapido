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
    logo: '/logos/disparorapido/logohorizontal.png',
    logoLight: '/logos/disparorapido/logohorizontal.png',
    favicon: '/logos/disparo-rapido/favicon.ico',

    supportEmail: 'contato@disparorapido.com.br',
  },

  theme: {
    // Primary UI — mesmo azul da sidebar ativa (#0055A4)
    primary: '#0055A4',
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#003d75', // Azul mais escuro (hover/ênfase)
    accentForeground: '#ffffff',

    // Gradientes alinhados ao azul institucional
    gradientFrom: '#003d75',
    gradientVia: '#0055A4',
    gradientTo: '#4d8cc4',
  },

  features: {
    enableBasicFeatures: true,
    enableCRM: true,
    enableCampaigns: false,
    enablePipeline: false,
    enableScraping: false,
    enableAnalytics: false,
    enableMarketplace: false,
    enableBilling: true,
    enableWorkers: false,
    enablePlanos: false, // Contratação pelo checkout transparente no site
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    marketingSiteUrl: 'https://disparorapido.com.br',
  },
};
