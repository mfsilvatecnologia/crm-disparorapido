# Campaign Contacts Management

Esta implementação adiciona funcionalidades completas para gerenciar contatos nas campanhas, seguindo exatamente as especificações do swagger fornecido.

## APIs Implementadas

### 1. POST /campanha/{id}/contacts
- **Endpoint**: `POST /campanha/{id}/contacts`
- **Função**: `addContactsToCampaign(campaignId: string, contactIds: string[])`
- **Descrição**: Adiciona contatos à campanha usando uma lista de IDs
- **Request Body**: 
  ```json
  {
    "contact_ids": ["uuid1", "uuid2", "uuid3"]
  }
  ```
- **Response**: Lista de objetos `CampaignContact` adicionados

### 2. GET /campanha/{id}/contacts
- **Endpoint**: `GET /campanha/{id}/contacts?ordering_strategy={strategy}`
- **Função**: `fetchCampaignContacts(campaignId: string, params?: CampaignContactsParams)`
- **Descrição**: Lista todos os contatos da campanha
- **Query Parameters**:
  - `ordering_strategy`: `'alphabetical' | 'random'` (opcional, padrão: 'alphabetical')
- **Response**: Lista de objetos `CampaignContact`
- **Tratamento de Erros**: Suporte para erro 423 (fora do horário de envio)

### 3. DELETE /campanha/{id}/contacts/{contact_id}
- **Endpoint**: `DELETE /campanha/{id}/contacts/{contact_id}`
- **Função**: `removeContactFromCampaign(campaignId: string, contactId: string)`
- **Descrição**: Remove um contato específico da campanha
- **Response**: Status 204 (No Content)

## Componentes React

### CampaignContactsList
Componente para listar e gerenciar contatos da campanha:

**Funcionalidades**:
- Listagem de contatos com informações detalhadas
- Filtro de busca por ID do contato
- Opções de ordenação (alfabética/aleatória)
- Exibição de métricas por contato (emails enviados, abertos, cliques, etc.)
- Botão de remoção individual de contatos
- Indicadores visuais de status (badges coloridos)
- Tratamento de estados de loading e erro

**Props**:
```typescript
interface CampaignContactsListProps {
  campaignId: string
}
```

### AddContactsToCampaign
Componente para adicionar novos contatos à campanha:

**Funcionalidades**:
- Modo individual: adiciona um contato por vez
- Modo em lote: adiciona múltiplos contatos (via texto separado por vírgula ou quebra de linha)
- Validação de IDs duplicados
- Preview dos contatos selecionados com remoção individual
- Contador de contatos selecionados
- Feedback de sucesso/erro
- Dicas de uso para o usuário

**Props**:
```typescript
interface AddContactsToCampaignProps {
  campaignId: string
}
```

### CampaignContactsManager
Componente principal que combina as funcionalidades:

**Funcionalidades**:
- Sistema de abas para alternar entre listagem e adição
- Interface unificada para gerenciamento completo
- Integração automática entre componentes

**Props**:
```typescript
interface CampaignContactsManagerProps {
  campaignId: string
}
```

## Hooks React Query

### useCampaignContacts
Hook para buscar contatos da campanha:

```typescript
const { data: contacts, isLoading, error } = useCampaignContacts(
  campaignId: string,
  params?: CampaignContactsParams
)
```

**Parâmetros**:
- `campaignId`: ID da campanha
- `params.ordering_strategy`: Estratégia de ordenação ('alphabetical' | 'random')

**Recursos**:
- Cache automático (2 minutos)
- Revalidação automática
- Tratamento de erro

### useAddContactsToCampaign
Hook para adicionar contatos:

```typescript
const addContactsMutation = useAddContactsToCampaign()

addContactsMutation.mutate({
  campaignId: string,
  contactIds: string[]
})
```

**Recursos**:
- Invalidação automática do cache após sucesso
- Toast notifications de sucesso/erro
- Estado de loading

### useRemoveContactFromCampaign
Hook para remover contatos:

```typescript
const removeContactMutation = useRemoveContactFromCampaign()

removeContactMutation.mutate({
  campaignId: string,
  contactId: string
})
```

**Recursos**:
- Invalidação automática do cache após sucesso
- Toast notifications de sucesso/erro
- Estado de loading

## Tipos TypeScript

### Novos tipos adicionados:
```typescript
// Request/Response types baseados no swagger
export interface AddContactsToCampaignRequest {
  contact_ids: string[]
}

export interface AddContactsToCampaignResponse {
  success: boolean
  data: CampaignContact[]
}

export interface ListCampaignContactsResponse {
  success: boolean
  data: CampaignContact[]
}

export interface CampaignContactsParams {
  ordering_strategy?: 'alphabetical' | 'random'
}

export interface CampaignContactsErrorResponse {
  success: false
  error: string
  next_available_time?: string
}
```

## Exemplo de Uso

### Em uma página de detalhes da campanha:

```typescript
import { CampaignContactsManager } from '@/features/campaigns'

function CampaignDetailsPage() {
  const { id } = useParams()
  
  return (
    <div>
      {/* Outras informações da campanha */}
      
      <CampaignContactsManager campaignId={id} />
    </div>
  )
}
```

### Uso individual dos componentes:

```typescript
import { 
  CampaignContactsList,
  AddContactsToCampaign 
} from '@/features/campaigns'

function CustomCampaignPage() {
  return (
    <div className="space-y-6">
      <AddContactsToCampaign campaignId="campaign-id" />
      <CampaignContactsList campaignId="campaign-id" />
    </div>
  )
}
```

## Tratamento de Erros

A implementação inclui tratamento específico para:

- **400**: Dados inválidos
- **401**: Não autorizado
- **404**: Campanha ou contato não encontrado
- **423**: Fora do horário de envio (caso específico do GET)

## UX/UI Features

- **Loading states**: Spinners e skeletons durante carregamento
- **Empty states**: Mensagens amigáveis quando não há dados
- **Error states**: Mensagens de erro claras e acionáveis
- **Toast notifications**: Feedback imediato para ações do usuário
- **Confirmações**: Modais de confirmação para ações destrutivas
- **Responsive design**: Interface adaptável para diferentes tamanhos de tela
- **Acessibilidade**: Labels apropriados e navegação por teclado

## Integração com Backend

Os endpoints seguem exatamente o formato especificado no swagger:
- Autenticação via `bearerAuth`
- Headers corretos (`Content-Type: application/json`)
- Status codes apropriados
- Estrutura de resposta padronizada

A implementação está pronta para ser conectada com o backend real, seguindo as especificações fornecidas.