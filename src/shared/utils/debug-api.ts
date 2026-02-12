/**
 * Funções de debug para testar conectividade com a API
 */

export async function debugApiConnection() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('leadsrapido_auth_token');
  
  console.log('🔍 Debug API Connection:');
  console.log('📍 Base URL:', baseURL);
  console.log('🔐 Token available:', !!token);
  console.log('🔐 Token preview:', token?.substring(0, 50) + '...');
  
  try {
    // Teste básico de conectividade
    console.log('📡 Testing basic connectivity...');
    const healthResponse = await fetch(`${baseURL}/api/v1/health`, {
      method: 'GET',
    });
    console.log('❤️ Health check:', healthResponse.status, await healthResponse.text());
    
    // Teste da API de leads
    console.log('📡 Testing leads API...');
    const leadsUrl = `${baseURL}/api/v1/leads?limit=1`;
    const leadsResponse = await fetch(leadsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('📊 Leads API status:', leadsResponse.status);
    
    if (leadsResponse.ok) {
      const leadsData = await leadsResponse.json();
      console.log('✅ Leads API response:', leadsData);
      return { success: true, data: leadsData };
    } else {
      const errorText = await leadsResponse.text();
      console.error('❌ Leads API error:', errorText);
      return { success: false, error: errorText, status: leadsResponse.status };
    }
    
  } catch (error) {
    console.error('💥 Debug failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testLeadSchema(sampleData: any) {
  try {
    const { LeadSchema } = await import('../services/schemas');
    const result = LeadSchema.parse(sampleData);
    console.log('✅ Schema validation success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testLeadsResponseSchema(sampleData: any) {
  try {
    const { LeadsResponseSchema } = await import('../services/schemas');
    const result = LeadsResponseSchema.parse(sampleData);
    console.log('✅ LeadsResponse schema validation success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ LeadsResponse schema validation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Função para executar no console do navegador
if (typeof window !== 'undefined') {
  (window as any).debugApi = debugApiConnection;
  (window as any).testLeadSchema = testLeadSchema;
  (window as any).testLeadsResponseSchema = testLeadsResponseSchema;
}