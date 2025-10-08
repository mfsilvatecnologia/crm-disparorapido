/**
 * Products API Client
 * 
 * API methods for product/plan operations
 */

import { apiClient } from '@/shared/services/client';
import type { Product, BillingCycle } from '../types';

/**
 * Base path for products API
 */
const BASE_PATH = '/api/v1/produtos';

/**
 * Backend product response interface
 */
interface BackendProduct {
  id: string;
  nome: string;
  descricao: string;
  asaasProductId: string;
  categoria: string;
  tipoCobranca: string;
  periodoValidade: number | null;
  preco: number;
  precoFormatado: string;
  funcionalidades: string[];
  maxWebSessions: number;
  maxExtensionSessions: number;
  metadata: {
    plano?: string;
    max_leads_mes?: number;
    max_web_sessions?: number;
    max_campanhas_ativas?: number;
    max_extension_sessions?: number;
    trial_dias?: number;
    creditos_bonus?: number;
    quantidade_creditos?: number;
    creditos_total?: number;
    [key: string]: any;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Convert backend billing type to frontend enum
 */
function convertBillingCycle(tipoCobranca: string): BillingCycle {
  switch (tipoCobranca.toLowerCase()) {
    case 'mensal':
      return 'MONTHLY' as BillingCycle;
    case 'trimestral':
      return 'QUARTERLY' as BillingCycle;
    case 'anual':
      return 'YEARLY' as BillingCycle;
    default:
      return 'MONTHLY' as BillingCycle;
  }
}

/**
 * Adapt backend product to frontend Product type
 */
function adaptBackendProduct(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct.id,
    name: backendProduct.nome,
    description: backendProduct.descricao,
    categoria: backendProduct.categoria as 'crm_saas' | 'extensao_chrome' | 'marketplace_leads',
    priceMonthly: Math.round(backendProduct.preco * 100), // Convert R$ to centavos
    billingCycle: convertBillingCycle(backendProduct.tipoCobranca),
    features: backendProduct.funcionalidades,
    maxSessions: backendProduct.maxWebSessions,
    maxLeads: backendProduct.metadata.max_leads_mes === -1 ? null : (backendProduct.metadata.max_leads_mes || null),
    trialDays: backendProduct.metadata.trial_dias || 7,
    isActive: backendProduct.status === 'ativo',
    isMostPopular: backendProduct.metadata.plano === 'premium',
    position: 0,
    asaasProductId: backendProduct.asaasProductId,
    createdAt: backendProduct.createdAt,
    updatedAt: backendProduct.updatedAt,
    deletedAt: null,
  };
}

/**
 * Fetch all active products
 */
export async function fetchProducts(): Promise<Product[]> {
  const response = await apiClient.get<{ success: boolean; data: BackendProduct[]; total: number }>(BASE_PATH);
  
  // Extract data array from response
  const backendProducts = response.data || [];
  
  // Filter subscription products (CRM SaaS and Chrome Extension), exclude marketplace_leads
  const subscriptionProducts = backendProducts.filter(
    p => p.categoria === 'crm_saas' || p.categoria === 'extensao_chrome'
  );
  
  // Adapt to frontend format
  const products = subscriptionProducts.map(adaptBackendProduct);
  
  return products;
}

/**
 * Fetch product by ID
 */
export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiClient.get<{ success: boolean; data: BackendProduct }>(`${BASE_PATH}/${id}`);
  
  // Extract data from response
  const backendProduct = response.data;
  
  // Adapt to frontend format
  const product = adaptBackendProduct(backendProduct);
  
  return product;
}

/**
 * Fetch featured/most popular product
 */
export async function fetchFeaturedProduct(): Promise<Product | null> {
  const products = await fetchProducts();
  return products.find(p => p.isMostPopular) || products[0] || null;
}