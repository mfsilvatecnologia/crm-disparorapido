#!/usr/bin/env node

/**
 * Script completo para testar o sistema de login
 * Investigação do sistema de autenticação do LeadsRápido
 */

import https from 'https';
import http from 'http';

// Configurações
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:8081';

// Dados de teste
const testCredentials = {
  valid: {
    email: 'joao@leadsrapido.com.br',
    password: 'password123'
  },
  demo: {
    email: 'test@example.com',
    password: 'password'
  },
  invalid: {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  }
};

console.log('🔍 INVESTIGAÇÃO DO SISTEMA DE LOGIN - LeadsRápido');
console.log('=' .repeat(60));

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json: null
          };
          
          if (res.headers['content-type']?.includes('application/json')) {
            result.json = JSON.parse(data);
          }
          
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testBackendHealth() {
  console.log('\n📡 1. Testando saúde do backend...');
  
  try {
    // Teste básico de conectividade
    const healthResponse = await makeRequest(`${BACKEND_URL}/health`);
    console.log(`   Status: ${healthResponse.statusCode}`);
    
    if (healthResponse.json) {
      console.log(`   Resposta: ${JSON.stringify(healthResponse.json)}`);
    }
    
    return healthResponse.statusCode === 200;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testLoginEndpoint(credentials, testName) {
  console.log(`\n🔐 2. Testando login - ${testName}...`);
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.json) {
      console.log(`   Sucesso: ${response.json.success}`);
      console.log(`   Mensagem: ${response.json.message}`);
      
      if (response.json.data?.user) {
        console.log(`   Usuário: ${response.json.data.user.email}`);
        console.log(`   Role: ${response.json.data.user.roles || response.json.data.user.role}`);
      }
      
      if (response.json.data?.token) {
        console.log(`   Token recebido: ${response.json.data.token.substring(0, 20)}...`);
        return {
          success: true,
          token: response.json.data.token,
          user: response.json.data.user
        };
      }
    }
    
    return { success: false, error: response.body };
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testFrontendAccess() {
  console.log('\n🌐 3. Testando acesso ao frontend...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`   Status: ${response.statusCode}`);
    
    // Verificar se contém elementos esperados
    const hasLogin = response.body.includes('login') || response.body.includes('Login');
    const hasReact = response.body.includes('react') || response.body.includes('React');
    
    console.log(`   Contém referências de login: ${hasLogin}`);
    console.log(`   Contém React: ${hasReact}`);
    
    return response.statusCode === 200;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function testAuthFlow() {
  console.log('\n🔄 4. Testando fluxo completo de autenticação...');
  
  // Teste com credenciais válidas
  const loginResult = await testLoginEndpoint(testCredentials.valid, 'Credenciais válidas');
  
  if (loginResult.success && loginResult.token) {
    console.log('\n   ✅ Login bem-sucedido! Testando endpoint protegido...');
    
    try {
      // Testar endpoint que requer autenticação
      const protectedResponse = await makeRequest(`${BACKEND_URL}/api/v1/leads`, {
        headers: {
          'Authorization': `Bearer ${loginResult.token}`
        }
      });
      
      console.log(`   Endpoint protegido - Status: ${protectedResponse.statusCode}`);
      
      if (protectedResponse.json) {
        console.log(`   Dados recebidos: ${JSON.stringify(protectedResponse.json).substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ⚠️  Erro ao testar endpoint protegido: ${error.message}`);
    }
  }
  
  // Teste com credenciais demo
  await testLoginEndpoint(testCredentials.demo, 'Credenciais demo');
  
  // Teste com credenciais inválidas
  await testLoginEndpoint(testCredentials.invalid, 'Credenciais inválidas');
}

async function checkCorsConfiguration() {
  console.log('\n🌍 5. Verificando configuração CORS...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'OPTIONS'
    });
    
    console.log(`   Status OPTIONS: ${response.statusCode}`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin']}`);
    console.log(`   Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods']}`);
    console.log(`   Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers']}`);
    
  } catch (error) {
    console.log(`   ❌ Erro CORS: ${error.message}`);
  }
}

async function investigateLoginSystem() {
  console.log('🚀 Iniciando investigação...\n');
  
  const backendOk = await testBackendHealth();
  const frontendOk = await testFrontendAccess();
  
  if (backendOk) {
    await testAuthFlow();
    await checkCorsConfiguration();
  } else {
    console.log('\n⚠️  Backend não está respondendo - verifique se está rodando na porta 3000');
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RESUMO DA INVESTIGAÇÃO:');
  console.log(`   Backend (${BACKEND_URL}): ${backendOk ? '✅ OK' : '❌ FALHA'}`);
  console.log(`   Frontend (${FRONTEND_URL}): ${frontendOk ? '✅ OK' : '❌ FALHA'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Sistema parece estar funcionando corretamente!');
    console.log('\n📝 PRÓXIMOS PASSOS PARA TESTE:');
    console.log('   1. Abra o navegador em: http://localhost:8081');
    console.log('   2. Navegue para a página de login');
    console.log('   3. Teste com: joao@leadsrapido.com.br / password123');
    console.log('   4. Ou teste com: test@example.com / password');
  } else {
    console.log('\n⚠️  Problemas detectados - verifique os logs acima');
  }
  
  console.log('=' .repeat(60));
}

// Executar investigação
investigateLoginSystem().catch(console.error);
