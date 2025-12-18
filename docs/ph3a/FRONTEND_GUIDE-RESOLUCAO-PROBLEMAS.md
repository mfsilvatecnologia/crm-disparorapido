# Frontend Guide - Sistema de Resolução de Problemas Multi-Metodologia

**Feature**: `020-resolucao-de-problemas` | **Version**: 1.0.0 | **Date**: 2025-12-18

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de API](#arquitetura-de-api)
3. [Modelos de Dados](#modelos-de-dados)
4. [Fluxos de UI](#fluxos-de-ui)
5. [Componentes Sugeridos](#componentes-sugeridos)
6. [Integração com API](#integração-com-api)
7. [Gerenciamento de Estado](#gerenciamento-de-estado)
8. [Validações e Erros](#validações-e-erros)
9. [Upload de Arquivos](#upload-de-arquivos)
10. [Relatórios e PDFs](#relatórios-e-pdfs)
11. [Considerações de UX](#considerações-de-ux)

---

## Visão Geral

### O Que Foi Implementado no Backend

O backend implementa um **sistema completo de resolução de problemas** que suporta três metodologias:

- **MASP** (Método de Análise e Solução de Problemas) - 8 etapas sequenciais
- **8D** (8 Disciplinas) - 9 disciplinas sequenciais com gates de aprovação
- **A3** (Lean Thinking) - 7 seções editáveis em paralelo

### Funcionalidades Principais

#### 1. Gestão de Projetos
- CRUD completo de projetos
- Suporte a múltiplas metodologias
- Workflow sequencial (MASP/8D) ou paralelo (A3)
- Controle de status e progresso

#### 2. Ferramentas de Qualidade
- **Diagrama Ishikawa** (Espinha de Peixe) - Análise de causas 6M
- **5 Porquês** - Identificação de causa raiz
- **5W2H** - Plano de ação estruturado
- **Gráfico de Pareto** - Análise 80/20
- **Brainstorming e Hipóteses**

#### 3. Evidências e Rastreabilidade
- Upload de arquivos (imagens, documentos, vídeos)
- Vínculo polimórfico a qualquer entidade
- Geração de thumbnails automática
- Extração de metadados

#### 4. Gestão de Ações
- Planos de ação vinculados a causas raiz
- Tipos específicos: Contenção, Corretiva, Preventiva (8D)
- Acompanhamento de eficácia

#### 5. Indicadores KPI
- Medições antes/durante/depois
- Comparação de eficácia
- Validação obrigatória na etapa de Verificação

#### 6. Conversão Entre Metodologias
- MASP ↔ 8D ↔ A3
- Preservação de artefatos compartilhados
- Wizard de mapeamento de etapas

#### 7. Relatórios PDF
- Relatórios específicos por metodologia
- Inclusão de todas as ferramentas e evidências
- Certificados de conclusão

---

## Arquitetura de API

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.leadsrapido.com/api/v1
```

### Autenticação

Todas as requisições requerem JWT Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

O JWT deve conter:
```json
{
  "user_id": "uuid",
  "empresa_id": "uuid",
  "email": "user@example.com",
  "role": "gestor|membro|aprovador"
}
```

### Estrutura de Endpoints

#### Projetos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos` | Criar projeto |
| GET | `/resolucao-problemas/projetos` | Listar projetos |
| GET | `/resolucao-problemas/projetos/:id` | Detalhes do projeto |
| PUT | `/resolucao-problemas/projetos/:id` | Atualizar projeto |
| DELETE | `/resolucao-problemas/projetos/:id` | Arquivar projeto |
| GET | `/resolucao-problemas/projetos/:id/progresso` | Progresso do projeto |

#### Workflow Etapas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/resolucao-problemas/projetos/:projeto_id/etapas` | Listar etapas |
| GET | `/resolucao-problemas/projetos/:projeto_id/etapas/:id` | Detalhes da etapa |
| PUT | `/resolucao-problemas/projetos/:projeto_id/etapas/:id` | Atualizar etapa |
| POST | `/resolucao-problemas/projetos/:projeto_id/etapas/:id/concluir` | Concluir etapa |
| POST | `/resolucao-problemas/projetos/:projeto_id/etapas/:id/aprovar` | Aprovar gate (8D) |

#### Ferramentas - Ishikawa
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos/:projeto_id/ishikawa` | Criar diagrama |
| GET | `/resolucao-problemas/projetos/:projeto_id/ishikawa/:id` | Detalhes |
| POST | `/resolucao-problemas/ishikawa/:ishikawa_id/causas` | Adicionar causa |
| PUT | `/resolucao-problemas/ishikawa/causas/:causa_id` | Atualizar causa |
| DELETE | `/resolucao-problemas/ishikawa/causas/:causa_id` | Remover causa |

#### Ferramentas - 5 Porquês

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos/:projeto_id/cinco-porques` | Criar cadeia |
| GET | `/resolucao-problemas/cinco-porques/:cadeia_id` | Detalhes |
| POST | `/resolucao-problemas/cinco-porques/:cadeia_id/passos` | Adicionar passo |
| PUT | `/resolucao-problemas/cinco-porques/passos/:passo_id` | Atualizar passo |

#### Ferramentas - 5W2H

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos/:projeto_id/5w2h` | Criar 5W2H |
| GET | `/resolucao-problemas/5w2h/:id` | Detalhes |
| PUT | `/resolucao-problemas/5w2h/:id` | Atualizar |
| POST | `/resolucao-problemas/5w2h/:id/itens` | Adicionar item |

#### Ações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos/:projeto_id/acoes` | Criar ação |
| GET | `/resolucao-problemas/projetos/:projeto_id/acoes` | Listar ações |
| PUT | `/resolucao-problemas/acoes/:id` | Atualizar ação |
| POST | `/resolucao-problemas/acoes/:id/vincular-causas` | Vincular causas |
| PUT | `/resolucao-problemas/acoes/:id/status` | Atualizar status |

#### Evidências

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/evidencias/upload` | Upload arquivo |
| POST | `/resolucao-problemas/evidencias/vincular` | Vincular evidência |
| GET | `/resolucao-problemas/evidencias` | Listar evidências |
| DELETE | `/resolucao-problemas/evidencias/:id` | Remover evidência |

#### Conversões

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/conversoes/masp-para-8d` | Converter MASP → 8D |
| POST | `/resolucao-problemas/conversoes/8d-para-masp` | Converter 8D → MASP |
| POST | `/resolucao-problemas/conversoes/para-a3` | Converter para A3 |
| GET | `/resolucao-problemas/conversoes/:id/preview` | Preview conversão |

#### Relatórios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/resolucao-problemas/projetos/:id/relatorio` | Gerar PDF |
| GET | `/resolucao-problemas/projetos/:id/relatorio/status` | Status geração |
| GET | `/resolucao-problemas/projetos/:id/certificado` | Gerar certificado |

### Formato de Resposta Padrão

#### Sucesso
```json
{
  "success": true,
  "data": { /* objeto ou array */ },
  "meta": {
    "timestamp": "2025-12-18T10:30:00Z",
    "version": "1.0.0"
  }
}
```

#### Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "metodologia",
        "message": "metodologia is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-18T10:30:00Z",
    "trace_id": "8a3f9c2e"
  }
}
```

---

## Modelos de Dados

### Entidades Principais

#### Projeto

```typescript
interface Projeto {
  id: string;
  empresa_id: string;
  cliente_id: string;
  metodologia: 'masp' | '8d' | 'a3';
  titulo: string;
  resumo?: string;
  problema_descricao: string;
  impacto?: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado' | 'arquivado';
  versao?: string;
  responsavel_id?: string;
  data_abertura: string; // ISO date
  data_encerramento?: string; // ISO date
  criado_em: string; // ISO datetime
  atualizado_em: string; // ISO datetime
}

// Response com relacionamentos
interface ProjetoDetalhado extends Projeto {
  cliente: {
    id: string;
    nome: string;
    cnpj?: string;
  };
  responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
  participantes: Participante[];
  workflow_etapas: WorkflowEtapa[];
}

interface Participante {
  id: string;
  nome: string;
  email?: string;
  papel: 'lider' | 'membro' | 'especialista' | 'aprovador' | 'champion';
}
```

#### WorkflowEtapa (Polimórfica)

```typescript
interface WorkflowEtapa {
  id: string;
  empresa_id: string;
  projeto_id: string;

  // Apenas um destes será preenchido
  etapa_masp?: EtapaMasp;
  disciplina_8d?: Disciplina8D;
  secao_a3?: SecaoA3;

  status: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado' | 'arquivado';
  versao?: string;
  data_inicio?: string;
  data_fim?: string;
  aprovado_por_id?: string;
  data_aprovacao?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

type EtapaMasp =
  | '1-identificacao'
  | '2-observacao'
  | '3-analise'
  | '4-plano-acao'
  | '5-acao'
  | '6-verificacao'
  | '7-padronizacao'
  | '8-conclusao';

type Disciplina8D =
  | 'd0-planejamento'
  | 'd1-equipe'
  | 'd2-descricao'
  | 'd3-contencao'
  | 'd4-causa-raiz'
  | 'd5-acao-corretiva'
  | 'd6-eficacia'
  | 'd7-acao-preventiva'
  | 'd8-encerramento';

type SecaoA3 =
  | 's1-contexto'
  | 's2-situacao-atual'
  | 's3-objetivos-metas'
  | 's4-analise-causa-raiz'
  | 's5-contramedidas'
  | 's6-plano-acao'
  | 's7-acompanhamento';
```

#### Ishikawa

```typescript
interface Ishikawa {
  id: string;
  empresa_id: string;
  projeto_id: string;
  etapa_id: string;
  objetivo: string;
  observacoes?: string;
  criado_em: string;
  causas: IshikawaCausa[];
}

interface IshikawaCausa {
  id: string;
  ishikawa_id: string;
  categoria: Categoria6M;
  descricao: string;
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica';
  confirmada: boolean;
  ordem: number;
}

type Categoria6M =
  | 'metodo'
  | 'maquinas'
  | 'materia_prima'
  | 'mao_de_obra'
  | 'medicao'
  | 'meio_ambiente';
```

#### CincoPorques

```typescript
interface CincoPorquesCadeia {
  id: string;
  empresa_id: string;
  projeto_id: string;
  etapa_id: string;
  efeito: string;
  confirmado: boolean;
  criado_em: string;
  passos: CincoPorquesPasso[];
}

interface CincoPorquesPasso {
  id: string;
  cadeia_id: string;
  ordem: number; // 1-5
  pergunta: string;
  resposta: string;
  validado: boolean;
}
```

#### Ferramenta5W2H

```typescript
interface Ferramenta5W2H {
  id: string;
  empresa_id: string;
  projeto_id: string;
  etapa_id: string;
  contexto: string;
  tipo: Tipo5W2H;
  criado_em: string;
  itens: Ferramenta5W2HItem[];
}

type Tipo5W2H =
  | 'problema'
  | 'plano_acao'
  | 'contencao'
  | 'corretiva'
  | 'preventiva';

interface Ferramenta5W2HItem {
  id: string;
  w2h_id: string;
  what: string;    // O quê?
  why: string;     // Por quê?
  where: string;   // Onde?
  when: string;    // Quando?
  who: string;     // Quem?
  how: string;     // Como?
  how_much: string; // Quanto?
  custo_moeda: string;
  custo_valor: number;
  responsavel_id?: string;
  prazo?: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado';
}
```

#### Acao

```typescript
interface Acao {
  id: string;
  empresa_id: string;
  projeto_id: string;
  etapa_id?: string;
  tipo_acao?: TipoAcao8D;
  titulo: string;
  descricao: string;
  responsavel_id?: string;
  data_inicio?: string;
  data_fim_prevista?: string;
  data_fim?: string;
  custo_previsto_valor?: number;
  custo_previsto_moeda: string;
  custo_real_valor?: number;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado';
  eficaz?: boolean;
  criado_em: string;
  causas_vinculadas: CausaVinculada[];
}

type TipoAcao8D = 'contencao' | 'corretiva' | 'preventiva';

interface CausaVinculada {
  tipo: 'ishikawa' | 'cinco_porques';
  causa_id: string;
  descricao: string;
}
```

#### Evidencia

```typescript
interface Evidencia {
  id: string;
  empresa_id: string;
  referencia_tipo: ReferenciaType;
  referencia_id: string;
  tipo: 'imagem' | 'documento' | 'video' | 'link';
  titulo: string;
  url: string;
  caminho: string;
  tamanho_bytes: number;
  mime_type: string;
  observacao?: string;
  metadados: Record<string, any>;
  criado_em: string;
  criado_por_id: string;
  thumbnail_url?: string; // Para imagens
}

type ReferenciaType =
  | 'projeto'
  | 'etapa'
  | 'causa_ishikawa'
  | 'acao'
  | 'indicador'
  | 'hipotese';
```

#### Indicador

```typescript
interface Indicador {
  id: string;
  empresa_id: string;
  projeto_id: string;
  nome: string;
  descricao: string;
  formula?: string;
  unidade: string; // "%", "unidades", "R$"
  meta_valor?: number;
  criado_em: string;
  medicoes: IndicadorMedicao[];
}

interface IndicadorMedicao {
  id: string;
  indicador_id: string;
  data: string;
  valor: number;
  origem: 'manual' | 'sistema' | 'sensor';
  contexto?: Record<string, any>;
  marcador: 'antes' | 'durante' | 'depois';
  criado_em: string;
}
```

### Máquinas de Estado

#### Status do Projeto

```
rascunho → em_andamento → concluido
                ↓
            cancelado → arquivado
```

#### Status da Etapa (MASP/8D - Sequencial)

```
rascunho → em_andamento → concluido → aprovado (8D apenas)
                ↓
            cancelado
```

**Validações de Avanço**:
- Etapa só pode iniciar se etapa anterior estiver concluída
- Etapa 3 (Análise): Requer Ishikawa OU 5 Porquês
- Etapa 4 (Plano): Requer ao menos uma ação com 5W2H completo
- Etapa 6 (Verificação): Requer indicadores antes/depois

#### Status da Etapa (A3 - Paralelo)

```
rascunho → em_andamento ⟷ concluido
```

**Validações**:
- Seções podem ser editadas independentemente
- Projeto só conclui se TODAS as 7 seções estiverem concluídas

---

## Fluxos de UI

### Fluxo 1: Criar Projeto MASP

```
1. Dashboard → Botão "Novo Projeto"
   ↓
2. Modal/Tela "Criar Projeto"
   Campos:
   - Selecionar Cliente (dropdown)
   - Metodologia: MASP / 8D / A3
   - Título do projeto
   - Descrição do problema (textarea, min 20 chars)
   - Impacto (opcional)
   - Responsável (dropdown usuários)
   ↓
3. Submit → POST /projetos
   ↓
4. Redirect para /projetos/:id
   → Exibe projeto com 8 etapas MASP inicializadas
   → Primeira etapa "1-identificacao" já em "em_andamento"
```

#### Componentes Envolvidos

- `ProjetoCreateModal`
- `ProjetoForm`
- `MetodologiaSelector`
- `ClienteAutocomplete`
- `UserSelector`

### Fluxo 2: Preencher Etapa 3 (Análise) - Ishikawa

```
1. Tela do Projeto → Tab "Etapas"
   ↓
2. Lista de Etapas → Clicar em "3-analise"
   ↓
3. Tela Etapa Análise
   → Botão "Criar Diagrama Ishikawa"
   ↓
4. Canvas Ishikawa
   - 6 Categorias (6M) como "espinhas"
   - Botão "+" em cada categoria
   ↓
5. Adicionar Causa
   Modal com:
   - Categoria (pré-selecionada)
   - Descrição da causa
   - Prioridade (baixa/média/alta/crítica)
   - Adicionar evidências (opcional)
   ↓
6. Submit → POST /ishikawa/:id/causas
   ↓
7. Canvas atualiza com nova causa
   ↓
8. Repetir até identificar todas as causas
   ↓
9. Botão "Concluir Etapa"
   → PUT /etapas/:id/concluir
   → Valida que há pelo menos 1 causa cadastrada
   → Marca etapa como "concluido"
   → Avança automaticamente para etapa 4
```

#### Componentes Envolvidos

- `EtapaDetalhes`
- `IshikawaDiagram` (Canvas SVG ou biblioteca de diagramas)
- `IshikawaCausaForm`
- `PrioridadeSelector`
- `EvidenciaUploader`

### Fluxo 3: Criar Plano de Ação (5W2H)

```
1. Etapa 4 "Plano de Ação" → Botão "Criar 5W2H"
   ↓
2. Form 5W2H
   Campos:
   - Contexto/Objetivo
   - Tipo: plano_acao / contenção / corretiva / preventiva
   ↓
3. Submit → POST /5w2h
   → Cria cabeçalho 5W2H
   ↓
4. Tela 5W2H → Lista de Itens (vazia)
   → Botão "Adicionar Item"
   ↓
5. Form Item 5W2H
   - What (O quê?) *obrigatório
   - Why (Por quê?) *obrigatório
   - Where (Onde?)
   - When (Quando?) *obrigatório
   - Who (Quem?) *obrigatório
   - How (Como?)
   - How Much (Quanto?)
   - Custo (valor + moeda)
   - Responsável
   - Prazo
   ↓
6. Submit → POST /5w2h/:id/itens
   ↓
7. Tabela 5W2H atualiza com novo item
   ↓
8. Vincular a Causas Raiz
   → Selecionar causas do Ishikawa ou 5 Porquês
   → POST /acoes/:id/vincular-causas
   ↓
9. Concluir Etapa
   → Valida que todos os itens têm What, Why, Who, When
   → PUT /etapas/:id/concluir
```

#### Componentes Envolvidos

- `Ferramenta5W2HForm`
- `Ferramenta5W2HItemTable`
- `Ferramenta5W2HItemForm`
- `CausasVinculoSelector`
- `MoneyInput`
- `DatePicker`

### Fluxo 4: Upload de Evidências

```
1. Qualquer Tela (Projeto, Etapa, Causa, Ação)
   → Botão "Adicionar Evidência"
   ↓
2. Modal Upload
   - Drag & Drop ou File Picker
   - Limite: 10MB
   - Formatos: JPG, PNG, PDF, DOCX, XLSX, CSV
   ↓
3. Preview do arquivo
   - Nome
   - Tamanho
   - Thumbnail (se imagem)
   ↓
4. Form Evidência
   - Título (opcional)
   - Observação/Descrição
   - Tags (opcional)
   ↓
5. Submit
   → POST /evidencias/upload (multipart/form-data)
   → Retorna evidencia_id e URLs
   ↓
6. Vincular Evidência
   → POST /evidencias/vincular
   Body: {
     evidencia_id: "uuid",
     referencia_tipo: "causa_ishikawa",
     referencia_id: "uuid"
   }
   ↓
7. Evidência aparece na galeria da entidade
```

#### Componentes Envolvidos

- `EvidenciaUploadModal`
- `FileDropzone`
- `FilePreview`
- `EvidenciaForm`
- `EvidenciaGallery`
- `EvidenciaCard`

### Fluxo 5: Conversão MASP → 8D

```
1. Tela do Projeto MASP (concluído ou em andamento)
   → Menu "..." → "Converter para 8D"
   ↓
2. Modal "Preview de Conversão"
   → Exibe mapeamento de etapas:

   MASP              →  8D
   1-identificacao   →  d2-descricao
   2-observacao      →  d2-descricao
   3-analise         →  d4-causa-raiz
   4-plano-acao      →  d5-acao-corretiva
   5-acao            →  d5-acao-corretiva
   6-verificacao     →  d6-eficacia
   7-padronizacao    →  d7-acao-preventiva
   8-conclusao       →  d8-encerramento

   Novas disciplinas:
   - d0-planejamento (vazia)
   - d1-equipe (vazia)
   - d3-contencao (vazia)

   Artefatos preservados:
   ✅ Ishikawa, 5 Porquês, 5W2H, Ações, Evidências
   ↓
3. Botão "Confirmar Conversão"
   → POST /conversoes/masp-para-8d
   Body: { projeto_id: "uuid" }
   ↓
4. Loading (pode levar 5-10s)
   → Worker processa conversão em background
   ↓
5. Polling ou WebSocket
   → GET /conversoes/:conversion_id/status
   → Status: "em_processamento" | "concluido" | "erro"
   ↓
6. Redirect para novo projeto 8D
   → /projetos/:novo_projeto_id
   → Exibe disciplinas 8D com dados migrados
```

#### Componentes Envolvidos

- `ConversaoModal`
- `MapeamentoPreview`
- `ConversaoStatus`
- `ProgressBar`

### Fluxo 6: Gerar Relatório PDF

```
1. Tela do Projeto (status: concluído)
   → Botão "Gerar Relatório"
   ↓
2. Modal "Opções de Relatório"
   - Incluir evidências: Sim / Não
   - Incluir assinatura digital: Sim / Não
   - Logo da empresa: Upload
   ↓
3. Submit
   → POST /projetos/:id/relatorio
   Body: { incluir_evidencias: true }
   ↓
4. Loading (15s aprox)
   → Worker gera PDF em background
   ↓
5. Polling status
   → GET /projetos/:id/relatorio/status
   → Status: "gerando" | "pronto" | "erro"
   ↓
6. PDF Pronto
   → Botão "Baixar PDF"
   → GET /projetos/:id/relatorio (download)
   → Salva arquivo localmente
```

#### Componentes Envolvidos

- `RelatorioModal`
- `RelatorioOptions`
- `PDFGenerationProgress`
- `PDFDownloadButton`

---

## Componentes Sugeridos

### Estrutura de Diretórios (React + TypeScript)

```
src/
├── components/
│   └── resolucao-problemas/
│       ├── projeto/
│       │   ├── ProjetoCard.tsx
│       │   ├── ProjetoList.tsx
│       │   ├── ProjetoDetalhes.tsx
│       │   ├── ProjetoForm.tsx
│       │   ├── ProjetoCreateModal.tsx
│       │   ├── ProjetoProgress.tsx
│       │   └── ProjetoStatusBadge.tsx
│       │
│       ├── workflow/
│       │   ├── EtapasList.tsx
│       │   ├── EtapaCard.tsx
│       │   ├── EtapaDetalhes.tsx
│       │   ├── EtapaTimeline.tsx
│       │   └── EtapaStepper.tsx
│       │
│       ├── ishikawa/
│       │   ├── IshikawaDiagram.tsx          # Canvas SVG
│       │   ├── IshikawaCausaForm.tsx
│       │   ├── IshikawaCausaCard.tsx
│       │   └── IshikawaCategoryBranch.tsx
│       │
│       ├── cinco-porques/
│       │   ├── CincoPorquesCadeia.tsx
│       │   ├── CincoPorquesPassoForm.tsx
│       │   ├── CincoPorquesTree.tsx
│       │   └── CincoPorquesFlowchart.tsx
│       │
│       ├── ferramenta-5w2h/
│       │   ├── Ferramenta5W2HForm.tsx
│       │   ├── Ferramenta5W2HTable.tsx
│       │   ├── Ferramenta5W2HItemForm.tsx
│       │   └── Ferramenta5W2HItemRow.tsx
│       │
│       ├── acao/
│       │   ├── AcaoList.tsx
│       │   ├── AcaoCard.tsx
│       │   ├── AcaoForm.tsx
│       │   ├── AcaoVinculoCausasModal.tsx
│       │   └── AcaoStatusBadge.tsx
│       │
│       ├── evidencia/
│       │   ├── EvidenciaUploadModal.tsx
│       │   ├── EvidenciaGallery.tsx
│       │   ├── EvidenciaCard.tsx
│       │   ├── EvidenciaThumbnail.tsx
│       │   ├── FileDropzone.tsx
│       │   └── FilePreview.tsx
│       │
│       ├── indicador/
│       │   ├── IndicadorList.tsx
│       │   ├── IndicadorForm.tsx
│       │   ├── IndicadorMedicaoForm.tsx
│       │   ├── IndicadorChart.tsx             # Gráfico antes/depois
│       │   └── IndicadorComparison.tsx
│       │
│       ├── conversao/
│       │   ├── ConversaoModal.tsx
│       │   ├── MapeamentoPreview.tsx
│       │   ├── ConversaoStatus.tsx
│       │   └── ConversaoHistory.tsx
│       │
│       ├── relatorio/
│       │   ├── RelatorioModal.tsx
│       │   ├── RelatorioOptions.tsx
│       │   ├── PDFGenerationProgress.tsx
│       │   └── PDFDownloadButton.tsx
│       │
│       └── shared/
│           ├── MetodologiaSelector.tsx
│           ├── MetodologiaBadge.tsx
│           ├── StatusBadge.tsx
│           ├── PrioridadeSelector.tsx
│           ├── UserSelector.tsx
│           ├── ClienteAutocomplete.tsx
│           ├── DatePicker.tsx
│           ├── MoneyInput.tsx
│           └── ProgressBar.tsx
│
├── pages/
│   └── resolucao-problemas/
│       ├── index.tsx                         # Lista de projetos
│       ├── [projetoId]/
│       │   ├── index.tsx                     # Detalhes do projeto
│       │   ├── etapas/
│       │   │   └── [etapaId].tsx            # Detalhes da etapa
│       │   ├── ishikawa/
│       │   │   └── [ishikawaId].tsx
│       │   └── relatorio.tsx
│       └── novo.tsx                          # Criar projeto
│
├── hooks/
│   └── resolucao-problemas/
│       ├── useProjeto.ts
│       ├── useProjetos.ts
│       ├── useEtapa.ts
│       ├── useIshikawa.ts
│       ├── useCincoPorques.ts
│       ├── use5W2H.ts
│       ├── useAcao.ts
│       ├── useEvidencia.ts
│       ├── useConversao.ts
│       └── useRelatorio.ts
│
├── services/
│   └── resolucao-problemas/
│       ├── projetoService.ts
│       ├── etapaService.ts
│       ├── ishikawaService.ts
│       ├── cincoPorquesService.ts
│       ├── ferramenta5W2HService.ts
│       ├── acaoService.ts
│       ├── evidenciaService.ts
│       ├── conversaoService.ts
│       └── relatorioService.ts
│
├── store/
│   └── resolucao-problemas/
│       ├── projetoSlice.ts                   # Redux/Zustand
│       ├── etapaSlice.ts
│       ├── ishikawaSlice.ts
│       └── evidenciaSlice.ts
│
├── types/
│   └── resolucao-problemas/
│       ├── projeto.types.ts
│       ├── etapa.types.ts
│       ├── ishikawa.types.ts
│       ├── cincoPorques.types.ts
│       ├── ferramenta5W2H.types.ts
│       ├── acao.types.ts
│       ├── evidencia.types.ts
│       ├── indicador.types.ts
│       └── api.types.ts
│
└── utils/
    └── resolucao-problemas/
        ├── validators/
        │   ├── projetoValidator.ts
        │   ├── etapaValidator.ts
        │   └── 5w2hValidator.ts
        ├── formatters/
        │   ├── dateFormatter.ts
        │   └── currencyFormatter.ts
        └── helpers/
            ├── etapaHelper.ts                # Lógica de avanço de etapas
            ├── mapeamentoHelper.ts           # Mapeamento MASP↔8D↔A3
            └── validacaoHelper.ts            # Validações de completude
```

---

## Integração com API

### Service Layer (projetoService.ts)

```typescript
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service
export const projetoService = {
  // Criar projeto
  create: async (data: CreateProjetoData): Promise<Projeto> => {
    const response = await apiClient.post('/resolucao-problemas/projetos', data);
    return response.data.data;
  },

  // Listar projetos com filtros
  list: async (filters?: ProjetoFilters): Promise<PaginatedResponse<Projeto>> => {
    const params = new URLSearchParams();

    if (filters?.metodologia) params.append('metodologia', filters.metodologia);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.cursor) params.append('cursor', filters.cursor);

    const response = await apiClient.get(`/resolucao-problemas/projetos?${params}`);
    return response.data;
  },

  // Obter projeto por ID
  getById: async (id: string): Promise<ProjetoDetalhado> => {
    const response = await apiClient.get(`/resolucao-problemas/projetos/${id}`);
    return response.data.data;
  },

  // Atualizar projeto
  update: async (id: string, data: UpdateProjetoData): Promise<Projeto> => {
    const response = await apiClient.put(`/resolucao-problemas/projetos/${id}`, data);
    return response.data.data;
  },

  // Arquivar projeto
  archive: async (id: string, justificativa: string): Promise<void> => {
    await apiClient.delete(`/resolucao-problemas/projetos/${id}`, {
      data: { justificativa },
    });
  },

  // Obter progresso do projeto
  getProgress: async (id: string): Promise<ProjetoProgress> => {
    const response = await apiClient.get(`/resolucao-problemas/projetos/${id}/progresso`);
    return response.data.data;
  },
};

// Types
interface CreateProjetoData {
  cliente_id: string;
  metodologia: 'masp' | '8d' | 'a3';
  titulo: string;
  problema_descricao: string;
  impacto?: string;
  responsavel_id?: string;
}

interface UpdateProjetoData {
  titulo?: string;
  problema_descricao?: string;
  impacto?: string;
  responsavel_id?: string;
  status?: 'rascunho' | 'em_andamento' | 'concluido' | 'cancelado';
}

interface ProjetoFilters {
  metodologia?: 'masp' | '8d' | 'a3';
  status?: string;
  cliente_id?: string;
  limit?: number;
  cursor?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    limit: number;
    next_cursor?: string;
    has_more: boolean;
    timestamp: string;
    version: string;
  };
}
```

### Custom Hook (useProjeto.ts)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projetoService } from '@/services/resolucao-problemas/projetoService';
import { toast } from 'react-hot-toast';

export const useProjeto = (id?: string) => {
  const queryClient = useQueryClient();

  // Query para buscar projeto
  const { data: projeto, isLoading, error } = useQuery({
    queryKey: ['projeto', id],
    queryFn: () => projetoService.getById(id!),
    enabled: !!id,
  });

  // Mutation para criar projeto
  const createMutation = useMutation({
    mutationFn: projetoService.create,
    onSuccess: (data) => {
      toast.success('Projeto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
      // Redirect ou callback
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Erro ao criar projeto';
      toast.error(message);
    },
  });

  // Mutation para atualizar projeto
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjetoData }) =>
      projetoService.update(id, data),
    onSuccess: (data) => {
      toast.success('Projeto atualizado!');
      queryClient.invalidateQueries({ queryKey: ['projeto', id] });
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Erro ao atualizar');
    },
  });

  // Mutation para arquivar projeto
  const archiveMutation = useMutation({
    mutationFn: ({ id, justificativa }: { id: string; justificativa: string }) =>
      projetoService.archive(id, justificativa),
    onSuccess: () => {
      toast.success('Projeto arquivado!');
      queryClient.invalidateQueries({ queryKey: ['projetos'] });
    },
  });

  return {
    projeto,
    isLoading,
    error,
    createProjeto: createMutation.mutate,
    updateProjeto: updateMutation.mutate,
    archiveProjeto: archiveMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isArchiving: archiveMutation.isPending,
  };
};

// Hook para lista de projetos
export const useProjetos = (filters?: ProjetoFilters) => {
  return useQuery({
    queryKey: ['projetos', filters],
    queryFn: () => projetoService.list(filters),
  });
};

// Hook para progresso
export const useProjetoProgress = (id: string) => {
  return useQuery({
    queryKey: ['projeto-progress', id],
    queryFn: () => projetoService.getProgress(id),
    refetchInterval: 30000, // Atualiza a cada 30s
  });
};
```

### Componente de Exemplo (ProjetoList.tsx)

```typescript
import React, { useState } from 'react';
import { useProjetos } from '@/hooks/resolucao-problemas/useProjeto';
import { ProjetoCard } from './ProjetoCard';
import { ProjetoCreateModal } from './ProjetoCreateModal';
import { MetodologiaSelector } from '../shared/MetodologiaSelector';
import { StatusBadge } from '../shared/StatusBadge';

export const ProjetoList: React.FC = () => {
  const [filters, setFilters] = useState<ProjetoFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, error } = useProjetos(filters);

  if (isLoading) return <div>Carregando projetos...</div>;
  if (error) return <div>Erro ao carregar projetos</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projetos de Resolução de Problemas</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Novo Projeto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4">
        <MetodologiaSelector
          value={filters.metodologia}
          onChange={(metodologia) => setFilters({ ...filters, metodologia })}
          allowAll
        />
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os Status</option>
          <option value="em_andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Lista de projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((projeto) => (
          <ProjetoCard key={projeto.id} projeto={projeto} />
        ))}
      </div>

      {/* Paginação */}
      {data?.meta.has_more && (
        <button
          onClick={() => setFilters({ ...filters, cursor: data.meta.next_cursor })}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
        >
          Carregar mais
        </button>
      )}

      {/* Modal Criar Projeto */}
      <ProjetoCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
```

---

## Gerenciamento de Estado

### Opção 1: React Query (Recomendado)

**Vantagens**:
- Cache automático
- Refetch inteligente
- Invalidação de queries
- Loading/error states prontos
- Otimistic updates
- Pagination/infinite scroll fácil

**Setup**:
```typescript
// app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App */}
    </QueryClientProvider>
  );
}
```

### Opção 2: Zustand (Para Estado Global Complementar)

```typescript
// store/resolucao-problemas/projetoStore.ts
import { create } from 'zustand';
import { Projeto } from '@/types/resolucao-problemas/projeto.types';

interface ProjetoStore {
  currentProjeto: Projeto | null;
  setCurrentProjeto: (projeto: Projeto | null) => void;

  currentEtapa: WorkflowEtapa | null;
  setCurrentEtapa: (etapa: WorkflowEtapa | null) => void;

  selectedCausas: string[]; // IDs de causas selecionadas
  toggleCausaSelection: (causaId: string) => void;
  clearCausaSelection: () => void;
}

export const useProjetoStore = create<ProjetoStore>((set) => ({
  currentProjeto: null,
  setCurrentProjeto: (projeto) => set({ currentProjeto: projeto }),

  currentEtapa: null,
  setCurrentEtapa: (etapa) => set({ currentEtapa: etapa }),

  selectedCausas: [],
  toggleCausaSelection: (causaId) =>
    set((state) => ({
      selectedCausas: state.selectedCausas.includes(causaId)
        ? state.selectedCausas.filter((id) => id !== causaId)
        : [...state.selectedCausas, causaId],
    })),
  clearCausaSelection: () => set({ selectedCausas: [] }),
}));
```

### Opção 3: Redux Toolkit (Se já usa no projeto)

```typescript
// store/resolucao-problemas/projetoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projetoService } from '@/services/resolucao-problemas/projetoService';

export const fetchProjeto = createAsyncThunk(
  'projeto/fetch',
  async (id: string) => {
    return await projetoService.getById(id);
  }
);

const projetoSlice = createSlice({
  name: 'projeto',
  initialState: {
    current: null as Projeto | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjeto.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjeto.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
      })
      .addCase(fetchProjeto.rejected, (state, action) => {
        state.error = action.error.message || 'Erro';
        state.loading = false;
      });
  },
});

export default projetoSlice.reducer;
```

---

## Validações e Erros

### Validação Client-Side (Zod)

```typescript
// utils/validators/projetoValidator.ts
import { z } from 'zod';

export const createProjetoSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  metodologia: z.enum(['masp', '8d', 'a3'], {
    errorMap: () => ({ message: 'Selecione uma metodologia' }),
  }),
  titulo: z
    .string()
    .min(5, 'Título deve ter no mínimo 5 caracteres')
    .max(200, 'Título muito longo'),
  problema_descricao: z
    .string()
    .min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  impacto: z.string().optional(),
  responsavel_id: z.string().uuid().optional(),
});

export type CreateProjetoFormData = z.infer<typeof createProjetoSchema>;

// Validação de 5W2H
export const ferramenta5W2HItemSchema = z.object({
  what: z.string().min(5, 'What é obrigatório (mín. 5 caracteres)'),
  why: z.string().min(5, 'Why é obrigatório (mín. 5 caracteres)'),
  who: z.string().min(3, 'Who é obrigatório'),
  when: z.string().min(3, 'When é obrigatório'),
  where: z.string().optional(),
  how: z.string().optional(),
  how_much: z.string().optional(),
  custo_valor: z.number().min(0, 'Custo não pode ser negativo').optional(),
});
```

### Uso com React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjetoSchema, CreateProjetoFormData } from '@/utils/validators/projetoValidator';

export const ProjetoForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjetoFormData>({
    resolver: zodResolver(createProjetoSchema),
  });

  const onSubmit = (data: CreateProjetoFormData) => {
    // Submit validated data
    createProjeto(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Título</label>
        <input {...register('titulo')} />
        {errors.titulo && <span className="text-red-500">{errors.titulo.message}</span>}
      </div>

      <div>
        <label>Metodologia</label>
        <select {...register('metodologia')}>
          <option value="">Selecione...</option>
          <option value="masp">MASP</option>
          <option value="8d">8D</option>
          <option value="a3">A3</option>
        </select>
        {errors.metodologia && <span className="text-red-500">{errors.metodologia.message}</span>}
      </div>

      <button type="submit">Criar Projeto</button>
    </form>
  );
};
```

### Tratamento de Erros da API

```typescript
// utils/errorHandler.ts
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

interface ApiError {
  code: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export const handleApiError = (error: unknown): void => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data?.error as ApiError;

    if (apiError) {
      // Erro com detalhes de validação
      if (apiError.details && apiError.details.length > 0) {
        apiError.details.forEach((detail) => {
          toast.error(`${detail.field}: ${detail.message}`);
        });
        return;
      }

      // Erro genérico da API
      toast.error(apiError.message);
      return;
    }
  }

  // Erro desconhecido
  toast.error('Ocorreu um erro inesperado. Tente novamente.');
};

// Uso
try {
  await projetoService.create(data);
} catch (error) {
  handleApiError(error);
}
```

### Mensagens de Erro Específicas

```typescript
export const ERROR_MESSAGES = {
  // Projeto
  PROJETO_NOT_FOUND: 'Projeto não encontrado',
  PROJETO_ALREADY_CONCLUDED: 'Projeto já foi concluído',
  PROJETO_CANNOT_ADVANCE: 'Não é possível avançar esta etapa',

  // Etapa
  ETAPA_ANTERIOR_NAO_CONCLUIDA: 'A etapa anterior deve estar concluída antes de avançar',
  ETAPA_SEM_FERRAMENTAS: 'Esta etapa requer pelo menos uma ferramenta preenchida',
  ETAPA_3_REQUIRES_ISHIKAWA: 'Etapa 3 (Análise) requer um diagrama Ishikawa ou 5 Porquês',
  ETAPA_4_REQUIRES_5W2H: 'Etapa 4 (Plano de Ação) requer ao menos um 5W2H completo',
  ETAPA_6_REQUIRES_INDICADORES: 'Etapa 6 (Verificação) requer indicadores antes/depois',

  // Ação
  ACAO_SEM_CAUSAS: 'Ação deve estar vinculada a pelo menos uma causa raiz',
  ACAO_CAMPO_OBRIGATORIO: 'Preencha todos os campos obrigatórios (What, Why, Who, When)',

  // Upload
  FILE_TOO_LARGE: 'Arquivo excede o limite de 10MB',
  FILE_INVALID_FORMAT: 'Formato de arquivo não suportado',

  // Conversão
  CONVERSAO_METODOLOGIA_INVALIDA: 'Conversão entre estas metodologias não é suportada',
  CONVERSAO_PROJETO_NAO_CONCLUIDO: 'Apenas projetos concluídos podem ser convertidos',
};
```

---

## Upload de Arquivos

### Componente FileDropzone

```typescript
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxSize?: number; // em bytes
  acceptedTypes?: string[];
  multiple?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  multiple = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          const error = file.errors[0];
          if (error.code === 'file-too-large') {
            toast.error(`Arquivo ${file.file.name} excede o limite de 10MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`Formato de ${file.file.name} não é suportado`);
          }
        });
        return;
      }

      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-600">Solte o arquivo aqui...</p>
      ) : (
        <div>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Arraste e solte ou <span className="text-blue-600">clique para selecionar</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Formatos aceitos: JPG, PNG, PDF, DOCX (máx. 10MB)
          </p>
        </div>
      )}
    </div>
  );
};
```

### Service de Upload

```typescript
// services/evidenciaService.ts
import axios from 'axios';

export const evidenciaService = {
  upload: async (
    file: File,
    referenciaData: {
      referencia_tipo: string;
      referencia_id: string;
      titulo?: string;
      observacao?: string;
    }
  ): Promise<Evidencia> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('referencia_tipo', referenciaData.referencia_tipo);
    formData.append('referencia_id', referenciaData.referencia_id);
    if (referenciaData.titulo) formData.append('titulo', referenciaData.titulo);
    if (referenciaData.observacao) formData.append('observacao', referenciaData.observacao);

    const response = await apiClient.post('/resolucao-problemas/evidencias/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data.data;
  },
};
```

### Hook useEvidenciaUpload

```typescript
import { useMutation } from '@tanstack/react-query';
import { evidenciaService } from '@/services/resolucao-problemas/evidenciaService';
import { toast } from 'react-hot-toast';

export const useEvidenciaUpload = () => {
  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      referenciaData,
    }: {
      file: File;
      referenciaData: {
        referencia_tipo: string;
        referencia_id: string;
        titulo?: string;
        observacao?: string;
      };
    }) => evidenciaService.upload(file, referenciaData),
    onSuccess: () => {
      toast.success('Evidência enviada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Erro ao enviar evidência');
    },
  });

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    progress: 0, // TODO: Implementar tracking de progresso
  };
};
```

### Componente EvidenciaUploadModal

```typescript
import React, { useState } from 'react';
import { FileDropzone } from './FileDropzone';
import { useEvidenciaUpload } from '@/hooks/resolucao-problemas/useEvidenciaUpload';

interface EvidenciaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenciaData: {
    referencia_tipo: string;
    referencia_id: string;
  };
}

export const EvidenciaUploadModal: React.FC<EvidenciaUploadModalProps> = ({
  isOpen,
  onClose,
  referenciaData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [observacao, setObservacao] = useState('');

  const { upload, isUploading } = useEvidenciaUpload();

  const handleFilesSelected = (files: File[]) => {
    setSelectedFile(files[0]);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;

    upload(
      {
        file: selectedFile,
        referenciaData: {
          ...referenciaData,
          titulo: titulo || selectedFile.name,
          observacao,
        },
      },
      {
        onSuccess: () => {
          onClose();
          setSelectedFile(null);
          setTitulo('');
          setObservacao('');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Adicionar Evidência</h2>

        {!selectedFile ? (
          <FileDropzone onFilesSelected={handleFilesSelected} />
        ) : (
          <div>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="font-semibold">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título (opcional)</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder={selectedFile.name}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Observação</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Trocar Arquivo
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
```

---

## Relatórios e PDFs

### Service de Relatório

```typescript
// services/relatorioService.ts
export const relatorioService = {
  // Gerar relatório
  generate: async (
    projetoId: string,
    options?: {
      incluir_evidencias?: boolean;
      incluir_assinatura?: boolean;
    }
  ): Promise<{ job_id: string }> => {
    const response = await apiClient.post(`/resolucao-problemas/projetos/${projetoId}/relatorio`, options);
    return response.data.data;
  },

  // Verificar status de geração
  checkStatus: async (projetoId: string): Promise<{
    status: 'gerando' | 'pronto' | 'erro';
    url?: string;
    error?: string;
  }> => {
    const response = await apiClient.get(`/resolucao-problemas/projetos/${projetoId}/relatorio/status`);
    return response.data.data;
  },

  // Download do PDF
  download: async (projetoId: string): Promise<Blob> => {
    const response = await apiClient.get(`/resolucao-problemas/projetos/${projetoId}/relatorio`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
```

### Hook useRelatorio

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { relatorioService } from '@/services/resolucao-problemas/relatorioService';

export const useRelatorio = (projetoId: string) => {
  // Mutation para gerar relatório
  const generateMutation = useMutation({
    mutationFn: (options?: { incluir_evidencias?: boolean }) =>
      relatorioService.generate(projetoId, options),
  });

  // Query para polling de status
  const { data: statusData, refetch } = useQuery({
    queryKey: ['relatorio-status', projetoId],
    queryFn: () => relatorioService.checkStatus(projetoId),
    enabled: false, // Só ativa manualmente
    refetchInterval: (data) => {
      // Refetch a cada 2s se estiver gerando
      return data?.status === 'gerando' ? 2000 : false;
    },
  });

  // Mutation para download
  const downloadMutation = useMutation({
    mutationFn: () => relatorioService.download(projetoId),
    onSuccess: (blob) => {
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${projetoId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });

  return {
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    status: statusData?.status,
    pdfUrl: statusData?.url,
    download: downloadMutation.mutate,
    isDownloading: downloadMutation.isPending,
    startPolling: refetch,
  };
};
```

### Componente RelatorioModal

```typescript
import React, { useState, useEffect } from 'react';
import { useRelatorio } from '@/hooks/resolucao-problemas/useRelatorio';
import { toast } from 'react-hot-toast';

interface RelatorioModalProps {
  isOpen: boolean;
  onClose: () => void;
  projetoId: string;
}

export const RelatorioModal: React.FC<RelatorioModalProps> = ({
  isOpen,
  onClose,
  projetoId,
}) => {
  const [incluirEvidencias, setIncluirEvidencias] = useState(true);
  const { generate, status, download, isDownloading, startPolling } = useRelatorio(projetoId);

  useEffect(() => {
    if (status === 'pronto') {
      toast.success('Relatório gerado com sucesso!');
    } else if (status === 'erro') {
      toast.error('Erro ao gerar relatório');
    }
  }, [status]);

  const handleGenerate = () => {
    generate({ incluir_evidencias: incluirEvidencias }, {
      onSuccess: () => {
        startPolling(); // Inicia polling de status
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Gerar Relatório PDF</h2>

        {status === 'gerando' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span>Gerando relatório...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {status === 'pronto' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">✓ Relatório gerado com sucesso!</p>
            <button
              onClick={() => download()}
              disabled={isDownloading}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              {isDownloading ? 'Baixando...' : 'Download PDF'}
            </button>
          </div>
        )}

        {!status && (
          <div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={incluirEvidencias}
                  onChange={(e) => setIncluirEvidencias(e.target.checked)}
                />
                <span>Incluir evidências no relatório</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Incluir imagens e documentos anexados aumenta o tamanho do PDF
              </p>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Gerar Relatório
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-gray-600 hover:text-gray-800"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
```

---

## Considerações de UX

### 1. Feedback Visual de Progresso

**Stepper de Etapas**:
```typescript
const EtapaStepper: React.FC<{ metodologia: 'masp' | '8d' | 'a3'; etapas: WorkflowEtapa[] }> = ({
  metodologia,
  etapas,
}) => {
  const getEtapaNome = (etapa: WorkflowEtapa) => {
    if (etapa.etapa_masp) return etapa.etapa_masp;
    if (etapa.disciplina_8d) return etapa.disciplina_8d;
    return etapa.secao_a3;
  };

  return (
    <div className="flex items-center">
      {etapas.map((etapa, index) => (
        <React.Fragment key={etapa.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                etapa.status === 'concluido'
                  ? 'bg-green-500 text-white'
                  : etapa.status === 'em_andamento'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span className="text-xs mt-1">{getEtapaNome(etapa)}</span>
          </div>
          {index < etapas.length - 1 && (
            <div className={`flex-1 h-1 ${etapa.status === 'concluido' ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
```

### 2. Loading States

```typescript
// Skeleton para lista de projetos
const ProjetoCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

// Uso
{isLoading ? (
  <>
    <ProjetoCardSkeleton />
    <ProjetoCardSkeleton />
    <ProjetoCardSkeleton />
  </>
) : (
  projetos.map(projeto => <ProjetoCard key={projeto.id} projeto={projeto} />)
)}
```

### 3. Empty States

```typescript
const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    <svg className="w-24 h-24 text-gray-400 mb-4" /* ... */ />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 text-center max-w-md">{description}</p>
    {action}
  </div>
);

// Uso
{projetos.length === 0 && (
  <EmptyState
    title="Nenhum projeto criado"
    description="Comece criando seu primeiro projeto de resolução de problemas usando MASP, 8D ou A3"
    action={
      <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
        + Criar Primeiro Projeto
      </button>
    }
  />
)}
```

### 4. Confirmações Importantes

```typescript
// Confirmação antes de arquivar projeto
const confirmArchive = () => {
  if (confirm('Tem certeza que deseja arquivar este projeto? Esta ação não pode ser desfeita.')) {
    const justificativa = prompt('Digite o motivo do arquivamento:');
    if (justificativa && justificativa.length >= 10) {
      archiveProjeto({ id: projetoId, justificativa });
    } else {
      toast.error('Justificativa deve ter no mínimo 10 caracteres');
    }
  }
};

// Melhor: Modal de confirmação customizado
const ArchiveConfirmModal: React.FC<{ onConfirm: (justificativa: string) => void }> = ({ onConfirm }) => {
  const [justificativa, setJustificativa] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Arquivar Projeto</h2>
        <p className="text-gray-600 mb-4">
          Esta ação não pode ser desfeita. Digite o motivo do arquivamento:
        </p>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Ex: Cliente cancelou o contrato"
        />
        <div className="flex gap-2">
          <button className="flex-1 border px-4 py-2 rounded">Cancelar</button>
          <button
            onClick={() => onConfirm(justificativa)}
            disabled={justificativa.length < 10}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Arquivar
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 5. Tooltips e Ajuda Contextual

```typescript
import { Tooltip } from 'react-tooltip';

<div>
  <label>
    Metodologia
    <span data-tooltip-id="metodologia-tooltip" className="ml-1 text-gray-400 cursor-help">
      ?
    </span>
  </label>
  <Tooltip id="metodologia-tooltip">
    <div className="max-w-xs">
      <p className="font-semibold mb-1">MASP</p>
      <p className="text-sm">8 etapas sequenciais para resolução estruturada de problemas</p>

      <p className="font-semibold mt-2 mb-1">8D</p>
      <p className="text-sm">9 disciplinas com foco em ações de contenção e preventivas</p>

      <p className="font-semibold mt-2 mb-1">A3</p>
      <p className="text-sm">Formato Lean de 1 página para análise visual de problemas</p>
    </div>
  </Tooltip>
</div>
```

### 6. Notificações e Toasts

```typescript
import toast from 'react-hot-toast';

// Sucesso
toast.success('Projeto criado com sucesso!', {
  duration: 4000,
  position: 'top-right',
});

// Erro com detalhes
toast.error((t) => (
  <div>
    <strong>Erro ao criar projeto</strong>
    <ul className="text-sm mt-1">
      <li>• Título é obrigatório</li>
      <li>• Descrição deve ter no mínimo 20 caracteres</li>
    </ul>
    <button onClick={() => toast.dismiss(t.id)} className="text-blue-600 text-sm mt-2">
      Fechar
    </button>
  </div>
), {
  duration: 8000,
});

// Loading com promise
toast.promise(
  createProjeto(data),
  {
    loading: 'Criando projeto...',
    success: 'Projeto criado!',
    error: 'Erro ao criar projeto',
  }
);
```

### 7. Responsividade Mobile

```typescript
// Adaptar layout para mobile
const ProjetoCard: React.FC<{ projeto: Projeto }> = ({ projeto }) => (
  <div className="bg-white rounded-lg shadow">
    {/* Desktop: Layout horizontal */}
    <div className="hidden md:flex p-4 gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{projeto.titulo}</h3>
        <p className="text-gray-600">{projeto.problema_descricao}</p>
      </div>
      <div className="flex flex-col items-end">
        <MetodologiaBadge metodologia={projeto.metodologia} />
        <StatusBadge status={projeto.status} />
      </div>
    </div>

    {/* Mobile: Layout vertical */}
    <div className="md:hidden p-4">
      <div className="flex gap-2 mb-2">
        <MetodologiaBadge metodologia={projeto.metodologia} />
        <StatusBadge status={projeto.status} />
      </div>
      <h3 className="text-lg font-semibold mb-1">{projeto.titulo}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{projeto.problema_descricao}</p>
    </div>
  </div>
);
```

---

## Próximos Passos

1. **Setup Inicial**
   - Configurar projeto React/Next.js
   - Instalar dependências (React Query, Axios, Zod, etc.)
   - Configurar variáveis de ambiente

2. **Autenticação**
   - Implementar fluxo de login
   - Armazenar JWT token
   - Criar contexto de autenticação

3. **Implementar Módulos (Ordem Sugerida)**
   - Módulo 1: Listagem e CRUD de Projetos
   - Módulo 2: Workflow de Etapas
   - Módulo 3: Ferramenta Ishikawa
   - Módulo 4: 5 Porquês e 5W2H
   - Módulo 5: Gestão de Ações
   - Módulo 6: Upload de Evidências
   - Módulo 7: Indicadores e Verificação
   - Módulo 8: Conversão entre Metodologias
   - Módulo 9: Geração de Relatórios

4. **Testes**
   - Testes unitários (Jest + Testing Library)
   - Testes de integração com API
   - Testes E2E (Cypress/Playwright)

5. **Otimizações**
   - Code splitting
   - Lazy loading de componentes
   - Otimização de imagens
   - Cache estratégico

---

## Recursos Adicionais

### Bibliotecas Recomendadas

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "react-hot-toast": "^2.4.0",
    "react-dropzone": "^14.2.0",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwindcss": "^3.3.0",
    "zustand": "^4.4.0",
    "react-tooltip": "^5.25.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0"
  }
}
```

### Documentação de Referência

- **Backend API**: `specs/020-resolucao-de-problemas/contracts/`
- **Modelos de Dados**: `specs/020-resolucao-de-problemas/data-model.md`
- **Especificação Completa**: `specs/020-resolucao-de-problemas/spec.md`
- **Quickstart Backend**: `specs/020-resolucao-de-problemas/quickstart.md`

---

**Última atualização**: 2025-12-18
**Versão**: 1.0.0
**Mantido por**: Equipe LeadsRapido
