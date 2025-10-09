/**
 * Sales Feature Routes
 * Route utilities and constants for sales feature
 */

/**
 * Sales Route Paths
 */
export const SALES_ROUTES = {
  // Public routes
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  
  // Protected routes (under /app)
  SUBSCRIPTION: '/app/subscription',
  CREDITS: '/app/credits',
  MARKETPLACE: '/app/marketplace',
  
  // Financial routes
  FINANCIAL_DASHBOARD: '/app/financial',
  PAYMENTS: '/app/payments',
  PAYMENT_DETAILS: (id: string) => `/app/payments/${id}`,
  CREDIT_TRANSACTIONS: '/app/credits/transactions',
} as const;

/**
 * Navigation helpers
 */
export const navigateToPaymentDetails = (id: string) => SALES_ROUTES.PAYMENT_DETAILS(id);

/**
 * Breadcrumb helpers
 */
export const getBreadcrumbs = (path: string, paymentId?: string) => {
  const breadcrumbs = [
    { label: 'Home', path: '/app' }
  ];

  if (path.startsWith('/app/payments')) {
    breadcrumbs.push({ label: 'Pagamentos', path: SALES_ROUTES.PAYMENTS });
    if (paymentId) {
      breadcrumbs.push({ label: `Pagamento #${paymentId}`, path: SALES_ROUTES.PAYMENT_DETAILS(paymentId) });
    }
  } else if (path === SALES_ROUTES.CREDIT_TRANSACTIONS) {
    breadcrumbs.push({ label: 'Créditos', path: SALES_ROUTES.CREDITS });
    breadcrumbs.push({ label: 'Transações', path: SALES_ROUTES.CREDIT_TRANSACTIONS });
  } else if (path === SALES_ROUTES.FINANCIAL_DASHBOARD) {
    breadcrumbs.push({ label: 'Dashboard Financeiro', path: SALES_ROUTES.FINANCIAL_DASHBOARD });
  } else if (path === SALES_ROUTES.SUBSCRIPTION) {
    breadcrumbs.push({ label: 'Assinatura', path: SALES_ROUTES.SUBSCRIPTION });
  } else if (path === SALES_ROUTES.MARKETPLACE) {
    breadcrumbs.push({ label: 'Marketplace', path: SALES_ROUTES.MARKETPLACE });
  }

  return breadcrumbs;
};
