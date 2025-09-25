# Monitoramento de Workers

Este documento explica como configurar e usar o sistema de monitoramento de workers em tempo real.

## 📋 Visão Geral

O sistema de monitoramento permite acompanhar o status dos workers e o progresso dos jobs de scraping em tempo real usando Supabase Realtime.

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real**: Acompanhe workers ativos e jobs em execução
- **Status dos Workers**: Visualize status, contadores de erro e métricas
- **Histórico de Jobs**: Veja o progresso dos jobs de scraping
- **Interface Intuitiva**: Dashboard completo com cards e indicadores visuais

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Configurar Supabase

1. **Criar Projeto**: Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. **Obter Credenciais**: Copie a URL do projeto e a chave anônima
3. **Configurar Realtime**: As tabelas e triggers devem ser configurados no backend

## 📱 Como Usar

### Acessar o Monitor

1. Faça login na aplicação
2. No menu lateral, clique em **"Workers"**
3. A página de monitoramento será carregada automaticamente

### Funcionalidades da Interface

#### Cards de Workers
- **Status Visual**: Ícones coloridos indicando o estado do worker
- **Métricas**: Contadores de erro, consumidores ativos, último processamento
- **Tipo de Worker**: Identificação clara do tipo (leads_temp_import, message_consumer)

#### Lista de Jobs
- **Status dos Jobs**: Visualização do progresso de scraping
- **Métricas**: Leads encontrados, inseridos, páginas processadas
- **Histórico**: Últimas 50 execuções mantidas em memória

#### Controles
- **Iniciar/Parar Monitoramento**: Controle manual do monitoramento
- **Limpar Dados**: Reset dos dados exibidos
- **Status de Conexão**: Indicador visual da conexão com Supabase

## 🔧 Arquitetura Técnica

### Componentes Principais

#### `SupabaseRealtimeService`
- Gerencia a conexão com Supabase
- Inscreve-se nos canais de broadcast
- Processa mensagens em tempo real

#### `useWorkerMonitor` Hook
- Estado centralizado do monitoramento
- Gerenciamento de inscrições
- Tratamento de erros e reconexões

#### `WorkerMonitorPage` Component
- Interface principal do usuário
- Renderização dos dados em tempo real
- Controles interativos

### Canais de Broadcast

#### `workers_status`
- Evento: `worker_status_update`
- Payload: Status completo do worker

#### `scraping_jobs`
- Evento: `job_progress_update`
- Payload: Progresso do job de scraping

## 📊 Estrutura dos Dados

### Worker Status Update
```typescript
interface WorkerStatusUpdate {
  workerId: string;
  workerType: 'leads_temp_import' | 'message_consumer';
  status: 'running' | 'stopped' | 'error';
  isRunning: boolean;
  errorCount: number;
  maxErrors: number;
  lastProcessedTime?: string;
  config?: any;
  consumerCount?: number;
  timestamp: string;
}
```

### Scraping Job Update
```typescript
interface ScrapingJobUpdate {
  jobId: string;
  status: string;
  leadsEncontrados: number;
  leadsInseridos: number;
  paginasProcessadas: number;
  erroDetalhes?: string;
  tempoExecucaoMs?: number;
  timestamp: string;
}
```

## 🔍 Debugging

### Logs Disponíveis

O sistema gera logs detalhados no console do navegador:

- **Conexão**: Status de conexão com Supabase
- **Workers**: Atualizações de status recebidas
- **Jobs**: Progresso dos jobs de scraping
- **Erros**: Problemas de conexão ou validação

### Verificação de Conexão

Para verificar se a configuração está correta:

1. Abra o console do navegador (F12)
2. Vá para a página de Workers
3. Procure por mensagens como:
   - ✅ `Subscribed to worker status updates`
   - ✅ `Subscribed to scraping job updates`
   - ✅ `Conexão com Supabase estabelecida`

## 🚨 Troubleshooting

### Problema: "Variáveis de ambiente do Supabase não configuradas"

**Solução**: Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão definidas no arquivo `.env`.

### Problema: "Falha ao conectar com Supabase"

**Solução**:
1. Verifique se a URL e chave do Supabase estão corretas
2. Confirme se o projeto Supabase está ativo
3. Verifique as regras de Row Level Security (RLS)

### Problema: Workers não aparecem

**Solução**:
1. Verifique se os workers estão enviando broadcasts
2. Confirme se os nomes dos canais estão corretos
3. Verifique os logs do backend para mensagens de broadcast

## 🎯 Próximos Passos

- [ ] Configurar triggers no Supabase para broadcasts automáticos
- [ ] Implementar notificações push para eventos críticos
- [ ] Adicionar gráficos históricos de performance
- [ ] Criar alertas configuráveis por email/SMS
- [ ] Implementar métricas de performance em tempo real

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação do Supabase Realtime
- Logs do console do navegador
- Configuração do backend de workers
