# 📧 Email para Equipe de Frontend

---

**Para:** Equipe Frontend
**Assunto:** ✅ API de Vendas Pronta - Sistema de Assinaturas com Trial Gratuito
**Data:** 04/10/2025
**Prioridade:** Alta

---

## Olá Time Frontend! 👋

Tenho uma ótima notícia: **a API do sistema de vendas está completa e pronta para integração!**

Implementamos um sistema completo de **assinaturas recorrentes** com **período de trial gratuito** integrado ao gateway de pagamento **Asaas**. Agora vocês podem criar a interface de vendas para nossos clientes.

---

## 🎯 O que está pronto?

✅ **API REST completa** com autenticação JWT
✅ **Trial gratuito configurável** (7, 14 dias, etc.)
✅ **Cobrança recorrente automática** (mensal, anual)
✅ **Integração com Asaas** (sandbox e produção)
✅ **Webhooks automáticos** para atualização de status
✅ **Documentação completa** com exemplos de código
✅ **Testes HTTP prontos** para validação

---

## 📋 O que você precisa fazer?

Criar 4 páginas principais:

### 1. **Pricing Page** (`/pricing`)
Lista todos os planos com badges "Trial Grátis"

### 2. **Checkout** (`/checkout`)
Cliente confirma plano e inicia trial

### 3. **Success** (`/checkout/success`)
Confirmação de trial ativado

### 4. **Subscription Manager** (`/account/subscription`)
Dashboard para gerenciar assinatura ativa

---

## 🚀 Quick Start

### Endpoints Principais

```http
# 1. Listar planos disponíveis
GET /api/v1/produtos?categoria=crm_saas&status=ativo

# 2. Criar assinatura (iniciar trial)
POST /api/v1/subscriptions
{
  "empresaId": "uuid",
  "produtoId": "uuid",
  "billingCycle": "MONTHLY",
  "value": 99.90,
  "hasTrial": true,
  "trialDays": 7
}

# 3. Listar assinaturas do usuário
GET /api/v1/subscriptions?empresaId={id}

# 4. Cancelar assinatura
POST /api/v1/subscriptions/{id}/cancel
```

---

## 📚 Documentação

Preparei **3 documentos** para vocês:

### 1️⃣ **Quick Start** (Comece aqui!)
📄 `docs/FRONTEND_SALES_QUICK_START.md`

**5 minutos de leitura** com:
- Endpoints principais
- Exemplos de código React
- Componentes sugeridos
- Tratamento de erros
- TypeScript types

👉 **Leia este primeiro!**

---

### 2️⃣ **Especificação Completa** (Referência detalhada)
📄 `docs/FRONTEND_SALES_PAGE_SPEC.md`

**30+ páginas** com:
- Fluxo completo de usuário
- Todos os endpoints documentados
- Modelos de dados TypeScript
- Componentes React completos
- Validações e regras de negócio
- Design system sugerido
- Casos de uso detalhados
- Exemplos de requisições
- UI/UX guidelines
- Responsividade
- Testes sugeridos

👉 **Use como referência durante desenvolvimento**

---

### 3️⃣ **Testes HTTP** (Validação da API)
📄 `contract-first/subscriptions/test-subscriptions.http`

**20+ casos de teste** prontos:
- Criar assinaturas com/sem trial
- Listar e filtrar assinaturas
- Cancelar assinatura
- Simular webhooks do Asaas
- Casos de erro

👉 **Use para testar a API antes de integrar**

---

## 🎨 Exemplo de Código

Aqui está um exemplo básico de como criar uma assinatura:

```typescript
// Hook customizado
const useCreateSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/subscriptions', data);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar assinatura');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createSubscription, loading, error };
};

// Uso no componente
const CheckoutPage = () => {
  const { createSubscription, loading } = useCreateSubscription();
  const { user } = useAuth();

  const handleStartTrial = async (produto) => {
    const subscription = await createSubscription({
      empresaId: user.empresaId,
      produtoId: produto.id,
      billingCycle: 'MONTHLY',
      value: produto.preco,
      hasTrial: true,
      trialDays: 7
    });

    // Redirecionar para success page
    navigate('/checkout/success', { state: { subscription } });
  };

  return (
    <button onClick={() => handleStartTrial(selectedProduct)}>
      {loading ? 'Processando...' : 'Iniciar Trial Gratuito'}
    </button>
  );
};
```

**Simples assim!** 🎉

---

## 🔌 Ambiente de Desenvolvimento

**API Base URL:**
```
Development: http://localhost:3000/api/v1
Production: https://api.leadsrapido.com/api/v1
```

**Autenticação:**
Todas as requisições precisam do header:
```
Authorization: Bearer {jwt_token}
```

**Swagger Documentation:**
```
http://localhost:3000/api-docs
```

---

## 💡 Fluxo Resumido

```
1. User acessa /pricing
   ↓
2. Vê planos com badge "7 DIAS GRÁTIS"
   ↓
3. Clica em "Começar Trial"
   ↓
4. Se não autenticado → redireciona para login
   ↓
5. Vai para /checkout com plano selecionado
   ↓
6. Confirma → POST /subscriptions
   ↓
7. Backend cria assinatura com status "trialing"
   ↓
8. Frontend recebe subscription criada
   ↓
9. Redireciona para /checkout/success
   ↓
10. User começa a usar com trial ativo! 🎉
```

---

## ✅ Status dos Recursos

| Recurso | Status | Endpoint |
|---------|--------|----------|
| Listar produtos | ✅ Pronto | `GET /produtos` |
| Criar assinatura | ✅ Pronto | `POST /subscriptions` |
| Listar assinaturas | ✅ Pronto | `GET /subscriptions` |
| Buscar por ID | ✅ Pronto | `GET /subscriptions/{id}` |
| Cancelar assinatura | ✅ Pronto | `POST /subscriptions/{id}/cancel` |
| Webhooks Asaas | ✅ Pronto | `POST /webhooks/asaas` |
| Trial gratuito | ✅ Implementado | - |
| Cobrança recorrente | ✅ Implementado | - |

---

## 🧪 Como Testar

### Opção 1: VSCode REST Client

1. Instale a extensão "REST Client"
2. Abra `contract-first/subscriptions/test-subscriptions.http`
3. Clique em "Send Request" em cada teste

### Opção 2: Postman

1. Importe a collection (será enviada em breve)
2. Configure environment com seu token
3. Execute os testes

### Opção 3: cURL

```bash
# Listar produtos
curl http://localhost:3000/api/v1/produtos \
  -H "Authorization: Bearer {token}"

# Criar assinatura
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "empresaId": "uuid",
    "produtoId": "uuid",
    "billingCycle": "MONTHLY",
    "value": 99.90,
    "hasTrial": true,
    "trialDays": 7
  }'
```

---

## 🎨 Design Sugerido

### Badges de Status

- **Trial Ativo:** Badge azul com 🔥 "7 dias restantes"
- **Assinatura Ativa:** Badge verde com ✅ "Ativa"
- **Pagamento Pendente:** Badge laranja com ⚠️ "Pendente"
- **Cancelada:** Badge cinza com ❌ "Cancelada"

### Cores Sugeridas

```css
/* Trial */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Active */
background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

/* Past Due */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

---

## 📞 Precisa de Ajuda?

### Canais de Suporte:

**Slack:** #backend-api
**Email:** joao@leadsrapido.com
**GitHub Issues:** Use tag `frontend-integration`
**Daily:** Às 10h (pode chamar no Slack antes se urgente)

### O que posso ajudar:

✅ Explicar endpoints
✅ Debugar problemas de integração
✅ Fornecer dados de teste
✅ Criar novos endpoints se necessário
✅ Revisar código de integração

---

## 📅 Timeline Sugerida

**Semana 1:**
- Setup e familiarização com API
- Implementar Pricing Page
- Teste de integração básica

**Semana 2:**
- Implementar Checkout Flow
- Success Page
- Tratamento de erros

**Semana 3:**
- Subscription Manager
- Polish e UX
- Testes end-to-end

**Semana 4:**
- Ajustes finais
- Deploy em staging
- QA

---

## 🚀 Próximos Passos

### Para vocês (Frontend):

1. ✅ Ler o Quick Start
2. ✅ Testar endpoints com REST Client
3. ✅ Criar branch `feature/sales-page`
4. ✅ Implementar Pricing Page
5. ✅ Daily sync para alinhamento

### Para nós (Backend):

- ✅ Monitorar logs e performance
- ✅ Suporte ativo durante integração
- ✅ Ajustes rápidos se necessário
- ⏳ Preparar seeds de produtos (em breve)
- ⏳ Postman Collection (em breve)

---

## 🎁 Bônus

### Dados de Teste

Vou criar alguns produtos de exemplo para vocês testarem. Em breve vocês terão:

- **Plano Starter** - R$ 49,90/mês (Trial 7 dias)
- **Plano Pro** - R$ 99,90/mês (Trial 7 dias) ⭐ Mais Popular
- **Plano Business** - R$ 199,90/mês (Trial 14 dias)

### Melhorias Futuras (não bloqueia vocês)

- [ ] Upgrade/Downgrade de planos
- [ ] Cupons de desconto
- [ ] Histórico de pagamentos
- [ ] Notas fiscais

---

## 💪 Vamos nessa!

Estou muito empolgado para ver essa feature live! A API está sólida e pronta para escalar.

Se tiverem qualquer dúvida, **não hesitem em me chamar**. Prefiro responder 100 perguntas do que vocês ficarem travados.

**Let's ship it!** 🚀

---

**João Silva**
Backend Developer
LeadsRapido

---

## 📎 Anexos

1. [Quick Start Guide](./FRONTEND_SALES_QUICK_START.md)
2. [Especificação Completa](./FRONTEND_SALES_PAGE_SPEC.md)
3. [Testes HTTP](../contract-first/subscriptions/test-subscriptions.http)
4. [Guia de Integração Backend](../contract-first/subscriptions/README.md)

---

**P.S.:** Preparei café ☕ e estou online no Slack para ajudar! 😄
