/**
 * Tenant Configuration Types
 * Define the structure for multi-tenant configuration
 */

export type TenantId = 'vendas' | 'publix';

export interface TenantTheme {
  // Primary colors
  primary: string;
  primaryForeground: string;

  // Secondary colors
  secondary: string;
  secondaryForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Gradient for hero sections
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
}

export interface TenantFeatures {
  // Enable/disable features per tenant
  enableCampaigns: boolean;
  enablePipeline: boolean;
  enableScraping: boolean;
  enableAnalytics: boolean;
  enableMarketplace: boolean;
  enableBilling: boolean;
}

export interface TenantBranding {
  // Company information
  companyName: string;
  companyTagline: string;

  // Logo paths
  logo: string;
  logoLight?: string; // Optional light version for dark mode
  favicon: string;

  // Social media
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };

  // Contact
  supportEmail: string;
  supportPhone?: string;
}

export interface TenantConfig {
  // Identification
  id: TenantId;
  name: string;

  // Domains (supports multiple for staging/production)
  domains: string[];

  // Branding
  branding: TenantBranding;

  // Theme
  theme: TenantTheme;

  // Features
  features: TenantFeatures;

  // Custom settings
  settings?: {
    defaultLanguage?: string;
    timezone?: string;
    currency?: string;
    [key: string]: any;
  };
}
