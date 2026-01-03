import { TenantConfig } from './types';

/**
 * Lean Quality Tenant Configuration
 */
export const leanQualityConfig: TenantConfig = {
  id: 'lean-quality',
  name: 'Lean Quality',

  domains: [
    'leanquality.com.br',
    'www.leanquality.com.br',
    'localhost:3003', // Development
  ],

  branding: {
    companyName: 'Lean Quality',
    companyTagline: "Seja um Diferencial. Seja Lean Quality. Let's Go!",
    logo: '/logos/lean-quality/logo.svg',
    logoLight: '/logos/lean-quality/logo-light.svg',
    favicon: '/logos/lean-quality/favicon.ico',

    socialMedia: {
      linkedin: 'https://www.linkedin.com/company/lean-quality-consultoria-e-treinamento/',
    },

    supportEmail: 'contato@leanquality.com.br',
  },

  theme: {
    // Primary brand colors - Teal theme
    primary: '#008080', // Teal
    primaryForeground: '#ffffff',

    secondary: '#64748b', // Slate 500
    secondaryForeground: '#ffffff',

    accent: '#0ea5e9', // Sky 500
    accentForeground: '#ffffff',

    // Gradient for hero sections
    gradientFrom: '#004d4d', // Dark Teal
    gradientVia: '#008080',  // Teal
    gradientTo: '#00b3b3',   // Light Teal
  },

  features: {
    enableBasicFeatures: true,
    enableCRM: true,
    enableCampaigns: false,
    enablePipeline: true,
    enableScraping: false,
    enableAnalytics: true,
    enableMarketplace: false,
    enableBilling: false,
    enableWorkers: false,
    enablePlanos: false,
  },

  settings: {
    defaultLanguage: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
  },
};
