# Modelo de Dados: Dossiê de Leads PH3A

**Feature**: 001-lead-dossie
**Data**: 2025-12-05
**Fase**: 1 - Design & Contracts

## Visão Geral

Este documento define as entidades de dados, suas estruturas, relacionamentos e regras de validação para a funcionalidade de Dossiê de Leads.

---

## Entidade 1: Lead

Representa um cliente potencial no sistema.

### Estrutura

```typescript
interface Lead {
  id: string;                    // UUID
  documentNumber: string;        // CPF ou CNPJ
  documentType: 'CPF' | 'CNPJ';
  name: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  tags: string[];
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  hasEnrichment: boolean;        // Possui algum dado enriquecido
  enrichmentExpiry: string | null; // Data expiração (90 dias)
}

enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  LOST = 'lost',
  WON = 'won'
}
```

### Regras de Validação

- `id`: UUID v4 válido
- `documentNumber`: CPF (11 dígitos) ou CNPJ (14 dígitos), validação por algoritmo
- `name`: Mínimo 3 caracteres, máximo 200
- `email`: Formato válido (RFC 5322) ou null
- `phone`: Formato brasileiro ou null
- `status`: Deve ser um dos valores do enum
- `hasEnrichment`: Calculado com base na existência de dados no dossiê
- `enrichmentExpiry`: Se hasEnrichment=true, deve estar presente

### Relacionamentos

- 1 Lead → 0..1 DossierData
- 1 Lead → 0..N EnrichmentTransaction

---

## Entidade 2: CreditBalance

Representa o saldo de créditos disponível para enriquecimento.

### Estrutura

```typescript
interface CreditBalance {
  userId: string;                // UUID do usuário
  companyId: string;             // UUID da empresa
  balance: number;               // Créditos disponíveis (inteiro)
  reserved: number;              // Créditos reservados (transações pendentes)
  available: number;             // balance - reserved
  currency: 'BRL';
  lastUpdated: string;           // ISO 8601
  transactions: CreditTransaction[];
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'consumption' | 'refund' | 'expiry';
  amount: number;                // Positivo para purchase/refund, negativo para consumption
  balanceAfter: number;
  description: string;
  createdAt: string;
  relatedEnrichmentId?: string;  // Se type='consumption'
}
```

### Regras de Validação

- `balance`: Número inteiro >= 0
- `reserved`: Número inteiro >= 0, <= balance
- `available`: Deve ser balance - reserved
- `amount`: Não pode ser 0

### Transições de Estado

```
[Compra Créditos] → balance += amount
[Compra Enriquecimento] → reserved += cost
[Enriquecimento Sucesso] → reserved -= cost, balance -= cost
[Enriquecimento Falha] → reserved -= cost (refund)
```

---

## Entidade 3: EnrichmentPackage

Representa um pacote de dados disponível para compra.

### Estrutura

```typescript
interface EnrichmentPackage {
  id: string;
  code: PackageCode;
  name: string;
  description: string;
  cost: number;                  // Custo em créditos
  dataSource: DataSource;
  features: string[];            // Lista de dados incluídos
  estimatedTime: number;         // Tempo estimado em segundos
  isActive: boolean;
}

enum PackageCode {
  FINANCIAL_HEALTH = 'financial_health',
  ENRICHED_PROFILE = 'enriched_profile',
  DIGITAL_TRACE = 'digital_trace',
  MARKET_AFFINITY = 'market_affinity',
  REGISTRY_VALIDATION = 'registry_validation',
  COMPLETE = 'complete'          // Bundle com desconto
}

enum DataSource {
  DATA_FRAUD = 'DataFraud',
  DATA_BUSCA = 'DataBusca',
  DATA_TAG = 'DataTag',
  DATA_AFFINITY = 'DataAffinity',
  MULTIPLE = 'Multiple'          // Para pacote completo
}
```

### Regras de Validação

- `cost`: Número inteiro > 0
- `code`: Deve ser único
- Para `COMPLETE`: cost < soma dos pacotes individuais (desconto aplicado)

---

## Entidade 4: EnrichmentTransaction

Representa uma compra de enriquecimento (concluída ou falha).

### Estrutura

```typescript
interface EnrichmentTransaction {
  id: string;                    // UUID
  leadId: string;                // FK para Lead
  packageCode: PackageCode;
  status: TransactionStatus;
  cost: number;                  // Créditos gastos
  userId: string;                // Quem comprou
  userName: string;              // Nome do usuário
  createdAt: string;             // Timestamp compra
  completedAt: string | null;    // Timestamp conclusão
  error: string | null;          // Mensagem de erro se falhou
  retryCount: number;            // Tentativas de retry
}

enum TransactionStatus {
  PENDING = 'pending',           // Aguardando resposta API
  SUCCESS = 'success',           // Dados recuperados
  FAILED = 'failed',             // Erro permanente
  REFUNDED = 'refunded'          // Créditos devolvidos
}
```

### Regras de Validação

- `status`: Transição de estado válida (ver abaixo)
- Se `status=SUCCESS`: `completedAt` deve estar presente
- Se `status=FAILED`: `error` deve estar presente
- `retryCount`: >= 0, máximo 3

### Transições de Estado

```
PENDING → SUCCESS  (API retorna dados)
PENDING → FAILED   (Erro permanente, após retries)
FAILED → REFUNDED  (Créditos devolvidos)
```

---

## Entidade 5: DossierData

Representa todos os dados enriquecidos de um lead.

### Estrutura

```typescript
interface DossierData {
  leadId: string;                // FK para Lead
  financialHealth: FinancialHealth | null;
  enrichedProfile: EnrichedProfile | null;
  digitalTrace: DigitalTrace | null;
  marketAffinity: MarketAffinity | null;
  registryValidation: RegistryValidation | null;
  expiresAt: string;             // Data expiração (90 dias da última compra)
  createdAt: string;
  updatedAt: string;
}
```

### Sub-Entidades

#### FinancialHealth (Fonte: DataFraud)

```typescript
interface FinancialHealth {
  creditScore: number | null;    // 0-1000
  creditScoreD30: number | null; // Score 30 dias atrás
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  purchaseCapacityMin: number | null; // Em centavos
  purchaseCapacityMax: number | null; // Em centavos
  flags: string[];               // ['no_restrictions', 'positive_history']
  source: 'DataFraud';
  updatedAt: string;
}
```

**Validações**:
- `creditScore`: 0 <= value <= 1000 ou null
- `riskLevel`: Derivado do creditScore (0-300: HIGH, 301-600: MEDIUM, 601-1000: LOW)
- `purchaseCapacityMin` <= `purchaseCapacityMax`

#### EnrichedProfile (Fonte: DataBusca)

```typescript
interface EnrichedProfile {
  ageRange: string | null;       // "35-40 anos"
  maritalStatus: string | null;  // "Casado(a)"
  probableRole: string | null;   // "Diretor / Gerente Sênior"
  additionalContacts: Contact[];
  source: 'DataBusca';
  updatedAt: string;
}

interface Contact {
  type: 'phone' | 'email';
  value: string;                 // Pode estar mascarado (LGPD)
  valueMasked: string;           // Versão sempre mascarada
  label: 'Comercial' | 'Corporativo' | 'Pessoal' | 'Outro';
  verified: boolean;
}
```

**Validações**:
- `additionalContacts`: Máximo 10 itens
- `value`: Se phone, formato brasileiro; se email, RFC 5322

#### DigitalTrace (Fonte: DataTag)

```typescript
interface DigitalTrace {
  temperature: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  visits30d: number;             // Visitas últimos 30 dias
  avgTimeSeconds: number;        // Tempo médio em segundos
  intentTags: string[];          // ['Compra Imediata', 'Alto Padrão']
  isOnlineNow: boolean;
  insight: string | null;        // "Visitou a página 'Financiamento' 3 vezes"
  source: 'DataTag';
  updatedAt: string;
}
```

**Validações**:
- `visits30d`: >= 0
- `avgTimeSeconds`: >= 0
- `temperature`: Derivado de visits30d e avgTimeSeconds

#### MarketAffinity (Fonte: DataAffinity)

```typescript
interface MarketAffinity {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';
  classification: string;        // "Perfil Premium"
  compatibilityPercentile: number; // 0-100
  similarProfiles: string[];     // ["Investidor Imobiliário"]
  closingLift: number;           // Multiplicador de conversão (ex: 3.0)
  insight: string | null;
  source: 'DataAffinity';
  updatedAt: string;
}
```

**Validações**:
- `compatibilityPercentile`: 0 <= value <= 100
- `closingLift`: >= 0
- `grade`: Derivado de compatibilityPercentile

#### RegistryValidation (Fonte: DataBusca)

```typescript
interface RegistryValidation {
  cpfStatus: 'REGULAR' | 'IRREGULAR' | 'NOT_FOUND' | 'SUSPENDED' | 'CANCELED';
  motherNameMatch: 'MATCH' | 'NO_MATCH' | 'NOT_PROVIDED';
  addressMatch: 'MATCH' | 'DIVERGENT' | 'NOT_PROVIDED';
  deathRecord: 'NOT_FOUND' | 'FOUND';
  deathYear: number | null;
  lastCheckedAt: string;
  source: 'DataBusca';
  updatedAt: string;
}
```

**Validações**:
- Se `deathRecord=FOUND`: `deathYear` deve estar presente
- `lastCheckedAt`: Não pode ser futuro

---

## Regras de Expiração de Dados

1. **Período de Validade**: 90 dias a partir da compra do enriquecimento
2. **Cálculo**: `expiresAt = max(updatedAt de cada pacote) + 90 dias`
3. **Indicação Visual**: Se `expiresAt < hoje`, mostrar badge "Dados Expirados"
4. **Re-compra**: Dados expirados podem ser renovados comprando o pacote novamente

---

## Diagrama de Relacionamentos

```
┌─────────┐
│  Lead   │──1:0..1──┤ DossierData │
└─────────┘          └─────────────┘
     │                      │
     │                      ├── FinancialHealth
     │                      ├── EnrichedProfile
     │                      ├── DigitalTrace
     │                      ├── MarketAffinity
     │                      └── RegistryValidation
     │
     │ 1:N
     ↓
┌──────────────────────┐
│ EnrichmentTransaction│
└──────────────────────┘
     │
     │ N:1
     ↓
┌────────────────┐
│ CreditBalance  │
└────────────────┘
```

---

## Schemas Zod (Validação Runtime)

Os schemas Zod completos estão definidos em:
- `src/features/lead-dossier/types/lead.ts`
- `src/features/lead-dossier/types/credit.ts`
- `src/features/lead-dossier/types/enrichment.ts`
- `src/features/lead-dossier/types/dossier.ts`

Exemplo:

```typescript
import { z } from 'zod';

export const LeadSchema = z.object({
  id: z.string().uuid(),
  documentNumber: z.string().regex(/^\d{11}$|^\d{14}$/),
  documentType: z.enum(['CPF', 'CNPJ']),
  name: z.string().min(3).max(200),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'lost', 'won']),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  hasEnrichment: z.boolean(),
  enrichmentExpiry: z.string().datetime().nullable(),
});

export type Lead = z.infer<typeof LeadSchema>;
```

---

## Próximos Passos

1. ✅ Data model definido
2. → Criar contratos de API (contracts/)
3. → Criar quickstart.md
4. → Gerar tasks.md (comando `/speckit.tasks`)

