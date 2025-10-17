// Test API Configuration
// Execute this in browser console to verify API endpoint detection

import { detectApiEndpoint, getApiBaseUrl, getApiConfig } from '@/config/api.config';

console.log('=== API Configuration Test ===');

// Test environment variable
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Test getApiBaseUrl function  
console.log('getApiBaseUrl("vendas"):', getApiBaseUrl('vendas'));

// Test getApiConfig function
console.log('getApiConfig("vendas"):', getApiConfig('vendas'));

// Test detectApiEndpoint function (async)
detectApiEndpoint('vendas').then(url => {
  console.log('detectApiEndpoint("vendas"):', url);
});

console.log('=== End Test ===');