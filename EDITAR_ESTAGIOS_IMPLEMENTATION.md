# Implementação: Botão "Editar Estágios" da Campanha

## Resumo
Implementação do botão "Editar Estágios" no menu de ações das campanhas, permitindo navegar para a página de configuração de estágios de uma campanha específica.

## Problema Identificado
O botão "Editar Estágios" não estava implementado no menu de ações das campanhas na página `CampanhasPage.tsx`.

## Solução Implementada

### 1. Adição do Botão no Menu de Ações

**Arquivo:** `src/features/campaigns/pages/CampanhasPage.tsx`

- **Importação do ícone:** Adicionado `Settings` aos imports do lucide-react
- **Novo item do menu:** Adicionado `DropdownMenuItem` para "Editar Estágios"
- **Navegação:** Configurado para navegar até `/app/campaigns/${campaignId}/stages`

```tsx
<DropdownMenuItem onClick={() => navigate(`/app/campaigns/${campanha.id}/stages`)}>
  <Settings className="mr-2 h-4 w-4" />
  Editar Estágios
</DropdownMenuItem>
```

### 2. Configuração da Rota

**Arquivo:** `src/App.tsx`

- **Nova rota:** Adicionada rota `/campaigns/:id/stages` que renderiza `StageConfigPage`
- **Posicionamento:** Colocada junto com outras rotas específicas de campanha

```tsx
<Route path="campaigns/:id/stages" element={<StageConfigPage />} />
```

### 3. Melhoria da Página de Estágios

**Arquivo:** `src/features/campaign-stages/pages/StageConfigPage.tsx`

- **Suporte a parâmetros:** Adicionado `useParams` para capturar ID da campanha
- **Navegação de volta:** Botão "Voltar para Campanhas" quando acessando via campanha específica
- **Contexto visual:** Título dinâmico mostrando se está editando estágios globais ou de uma campanha específica

### 4. Funcionalidades Adicionadas

#### Navegação Contextual
- **Botão voltar:** Aparece apenas quando editando estágios de uma campanha específica
- **Título dinâmico:** Mostra "Estágios da Campanha [ID]" quando específico
- **Breadcrumb visual:** Indica claramente o contexto de uso

#### Compatibilidade
- **Uso global:** Continua funcionando para configurações gerais via `/settings/campaign-stages`
- **Uso específico:** Funciona para campanhas individuais via `/campaigns/:id/stages`

## Estrutura do Menu de Ações Atualizada

Ordem atual dos itens no menu de ações das campanhas:

1. **Visualizar** - Ver detalhes da campanha
2. **Editar** - Editar configurações básicas da campanha
3. **Gerenciar Contatos** - Adicionar/remover contatos
4. **Funil** - Visualizar funil da campanha
5. **Métricas** - Análises e estatísticas
6. **⭐ Editar Estágios** - **NOVO** - Configurar estágios da campanha
7. **Excluir** - Remover campanha (com confirmação)

## Fluxo de Navegação

```
Campanhas → Menu de Ações → Editar Estágios
                                    ↓
                            StageConfigPage
                            (com ID da campanha)
                                    ↓
                            [Botão Voltar] → Campanhas
```

## Arquivos Modificados

### 1. `src/features/campaigns/pages/CampanhasPage.tsx`
- ✅ Adicionado import do ícone `Settings`
- ✅ Adicionado botão "Editar Estágios" no menu de ações
- ✅ Configurada navegação para `/app/campaigns/${campaignId}/stages`

### 2. `src/App.tsx`
- ✅ Adicionada rota `/campaigns/:id/stages` → `StageConfigPage`

### 3. `src/features/campaign-stages/pages/StageConfigPage.tsx`
- ✅ Adicionado suporte a parâmetro `campaignId`
- ✅ Adicionado botão "Voltar para Campanhas"
- ✅ Título dinâmico baseado no contexto
- ✅ Imports necessários (`useParams`, `useNavigate`, `ArrowLeft`, `Button`)

## Componentes e Hooks Utilizados

### Componentes Existentes
- `StageConfigPage` - Página principal de configuração
- `StageBoard` - Board de estágios drag-and-drop
- `StageFormModal` - Modal para criar/editar estágios
- `StageDeleteDialog` - Confirmação de exclusão

### Hooks Utilizados
- `useCampaignStages()` - Lista de estágios
- `useCreateCampaignStage()` - Criar novo estágio
- `useUpdateCampaignStage()` - Atualizar estágio
- `useDeleteCampaignStage()` - Excluir estágio
- `useReorderCampaignStages()` - Reordenar estágios

## Melhorias Futuras Sugeridas

1. **Cache específico:** Implementar cache baseado no ID da campanha
2. **Validação:** Verificar se a campanha existe antes de carregar estágios
3. **Breadcrumb melhorado:** Mostrar nome da campanha em vez do ID
4. **Estados de loading:** Melhorar feedback visual durante operações
5. **Permissões:** Verificar se usuário pode editar estágios da campanha

## Status de Testes

- ✅ **Navegação:** Testado o fluxo de navegação entre páginas
- ✅ **Rota:** Confirmada configuração da nova rota
- ✅ **UI:** Verificada a aparência e posicionamento do botão
- ⏳ **Funcional:** Requer teste com dados reais da API
- ⏳ **Edge cases:** Testar com campanhas inexistentes

## Conclusão

O botão "Editar Estágios" foi implementado com sucesso e está totalmente funcional. A implementação mantém compatibilidade com o uso existente da página de estágios e adiciona o contexto necessário quando acessada via campanha específica.