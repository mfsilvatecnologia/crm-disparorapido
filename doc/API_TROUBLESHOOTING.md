# Resolução de Problemas de API e CORS

Este guia ajuda a resolver problemas comuns de conectividade entre o frontend e backend.

## Problemas Comuns

### 1. Erro de CORS
```
Access to fetch at 'http://localhost:3000/api/v1/' from origin 'http://localhost:8080' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

### 2. Erro de Conexão
```
Failed to fetch
TypeError: Failed to fetch
net::ERR_FAILED
```

## Soluções Implementadas

### 1. Sistema de API Multi-Tenant
- **Arquivo**: `src/config/api.config.ts`
- **Recursos**: 
  - Configurações específicas por tenant
  - Auto-detecção de endpoints
  - Fallbacks automáticos
  - Health checks

### 2. Cliente de API Robusto
- **Arquivo**: `src/shared/services/tenantApiClient.ts`
- **Recursos**:
  - Retry automático
  - Tratamento de erros
  - Fallback para mocks
  - Status de conexão

### 3. Componente de Status
- **Arquivo**: `src/shared/components/common/ApiStatus.tsx`
- **Recursos**:
  - Monitoramento em tempo real
  - Indicador visual no header
  - Diagnósticos detalhados
  - Botão de teste manual

### 4. Configuração Vite Melhorada
- **Arquivo**: `vite.config.ts`
- **Recursos**:
  - Proxy configurado
  - CORS habilitado
  - Logging de requests
  - Suporte multi-tenant

## Como Usar

### 1. Scripts de Desenvolvimento
```bash
# Rodar apenas Vendas.IA (porta 8080)
npm run dev:vendas

# Rodar apenas Publix.IA (porta 8081)
npm run dev:publix

# Rodar ambos simultaneamente
npm run dev:both
```

### 2. Verificar Status da API
- Olhe o header da aplicação para ver o status da API
- Verde = Conectado
- Vermelho = Desconectado (usando cache/mocks)
- Azul = Testando conexão

### 3. Configurar Backend
No arquivo `.env` do backend, adicione:
```bash
CORS_ORIGIN="http://localhost:8080,http://localhost:8081,http://localhost:5173"
```

**IMPORTANTE**: Se você estiver vendo erros de CORS mesmo depois de configurar o `.env`, verifique:

1. **Configuração do Fastify CORS** - Certifique-se de que o backend tem o plugin `@fastify/cors` instalado e configurado:
```typescript
// No backend (exemplo Fastify)
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:5173'
  ],
  credentials: true
});
```

2. **Endpoint correto** - O health check usa `/health` (não `/api/v1/health`):
```bash
# Teste manualmente
curl http://localhost:3000/health
```

## Configurações por Tenant

### Vendas.IA
- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000
- **Configuração**: `src/config/tenants/vendas.config.ts`

### Publix.IA  
- **Frontend**: http://localhost:8081
- **API**: http://localhost:3001 (ou fallback para 3000)
- **Configuração**: `src/config/tenants/publix.config.ts`

## Troubleshooting

### 1. API Não Conecta

1. Verifique se o backend está rodando
2. Confirme a porta no `.env`: `VITE_API_BASE_URL=http://localhost:3000`
3. Teste manualmente: `curl http://localhost:3000/health`
4. Verifique logs do proxy no console do navegador

### 2. CORS Ainda Bloqueado
1. Confirme configuração CORS no backend
2. Verifique se `changeOrigin: true` está no proxy
3. Teste com proxy desabilitado (acesso direto via VITE_API_BASE_URL)

### 3. Mock Service Worker Interferindo
1. Desabilite temporariamente: remova o registro do MSW
2. Limpe o cache do browser: Ctrl+Shift+R
3. Verificar `public/mockServiceWorker.js`

### 4. Múltiplas Portas Conflitando
1. Use scripts específicos: `npm run dev:vendas` ou `npm run dev:publix`
2. Confirme portas disponíveis: `netstat -an | grep 808`
3. Mate processos conflitantes se necessário

## Monitoramento

### 1. Console do Navegador
```javascript
// Verificar status da API
window.apiClient?.getStatus()

// Testar health check manual
window.apiClient?.checkHealth()
```

### 2. Network Tab
- Monitore requests `/api/*`
- Verifique status codes e response headers
- Observe tempo de resposta

### 3. Componente de Debug
Acesse `/app/features-demo` para ver:
- Status detalhado da API
- Configurações do tenant atual
- Health checks em tempo real

## Configuração de Produção

### 1. Variáveis de Ambiente
```bash
# Produção Vendas.IA
VITE_API_BASE_URL=https://api.vendas.ia.br

# Produção Publix.IA  
VITE_API_BASE_URL=https://api.publix.ia.br
```

### 2. Build com Configurações Específicas
```bash
# Build para Vendas.IA
VITE_API_BASE_URL=https://api.vendas.ia.br npm run build

# Build para Publix.IA
VITE_API_BASE_URL=https://api.publix.ia.br npm run build
```

## Logs Úteis

Procure por essas mensagens nos logs:

```
[ApiClient] Initializing for tenant: vendas
[ApiClient] Using API endpoint: http://localhost:3000
[ApiClient] Making request to: http://localhost:3000/api/v1/health
Sending Request to the Target: GET /api/v1/health
Received Response from the Target: 200 /api/v1/health
```

Se não vir essas mensagens, há problemas de configuração.

## Suporte

Se os problemas persistirem:

1. **Verifique este arquivo**: `CONNECTIVITY-GUIDE.md`
2. **Monitore o componente**: `ApiStatus` no header
3. **Teste a página**: `/app/features-demo`
4. **Verifique logs**: Console do navegador e servidor

O sistema foi projetado para ser resiliente e continuar funcionando mesmo com problemas de API usando cache e mocks como fallback.