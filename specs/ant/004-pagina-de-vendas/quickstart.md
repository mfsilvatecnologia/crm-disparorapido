# Quickstart: Sales & Subscriptions

**Feature**: 004-pagina-de-vendas
**Purpose**: Validar end-to-end os fluxos principais da feature de vendas e assinaturas
**Date**: 2025-10-04

## Overview

Este documento contém cenários de teste executáveis que validam os requisitos funcionais da feature. Cada cenário deve ser implementado como teste de integração e deve passar antes da feature ser considerada completa.

## Prerequisites

```bash
# Database
npm run db:migrate
npm run db:seed  # Popula produtos de teste

# Environment
ASAAS_API_KEY=test_key_sandbox
ASAAS_ENV=sandbox
JWT_SECRET=test_secret

# Services running
npm run dev         # Frontend (porta 5173)
npm run server:dev  # Backend (porta 3000)
```

## Test Data Setup

```typescript
// Produtos de teste (seed)
const testProducts = [
  {
    name: "Plano Básico",
    priceMonthly: 4900, // R$ 49,00
    billingCycle: "monthly",
    features: ["1.000 leads", "1 usuário", "Suporte por email"],
    maxSessions: 1,
    maxLeads: 1000,
    trialDays: 7,
    isActive: true,
    isMostPopular: false,
    position: 0
  },
  {
    name: "Plano Pro",
    priceMonthly: 19900, // R$ 199,00
    billingCycle: "monthly",
    features: ["10.000 leads", "5 usuários", "Relatórios avançados", "Suporte prioritário"],
    maxSessions: 5,
    maxLeads: 10000,
    trialDays: 14,
    isActive: true,
    isMostPopular: true,
    position: 1
  },
  {
    name: "Plano Enterprise",
    priceMonthly: 49900, // R$ 499,00
    billingCycle: "monthly",
    features: ["Leads ilimitados", "Usuários ilimitados", "API dedicada", "Suporte 24/7"],
    maxSessions: 999,
    maxLeads: null,
    trialDays: 14,
    isActive: true,
    isMostPopular: false,
    position: 2
  }
];

// Usuário de teste
const testUser = {
  email: "test@example.com",
  password: "Test123!@#",
  company: {
    name: "Test Company",
    cnpj: "12345678000190"
  }
};
```

---

## Scenario 1: View Pricing Plans (Unauthenticated)

**FR-001 a FR-004**: Exibição de planos de preços

### Steps

```gherkin
Given eu sou um visitante não autenticado
When eu acesso a página "/pricing"
Then eu vejo 3 planos exibidos
And cada plano mostra:
  | Campo           | Esperado                    |
  | nome            | Visível                     |
  | preço mensal    | Formatado em R$             |
  | trial duration  | "X dias grátis"             |
  | features        | Lista com bullet points     |
  | CTA button      | "Iniciar Teste Grátis"      |
And o "Plano Pro" tem badge "Mais Popular"
And os planos estão ordenados por position (0, 1, 2)
```

### Validation

```typescript
test('deve exibir planos de pricing corretamente', async () => {
  // Arrange
  const { container } = render(<App />, { route: '/pricing' });

  // Act
  await screen.findByRole('heading', { name: /planos e preços/i });

  // Assert
  const pricingCards = screen.getAllByTestId('pricing-card');
  expect(pricingCards).toHaveLength(3);

  // Plano Pro é o mais popular
  const proCard = screen.getByText('Plano Pro').closest('[data-testid="pricing-card"]');
  expect(within(proCard).getByText(/mais popular/i)).toBeInTheDocument();

  // Preço formatado
  expect(screen.getByText('R$ 199,00')).toBeInTheDocument();
  expect(screen.getByText(/mês/i)).toBeInTheDocument();

  // Trial duration
  expect(screen.getByText('14 dias grátis')).toBeInTheDocument();

  // Features
  const features = within(proCard).getAllByRole('listitem');
  expect(features.length).toBeGreaterThan(0);
  expect(within(proCard).getByText(/10.000 leads/i)).toBeInTheDocument();

  // CTA button
  const ctaButtons = screen.getAllByRole('button', { name: /iniciar teste grátis/i });
  expect(ctaButtons).toHaveLength(3);
});
```

---

## Scenario 2: Start Trial (Happy Path)

**FR-005 a FR-010**: Ativação de trial

### Steps

```gherkin
Given eu sou um visitante não autenticado
And existe um usuário cadastrado "test@example.com"
And este usuário NÃO tem assinatura ativa
When eu clico em "Iniciar Teste Grátis" no "Plano Pro"
Then eu sou redirecionado para "/login?redirect=/checkout/product-id"
When eu faço login com credenciais válidas
Then eu sou redirecionado para "/checkout/product-id"
And eu vejo a página de confirmação com:
  | Campo                  | Valor                        |
  | Nome do plano          | "Plano Pro"                  |
  | Preço                  | "R$ 199,00/mês"              |
  | Trial duration         | "14 dias grátis"             |
  | Trial end date         | "18 de outubro de 2025"      |
  | First payment date     | "19 de outubro de 2025"      |
  | Features               | Lista completa               |
When eu clico em "Confirmar e Iniciar Trial"
Then uma requisição POST é feita para "/api/subscriptions/trial"
And a API retorna status 201
And uma subscription é criada no banco:
  | Campo            | Valor                          |
  | status           | "trialing"                     |
  | hasTrial         | true                           |
  | trialDurationDays| 14                             |
  | isInTrial        | true                           |
  | paymentCount     | 0                              |
Then eu sou redirecionado para "/checkout/success"
And eu vejo a mensagem "Trial Ativado com Sucesso!"
And eu vejo:
  | Info                   | Valor                         |
  | Trial end date         | "18 de outubro de 2025"       |
  | First payment date     | "19 de outubro de 2025"       |
  | Trial duration         | "14 dias"                     |
And eu recebo um email de confirmação de trial
```

### Validation

```typescript
test('deve permitir iniciar trial com sucesso (usuário autenticado)', async () => {
  // Arrange
  const user = userEvent.setup();
  const { container } = render(<App />, { user: testUser, route: '/pricing' });

  // Mock API
  server.use(
    rest.post('/api/subscriptions/trial', async (req, res, ctx) => {
      const body = await req.json();
      expect(body.productId).toBeDefined();

      return res(ctx.status(201), ctx.json({
        success: true,
        data: {
          id: 'sub-123',
          status: 'trialing',
          hasTrial: true,
          trialEndDate: addDays(new Date(), 14).toISOString(),
          ...body
        }
      }));
    })
  );

  // Act
  const proCard = screen.getByText('Plano Pro').closest('[data-testid="pricing-card"]');
  const ctaButton = within(proCard).getByRole('button', { name: /iniciar teste grátis/i });
  await user.click(ctaButton);

  // Assert - Checkout page
  await screen.findByRole('heading', { name: /confirmar assinatura/i });
  expect(screen.getByText('Plano Pro')).toBeInTheDocument();
  expect(screen.getByText('R$ 199,00/mês')).toBeInTheDocument();
  expect(screen.getByText('14 dias grátis')).toBeInTheDocument();

  // Act - Confirm
  const confirmButton = screen.getByRole('button', { name: /confirmar e iniciar trial/i });
  await user.click(confirmButton);

  // Assert - Success page
  await screen.findByRole('heading', { name: /trial ativado com sucesso/i });
  expect(screen.getByText(/seu trial de 14 dias começou/i)).toBeInTheDocument();
  expect(screen.getByText(/primeira cobrança em/i)).toBeInTheDocument();
});
```

---

## Scenario 3: View Subscription Status (In Trial)

**FR-011 a FR-015**: Exibição de status de assinatura

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa tem uma subscription com status "trialing"
And o trial termina em 12 dias
When eu acesso o dashboard "/dashboard"
Then eu vejo um banner de trial no topo
And o banner mostra:
  | Info                    | Valor                         |
  | Status badge            | "Trial Ativo" (azul)          |
  | Days remaining          | "12 dias restantes"           |
  | Trial end date          | "18 de outubro de 2025"       |
  | First payment amount    | "R$ 199,00"                   |
  | First payment date      | "19 de outubro de 2025"       |
  | Link                    | "Gerenciar Assinatura"        |
When eu clico em "Gerenciar Assinatura"
Then eu sou redirecionado para "/subscription"
And eu vejo detalhes completos:
  | Campo                   | Valor                         |
  | Plano                   | "Plano Pro"                   |
  | Status                  | "Trial Ativo"                 |
  | Billing cycle           | "Mensal"                      |
  | Days remaining          | "12 dias"                     |
  | Trial end               | "18 de outubro de 2025"       |
  | Next payment            | "R$ 199,00 em 19/10/2025"     |
  | Payment history         | "Nenhum pagamento ainda"      |
And eu vejo botão "Cancelar Assinatura"
```

### Validation

```typescript
test('deve exibir status de trial corretamente no dashboard', async () => {
  // Arrange
  const trialEndDate = addDays(new Date(), 12);
  const subscription = {
    id: 'sub-123',
    status: 'trialing',
    hasTrial: true,
    trialEndDate,
    isInTrial: true,
    priceAmount: 19900,
    product: {
      name: 'Plano Pro',
      features: ['10.000 leads', '5 usuários']
    }
  };

  server.use(
    rest.get('/api/subscriptions/current', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: subscription }));
    })
  );

  // Act
  const { container } = render(<App />, { user: testUser, route: '/dashboard' });

  // Assert
  await screen.findByTestId('trial-banner');
  expect(screen.getByText(/trial ativo/i)).toBeInTheDocument();
  expect(screen.getByText(/12 dias restantes/i)).toBeInTheDocument();
  expect(screen.getByText('R$ 199,00')).toBeInTheDocument();

  // Badge color
  const badge = screen.getByText(/trial ativo/i);
  expect(badge).toHaveClass('bg-blue-100'); // ou classe equivalente
});
```

---

## Scenario 4: Cancel Subscription (During Trial)

**FR-016 a FR-021**: Cancelamento de assinatura

### Steps

```gherkin
Given eu sou um usuário autenticado (admin da empresa)
And minha empresa tem subscription "trialing"
And o trial termina em 10 dias
When eu acesso "/subscription"
And eu clico em "Cancelar Assinatura"
Then um modal de confirmação é exibido com:
  | Info                    | Texto                                |
  | Título                  | "Cancelar Assinatura?"               |
  | Aviso                   | "Seu acesso continuará até 18/10"    |
  | Consequências           | "Após esta data você perderá acesso" |
  | Retenção dados          | "Dados mantidos por 30 dias"         |
  | Motivo (opcional)       | Textarea vazio                       |
And eu vejo botões:
  | Botão                   | Estilo                               |
  | "Voltar"                | Secondary                            |
  | "Confirmar Cancelamento"| Danger (vermelho)                    |
When eu digito "Encontrei solução melhor" no campo motivo
And eu clico em "Confirmar Cancelamento"
Then uma requisição PATCH é feita para "/api/subscriptions/:id/cancel"
And a API retorna status 200
And a subscription no banco é atualizada:
  | Campo               | Valor                                |
  | status              | "canceled"                           |
  | canceledAt          | Data/hora atual                      |
  | cancellationReason  | "Encontrei solução melhor"           |
Then o modal fecha
And eu vejo mensagem de sucesso:
  "Assinatura cancelada. Acesso continua até 18 de outubro de 2025."
And o status exibido muda para "Cancelada"
And o botão "Cancelar Assinatura" some
And eu recebo email de confirmação de cancelamento
```

### Validation

```typescript
test('deve permitir cancelar subscription durante trial', async () => {
  // Arrange
  const user = userEvent.setup();
  const subscription = {
    id: 'sub-123',
    status: 'trialing',
    trialEndDate: addDays(new Date(), 10)
  };

  server.use(
    rest.get('/api/subscriptions/current', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: subscription }));
    }),
    rest.patch('/api/subscriptions/:id/cancel', async (req, res, ctx) => {
      const body = await req.json();
      expect(body.reason).toBe('Encontrei solução melhor');

      return res(ctx.json({
        success: true,
        data: {
          ...subscription,
          status: 'canceled',
          canceledAt: new Date().toISOString(),
          cancellationReason: body.reason
        },
        message: 'Assinatura cancelada. Acesso continua até 18 de outubro de 2025.'
      }));
    })
  );

  // Act
  const { container } = render(<App />, { user: testUser, route: '/subscription' });

  const cancelButton = await screen.findByRole('button', { name: /cancelar assinatura/i });
  await user.click(cancelButton);

  // Assert - Modal
  await screen.findByRole('dialog');
  expect(screen.getByText(/cancelar assinatura\?/i)).toBeInTheDocument();
  expect(screen.getByText(/acesso continuará até/i)).toBeInTheDocument();

  // Act - Fill reason and confirm
  const reasonTextarea = screen.getByRole('textbox', { name: /motivo/i });
  await user.type(reasonTextarea, 'Encontrei solução melhor');

  const confirmButton = screen.getByRole('button', { name: /confirmar cancelamento/i });
  await user.click(confirmButton);

  // Assert - Success
  await screen.findByText(/assinatura cancelada/i);
  expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /cancelar assinatura/i })).not.toBeInTheDocument();
});
```

---

## Scenario 5: Trial Expiration to Active (UI Update)

**Frontend behavior**: Atualização de status após pagamento processado pelo backend

**Nota**: O webhook do Asaas é processado pelo BACKEND (já implementado). Este teste valida que o FRONTEND exibe corretamente as mudanças de status após o backend processar o pagamento.

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha subscription está em status "trialing"
And o trial termina hoje
And estou visualizando o dashboard
When o backend processa o pagamento via webhook Asaas (fora do escopo desta feature)
And a subscription no banco de dados muda para status "active"
And o TanStack Query faz refetch da subscription (polling ou manual)
Then o status exibido muda de "Trial Ativo" para "Ativo"
And o badge de trial desaparece
And eu vejo "Próximo pagamento: R$ 199,00 em 19/11/2025"
And eu recebo notificação in-app:
  "Pagamento recebido! Sua assinatura está ativa."
```

### Validation

```typescript
test('deve exibir status atualizado quando trial se torna ativo', async () => {
  // Arrange - Subscription inicial em trial
  const subscription = {
    id: 'sub-123',
    status: 'trialing',
    hasTrial: true,
    isInTrial: true,
    trialEndDate: new Date(),
    product: { name: 'Plano Pro' }
  };

  server.use(
    rest.get('/api/subscriptions/current', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: subscription }));
    })
  );

  const { container } = render(<App />, { user: testUser, route: '/dashboard' });

  // Assert - Trial status exibido inicialmente
  await screen.findByText(/trial ativo/i);

  // Act - Simular atualização do backend (webhook processado por sistema externo)
  const updatedSubscription = {
    ...subscription,
    status: 'active',
    isInTrial: false,
    paymentCount: 1,
    lastPaymentDate: new Date().toISOString(),
    nextDueDate: addMonths(new Date(), 1).toISOString()
  };

  server.use(
    rest.get('/api/subscriptions/current', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: updatedSubscription }));
    })
  );

  // Simular refetch do TanStack Query (como se fosse polling automático)
  await act(async () => {
    queryClient.invalidateQueries(['subscription']);
    await waitFor(() => queryClient.isFetching(['subscription']) === 0);
  });

  // Assert - Status ativo exibido
  await screen.findByText(/^ativo$/i);
  expect(screen.queryByText(/trial ativo/i)).not.toBeInTheDocument();
  expect(screen.getByText(/próximo pagamento/i)).toBeInTheDocument();
  expect(screen.getByText('R$ 199,00')).toBeInTheDocument();
  expect(screen.getByText(/19\/11\/2025/i)).toBeInTheDocument();
});
```

---

## Scenario 6: Prevent Duplicate Trial

**FR-010**: Impedir trial duplicado

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa JÁ teve um trial para "Plano Pro"
And a subscription antiga está cancelada ou expirada
When eu tento iniciar um novo trial para "Plano Pro"
Then uma requisição POST é feita para "/api/subscriptions/trial"
And a API retorna status 400
And eu vejo mensagem de erro:
  "Você já utilizou o período de teste para este plano."
And eu vejo opção:
  "Assinar diretamente sem trial"
```

### Validation

```typescript
test('deve impedir trial duplicado para mesmo produto', async () => {
  // Arrange
  const user = userEvent.setup();

  // Criar trial anterior (expirado)
  await prisma.subscription.create({
    data: {
      companyId: testCompany.id,
      productId: testProduct.id,
      status: 'expired',
      hasTrial: true,
      trialEndDate: subDays(new Date(), 5),
      isInTrial: false
    }
  });

  server.use(
    rest.post('/api/subscriptions/trial', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({
        success: false,
        error: {
          code: 'TRIAL_ALREADY_USED',
          message: 'Você já utilizou o período de teste para este plano.'
        }
      }));
    })
  );

  // Act
  const { container } = render(<App />, { user: testUser, route: '/pricing' });

  const proCard = screen.getByText('Plano Pro').closest('[data-testid="pricing-card"]');
  const ctaButton = within(proCard).getByRole('button', { name: /iniciar teste grátis/i });
  await user.click(ctaButton);

  const confirmButton = await screen.findByRole('button', { name: /confirmar/i });
  await user.click(confirmButton);

  // Assert
  await screen.findByText(/você já utilizou o período de teste/i);
  expect(screen.getByRole('button', { name: /assinar diretamente/i })).toBeInTheDocument();
});
```

---

## Scenario 7: Session Limit Enforcement

**FR-034**: Limite de sessões simultâneas

### Steps

```gherkin
Given minha empresa tem subscription "active" para "Plano Pro"
And o plano permite maxSessions = 5
And já existem 5 sessões ativas
When um 6º usuário tenta fazer login
Then a API retorna erro 403
And o usuário vê mensagem:
  "Limite de sessões atingido. Seu plano permite 5 usuários simultâneos."
And são mostradas opções:
  - "Encerrar outra sessão"
  - "Fazer upgrade do plano"
```

### Validation

```typescript
test('deve bloquear login quando limite de sessões atingido', async () => {
  // Arrange
  const subscription = {
    product: {
      maxSessions: 5
    }
  };

  // Simular 5 sessões ativas no Redis
  for (let i = 0; i < 5; i++) {
    await redis.sadd(`session:limit:${testCompany.id}`, `session-${i}`);
  }

  // Mock login endpoint
  server.use(
    rest.post('/api/auth/login', (req, res, ctx) => {
      return res(ctx.status(403), ctx.json({
        success: false,
        error: {
          code: 'SESSION_LIMIT_REACHED',
          message: 'Limite de sessões atingido. Seu plano permite 5 usuários simultâneos.',
          details: {
            currentSessions: 5,
            maxSessions: 5
          }
        }
      }));
    })
  );

  // Act
  const { container } = render(<LoginPage />);
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/senha/i);
  const loginButton = screen.getByRole('button', { name: /entrar/i });

  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'Test123!');
  await user.click(loginButton);

  // Assert
  await screen.findByText(/limite de sessões atingido/i);
  expect(screen.getByText(/5 usuários simultâneos/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /fazer upgrade/i })).toBeInTheDocument();
});
```

---

## Scenario 8: Responsive Design (Mobile)

**FR-035 a FR-038**: Layout responsivo

### Steps

```gherkin
Given eu estou em um dispositivo mobile (375px width)
When eu acesso "/pricing"
Then os pricing cards estão empilhados verticalmente
And cada card ocupa 100% da largura
And features podem ser expandidas/colapsadas
And o CTA button está fixo no bottom da tela
When eu deslizo horizontalmente
Then eu posso navegar entre os cards como carrossel
```

### Validation

```typescript
test('deve exibir pricing page responsivamente em mobile', async () => {
  // Arrange
  global.innerWidth = 375;
  global.dispatchEvent(new Event('resize'));

  // Act
  const { container } = render(<PricingPage />);

  // Assert
  const pricingCards = screen.getAllByTestId('pricing-card');

  pricingCards.forEach(card => {
    const styles = window.getComputedStyle(card);
    expect(styles.width).toBe('100%');
  });

  // Cards em coluna
  const cardsContainer = screen.getByTestId('pricing-cards-container');
  expect(cardsContainer).toHaveClass('flex-col'); // ou grid-cols-1
});
```

---

## Performance Benchmarks

```typescript
test('pricing page deve carregar em menos de 2 segundos', async () => {
  const startTime = performance.now();

  render(<PricingPage />);
  await screen.findByRole('heading', { name: /planos/i });

  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // 2s
});

test('checkout flow deve ter transições < 500ms', async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);

  // Step 1: Pricing → Checkout
  const startTime1 = performance.now();
  const ctaButton = screen.getByRole('button', { name: /iniciar trial/i });
  await user.click(ctaButton);
  await screen.findByRole('heading', { name: /confirmar/i });
  const transition1 = performance.now() - startTime1;
  expect(transition1).toBeLessThan(500);

  // Step 2: Checkout → Success
  const startTime2 = performance.now();
  const confirmButton = screen.getByRole('button', { name: /confirmar/i });
  await user.click(confirmButton);
  await screen.findByRole('heading', { name: /sucesso/i });
  const transition2 = performance.now() - startTime2;
  expect(transition2).toBeLessThan(1000); // API call included
});
```

---

## Scenario 9: Purchase Credit Package

**Sistema de Créditos**: Compra de pacote de créditos

### Steps

```gherkin
Given eu sou um usuário autenticado
And estou na página "/credits/packages"
When a página carrega
Then eu vejo 5 pacotes de créditos exibidos:
  | Pacote      | Preço      | Créditos | Leads | Bônus |
  | Starter     | R$ 50,00   | 5.000    | 100   | -     |
  | Básico      | R$ 100,00  | 10.000   | 250   | -     |
  | Pro         | R$ 250,00  | 24.750   | 750   | +50   |
  | Business    | R$ 600,00  | 60.000   | 2.000 | +200  |
  | Enterprise  | R$ 1.250,00| 125.000  | 5.000 | +750  |
And o "Pacote Pro" tem badge "Mais Popular"
And cada pacote mostra:
  - Preço formatado
  - Quantidade de leads inclusos
  - Custo por lead
  - Economia (se tiver bônus)
When eu clico em "Comprar Agora" no "Pacote Pro"
Then um modal de confirmação é exibido com:
  | Campo                | Valor                    |
  | Pacote selecionado   | "Pacote Pro"             |
  | Valor total          | "R$ 250,00"              |
  | Créditos             | "24.750 + 1.650 bônus"   |
  | Leads inclusos       | "750 + 50 bônus"         |
  | Forma de pagamento   | Opções (PIX, Boleto, CC) |
When eu confirmo a compra
Then integração com Asaas é iniciada
And webhook processa pagamento (backend)
And créditos são adicionados à empresa
```

### Validation

```typescript
test('deve permitir comprar pacote de créditos', async () => {
  // Arrange
  const user = userEvent.setup();

  server.use(
    rest.get('/api/v1/credits/packages', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [
          {
            id: 'pkg-pro',
            nome: 'Pacote Pro',
            preco_centavos: 25000,
            quantidade_creditos: 24750,
            bonus_creditos: 1650,
            destaque: true
          }
        ]
      }));
    }),
    rest.post('/api/v1/payments/create', async (req, res, ctx) => {
      const body = await req.json();
      expect(body.produtoId).toBe('pkg-pro');

      return res(ctx.json({
        success: true,
        data: {
          paymentId: 'pay_123',
          paymentUrl: 'https://asaas.com/pay/123'
        }
      }));
    })
  );

  // Act
  render(<CreditPackagesPage />, { user: testUser });

  const proCard = await screen.findByText('Pacote Pro')
    .then(el => el.closest('[data-testid="package-card"]'));

  expect(within(proCard).getByText('R$ 250,00')).toBeInTheDocument();
  expect(within(proCard).getByText(/mais popular/i)).toBeInTheDocument();

  const buyButton = within(proCard).getByRole('button', { name: /comprar/i });
  await user.click(buyButton);

  // Assert - Confirmation modal
  await screen.findByRole('dialog');
  expect(screen.getByText('Pacote Pro')).toBeInTheDocument();
  expect(screen.getByText(/24.750 \+ 1.650 bônus/i)).toBeInTheDocument();

  const confirmButton = screen.getByRole('button', { name: /confirmar compra/i });
  await user.click(confirmButton);

  // Assert - Redirect to payment
  await waitFor(() => {
    expect(window.location.href).toContain('asaas.com/pay');
  });
});
```

---

## Scenario 10: View Credit Balance

**Sistema de Créditos**: Consulta de saldo

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa tem saldo de 15.000 créditos
When eu acesso o dashboard
Then eu vejo o widget de saldo de créditos exibindo:
  | Info                  | Valor                    |
  | Saldo atual           | "R$ 150,00"              |
  | Créditos              | "15.000 créditos"        |
  | Leads disponíveis     | "~454 leads"             |
  | Total comprado        | "R$ 250,00"              |
  | Total gasto           | "R$ 100,00"              |
  | Total bônus           | "R$ 10,00"               |
  | Última transação      | "Compra - Pacote Pro"    |
And eu vejo botão "Comprar Mais Créditos"
When eu clico em "Ver Histórico"
Then sou redirecionado para "/credits/history"
And vejo lista de todas transações ordenadas por data
```

### Validation

```typescript
test('deve exibir saldo de créditos no dashboard', async () => {
  // Arrange
  server.use(
    rest.get('/api/v1/credits/balance', (req, res, ctx) => {
      expect(req.url.searchParams.get('empresaId')).toBe(testCompany.id);

      return res(ctx.json({
        success: true,
        data: {
          empresaId: testCompany.id,
          empresaNome: 'Test Company',
          saldoCreditosCentavos: 15000,
          saldoFormatado: 'R$ 150,00',
          ultimaTransacao: {
            tipo: 'compra',
            descricao: 'Compra de créditos - Pacote Pro'
          },
          estatisticas: {
            totalComprado: 25000,
            totalGasto: 10000,
            totalBonusRecebido: 1000
          }
        }
      }));
    })
  );

  // Act
  render(<DashboardPage />, { user: testUser });

  // Assert
  const creditWidget = await screen.findByTestId('credit-balance-card');

  expect(within(creditWidget).getByText('R$ 150,00')).toBeInTheDocument();
  expect(within(creditWidget).getByText(/15\.000 créditos/i)).toBeInTheDocument();
  expect(within(creditWidget).getByText(/~454 leads/i)).toBeInTheDocument();

  // Statistics
  expect(within(creditWidget).getByText('+R$ 250,00')).toBeInTheDocument(); // total comprado
  expect(within(creditWidget).getByText('-R$ 100,00')).toBeInTheDocument(); // total gasto
  expect(within(creditWidget).getByText('+R$ 10,00')).toBeInTheDocument();  // bônus
});
```

---

## Scenario 11: Browse Marketplace Leads

**Marketplace**: Navegação e filtros

### Steps

```gherkin
Given eu sou um usuário autenticado
And existem 150 leads disponíveis no marketplace
When eu acesso "/marketplace"
Then eu vejo:
  - Grid de leads com preview mascarado
  - Filtros: segmento, cidade, estado
  - Paginação (20 leads por página)
And cada lead exibe:
  | Campo          | Formato                    |
  | Nome empresa   | Completo                   |
  | Segmento       | Completo                   |
  | Cidade/Estado  | Completo                   |
  | Telefone       | "(11) 9876-****"           |
  | Email          | "***@***.com"              |
  | Custo          | "R$ 0,30 (30 créditos)"    |
  | Status         | Badge "Disponível"         |
  | Botão          | "Comprar Lead"             |
When eu seleciono filtro "Segmento: Alimentação"
Then apenas leads do segmento Alimentação são exibidos
And contador mostra "23 leads encontrados"
```

### Validation

```typescript
test('deve exibir marketplace com leads mascarados', async () => {
  // Arrange
  const user = userEvent.setup();

  server.use(
    rest.get('/api/v1/leads/marketplace', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [
          {
            id: 'lead-1',
            empresaNome: 'Padaria Central',
            segmento: 'Alimentação',
            cidade: 'São Paulo',
            estado: 'SP',
            telefone: '(11) 9876-****',
            email: '***@***.com',
            custoCreditosCentavos: 30,
            statusMarketplace: 'publico'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 150,
          totalPages: 8
        }
      }));
    })
  );

  // Act
  render(<MarketplacePage />, { user: testUser });

  // Assert
  const leadCard = await screen.findByTestId('lead-card-lead-1');

  expect(within(leadCard).getByText('Padaria Central')).toBeInTheDocument();
  expect(within(leadCard).getByText('Alimentação')).toBeInTheDocument();
  expect(within(leadCard).getByText('(11) 9876-****')).toBeInTheDocument();
  expect(within(leadCard).getByText('***@***.com')).toBeInTheDocument();
  expect(within(leadCard).getByText('R$ 0,30')).toBeInTheDocument();

  // Filters
  const segmentoFilter = screen.getByLabelText(/segmento/i);
  await user.selectOptions(segmentoFilter, 'Alimentação');

  await waitFor(() => {
    expect(screen.getByText(/23 leads encontrados/i)).toBeInTheDocument();
  });
});
```

---

## Scenario 12: Purchase Lead with Credits

**Marketplace**: Compra de lead

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa tem saldo de 15.000 créditos
And estou visualizando um lead no marketplace:
  | Campo          | Valor                      |
  | Nome           | "Padaria Central"          |
  | Telefone       | "(11) 9876-****"           |
  | Custo          | 30 créditos (R$ 0,30)      |
When eu clico em "Comprar Lead"
Then um modal de confirmação é exibido com:
  | Info                | Valor                     |
  | Lead                | "Padaria Central"         |
  | Custo               | "30 créditos (R$ 0,30)"   |
  | Saldo atual         | "15.000 créditos"         |
  | Saldo após compra   | "14.970 créditos"         |
And eu vejo preview mascarado no modal
When eu confirmo a compra
Then requisição POST é feita para "/api/v1/credits/purchase-lead"
And a API retorna status 200
And eu sou redirecionado para página do lead
And eu vejo dados completos SEM máscara:
  | Campo          | Valor                      |
  | Telefone       | "(11) 98765-4321"          |
  | Email          | "contato@padariacentral.com"|
And widget de saldo atualiza para "14.970 créditos"
And eu vejo toast: "Lead comprado com sucesso!"
```

### Validation

```typescript
test('deve permitir comprar lead com créditos', async () => {
  // Arrange
  const user = userEvent.setup();

  server.use(
    rest.get('/api/v1/credits/balance', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: { saldoCreditosCentavos: 15000 }
      }));
    }),
    rest.post('/api/v1/credits/purchase-lead', async (req, res, ctx) => {
      const body = await req.json();
      expect(body.empresaId).toBe(testCompany.id);
      expect(body.leadId).toBe('lead-1');

      return res(ctx.json({
        success: true,
        data: {
          leadAcessoId: 'access-1',
          custoCreditos: 30,
          saldoRestante: 14970,
          leadData: {
            id: 'lead-1',
            empresaNome: 'Padaria Central',
            telefone: '(11) 98765-4321',
            email: 'contato@padariacentral.com'
          }
        }
      }));
    })
  );

  // Act
  render(<MarketplacePage />, { user: testUser });

  const leadCard = await screen.findByTestId('lead-card-lead-1');
  const buyButton = within(leadCard).getByRole('button', { name: /comprar/i });

  await user.click(buyButton);

  // Assert - Confirmation modal
  await screen.findByRole('dialog');
  expect(screen.getByText('Padaria Central')).toBeInTheDocument();
  expect(screen.getByText(/30 créditos/i)).toBeInTheDocument();
  expect(screen.getByText(/saldo após.*14\.970/i)).toBeInTheDocument();

  const confirmButton = screen.getByRole('button', { name: /confirmar compra/i });
  await user.click(confirmButton);

  // Assert - Full lead data displayed
  await screen.findByText('(11) 98765-4321'); // telefone completo
  expect(screen.getByText('contato@padariacentral.com')).toBeInTheDocument();

  // Assert - Balance updated
  await screen.findByText(/14\.970 créditos/i);

  // Assert - Toast notification
  expect(screen.getByText(/lead comprado com sucesso/i)).toBeInTheDocument();
});
```

---

## Scenario 13: Insufficient Credits Error

**Marketplace**: Saldo insuficiente

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa tem saldo de 15 créditos
And estou visualizando um lead que custa 30 créditos
When eu tento comprar o lead
Then o botão "Comprar Lead" está desabilitado
And eu vejo mensagem:
  "Saldo insuficiente. Você precisa de mais 15 créditos."
And eu vejo link "Comprar Créditos"
When eu clico em "Comprar Créditos"
Then sou redirecionado para "/credits/packages"
```

### Validation

```typescript
test('deve bloquear compra quando saldo insuficiente', async () => {
  // Arrange
  const user = userEvent.setup();

  server.use(
    rest.get('/api/v1/credits/balance', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: { saldoCreditosCentavos: 15 }
      }));
    })
  );

  // Act
  render(<LeadMarketplaceCard
    lead={{
      id: 'lead-1',
      custoCreditosCentavos: 30
    }}
    userBalance={15}
  />);

  // Assert
  const buyButton = screen.getByRole('button', { name: /comprar/i });
  expect(buyButton).toBeDisabled();

  expect(screen.getByText(/saldo insuficiente/i)).toBeInTheDocument();
  expect(screen.getByText(/você precisa de mais 15 créditos/i)).toBeInTheDocument();

  const buyCreditLink = screen.getByRole('link', { name: /comprar créditos/i });
  expect(buyCreditLink).toHaveAttribute('href', '/credits/packages');
});
```

---

## Scenario 14: Prevent Duplicate Lead Purchase

**Marketplace**: Lead já comprado

### Steps

```gherkin
Given eu sou um usuário autenticado
And minha empresa JÁ comprou o lead "Padaria Central"
And estou navegando no marketplace
When eu vejo o lead "Padaria Central" na lista
Then o lead mostra badge "Já comprado"
And o botão está desabilitado
And mostra "Ver Detalhes" em vez de "Comprar"
When eu clico em "Ver Detalhes"
Then sou redirecionado para "/leads/purchased/lead-id"
And vejo dados completos do lead
```

### Validation

```typescript
test('deve mostrar lead já comprado com badge', async () => {
  // Arrange
  const purchasedLeadId = 'lead-1';

  server.use(
    rest.get('/api/v1/leads/marketplace', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [{
          id: purchasedLeadId,
          empresaNome: 'Padaria Central',
          alreadyPurchased: true // flag do backend
        }]
      }));
    })
  );

  // Act
  render(<MarketplacePage />, { user: testUser });

  // Assert
  const leadCard = await screen.findByTestId(`lead-card-${purchasedLeadId}`);

  expect(within(leadCard).getByText(/já comprado/i)).toBeInTheDocument();

  const actionButton = within(leadCard).getByRole('button');
  expect(actionButton).toHaveTextContent(/ver detalhes/i);
  expect(actionButton).not.toHaveTextContent(/comprar/i);
});
```

---

## Integration: Credits + Subscriptions

**Validação**: Sistemas funcionando em conjunto

### Scenario 15: User with Both Subscription and Credits

```gherkin
Given eu sou um usuário autenticado
And minha empresa tem:
  - Subscription "Plano Pro" ativa
  - Saldo de 5.000 créditos
When eu acesso o dashboard
Then eu vejo:
  - Widget de subscription mostrando "Plano Pro - Ativo"
  - Widget de créditos mostrando "R$ 50,00 disponível"
And posso:
  - Gerenciar subscription
  - Comprar mais créditos
  - Acessar marketplace de leads
```

### Validation

```typescript
test('deve exibir subscription e créditos simultaneamente', async () => {
  // Arrange
  server.use(
    rest.get('/api/subscriptions/current', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: {
          status: 'active',
          product: { name: 'Plano Pro' }
        }
      }));
    }),
    rest.get('/api/v1/credits/balance', (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: {
          saldoCreditosCentavos: 5000,
          saldoFormatado: 'R$ 50,00'
        }
      }));
    })
  );

  // Act
  render(<DashboardPage />, { user: testUser });

  // Assert - Both systems visible
  await screen.findByText('Plano Pro');
  expect(screen.getByText(/ativo/i)).toBeInTheDocument();

  expect(screen.getByText('R$ 50,00')).toBeInTheDocument();
  expect(screen.getByText(/5\.000 créditos/i)).toBeInTheDocument();

  // Assert - All actions available
  expect(screen.getByRole('link', { name: /gerenciar assinatura/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /comprar créditos/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /marketplace/i })).toBeInTheDocument();
});
```

---

## Performance Benchmarks (Extended)

```typescript
test('marketplace page deve carregar em menos de 2s', async () => {
  const startTime = performance.now();

  render(<MarketplacePage />);
  await screen.findByRole('heading', { name: /marketplace/i });

  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});

test('compra de lead deve completar em menos de 1s', async () => {
  const user = userEvent.setup();
  render(<MarketplacePage />);

  const buyButton = await screen.findByRole('button', { name: /comprar/i });

  const startTime = performance.now();
  await user.click(buyButton);

  const confirmButton = await screen.findByRole('button', { name: /confirmar/i });
  await user.click(confirmButton);

  await screen.findByText(/comprado com sucesso/i);
  const purchaseTime = performance.now() - startTime;

  expect(purchaseTime).toBeLessThan(1000);
});
```

---

## Next Steps

✅ **Quickstart scenarios complete** (Subscriptions + Credits + Marketplace)
→ Update claude.md with feature context
→ Update plan.md progress tracking
→ Ready for /tasks command
