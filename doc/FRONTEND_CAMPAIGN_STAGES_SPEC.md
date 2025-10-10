# 🎯 Especificação Frontend - Sistema de Estágios de Leads em Campanhas

**Data:** 8 de outubro de 2025  
**Feature:** Campaign Lead Stages  
**Branch Backend:** `008-campaign-lead-stages`  
**Status Backend:** ✅ 100% Implementado  
**Prioridade:** P1 (MVP)

---

## 📋 Resumo Executivo

O backend implementou um **sistema completo de gestão de estágios de leads em campanhas** (similar a pipelines de CRM como Pipedrive/HubSpot). Permite que empresas criem seus próprios funis de vendas customizados, movam leads entre estágios, rastreiem histórico completo e cobrem créditos por transições.

### 🎯 Principais Funcionalidades Implementadas:

1. **✅ US1 - Configurar Estágios Customizados** (MVP)
   - CRUD completo de estágios (nome, cor, ícone, categoria, ordem)
   - Reordenação via drag-and-drop
   - Validação de regras de negócio
   - Configuração de cobrança por estágio

2. **✅ US2 - Mover Leads Entre Estágios** (MVP)
   - Transição manual individual
   - Atualização em massa (bulk update)
   - Histórico completo com auditoria
   - Tracking de duração por estágio

3. **✅ US5 - Cobrança por Estágio**
   - Configuração de custo por estágio
   - Permite saldo negativo
   - Auditoria de cobranças
   - Cobrança não-bloqueante (transição sempre sucede)

4. **✅ US3 - Métricas de Funil**
   - Contagem de leads por estágio
   - Taxas de conversão
   - Duração média por estágio
   - Performance otimizada (< 3s para 1000 leads)

5. **✅ US4 - Histórico Individual**
   - Timeline completa de transições
   - Atribuição de usuário
   - Motivos registrados
   - Flags de automação

---

## 🏗️ Arquitetura do Sistema

### Modelo de Dados Principal

```typescript
// Estágio de Lead
interface CampaignLeadStage {
  id: string;                    // UUID
  empresaId: string;             // UUID da empresa
  nome: string;                  // Ex: "Novo Lead", "Qualificação"
  categoria: StageCategory;      // novo | contato | qualificacao | negociacao | ganho | perdido
  cor: string;                   // Hex color: #3B82F6
  icone?: string;                // Nome do ícone: "star", "check-circle"
  ordem: number;                 // 0-indexed para ordenação
  isInicial: boolean;            // Apenas 1 por empresa
  isFinal: boolean;              // Para estágios ganho/perdido
  cobraCreditos: boolean;        // Se cobra ao transitar
  custocentavos?: number;        // Custo em centavos (obrigatório se cobraCreditos=true)
  descricaoCobranca?: string;    // Descrição da cobrança
  isAtivo: boolean;              // Soft delete
  criadoPor?: string;            // UUID do criador
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}

// Histórico de Transições
interface CampaignContactStageHistory {
  id: string;
  campaignContactId: string;     // ID do lead
  fromStageId?: string;          // null na primeira transição
  toStageId: string;             // Novo estágio
  motivo?: string;               // Motivo da mudança
  automatico: boolean;           // Manual vs automático
  duracaoHoras?: number;         // Tempo no estágio anterior
  criadoPor?: string;            // UUID do usuário
  createdAt: string;
}

// Cobrança de Estágio
interface CampaignStageCharge {
  id: string;
  empresaId: string;
  campanhaId: string;
  campaignContactId: string;
  stageId: string;
  custocentavos: number;
  tipoCobranca: 'mudanca_estagio' | 'acesso_lead' | 'execucao_agente';
  creditoTransacaoId?: string;   // null se falhou
  motivo?: string;
  foiCobrado: boolean;           // true se sucesso, false se falhou
  erroCobranca?: string;         // Mensagem de erro
  createdAt: string;
}
```

### Categorias de Estágios (Enum)

```typescript
type StageCategory = 
  | 'novo'          // Leads novos/não contatados
  | 'contato'       // Primeiro contato feito
  | 'qualificacao'  // Em processo de qualificação
  | 'negociacao'    // Negociação ativa
  | 'ganho'         // Deal fechado (won)
  | 'perdido';      // Deal perdido (lost)
```

---

## 🚀 APIs Implementadas

### Base URL
- **Desenvolvimento:** `http://localhost:3000/api/v1`
- **Produção:** `https://api.leadsrapido.com/api/v1`

### Headers Obrigatórios
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 1️⃣ CRUD de Estágios (US1)

### 1.1 Criar Estágio

```http
POST /api/v1/campaign-lead-stages
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Qualificação Avançada",
  "categoria": "qualificacao",
  "cor": "#10B981",
  "icone": "star",
  "ordem": 2,
  "isInicial": false,
  "isFinal": false,
  "cobraCreditos": true,
  "custocentavos": 500,
  "descricaoCobranca": "Lead qualificado"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-estagio",
    "empresaId": "uuid-empresa",
    "nome": "Qualificação Avançada",
    "categoria": "qualificacao",
    "cor": "#10B981",
    "icone": "star",
    "ordem": 2,
    "isInicial": false,
    "isFinal": false,
    "cobraCreditos": true,
    "custocentavos": 500,
    "descricaoCobranca": "Lead qualificado",
    "isAtivo": true,
    "criadoPor": "uuid-usuario",
    "createdAt": "2025-10-08T14:30:00.000Z",
    "updatedAt": "2025-10-08T14:30:00.000Z"
  }
}
```

**Validações:**
- ✅ Máximo de 20 estágios por empresa
- ✅ Apenas 1 estágio com `isInicial=true`
- ✅ Nome único por empresa
- ✅ Cor no formato `#RRGGBB`
- ✅ `custocentavos` obrigatório se `cobraCreditos=true`

**Erros:**
- `400` - Validação falhou
- `409` - Nome duplicado ou múltiplos estágios iniciais

---

### 1.2 Listar Estágios

```http
GET /api/v1/campaign-lead-stages?includeInactive=false&categoria=qualificacao
Authorization: Bearer {{token}}
```

**Query Params:**
- `includeInactive` (boolean): Incluir estágios inativos (default: false)
- `categoria` (string): Filtrar por categoria

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "nome": "Novo Lead",
      "categoria": "novo",
      "cor": "#3B82F6",
      "icone": "inbox",
      "ordem": 0,
      "isInicial": true,
      "isFinal": false,
      "cobraCreditos": false,
      "custocentavos": null,
      "isAtivo": true,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "nome": "Qualificação",
      "categoria": "qualificacao",
      "cor": "#10B981",
      "icone": "star",
      "ordem": 1,
      "isInicial": false,
      "isFinal": false,
      "cobraCreditos": true,
      "custocentavos": 500,
      "isAtivo": true,
      "createdAt": "2025-10-02T11:00:00.000Z",
      "updatedAt": "2025-10-02T11:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

### 1.3 Obter Estágio por ID

```http
GET /api/v1/campaign-lead-stages/{stageId}
Authorization: Bearer {{token}}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-estagio",
    "nome": "Negociação",
    "categoria": "negociacao",
    "cor": "#F59E0B",
    "icone": "trending-up",
    "ordem": 3,
    "isInicial": false,
    "isFinal": false,
    "cobraCreditos": true,
    "custocentavos": 1000,
    "isAtivo": true,
    "createdAt": "2025-10-03T12:00:00.000Z",
    "updatedAt": "2025-10-03T12:00:00.000Z"
  }
}
```

**Erros:**
- `404` - Estágio não encontrado

---

### 1.4 Atualizar Estágio

```http
PUT /api/v1/campaign-lead-stages/{stageId}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nome": "Qualificação Premium",
  "cor": "#8B5CF6",
  "icone": "award",
  "custocentavos": 750
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-estagio",
    "nome": "Qualificação Premium",
    "cor": "#8B5CF6",
    "icone": "award",
    "custocentavos": 750,
    "updatedAt": "2025-10-08T15:00:00.000Z"
  }
}
```

**⚠️ Restrições:**
- ❌ **NÃO pode alterar** `categoria` após criação
- ❌ **NÃO pode alterar** `isInicial` após criação
- ✅ Pode alterar nome, cor, ícone, custo

**Erros:**
- `400` - Tentativa de alterar campos bloqueados
- `404` - Estágio não encontrado
- `409` - Nome duplicado

---

### 1.5 Deletar Estágio (Soft Delete)

```http
DELETE /api/v1/campaign-lead-stages/{stageId}
Authorization: Bearer {{token}}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Estágio desativado com sucesso"
}
```

**Validações:**
- ✅ Verifica se há leads ativos no estágio via `campaign_contacts.current_stage_id`
- ✅ Se houver leads, retorna `409 Conflict`
- ✅ Soft delete: `isAtivo = false`

**Erros:**
- `404` - Estágio não encontrado
- `409` - Estágio tem leads ativos

---

### 1.6 Reordenar Estágios

```http
POST /api/v1/campaign-lead-stages/reorder
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "stages": [
    { "id": "uuid-1", "ordem": 0 },
    { "id": "uuid-2", "ordem": 1 },
    { "id": "uuid-3", "ordem": 2 }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Estágios reordenados com sucesso"
}
```

**Uso:** Drag-and-drop no frontend atualiza a ordem de exibição no funil.

---

## 2️⃣ Transições de Leads (US2)

### 2.1 Transição Manual Individual

```http
PATCH /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "stageId": "uuid-novo-estagio",
  "motivo": "Lead respondeu email e demonstrou interesse",
  "automatico": false
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "contactId": "uuid-contact",
    "previousStageId": "uuid-estagio-antigo",
    "currentStageId": "uuid-novo-estagio",
    "stageChangedAt": "2025-10-08T16:00:00.000Z",
    "stageChangedBy": "uuid-usuario",
    "duracaoHoras": 48.5
  },
  "warnings": []
}
```

**Com Cobrança de Créditos (se configurado):**
```json
{
  "success": true,
  "data": { ... },
  "warnings": [
    {
      "type": "charge_failed",
      "message": "Cobrança de R$ 5,00 falhou: Saldo insuficiente. Saldo atual: -R$ 4,00"
    }
  ]
}
```

**⚠️ Comportamento:**
- ✅ **Transição SEMPRE sucede** (mesmo se cobrança falhar)
- ✅ Cria registro em `campaign_contact_stage_history`
- ✅ Atualiza `campaign_contacts.current_stage_id`
- ✅ Calcula `duracaoHoras` automaticamente
- ✅ Se estágio cobra créditos, tenta cobrar (não-bloqueante)
- ✅ Permite saldo negativo

**Erros:**
- `404` - Campanha ou contato não encontrado
- `400` - Estágio não pertence à empresa

---

### 2.2 Atualização em Massa (Bulk Update)

```http
POST /api/v1/campaigns/{campaignId}/contacts/bulk-stage-update
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "contactIds": [
    "uuid-contact-1",
    "uuid-contact-2",
    "uuid-contact-3"
  ],
  "stageId": "uuid-novo-estagio",
  "motivo": "Leads não responderam após 7 dias",
  "automatico": false
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "successCount": 48,
    "failedCount": 2,
    "totalRequested": 50,
    "errors": [
      {
        "contactId": "uuid-x",
        "error": "Contato não encontrado"
      },
      {
        "contactId": "uuid-y",
        "error": "Estágio não pertence à empresa"
      }
    ],
    "chargeWarnings": [
      {
        "contactId": "uuid-z",
        "warning": "Cobrança falhou: Saldo insuficiente"
      }
    ]
  }
}
```

**Performance:**
- ✅ Atualização paralela usando `Promise.allSettled`
- ✅ < 5 segundos para 50 leads
- ✅ Não bloqueia se alguns leads falharem

---

### 2.3 Histórico de Transições do Lead

```http
GET /api/v1/campaigns/{campaignId}/contacts/{contactId}/stage-history
Authorization: Bearer {{token}}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-history-1",
      "campaignContactId": "uuid-contact",
      "fromStageId": null,
      "toStageId": "uuid-stage-novo",
      "motivo": null,
      "automatico": true,
      "duracaoHoras": null,
      "criadoPor": null,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "fromStageName": null,
      "toStageName": "Novo Lead"
    },
    {
      "id": "uuid-history-2",
      "campaignContactId": "uuid-contact",
      "fromStageId": "uuid-stage-novo",
      "toStageId": "uuid-stage-qualificacao",
      "motivo": "Lead demonstrou interesse no produto X",
      "automatico": false,
      "duracaoHoras": 48.5,
      "criadoPor": "uuid-usuario",
      "createdAt": "2025-10-03T10:30:00.000Z",
      "fromStageName": "Novo Lead",
      "toStageName": "Qualificação",
      "userName": "João Silva"
    },
    {
      "id": "uuid-history-3",
      "campaignContactId": "uuid-contact",
      "fromStageId": "uuid-stage-qualificacao",
      "toStageId": "uuid-stage-negociacao",
      "motivo": "Proposta enviada",
      "automatico": false,
      "duracaoHoras": 72.0,
      "criadoPor": "uuid-usuario",
      "createdAt": "2025-10-06T10:30:00.000Z",
      "fromStageName": "Qualificação",
      "toStageName": "Negociação",
      "userName": "João Silva"
    }
  ],
  "total": 3
}
```

**Características:**
- ✅ Ordenado por `createdAt DESC` (mais recente primeiro)
- ✅ `fromStageId = null` na primeira transição
- ✅ `automatico = true` para transições automáticas (ex: lead criado)
- ✅ `duracaoHoras` calculado automaticamente
- ✅ Inclui nomes de estágios e usuários para facilitar UI

---

## 3️⃣ Métricas de Funil (US3)

### 3.1 Métricas do Funil da Campanha

```http
GET /api/v1/campaigns/{campaignId}/funnel
Authorization: Bearer {{token}}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campaignId": "uuid-campanha",
    "totalLeads": 100,
    "stages": [
      {
        "stageId": "uuid-stage-1",
        "stageName": "Novo Lead",
        "categoria": "novo",
        "cor": "#3B82F6",
        "ordem": 0,
        "leadCount": 30,
        "percentageOfTotal": 30.0,
        "conversionFromPrevious": null,
        "averageDurationHours": null
      },
      {
        "stageId": "uuid-stage-2",
        "stageName": "Contato Inicial",
        "categoria": "contato",
        "cor": "#8B5CF6",
        "ordem": 1,
        "leadCount": 20,
        "percentageOfTotal": 20.0,
        "conversionFromPrevious": 66.67,
        "averageDurationHours": 24.5
      },
      {
        "stageId": "uuid-stage-3",
        "stageName": "Qualificação",
        "categoria": "qualificacao",
        "cor": "#10B981",
        "ordem": 2,
        "leadCount": 15,
        "percentageOfTotal": 15.0,
        "conversionFromPrevious": 75.0,
        "averageDurationHours": 48.0
      },
      {
        "stageId": "uuid-stage-4",
        "stageName": "Negociação",
        "categoria": "negociacao",
        "cor": "#F59E0B",
        "ordem": 3,
        "leadCount": 10,
        "percentageOfTotal": 10.0,
        "conversionFromPrevious": 66.67,
        "averageDurationHours": 120.0
      },
      {
        "stageId": "uuid-stage-5",
        "stageName": "Ganho",
        "categoria": "ganho",
        "cor": "#10B981",
        "ordem": 4,
        "leadCount": 5,
        "percentageOfTotal": 5.0,
        "conversionFromPrevious": 50.0,
        "averageDurationHours": 168.0
      },
      {
        "stageId": "uuid-stage-6",
        "stageName": "Perdido",
        "categoria": "perdido",
        "cor": "#EF4444",
        "ordem": 5,
        "leadCount": 20,
        "percentageOfTotal": 20.0,
        "conversionFromPrevious": null,
        "averageDurationHours": null
      }
    ],
    "generatedAt": "2025-10-08T17:00:00.000Z"
  }
}
```

**Métricas Calculadas:**
- `leadCount`: Leads atualmente no estágio
- `percentageOfTotal`: % do total de leads
- `conversionFromPrevious`: Taxa de conversão do estágio anterior (%)
- `averageDurationHours`: Tempo médio que leads passam neste estágio

**Performance:**
- ✅ < 3 segundos para campanhas com 1000 leads
- ✅ Usa função PostgreSQL otimizada com CTEs

---

## 4️⃣ Configuração e Auditoria de Cobranças (US5)

### 4.1 Configurar Modelo de Cobrança da Empresa

```http
PUT /api/v1/empresa/configuracoes/cobranca
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "modeloCobrancaCampanha": "mudanca_estagio",
  "debitarMudancaEstagio": true
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "empresaId": "uuid-empresa",
    "modeloCobrancaCampanha": "mudanca_estagio",
    "debitarMudancaEstagio": true,
    "updatedAt": "2025-10-08T17:30:00.000Z"
  }
}
```

**Configurações:**
- `modeloCobrancaCampanha`:
  - `mudanca_estagio` - Cobra ao mudar estágio
  - `acesso_lead` - Cobra ao acessar lead (futuro)
  - `execucao_agente` - Cobra ao executar agente IA (futuro)
- `debitarMudancaEstagio`:
  - `true` - Cobra créditos ao transitar (se estágio.cobraCreditos=true)
  - `false` - Não cobra (útil para testes)

---

### 4.2 Listar Cobranças de uma Campanha

```http
GET /api/v1/campaigns/{campaignId}/charges?startDate=2025-10-01&endDate=2025-10-08&foiCobrado=true
Authorization: Bearer {{token}}
```

**Query Params:**
- `startDate` (ISO date): Filtro data início
- `endDate` (ISO date): Filtro data fim
- `stageId` (UUID): Filtrar por estágio específico
- `foiCobrado` (boolean): Filtrar por status (true=sucesso, false=falha)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-charge-1",
      "empresaId": "uuid-empresa",
      "campanhaId": "uuid-campanha",
      "campaignContactId": "uuid-contact",
      "stageId": "uuid-stage",
      "stageName": "Qualificação",
      "custocentavos": 500,
      "tipoCobranca": "mudanca_estagio",
      "creditoTransacaoId": "uuid-transacao",
      "motivo": "Lead qualificado",
      "foiCobrado": true,
      "erroCobranca": null,
      "createdAt": "2025-10-05T14:00:00.000Z"
    },
    {
      "id": "uuid-charge-2",
      "empresaId": "uuid-empresa",
      "campanhaId": "uuid-campanha",
      "campaignContactId": "uuid-contact-2",
      "stageId": "uuid-stage",
      "stageName": "Qualificação",
      "custocentavos": 500,
      "tipoCobranca": "mudanca_estagio",
      "creditoTransacaoId": null,
      "motivo": "Lead qualificado",
      "foiCobrado": false,
      "erroCobranca": "Saldo insuficiente",
      "createdAt": "2025-10-06T10:00:00.000Z"
    }
  ],
  "total": 2
}
```

---

### 4.3 Resumo de Cobranças da Campanha

```http
GET /api/v1/campaigns/{campaignId}/charges/summary
Authorization: Bearer {{token}}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "campanhaId": "uuid-campanha",
    "totalCharges": 150,
    "successfulCharges": 145,
    "failedCharges": 5,
    "totalAmountCentavos": 75000,
    "totalAmountReais": 750.00,
    "chargesByStage": [
      {
        "stageId": "uuid-stage-1",
        "stageName": "Qualificação",
        "chargeCount": 80,
        "totalCentavos": 40000,
        "totalReais": 400.00
      },
      {
        "stageId": "uuid-stage-2",
        "stageName": "Negociação",
        "chargeCount": 70,
        "totalCentavos": 35000,
        "totalReais": 350.00
      }
    ],
    "generatedAt": "2025-10-08T18:00:00.000Z"
  }
}
```

---

## 🎨 Sugestões de UI/UX

### 1. Página de Configuração de Estágios

**Componente Principal: Stage Board**

```tsx
interface StageCardProps {
  stage: CampaignLeadStage;
  onEdit: (stage: CampaignLeadStage) => void;
  onDelete: (stageId: string) => void;
  onDragStart: (stageId: string) => void;
  onDragEnd: () => void;
}

function StageCard({ stage, onEdit, onDelete }: StageCardProps) {
  return (
    <div 
      draggable 
      className="stage-card"
      style={{ borderLeft: `4px solid ${stage.cor}` }}
    >
      <div className="stage-header">
        <Icon name={stage.icone} color={stage.cor} />
        <h3>{stage.nome}</h3>
        {stage.isInicial && <Badge>Inicial</Badge>}
        {stage.isFinal && <Badge>Final</Badge>}
      </div>
      
      <div className="stage-body">
        <p className="category">{formatCategory(stage.categoria)}</p>
        <p className="order">Ordem: {stage.ordem}</p>
        
        {stage.cobraCreditos && (
          <div className="charging-info">
            <Icon name="dollar-sign" />
            <span>R$ {(stage.custocentavos! / 100).toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="stage-actions">
        <Button onClick={() => onEdit(stage)}>Editar</Button>
        <Button variant="danger" onClick={() => onDelete(stage.id)}>
          Excluir
        </Button>
      </div>
    </div>
  );
}
```

**Modal de Criação/Edição:**

```tsx
function CreateStageModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'novo',
    cor: '#3B82F6',
    icone: 'inbox',
    cobraCreditos: false,
    custocentavos: 0
  });

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      custocentavos: formData.cobraCreditos ? formData.custocentavos : null
    };
    
    await fetch('/api/v1/campaign-lead-stages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Novo Estágio</h2>
      
      <Input
        label="Nome do Estágio"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        placeholder="Ex: Qualificação Avançada"
      />
      
      <Select
        label="Categoria"
        value={formData.categoria}
        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
      >
        <option value="novo">Novo Lead</option>
        <option value="contato">Contato Inicial</option>
        <option value="qualificacao">Qualificação</option>
        <option value="negociacao">Negociação</option>
        <option value="ganho">Ganho</option>
        <option value="perdido">Perdido</option>
      </Select>
      
      <ColorPicker
        label="Cor do Estágio"
        value={formData.cor}
        onChange={(color) => setFormData({ ...formData, cor: color })}
      />
      
      <IconPicker
        label="Ícone"
        value={formData.icone}
        onChange={(icon) => setFormData({ ...formData, icone: icon })}
      />
      
      <Checkbox
        label="Cobrar créditos neste estágio"
        checked={formData.cobraCreditos}
        onChange={(e) => setFormData({ ...formData, cobraCreditos: e.target.checked })}
      />
      
      {formData.cobraCreditos && (
        <CurrencyInput
          label="Custo por transição"
          value={formData.custocentavos / 100}
          onChange={(value) => setFormData({ ...formData, custocentavos: value * 100 })}
          prefix="R$ "
        />
      )}
      
      <Button onClick={handleSubmit}>Criar Estágio</Button>
    </Modal>
  );
}
```

---

### 2. Visualização de Funil (Kanban Board)

```tsx
function CampaignFunnelBoard({ campaignId }: { campaignId: string }) {
  const [stages, setStages] = useState<CampaignLeadStage[]>([]);
  const [leads, setLeads] = useState<CampaignContact[]>([]);
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);

  useEffect(() => {
    // Carregar estágios
    fetchStages();
    // Carregar leads da campanha
    fetchLeads();
    // Carregar métricas
    fetchMetrics();
  }, [campaignId]);

  const handleDragDrop = async (leadId: string, newStageId: string, reason: string) => {
    try {
      const response = await fetch(
        `/api/v1/campaigns/${campaignId}/contacts/${leadId}/stage`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            stageId: newStageId,
            motivo: reason,
            automatico: false
          })
        }
      );

      const result = await response.json();
      
      if (result.warnings?.length > 0) {
        toast.warning(`Lead movido, mas: ${result.warnings[0].message}`);
      } else {
        toast.success('Lead movido com sucesso!');
      }
      
      // Recarregar dados
      fetchLeads();
      fetchMetrics();
      
    } catch (error) {
      toast.error('Erro ao mover lead');
    }
  };

  return (
    <div className="funnel-board">
      <FunnelMetrics metrics={metrics} />
      
      <div className="board-columns">
        {stages.map(stage => (
          <StageColumn
            key={stage.id}
            stage={stage}
            leads={leads.filter(l => l.currentStageId === stage.id)}
            onDropLead={handleDragDrop}
          />
        ))}
      </div>
    </div>
  );
}

function StageColumn({ stage, leads, onDropLead }: StageColumnProps) {
  const handleDrop = (e: DragEvent) => {
    const leadId = e.dataTransfer.getData('leadId');
    const reason = prompt('Motivo da mudança:');
    if (reason) {
      onDropLead(leadId, stage.id, reason);
    }
  };

  return (
    <div 
      className="stage-column"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{ borderTop: `3px solid ${stage.cor}` }}
    >
      <div className="column-header">
        <Icon name={stage.icone} color={stage.cor} />
        <h3>{stage.nome}</h3>
        <Badge>{leads.length}</Badge>
      </div>
      
      <div className="column-body">
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### 3. Histórico do Lead (Timeline)

```tsx
function LeadStageHistory({ campaignId, contactId }: HistoryProps) {
  const [history, setHistory] = useState<CampaignContactStageHistory[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [campaignId, contactId]);

  const fetchHistory = async () => {
    const response = await fetch(
      `/api/v1/campaigns/${campaignId}/contacts/${contactId}/stage-history`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const result = await response.json();
    setHistory(result.data);
  };

  return (
    <div className="stage-history">
      <h2>Histórico de Movimentação</h2>
      
      <Timeline>
        {history.map((item, index) => (
          <TimelineItem key={item.id}>
            <TimelineMarker 
              color={index === 0 ? 'green' : 'blue'}
              icon={item.automatico ? 'robot' : 'user'}
            />
            
            <TimelineContent>
              <div className="timeline-header">
                <strong>
                  {item.fromStageName ? (
                    `${item.fromStageName} → ${item.toStageName}`
                  ) : (
                    `Lead criado em ${item.toStageName}`
                  )}
                </strong>
                <span className="timestamp">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              
              {item.motivo && (
                <p className="reason">{item.motivo}</p>
              )}
              
              <div className="timeline-meta">
                {item.duracaoHoras && (
                  <span>
                    <Icon name="clock" />
                    Permaneceu {formatDuration(item.duracaoHoras)} no estágio anterior
                  </span>
                )}
                
                {item.userName && (
                  <span>
                    <Icon name="user" />
                    {item.userName}
                  </span>
                )}
                
                {item.automatico && (
                  <Badge variant="info">Automático</Badge>
                )}
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
```

---

### 4. Atualização em Massa

```tsx
function BulkStageUpdate({ campaignId, selectedLeads }: BulkUpdateProps) {
  const [targetStage, setTargetStage] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkUpdate = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/v1/campaigns/${campaignId}/contacts/bulk-stage-update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactIds: selectedLeads.map(l => l.id),
            stageId: targetStage,
            motivo: reason,
            automatico: false
          })
        }
      );

      const result = await response.json();
      
      toast.success(
        `${result.data.successCount} leads atualizados com sucesso!`
      );
      
      if (result.data.failedCount > 0) {
        toast.warning(
          `${result.data.failedCount} leads falharam. Verifique os detalhes.`
        );
      }
      
      if (result.data.chargeWarnings?.length > 0) {
        toast.info(
          `${result.data.chargeWarnings.length} cobranças falharam (leads movidos mesmo assim)`
        );
      }
      
      // Recarregar lista
      onSuccess();
      
    } catch (error) {
      toast.error('Erro ao atualizar leads em massa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <h2>Atualizar {selectedLeads.length} Leads</h2>
      
      <Select
        label="Mover para estágio"
        value={targetStage}
        onChange={(e) => setTargetStage(e.target.value)}
      >
        <option value="">Selecione um estágio</option>
        {stages.map(stage => (
          <option key={stage.id} value={stage.id}>
            {stage.nome}
          </option>
        ))}
      </Select>
      
      <Textarea
        label="Motivo da mudança"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Ex: Leads não responderam após follow-up"
      />
      
      <Button
        onClick={handleBulkUpdate}
        disabled={!targetStage || isLoading}
        loading={isLoading}
      >
        Atualizar Leads
      </Button>
    </Modal>
  );
}
```

---

### 5. Dashboard de Métricas

```tsx
function CampaignDashboard({ campaignId }: DashboardProps) {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [campaignId]);

  const fetchMetrics = async () => {
    const response = await fetch(
      `/api/v1/campaigns/${campaignId}/funnel`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const result = await response.json();
    setMetrics(result.data);
  };

  if (!metrics) return <Loading />;

  return (
    <div className="campaign-dashboard">
      <h1>Funil de Vendas - {metrics.totalLeads} Leads</h1>
      
      {/* Funil Visual */}
      <FunnelChart data={metrics.stages} />
      
      {/* Cards de Estágio */}
      <div className="stage-cards-grid">
        {metrics.stages.map(stage => (
          <StageMetricCard key={stage.stageId} stage={stage} />
        ))}
      </div>
      
      {/* Tabela Detalhada */}
      <StageMetricsTable stages={metrics.stages} />
    </div>
  );
}

function StageMetricCard({ stage }: { stage: StageMetrics }) {
  return (
    <Card style={{ borderLeft: `4px solid ${stage.cor}` }}>
      <CardHeader>
        <h3>{stage.stageName}</h3>
        <Icon name={stage.icone} color={stage.cor} />
      </CardHeader>
      
      <CardBody>
        <div className="metric-large">
          <span className="value">{stage.leadCount}</span>
          <span className="label">Leads</span>
        </div>
        
        <div className="metrics-row">
          <div className="metric">
            <span className="value">{stage.percentageOfTotal.toFixed(1)}%</span>
            <span className="label">do total</span>
          </div>
          
          {stage.conversionFromPrevious && (
            <div className="metric">
              <span className="value success">
                {stage.conversionFromPrevious.toFixed(1)}%
              </span>
              <span className="label">conversão</span>
            </div>
          )}
        </div>
        
        {stage.averageDurationHours && (
          <div className="duration-metric">
            <Icon name="clock" />
            <span>
              Tempo médio: {formatDuration(stage.averageDurationHours)}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
```

---

## ⚠️ Regras de Negócio Importantes

### Validações Críticas:

1. **Estágios:**
   - ✅ Máximo 20 estágios por empresa
   - ✅ Apenas 1 estágio com `isInicial=true`
   - ✅ Nome único por empresa
   - ✅ Se `cobraCreditos=true`, `custocentavos` é obrigatório
   - ❌ Não pode deletar estágio com leads ativos

2. **Transições:**
   - ✅ Transição SEMPRE sucede (mesmo se cobrança falhar)
   - ✅ Permite transição "para trás" (ex: Negociação → Qualificação)
   - ✅ Calcula `duracaoHoras` automaticamente
   - ✅ Registra usuário que fez a transição

3. **Cobranças:**
   - ✅ Permite saldo negativo (constraint removido)
   - ✅ Cobrança é não-bloqueante (falha não impede transição)
   - ✅ Auditoria completa em `campaign_stage_charges`
   - ✅ Se `empresa.debitarMudancaEstagio=false`, não cobra

4. **Segurança:**
   - ✅ Row Level Security (RLS) em todas as tabelas
   - ✅ Multi-tenancy: empresa A não vê dados da empresa B
   - ✅ Todas operações validam `empresaId` do JWT

---

## 🧪 Casos de Teste Sugeridos

### Teste 1: Criação e Configuração de Estágios
1. Criar 5 estágios diferentes
2. Reordenar via drag-and-drop
3. Editar cor e nome de um estágio
4. Tentar criar estágio com nome duplicado → erro 409
5. Tentar criar 2 estágios iniciais → erro 409
6. Deletar estágio vazio → sucesso
7. Tentar deletar estágio com leads → erro 409

### Teste 2: Transições de Leads
1. Criar 20 leads em "Novo Lead"
2. Mover 1 lead manualmente para "Qualificação"
3. Verificar histórico do lead
4. Selecionar 10 leads e mover em massa para "Contatado"
5. Verificar que bulk update retornou `successCount: 10`
6. Mover lead "para trás" (Qualificação → Novo) → deve funcionar

### Teste 3: Cobrança de Créditos
1. Configurar estágio "Qualificado" com `custocentavos: 500`
2. Empresa com saldo de R$ 10,00
3. Mover lead para "Qualificado"
4. Verificar saldo = R$ 5,00
5. Mover mais 20 leads → saldo fica negativo
6. Verificar que transições continuam funcionando
7. Listar cobranças → verificar `foiCobrado: true`

### Teste 4: Métricas de Funil
1. Criar campanha com 100 leads distribuídos
2. Requisitar métricas do funil
3. Verificar contagem de leads por estágio
4. Verificar taxas de conversão calculadas
5. Verificar duração média por estágio
6. Performance < 3s

---

## 📚 Documentação Adicional

### Arquivos de Referência no Backend:
- 📄 Spec completa: `/specs/008-campaign-lead-stages/spec.md`
- 📄 Modelo de dados: `/specs/008-campaign-lead-stages/data-model.md`
- 📄 Contratos API: `/specs/008-campaign-lead-stages/contracts/campaign-lead-stages.yaml`
- 📄 Quickstart: `/specs/008-campaign-lead-stages/quickstart.md`
- 📄 Tasks: `/specs/008-campaign-lead-stages/tasks.md`

### Testes de Contrato (já implementados):
- 🧪 `/contract-first/campaign-lead-stages/` (arquivos .http)

---

## 🚀 Próximos Passos para o Frontend

### Prioridade P1 (MVP):

1. **✅ Página de Configuração de Estágios**
   - CRUD completo
   - Drag-and-drop para reordenação
   - Modal de criação/edição

2. **✅ Board Kanban de Leads**
   - Visualização por estágios
   - Drag-and-drop entre estágios
   - Contador de leads por estágio

3. **✅ Histórico de Transições**
   - Timeline de movimentações
   - Motivos e duração
   - Atribuição de usuário

### Prioridade P2:

4. **✅ Dashboard de Métricas**
   - Funil visual
   - Cards de métricas
   - Taxas de conversão

5. **✅ Atualização em Massa**
   - Seleção múltipla de leads
   - Modal de bulk update
   - Feedback de sucesso/falha

6. **✅ Configurações de Cobrança**
   - Toggle de modelo de cobrança
   - Visualização de custos
   - Auditoria de cobranças

---
