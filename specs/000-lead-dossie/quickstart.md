# Guia Rápido: Dossiê de Leads com Enriquecimento PH3A

**Feature**: 001-lead-dossie
**Data**: 2025-12-05
**Tempo Estimado**: 10-15 minutos para setup inicial

## Objetivo

Este guia mostra como executar e testar a funcionalidade de Dossiê de Leads localmente em seu ambiente de desenvolvimento.

---

## Pré-requisitos

- Node.js 18+ instalado
- Backend LeadsRapido rodando em `localhost:3000`
- Conta de teste com créditos disponíveis
- Leads de exemplo no banco de dados

---

## 1. Setup Inicial (3 min)

### 1.1 Instalar Dependências

```bash
cd /path/to/leadsrapido_frontend
npm install
```

**Nota**: Todas as dependências necessárias já estão no `package.json`:
- `@tanstack/react-query`
- `zod`
- `date-fns`
- `react-hook-form`
- Tailwind CSS e shadcn/ui

### 1.2 Configurar Variáveis de Ambiente

Crie/edite `.env.local`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_PH3A=true
```

### 1.3 Iniciar Servidor de Desenvolvimento

```bash
npm run dev
# Ou para tenant específico:
npm run dev:vendas-ia
```

Aplicação estará disponível em: `http://localhost:5173`

---

## 2. Navegação Rápida (2 min)

### 2.1 Acessar Tela de Dossiê de Leads

1. Faça login com credenciais de teste
2. No menu lateral, clique em **"Dossiê de Leads"**
3. Você verá a lista de leads

**URL direta**: `http://localhost:5173/lead-dossier`

### 2.2 Estrutura da Tela

```
┌─────────────────────────────────────┐
│  Dossiê de Leads        [+100 CR]   │ ← Header com saldo de créditos
├─────────────────────────────────────┤
│  [Buscar...] [Filtros]              │ ← Filtros e busca
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Roberto Silva               │    │
│  │ CPF: ***.456.789-**         │    │ ← Lista de leads
│  │ Status: Qualificado         │    │
│  │ [Ver Dossiê] [Enriquecer]   │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Carregar mais]                    │
└─────────────────────────────────────┘
```

---

## 3. Fluxo de Uso: Comprar Enriquecimento (5 min)

### 3.1 Selecionar um Lead

1. Na lista, clique em um lead **sem enriquecimento** (badge "Sem dados")
2. Clique no botão **"Enriquecer Lead"**

### 3.2 Modal de Compra

```
┌─────────────────────────────────────────┐
│  Enriquecer Lead: Roberto Silva         │
│                                         │
│  Saldo Disponível: 500 créditos        │
│                                         │
│  ┌───────────────────────────┐         │
│  │ Saúde Financeira          │         │
│  │ Fonte: DataFraud          │         │
│  │ Custo: 100 créditos       │         │
│  │                           │         │
│  │ [x] Score de crédito      │         │
│  │ [x] Nível de risco        │         │
│  │ [x] Capacidade de compra  │         │
│  │                           │         │
│  │ [Comprar - 100 CR]        │         │
│  └───────────────────────────┘         │
│                                         │
│  [Cancelar]                             │
└─────────────────────────────────────────┘
```

3. Selecione um pacote (ex: **Saúde Financeira**)
4. Clique em **"Comprar - 100 CR"**
5. Confirme no modal de confirmação

### 3.3 Aguardar Processamento

- Loading spinner aparece no card
- Tempo típico: 3-10 segundos
- Sucesso: Card mostra dados
- Erro: Mensagem de erro com botão "Tentar novamente"

---

## 4. Visualizar Dados Enriquecidos (3 min)

### 4.1 Acessar Dossiê Completo

Após compra bem-sucedida:

1. Clique no botão **"Ver Dossiê"** do lead
2. Você será redirecionado para `/lead-dossier/:leadId`

### 4.2 Cards de Dados

```
┌─────────────────────────────────────────────┐
│  Roberto Silva                              │
│  CPF: ***.456.789-**                        │
│  [Voltar] [Enriquecer Mais]                 │
├─────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │ Saúde Financeira │ │ Perfil Enriquec. │  │
│  │ Fonte: DataFraud │ │ Fonte: DataBusca │  │
│  │                  │ │                  │  │
│  │ Score: 850       │ │ Idade: 35-40     │  │
│  │ Risco: Baixo     │ │ Est.Civil: Casado│  │
│  │ Cap.: R$ 1.2M    │ │ Cargo: Diretor   │  │
│  └──────────────────┘ └──────────────────┘  │
│                                             │
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │ Rastro Digital   │ │ Valid. Cadastral │  │
│  │ ...              │ │ ...              │  │
│  └──────────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────┘
```

### 4.3 Interpretação dos Dados

**Saúde Financeira**:
- Score 0-300: Alto risco ⚠️
- Score 301-600: Médio risco 🟡
- Score 601-800: Baixo risco ✅
- Score 801-1000: Muito baixo risco ⭐

**Validação Cadastral**:
- CPF Regular ✅ (verde)
- CPF Irregular ⚠️ (vermelho)
- Óbito Encontrado 🚫 (crítico)

---

## 5. Testes Rápidos (3 min)

### 5.1 Executar Testes de Contrato

```bash
npm run test:contract
```

**Verifica**:
- Schemas de API validam corretamente
- Responses seguem contratos OpenAPI
- Tipos TypeScript sincronizados

### 5.2 Executar Testes de Integração

```bash
npm run test:integration
```

**Fluxos testados**:
- Listar leads → sucesso
- Comprar enriquecimento → atualiza saldo → mostra dados
- Tentar compra duplicada → erro esperado
- Compra sem créditos → erro esperado

### 5.3 Executar Todos os Testes

```bash
npm run test:run
```

---

## 6. Cenários de Teste Manual

### Cenário 1: Compra Bem-Sucedida ✅

1. **Setup**: Lead sem enriquecimento, saldo > 100 CR
2. **Ação**: Comprar "Saúde Financeira"
3. **Resultado Esperado**:
   - Saldo reduz em 100 CR
   - Card mostra dados enriquecidos
   - Histórico registra compra

### Cenário 2: Créditos Insuficientes ⚠️

1. **Setup**: Saldo < 100 CR
2. **Ação**: Tentar comprar pacote de 100 CR
3. **Resultado Esperado**:
   - Modal mostra erro "Créditos insuficientes"
   - Botão "Comprar Créditos" aparece
   - Saldo não muda

### Cenário 3: Compra Duplicada 🚫

1. **Setup**: Lead já tem "Saúde Financeira" (< 90 dias)
2. **Ação**: Tentar comprar mesmo pacote
3. **Resultado Esperado**:
   - Pacote mostra badge "Já adquirido em DD/MM/YYYY"
   - Botão desabilitado
   - Mensagem: "Dados válidos até DD/MM/YYYY"

### Cenário 4: Dados Expirados 📅

1. **Setup**: Lead com enriquecimento > 90 dias
2. **Ação**: Visualizar dossiê
3. **Resultado Esperado**:
   - Badge "Dados Expirados" em vermelho
   - Botão "Renovar Dados" disponível
   - Cards mostram último valor conhecido

### Cenário 5: Erro de API 🔥

1. **Setup**: Backend offline ou erro 500
2. **Ação**: Tentar comprar enriquecimento
3. **Resultado Esperado**:
   - Erro tratado graciosamente
   - Mensagem: "Não foi possível processar"
   - Botão "Tentar novamente"
   - Créditos não deduzidos

---

## 7. Dados de Teste (Mock)

Para testes locais sem backend real:

### 7.1 Configurar MSW (Mock Service Worker)

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/leads', () => {
    return HttpResponse.json({
      data: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          documentNumber: '12345678900',
          documentType: 'CPF',
          name: 'Roberto Silva',
          email: 'roberto@test.com',
          phone: '(11) 98765-4321',
          status: 'qualified',
          tags: ['vip'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasEnrichment: false,
          enrichmentExpiry: null,
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get('/api/credits/balance', () => {
    return HttpResponse.json({
      userId: 'user-uuid',
      companyId: 'company-uuid',
      balance: 500,
      reserved: 0,
      available: 500,
      currency: 'BRL',
      lastUpdated: new Date().toISOString(),
    });
  }),
];
```

### 7.2 Iniciar com Mocks

```bash
VITE_USE_MOCKS=true npm run dev
```

---

## 8. Troubleshooting

### Problema: "Créditos não atualizando após compra"

**Solução**: Verificar invalidação de cache no React Query

```typescript
// hooks/usePurchaseEnrichment.ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
  queryClient.invalidateQueries({ queryKey: ['dossier', leadId] });
}
```

### Problema: "Dados mascarados não aparecem corretamente"

**Solução**: Verificar utilitário de mascaramento

```typescript
// utils/lgpdMask.ts
console.log(maskCPF('12345678900')); // Deve retornar: ***.456.789-**
```

### Problema: "Modal de compra não abre"

**Solução**: Verificar logs do console para erros de validação Zod

---

## 9. Próximos Passos

Após validar o fluxo básico:

1. ✅ Testar todos os 5 pacotes de enriquecimento
2. ✅ Verificar responsividade mobile (resize browser)
3. ✅ Testar filtros e busca na lista
4. ✅ Verificar histórico de compras
5. ✅ Testar pacote completo (P3)

---

## 10. Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Iniciar app
npm run dev:vendas-ia          # Tenant específico
npm run lint                   # Lint código
npm run build                  # Build produção

# Testes
npm run test:contract          # Testes de contrato
npm run test:integration       # Testes de integração
npm run test:run               # Todos os testes
npm run test:coverage          # Cobertura

# Backend (em outra janela)
cd ../leadsrapido_backend
npm run dev:api                # API backend
```

---

## 11. Links Úteis

- **Especificação**: [spec.md](./spec.md)
- **Modelo de Dados**: [data-model.md](./data-model.md)
- **Contratos API**:
  - [Leads API](./contracts/api-leads.yaml)
  - [Credits API](./contracts/api-credits.yaml)
  - [PH3A API](./contracts/api-ph3a.yaml)
- **PRD Original**: `/docs/ph3a/PRD-RESUMO-LEAD.md`
- **Schema PH3A**: `/docs/ph3a/DOSSIER_SCHEMA.md`

---

## 12. Ajuda

Problemas ou dúvidas:

1. Verificar console do navegador (F12)
2. Verificar logs do backend
3. Conferir network tab para requests/responses
4. Consultar documentação dos contratos API
5. Rodar testes: `npm run test:run`

**Status dos Serviços**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Backend Health: http://localhost:3000/health

---

**Tempo Total**: ~10-15 minutos para setup completo e teste do fluxo básico

**Pronto para desenvolvimento!** 🚀

