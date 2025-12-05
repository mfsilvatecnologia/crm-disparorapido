# Research: Sistema de Autenticação e Gerenciamento de Sessões

## Fontes de Informação

### Documento Base
- **INTEGRATION_GUIDE_REACT_FRONTEND.md** - Guia completo de integração do backend
  - Define arquitetura de sessões compartilhadas
  - Especifica controles de licença por plano
  - Documenta endpoints da API
  - Fornece exemplos de código React

## Conceitos Chave Identificados

### 1. Sessão Compartilhada (Unified Session)
- **Conceito**: Uma única sessão por dispositivo, compartilhada entre web e extensão
- **Identificador**: `device_id` (UUID persistente)
- **Diferenciação**: Campo `client_type` indica último cliente ativo ('web' ou 'extension')
- **Vantagem**: Usuário não precisa fazer login múltiplo no mesmo dispositivo

### 2. Controle de Licenças por Device ID
- **Métrica**: Conta device_ids únicos, não client_types
- **Exemplo**: Web + extensão no mesmo device = 1 licença
- **Exemplo**: Web em device A + extensão em device B = 2 licenças
- **Planos**: Freemium (1), Básico (2), Premium (5), Enterprise (10)

### 3. Token Rotation Strategy
- **Access Token**: Curta duração, usado em cada requisição
- **Refresh Token**: Longa duração, rotacionado a cada refresh
- **Timing**: Auto-refresh quando < 5min para expirar
- **Segurança**: Hash do refresh token armazenado no banco

### 4. Device Fingerprinting
- **Propósito**: Detectar mudanças suspeitas no dispositivo
- **Componentes**: User agent, idioma, plataforma, hardware, timezone, resolução, canvas, WebGL
- **Uso**: Validação adicional durante refresh token
- **Alertas**: Mudanças significativas marcam sessão como "suspicious"

### 5. Session States
- **active**: Sessão válida e em uso
- **expired**: Expirou por inatividade (45min)
- **revoked**: Revogada manualmente (logout ou admin)
- **suspicious**: Atividade anômala detectada

### 6. Enforcement Modes
- **block**: Bloqueia login ao atingir limite (produção)
- **warn**: Permite mas exibe avisos (desenvolvimento)
- **allow_with_audit**: Permite mas registra em auditoria (monitoramento)

## Fluxos Principais Documentados

### Login Flow
1. Frontend gera/obtém device_id do localStorage
2. Frontend gera device_fingerprint
3. Backend valida credenciais
4. Backend verifica limites de sessão da empresa
5. Se dentro do limite: cria/atualiza sessão e retorna tokens
6. Se limite atingido: retorna erro 403 com detalhes

### Refresh Token Flow
1. Frontend detecta token expirando (< 5min)
2. Envia refresh_token + device_id + fingerprint
3. Backend valida token e sessão
4. Backend atualiza last_activity_at
5. Backend gera novos tokens (rotação)
6. Frontend atualiza tokens no localStorage

### Session Sharing Flow
1. Usuário faz login no web (cria sessão com device_id X)
2. Usuário abre extensão no mesmo device
3. Extensão usa mesmo device_id X do localStorage
4. Backend reconhece sessão existente
5. Atualiza client_type para 'extension'
6. Ambos clientes compartilham mesma sessão

## Padrões de Segurança Identificados

### 1. Defense in Depth
- Hash de refresh tokens no banco
- Device fingerprint validation
- IP address tracking
- User agent monitoring
- Audit logging completo

### 2. Rate Limiting
- Limite de tentativas de login
- Cooldown após múltiplas falhas
- Header `Retry-After` em 429

### 3. Session Hygiene
- Expiração automática por inatividade
- Revogação manual disponível
- Detecção de atividade suspeita
- Limpeza periódica de sessões expiradas

## Requisitos de Persistência

### localStorage (Frontend)
- `leadsrapido_device_id`: UUID do dispositivo
- `access_token`: Token de acesso atual
- `refresh_token`: Token de refresh atual
- `last_activity`: Timestamp da última atividade

### Backend Database
- Tabela `user_sessions`: Sessões ativas e históricas
- Tabela `empresa_session_limits`: Configuração de limites
- Tabela `session_audit_log`: Auditoria completa
- Índices em: device_id, user_id, empresa_id, status

## Considerações de UX

### Feedback ao Usuário
- Loading states durante autenticação
- Mensagens claras em caso de limite atingido
- Lista de sessões ativas com ação de revogar
- Warnings antes de expiração de sessão
- Preservação de destino após login

### Transparência
- Mostrar quando/onde sessão foi criada
- Indicar dispositivo e localização
- Tempo desde última atividade
- Tipo de cliente (web/extension)

## Integrações Necessárias

### Com Backend API
- Endpoints de autenticação (`/auth/*`)
- Endpoints de sessões (`/sessions/*`)
- Endpoints admin (`/admin/sessions`)
- WebSocket para notificações real-time (futuro)

### Com Chrome Extension
- Compartilhamento de device_id via storage
- Sincronização de tokens
- Notificações de mudança de sessão

## Riscos e Mitigações

### Risco: Perda de device_id
- **Impacto**: Usuário conta como novo dispositivo (nova licença)
- **Mitigação**: Instruções claras sobre não limpar dados do navegador
- **Alternativa**: Permitir "recuperação" de device_id via email

### Risco: Fingerprint drift
- **Impacto**: Atualizações de navegador podem alterar fingerprint
- **Mitigação**: Usar múltiplos componentes, tolerar mudanças menores
- **Alternativa**: Marcar como "suspicious" mas não bloquear imediatamente

### Risco: Limite de sessões atingido
- **Impacto**: Usuário legítimo bloqueado
- **Mitigação**: Interface clara para revogar sessões antigas
- **Alternativa**: Modo "warn" durante onboarding

### Risco: Token refresh failure
- **Impacto**: Interrupção da experiência do usuário
- **Mitigação**: Retry automático com backoff exponencial
- **Alternativa**: Fallback gracioso para re-login

## Próximos Passos

1. Revisar especificação com stakeholders
2. Validar requisitos de segurança com time de infra
3. Confirmar compatibilidade com arquitetura atual
4. Planejar migração de autenticação legada (se existir)
5. Definir estratégia de testes (unit, integration, e2e)
