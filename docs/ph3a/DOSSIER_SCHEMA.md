# PH3A Dossier Database Schema

## Visão Geral

Esta documentação detalha a estrutura JSONB dos campos da tabela `ph3a_dossier` que armazena dossiês completos da API PH3A DataBusca.

**Referências:**
- API OpenAPI: `docs/ph3a/openapi-databusca.json` (schema "Content")
- Mock Frontend: `docs/ph3a/datadossie-mock-frontend.js`
- Migration: `supabase/migrations/20251204000000_create_ph3a_dossier_tables.js`

---

## Campos JSONB Principais

### 1. `dados_pessoais` (JSONB)

Dados cadastrais básicos da pessoa física ou jurídica.

```typescript
{
  name: string;                // Nome completo ou razão social
  nameSocial?: string;         // Nome social/fantasia (Receita Federal)
  birthDate?: string;          // Data nascimento (DD/MM/YYYY) ou abertura empresa
  age?: number;                // Idade (PF) ou tempo atividade (PJ)
  gender?: string;             // "Masculino", "Feminino", ou tipo empresa
  genderCode?: number;         // Código PH3A (1:Male, 2:Female, 10+:Company types)
  maritalStatus?: string;      // "Solteiro", "Casado", "Divorciado", "Viúvo"
  maritalStatusCode?: number;  // 0:Single, 1:Married, 2:Divorced, 3:Widowed
  nationality?: string;        // "Brasileiro", "Argentino", etc.
  nationalityCode?: number;    // Código PH3A (10:Brasileiro, 20:Naturalizado, etc.)
  education?: string;          // "Superior", "Médio Completo", etc.
  educationCode?: number;      // 1-13 (Analfabeto até Pós-Doutorado)
  educationGroup?: number;     // 0:None, 1:Primary, 2:Fundamental, 3:Medium, 4:Superior
  motherName?: string;         // Nome da mãe
  fatherName?: string;         // Nome do pai
  deathDate?: string;          // Data óbito (DD/MM/YYYY) ou encerramento
  deathYear?: number;          // Ano do óbito
  zodiac?: string;             // "Áries", "Touro", etc. (apenas PF)
  zodiacCode?: number;         // 0-11 (Aries to Pisces)
  dependents?: number;         // Número de dependentes (PF)

  // Campos específicos PJ
  taxModel?: string;           // "Simples", "Lucro Presumido", "Lucro Real"
  taxModelCode?: number;       // 0:PresumedProfit, 1:RealProfit, 2:Simple
  businessSize?: string;       // "MEI", "Micro", "Pequena", "Média", "Grande"
  businessSizeCode?: number;   // 0:Micro, 1:Small, 2:Medium, 3:Large, 4:MEI
  optingSimple?: boolean;      // Optante pelo Simples Nacional
  isMEI?: boolean;             // É Micro Empreendedor Individual
  legalNatureId?: number;      // Código natureza jurídica
  legalNature?: string;        // Descrição natureza jurídica
  totalEmployees?: number;     // Número de funcionários
  totalCompanies?: number;     // Total de empresas/filiais
  totalPartners?: number;      // Total de sócios PF
  totalCompanyPartners?: number; // Total de sócios PJ
  mainCompanyDocument?: string; // CNPJ matriz
}
```

---

### 2. `scores` (JSONB)

Scores de crédito, marketing, PLD e pré-screening com evolução temporal.

```typescript
{
  creditScore?: {              // Score de crédito
    d00?: number;              // Score atual (0-1000)
    d30?: number;              // Score 30 dias atrás
    d60?: number;              // Score 60 dias atrás
    d90?: number;              // Score 90 dias atrás
    ranking?: number;          // Data última atualização (YYYYMMDD)
    createDate?: string;       // Data criação (ISO 8601)
    status?: number;           // 0:History, 1:Active, 2:Verified, 3:Hot
  };

  marketingScore?: {           // Score de marketing (mesma estrutura)
    d00?: number;
    d30?: number;
    d60?: number;
    d90?: number;
    ranking?: number;
    createDate?: string;
    status?: number;
  };

  preScreening?: {             // Score PH3A (mesma estrutura)
    d00?: number;
    d30?: number;
    d60?: number;
    d90?: number;
    ranking?: number;
    createDate?: string;
    status?: number;
  };

  pldScore?: {                 // Score PLD - Prevenção Lavagem Dinheiro
    d00?: number;              // Score atual (0-1000)
    d30?: number;
    d60?: number;
    d90?: number;
    ranking?: number;
    createDate?: string;
    status?: number;
  };
}
```

**Interpretação dos scores:**
- **0-300**: Alto risco / Baixa capacidade
- **301-600**: Risco médio / Capacidade moderada
- **601-800**: Baixo risco / Boa capacidade
- **801-1000**: Risco muito baixo / Excelente capacidade

---

### 3. `indicadores` (JSONB)

Indicadores de renda, situação fiscal e flags de risco.

```typescript
{
  // Renda (Pessoa Física)
  income?: {
    personal?: number;         // Renda individual (R$)
    partner?: number;          // Renda do cônjuge (R$)
    family?: number;           // Renda familiar (R$)
    retired?: number;          // Aposentadoria (R$)
    presumed?: number;         // Renda presumida (R$)
    personalClass?: string;    // "A", "B", "C", "D", "E"
    personalClassCode?: number; // 0:A, 1:B, 2:C, 3:D, 4:E
    familyClass?: string;      // "A", "B", "C", "D", "E"
    familyClassCode?: number;  // 0:A, 1:B, 2:C, 3:D, 4:E
    ranking?: number;
    createDate?: string;
    status?: number;
  };

  // Receita (Pessoa Jurídica)
  revenue?: {
    shared?: number;           // Receita compartilhada (R$)
    presumed?: number;         // Receita presumida (R$)
    balance?: number;          // Balanço (R$)
    ranking?: number;
    createDate?: string;
    status?: number;
  };

  // Situação Fiscal (PF e PJ)
  fiscalSituation?: {
    condition?: string;        // "Regular", "Pendente", "Suspenso", "Cancelado", "Falecido"
    conditionCode?: number;    // 0:Regular, 1:Pendente, 2:Suspenso, 3:Cancelado, 4:Nulo, 5:Falecido
    checkCode?: string;        // Código controle comprovante
    checkDate?: string;        // Data verificação (YYYY-MM-DD)
    description?: string;      // Descrição situação
    specialStatus?: string;    // "Recuperação Judicial", etc.
    specialStatusDate?: string; // Data início situação especial
    deathYear?: number;        // Ano óbito
    ranking?: number;
    createDate?: string;
    status?: number;
  };

  // Flags de Risco (bitwise e array)
  flags?: number;              // 0:None, 1:Invalid, 2:Inexistent, 4:Confirmed, 8:Canceled, 16:VIP, 32:PPE, 64:Correlated, 128:Warning, 256:MinorAge
  flagList?: number[];         // Array com flags individualizados
}
```

---

### 4. `telefones` (JSONB Array)

Lista de telefones com validação e flags PROCON.

```typescript
[
  {
    number: string;            // "(11) 98765-4321"
    numberRaw?: string;        // "11987654321" (sem formatação)
    type?: string;             // "Celular", "Fixo", "Comercial"
    typeCode?: number;         // Código tipo telefone
    score?: number;            // 0-10 (qualidade validação)
    ranking?: number;          // YYYYMMDD
    createDate?: string;       // ISO 8601
    status?: number;           // 0:History, 1:Active, 2:Verified, 3:Hot
    proconFlag?: boolean;      // TRUE se número possui reclamação PROCON
    tags?: string[];           // ["PROCON", "WhatsApp", "Principal"]
    isWhatsApp?: boolean;      // Número tem WhatsApp
    operator?: string;         // "Vivo", "Claro", "Tim", "Oi"
  }
]
```

---

### 5. `emails` (JSONB Array)

Lista de emails com validação.

```typescript
[
  {
    email: string;             // "contato@empresa.com.br"
    type?: string;             // "Pessoal", "Profissional"
    typeCode?: number;
    score?: number;            // 0-10 (qualidade validação)
    ranking?: number;          // YYYYMMDD
    createDate?: string;       // ISO 8601
    status?: number;           // 0:History, 1:Active, 2:Verified, 3:Hot
    verified?: boolean;        // Email verificado/validado
    deliverable?: boolean;     // Email existe e aceita mensagens
    domain?: string;           // "empresa.com.br"
    isDisposable?: boolean;    // Email temporário/descartável
  }
]
```

---

### 6. `enderecos` (JSONB Array)

Endereços residenciais/comerciais com geolocalização.

```typescript
[
  {
    street: string;            // "Rua das Flores"
    number?: string;           // "123", "S/N"
    complement?: string;       // "Apto 45", "Bloco B"
    district?: string;         // "Centro", "Jardim Paulista"
    city: string;              // "São Paulo"
    state: string;             // "SP"
    zipCode: string;           // "01310-100"
    type?: string;             // "Rua", "Avenida", "Travessa"
    title?: string;            // "Rua", "Av."
    score?: number;            // 0-10 (qualidade endereço)
    isFiscalAddress?: boolean; // Endereço fiscal/principal
    geolocation?: {
      latitude: number;        // -23.5505199
      longitude: number;       // -46.6333094
    };
    dneId?: number;            // ID no Diretório Nacional de Endereços
    ibge?: number;             // Código IBGE cidade
    censusSector?: number;     // Setor censitário
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 7. `enderecos_comerciais` (JSONB Array)

Endereços comerciais vinculados a empresas.

```typescript
[
  {
    street: string;
    number?: string;
    complement?: string;
    district?: string;
    city: string;
    state: string;
    zipCode: string;
    companyDocument: string;   // CNPJ da empresa
    companyName: string;       // Razão social
    isHeadquarters?: boolean;  // É matriz
    isActive?: boolean;        // Filial ativa
    // ... demais campos iguais a enderecos
  }
]
```

---

### 8. `imoveis` (JSONB Array)

Imóveis registrados em nome do CPF/CNPJ.

```typescript
[
  {
    zipCode: string;           // "01310-100"
    propertyType: string;      // "Apartamento", "Casa", "Terreno", "Sala Comercial"
    estimatedValue?: number;   // Valor estimado em centavos
    estimatedValueFormatted?: string; // "R$ 1.850.000,00"
    acquisitionDate?: string;  // "15/03/2018" (DD/MM/YYYY)
    area?: number;             // Área em m²
    socialClass?: string;      // "Classe A", "Classe B", etc.
    city?: string;             // "São Paulo"
    state?: string;            // "SP"
    district?: string;         // Bairro
    registrationNumber?: string; // Matrícula do imóvel
    ownership?: string;        // "Proprietário", "Usufrutuário"
    hasLien?: boolean;         // Possui ônus/gravame
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 9. `veiculos` (JSONB Array)

Veículos registrados em nome do CPF/CNPJ.

```typescript
[
  {
    plate: string;             // "ABC-1234"
    brand: string;             // "MERCEDES-BENZ"
    model: string;             // "GLE 450"
    year: string;              // "2022" ou "2022/2023"
    category: string;          // "SUV", "Sedan", "Hatchback", "Pickup"
    chassi?: string;           // "9BWZZZ377VT004251"
    renavam?: string;          // Código RENAVAM
    color?: string;            // "Preto", "Prata"
    fuel?: string;             // "Gasolina", "Flex", "Diesel", "Elétrico"
    ownership?: string;        // "Proprietário", "Arrendatário"
    registrationDate?: string; // Data registro (DD/MM/YYYY)
    estimatedValue?: number;   // Valor estimado FIPE (centavos)
    hasRestriction?: boolean;  // Possui restrição (roubo, alienação)
    restrictionType?: string;  // "Alienação Fiduciária", "Roubo/Furto"
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 10. `relacionamentos` (JSONB Array)

Pessoas relacionadas (familiares, sócios, procuradores).

```typescript
[
  {
    document: string;          // CPF ou CNPJ formatado
    documentRaw?: number;      // Documento sem formatação
    documentType: string;      // "CPF", "CNPJ"
    documentTypeCode?: number; // 0:CPF, 1:CNPJ
    name: string;              // Nome completo
    relationType: string;      // "Cônjuge", "Filho", "Sócio", "Procurador"
    relationTypeCode?: number;
    participationPercent?: number; // % participação sociedade
    activityDescription?: string; // Descrição atividade
    companyDocument?: string;  // CNPJ empresa relacionada
    companyName?: string;      // Nome empresa relacionada
    startDate?: string;        // Data início relação
    endDate?: string;          // Data fim relação
    isActive?: boolean;        // Relação ativa
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 11. `sociedades` (JSONB Array)

Empresas onde o CPF/CNPJ é sócio.

```typescript
[
  {
    document: string;          // CNPJ empresa
    documentRaw?: number;
    name: string;              // Razão social
    fantasyName?: string;      // Nome fantasia
    cnaes?: string[];          // ["4711-3/02", "4744-0/01"]
    primaryCnae?: string;      // CNAE principal
    totalEmployees?: number;   // Número funcionários
    businessSize?: string;     // "MEI", "Micro", "Pequena", "Média", "Grande"
    businessSizeCode?: number;
    revenue?: number;          // Faturamento presumido (centavos)
    participationPercent?: number; // % participação
    role?: string;             // "Sócio Administrador", "Sócio"
    admissionDate?: string;    // Data entrada sociedade
    withdrawalDate?: string;   // Data saída sociedade
    isActive?: boolean;        // Sociedade ativa
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 12. `empresas_correlacionadas` (JSONB Array)

Empresas correlacionadas via sócios em comum.

```typescript
[
  {
    document: string;          // CNPJ
    documentRaw?: number;
    name: string;              // Razão social
    relationType: string;      // "Mesmo sócio", "Grupo econômico"
    commonPartner?: string;    // Nome sócio em comum
    commonPartnerDocument?: string; // CPF sócio
    // ... demais campos similares a sociedades
  }
]
```

---

### 13. `atividades_profissionais` (JSONB Array)

CBOs (PF) ou CNAEs (PJ).

```typescript
[
  {
    code: string;              // "141405" (CBO) ou "4711-3/02" (CNAE)
    description: string;       // "Comerciante Atacadista" ou "Comércio varejista"
    type: string;              // "CBO", "CNAE"
    isPrimary?: boolean;       // Atividade principal
    startDate?: string;        // Data início atividade
    endDate?: string;          // Data fim atividade
    isActive?: boolean;        // Atividade ativa
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 14. `empregos` (JSONB Array)

Histórico profissional (apenas PF).

```typescript
[
  {
    companyDocument: string;   // CNPJ empregador
    companyName: string;       // Nome empresa
    role: string;              // "Gerente de Vendas"
    cboCode?: string;          // Código CBO
    admissionDate?: string;    // Data admissão (DD/MM/YYYY)
    terminationDate?: string;  // Data demissão
    salary?: number;           // Último salário (centavos)
    department?: string;       // "Vendas", "TI"
    isActive?: boolean;        // Vínculo ativo
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 15. `midias_negativas` (JSONB Array)

Notícias e publicações negativas.

```typescript
[
  {
    title: string;             // "Polícia aponta ex-secretário como líder de esquema"
    category: string;          // "Investigação Criminal", "Processo Judicial"
    impact: string;            // "baixo", "medio", "alto", "critico"
    impactCode?: number;       // 0:baixo, 1:medio, 2:alto, 3:critico
    date?: string;             // "02/04/2025" (DD/MM/YYYY)
    source?: string;           // "Diário da Justiça - TJTO"
    url?: string;              // Link notícia
    summary?: string;          // Resumo conteúdo
    keywords?: string[];       // ["corrupção", "falsificação"]
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 16. `processos_judiciais` (JSONB Array)

Processos judiciais detalhados.

```typescript
[
  {
    number: string;            // "10297372920244013200" (CNJ)
    area: string;              // "Cível", "Criminal", "Trabalhista", "Juizado Especial"
    type: string;              // "Mandado de Segurança", "Ação Penal"
    relation: string;          // "Autor", "Réu", "Terceiro"
    value?: number;            // Valor causa (centavos)
    valueFormatted?: string;   // "R$ 1.412,00"
    status: string;            // "Em Tramitação", "Arquivamento Definitivo"
    statusCode?: number;       // Código status
    court?: string;            // "TRT-13", "TJSP"
    filingDate?: string;       // Data distribuição (DD/MM/YYYY)
    lastUpdate?: string;       // Última movimentação
    parties?: Array<{          // Partes do processo
      name: string;
      role: string;            // "Autor", "Réu", "Advogado"
      document?: string;
    }>;
    subject?: string;          // Assunto principal
    level?: string;            // "1ª Instância", "2ª Instância", "Superior"
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 17. `protestos` (JSONB Array)

Protestos em cartório.

```typescript
[
  {
    date: string;              // "15/03/2023" (DD/MM/YYYY)
    value: number;             // Valor em centavos
    valueFormatted?: string;   // "R$ 12.450,00"
    type: string;              // "ICMS", "Duplicata", "Nota Promissória"
    creditor?: string;         // Nome credor
    debtor: string;            // "XYZ DISTRIBUIDORA LTDA"
    notaryOffice?: string;     // Cartório
    city?: string;             // Cidade
    state?: string;            // UF
    canceled?: boolean;        // Protesto cancelado
    cancelDate?: string;       // Data cancelamento
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 18. `debitos` (JSONB Array)

Pendências financeiras diversas.

```typescript
[
  {
    type: string;              // "Tributo Federal", "FGTS", "Crédito Bancário"
    description: string;       // Descrição débito
    value?: number;            // Valor (centavos)
    dueDate?: string;          // Vencimento (DD/MM/YYYY)
    origin: string;            // "Receita Federal", "Caixa Econômica"
    status?: string;           // "Em aberto", "Quitado", "Parcelado"
    installments?: number;     // Número parcelas
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 19. `divida_ativa` (JSONB Array)

Dívida ativa PGFN (Procuradoria Geral da Fazenda Nacional).

```typescript
[
  {
    debtType: string;          // "IRPF", "INSS", "FGTS"
    inscriptionNumber: string; // Número inscrição dívida ativa
    value: number;             // Valor (centavos)
    valueFormatted?: string;   // "R$ 89.322,00"
    situation: string;         // "Ativa", "Parcelada", "Suspensa"
    inscriptionDate?: string;  // Data inscrição (DD/MM/YYYY)
    issuer: string;            // "PGFN", "Secretaria da Fazenda"
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 20. `restricoes` (JSONB Array)

Restrições cadastrais (OAF, Interpol, PEP).

```typescript
[
  {
    type: string;              // "OAF", "Interpol", "PEP", "CEIS", "CNEP"
    description: string;       // Descrição restrição
    entity: string;            // Órgão responsável
    startDate?: string;        // Data início (DD/MM/YYYY)
    endDate?: string;          // Data fim
    severity: string;          // "baixo", "medio", "alto", "critico"
    isActive: boolean;         // Restrição ativa
    details?: string;          // Detalhes adicionais
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 21. `marcadores` (JSONB Array)

Marcadores gerais (PEP, FI, CADE).

```typescript
[
  {
    markerType: string;        // "PEP", "FI", "CADE", "VIP"
    description: string;       // Descrição marcador
    date?: string;             // Data marcação (DD/MM/YYYY)
    isActive: boolean;         // Marcador ativo
    source?: string;           // Fonte informação
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 22. `referencias_bancarias` (JSONB Array)

Referências bancárias.

```typescript
[
  {
    bank: string;              // "Banco do Brasil", "Itaú"
    bankCode?: string;         // "001", "341"
    agency?: string;           // "1234-5"
    account?: string;          // "12345-6"
    accountType?: string;      // "Corrente", "Poupança"
    openingDate?: string;      // Data abertura (DD/MM/YYYY)
    status?: string;           // "Ativa", "Encerrada"
    hasCredit?: boolean;       // Possui crédito aprovado
    creditLimit?: number;      // Limite crédito (centavos)
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 23. `cheques_sem_fundo` (JSONB Array)

Cheques devolvidos.

```typescript
[
  {
    bank: string;              // "Banco Bradesco"
    bankCode?: string;         // "237"
    agency?: string;           // "1234"
    checkNumber: string;       // Número cheque
    amount: number;            // Valor (centavos)
    amountFormatted?: string;  // "R$ 1.500,00"
    date: string;              // Data devolução (DD/MM/YYYY)
    reason: string;            // "Saldo Insuficiente"
    alinea?: string;           // Código alínea (11, 12, etc.)
    status?: string;           // "Ativo", "Regularizado"
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 24. `restituicoes_irpf` (JSONB Array)

Restituições Imposto de Renda Pessoa Física.

```typescript
[
  {
    year: number;              // 2023
    amount: number;            // Valor (centavos)
    amountFormatted?: string;  // "R$ 1.250,00"
    batchNumber?: string;      // "3º lote"
    status: string;            // "Disponível", "Creditado", "Pendente"
    paymentDate?: string;      // Data crédito (DD/MM/YYYY)
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 25. `assistencias` (JSONB Array)

Benefícios sociais (Bolsa Família, BPC, etc.).

```typescript
[
  {
    program: string;           // "Bolsa Família", "BPC"
    benefitType: string;       // "Transferência de Renda"
    value?: number;            // Valor mensal (centavos)
    startDate?: string;        // Data início (DD/MM/YYYY)
    endDate?: string;          // Data fim
    nis?: string;              // Número NIS
    status: string;            // "Ativo", "Bloqueado", "Cancelado"
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 26. `servicos` (JSONB Array)

Serviços contratados (telefonia, TV, internet).

```typescript
[
  {
    provider: string;          // "Vivo", "Sky", "NET"
    serviceType: string;       // "Telefonia", "TV", "Internet", "Água", "Energia"
    plan?: string;             // Nome plano
    contractDate?: string;     // Data contratação (DD/MM/YYYY)
    status: string;            // "Ativo", "Cancelado", "Suspenso"
    monthlyValue?: number;     // Valor mensal (centavos)
    ranking?: number;
    createDate?: string;
    statusData?: number;
  }
]
```

---

### 27. `doacoes_politicas` (JSONB Array)

Doações para partidos políticos.

```typescript
[
  {
    party: string;             // "PT", "PSDB"
    candidateName?: string;    // Nome candidato beneficiado
    electionYear: number;      // 2022
    amount: number;            // Valor doação (centavos)
    amountFormatted?: string;  // "R$ 10.000,00"
    donationType: string;      // "Campanha", "Partido"
    date?: string;             // Data doação (DD/MM/YYYY)
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 28. `cargos_publicos` (JSONB Array)

Cargos e atividades no setor público.

```typescript
[
  {
    role: string;              // "Secretário Municipal", "Vereador"
    entity: string;            // Nome órgão/entidade
    entityType: string;        // "Municipal", "Estadual", "Federal"
    startDate?: string;        // Data início (DD/MM/YYYY)
    endDate?: string;          // Data fim
    salary?: number;           // Remuneração (centavos)
    isPEP: boolean;            // É Pessoa Politicamente Exposta
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 29. `websites` (JSONB Array)

Domínios e websites.

```typescript
[
  {
    domain: string;            // "empresa.com.br"
    registrationDate?: string; // Data registro (DD/MM/YYYY)
    expirationDate?: string;   // Data expiração
    registrar?: string;        // "Registro.br", "GoDaddy"
    isActive: boolean;         // Domínio ativo
    hasWebsite?: boolean;      // Possui site online
    ssl?: boolean;             // Possui certificado SSL
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 30. `redes_sociais` (JSONB Array)

Perfis em redes sociais.

```typescript
[
  {
    platform: string;          // "LinkedIn", "Facebook", "Instagram", "Twitter"
    username?: string;         // Handle/username
    url: string;               // URL perfil
    followers?: number;        // Número seguidores
    verified?: boolean;        // Perfil verificado
    lastUpdate?: string;       // Última atualização (DD/MM/YYYY)
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 31. `outros_documentos` (JSONB Array)

Outros documentos (RG, CNH, OAB, CRM, etc.).

```typescript
[
  {
    docType: string;           // "RG", "CNH", "Título Eleitor", "PIS", "NIS", "OAB", "CRM"
    docTypeCode?: number;      // Código tipo (0:CPF, 1:CNPJ, 2:IE, 3:NIRE, 4:Titulo, 5:RG, 6:PIS, 7:NIS, 8:CNH, 9:OAB, 10:CRM)
    number: string;            // Número documento
    state?: string;            // UF emissão
    expeditionDate?: string;   // Data emissão (DD/MM/YYYY)
    expirationDate?: string;   // Data validade
    issuer?: string;           // Órgão emissor
    additionalData?: object;   // Dados específicos por tipo
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 32. `titulo_eleitor` (JSONB)

Dados do título de eleitor.

```typescript
{
  zone?: number;               // Zona eleitoral
  section?: number;            // Seção eleitoral
  issuer?: string;             // Emissor título
  votingLocation?: {           // Local votação
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    type?: string;
    title?: string;
  };
  ranking?: number;
  createDate?: string;
  status?: number;
}
```

---

### 33. `sumario_processos` (JSONB)

Sumarização de processos judiciais.

```typescript
{
  totalProcesses: number;      // Total processos
  byArea: {                    // Processos por área
    civil?: number;
    criminal?: number;
    trabalhista?: number;
    juizado?: number;
    outros?: number;
  };
  byStatus: {                  // Processos por status
    emTramitacao?: number;
    arquivados?: number;
    suspensos?: number;
    transitadoJulgado?: number;
  };
  byRelation: {                // Processos por relação
    autor?: number;
    reu?: number;
    terceiro?: number;
  };
  totalValue?: number;         // Valor total causas (centavos)
  avgValue?: number;           // Valor médio (centavos)
  oldestProcess?: {            // Processo mais antigo
    number: string;
    date: string;
  };
  newestProcess?: {            // Processo mais recente
    number: string;
    date: string;
  };
}
```

---

### 34. `modelos_estatisticos` (JSONB Array)

Modelos estatísticos e scores customizados PH3A.

```typescript
[
  {
    modelId: number;           // ID modelo
    modelName: string;         // "Propensão Inadimplência"
    score: number;             // Score (0-1000)
    probability?: number;      // Probabilidade (0-1)
    classification?: string;   // "Baixo Risco", "Alto Risco"
    variables?: object;        // Variáveis usadas no modelo
    ranking?: number;
    createDate?: string;
    status?: number;
  }
]
```

---

### 35. `historico_consultas` (JSONB Array)

Histórico de consultas ao CPF/CNPJ.

```typescript
[
  {
    queryDate: string;         // "15/03/2023 14:32:00"
    queryType: string;         // "Consulta Completa", "Score"
    requestingDocument?: string; // CPF/CNPJ solicitante
    requestingName?: string;   // Nome solicitante
    source?: string;           // Fonte consulta
  }
]
```

---

## Campos de Metadados e Controle

### `raw_response` (JSONB)

Backup completo da resposta original da API PH3A para troubleshooting e auditoria.

```typescript
{
  // Resposta JSON completa original da API sem transformações
  ContactId?: number;
  SequencialId?: number;
  Document?: number;
  // ... todos os campos originais
}
```

---

### `metadados` (JSONB)

Metadados adicionais customizados.

```typescript
{
  versao_parser?: string;      // Versão do parser usado
  fonte_integracao?: string;   // "API_DIRETA", "WEBHOOK", "BATCH"
  usuario_solicitante_id?: string; // UUID usuário
  observacoes?: string;        // Observações livres
  tags?: string[];             // Tags customizadas
  [key: string]: any;          // Campos customizados
}
```

---

## Queries de Exemplo

### Buscar dossiês com score de crédito alto

```sql
SELECT
  id,
  lead_id,
  document_number,
  (scores->>'creditScore'->>'d00')::int AS credit_score_atual
FROM ph3a_dossier
WHERE status = 'concluido'
  AND (scores->'creditScore'->>'d00')::int > 700
ORDER BY credit_score_atual DESC;
```

### Buscar leads com processos judiciais criminais

```sql
SELECT
  d.id,
  d.document_number,
  jsonb_array_length(d.processos_judiciais) AS total_processos
FROM ph3a_dossier d
WHERE status = 'concluido'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(d.processos_judiciais) AS p
    WHERE p->>'area' = 'Criminal'
  );
```

### Buscar leads com mídias negativas de alto impacto

```sql
SELECT
  d.id,
  d.document_number,
  m->>'title' AS noticia_titulo,
  m->>'impact' AS nivel_impacto
FROM ph3a_dossier d,
     jsonb_array_elements(d.midias_negativas) AS m
WHERE status = 'concluido'
  AND m->>'impact' IN ('alto', 'critico')
ORDER BY d.created_at DESC;
```

### Buscar leads com patrimônio veicular significativo

```sql
SELECT
  d.id,
  d.document_number,
  jsonb_array_length(d.veiculos) AS total_veiculos,
  v->>'brand' AS marca,
  v->>'model' AS modelo,
  v->>'year' AS ano
FROM ph3a_dossier d,
     jsonb_array_elements(d.veiculos) AS v
WHERE status = 'concluido'
  AND v->>'brand' IN ('MERCEDES-BENZ', 'BMW', 'PORSCHE', 'AUDI')
ORDER BY d.created_at DESC;
```

---

## Considerações de Performance

### Índices GIN JSONB

Os índices GIN criados permitem queries eficientes em campos JSONB:

```sql
-- Busca em scores
SELECT * FROM ph3a_dossier
WHERE scores @> '{"creditScore": {"d00": 800}}';

-- Busca em telefones com PROCON
SELECT * FROM ph3a_dossier
WHERE telefones @> '[{"proconFlag": true}]';
```

### Paginação Recomendada

Para queries grandes, sempre use paginação:

```sql
SELECT * FROM ph3a_dossier
WHERE empresa_solicitante_id = 'uuid-empresa'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

---

## Compliance LGPD

### Campos Sensíveis

Os seguintes campos contêm dados pessoais sensíveis (Lei 13.709/2018 Art. 5º):

- `dados_pessoais` - Nome, CPF, filiação, data nascimento
- `telefones` - Números telefone
- `emails` - Endereços email
- `enderecos` - Endereços residenciais
- `processos_judiciais` - Processos criminais
- `midias_negativas` - Notícias criminais
- `restricoes` - Restrições cadastrais
- `titulo_eleitor` - Dados eleitorais

### Anonimização para Relatórios

```sql
-- Exemplo de query anonimizada
SELECT
  SUBSTRING(document_number, 1, 3) || '.***.**' || SUBSTRING(document_number, -2) AS cpf_anonimizado,
  (scores->'creditScore'->>'d00')::int AS score,
  jsonb_array_length(processos_judiciais) AS total_processos
FROM ph3a_dossier
WHERE status = 'concluido';
```

---

## Expiração de Dados

Dossiês expiram em **90 dias** por padrão (`data_expiracao`).

### Job de Limpeza Automática

```sql
-- Marcar dossiês expirados
UPDATE ph3a_dossier
SET status = 'expirado'
WHERE data_expiracao < CURRENT_DATE
  AND status IN ('concluido', 'parcial');
```

### View de Dossiês Válidos

```sql
-- Usar sempre a view para dados válidos
SELECT * FROM ph3a_dossier_validos
WHERE empresa_solicitante_id = 'uuid-empresa';
```

---

## Referências

- **API OpenAPI**: `/docs/ph3a/openapi-databusca.json`
- **Mock Frontend**: `/docs/ph3a/datadossie-mock-frontend.js`
- **Migration**: `/supabase/migrations/20251204000000_create_ph3a_dossier_tables.js`
- **LGPD**: Lei 13.709/2018
- **PH3A Documentação**: (adicionar link quando disponível)
