import { TenantConfig } from './types';

/**
 * PH3A Tenant Configuration
 */
export const ph3aConfig: TenantConfig = {
  id: 'ph3a',
  name: 'PH3A',

  domains: [
    'ph3a.com.br',
    'www.ph3a.com.br',
    'localhost:3004', // Development
  ],

  branding: {
    companyName: 'PH3A',
    companyTagline: 'Tecnologia com Soluções Inovadoras',
    logo: '/logos/ph3a/logo.svg',
    logoLight: '/logos/ph3a/logo-light.svg',
    favicon: '/logos/ph3a/favicon.ico',

    supportEmail: 'contato@ph3a.com.br',
  },

  theme: {
    // Primary brand colors - Blue theme
    primary: '#0000FF', // Blue
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#0ea5e9', // Sky 500
    accentForeground: '#ffffff',

    // Gradient for hero sections
    gradientFrom: '#00008B', // Dark Blue
    gradientVia: '#0000FF',  // Blue
    gradientTo: '#ADD8E6',   // Light Blue
  },

  features: {
    enableBasicFeatures: true,
    enableCampaigns: false,
    enablePipeline: false,
    enableScraping: true,
    enableAnalytics: true,
    enableMarketplace: true,
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