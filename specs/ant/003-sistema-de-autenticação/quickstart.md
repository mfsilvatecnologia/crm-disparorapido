# Quick Start: Sistema de Autenticação

## Para Stakeholders (5 minutos)

### O que é?
Um sistema completo de login e gerenciamento de sessões que permite aos usuários acessar o LeadsRapido tanto pelo navegador web quanto pela extensão Chrome, usando um único login por dispositivo.

### Por que é importante?
- **Segurança**: Controle robusto de acesso com auditoria completa
- **Conveniência**: Um login serve para web e extensão no mesmo dispositivo
- **Monetização**: Controle de licenças por número de dispositivos (não por aplicativos)
- **Compliance**: Rastreamento completo de acessos para auditoria

### Quem usa?
- **Usuários finais**: Fazem login, gerenciam suas sessões ativas
- **Administradores**: Monitoram uso de licenças, revogam sessões se necessário
- **Sistema**: Valida acessos, refresca tokens automaticamente, detecta atividades suspeitas

## Para Desenvolvedores (2 minutos)

### Escopo
Implementação completa do sistema de autenticação no frontend React seguindo o padrão de feature-based architecture:

**Feature Domain**: `features/authentication/`

**Principais Componentes**:
- Context provider para estado de autenticação
- Hooks customizados para login/logout/refresh
- Utilitários de device ID e fingerprinting
- Componentes UI para login, gerenciamento de sessões, modais de erro
- Protected routes com verificação de sessão

**Integração com Backend**: API REST já existente (ver `INTEGRATION_GUIDE_REACT_FRONTEND.md`)

### Tech Highlights (apenas referência)
- Device ID persistente no localStorage
- Fingerprinting multi-componente (canvas, WebGL, hardware)
- Auto-refresh de tokens via interceptor
- Sessões compartilhadas entre web e extension
- Controle de limites por plano da empresa

### Documentos Relacionados
- **spec.md**: Requisitos funcionais completos (LEIA PRIMEIRO)
- **research.md**: Conceitos técnicos e padrões identificados
- **INTEGRATION_GUIDE_REACT_FRONTEND.md**: Guia técnico detalhado com endpoints e exemplos

## Decisões Chave

### 1. Sessão Compartilhada por Dispositivo
**Decisão**: Um device_id único serve web + extensão  
**Razão**: Melhor UX (login único) + controle de licença justo  
**Trade-off**: Perder device_id = conta como novo dispositivo

### 2. Auto-refresh Transparente
**Decisão**: Refresh automático quando token tem < 5min  
**Razão**: Experiência ininterrupta para o usuário  
**Trade-off**: Lógica mais complexa, mas vale a pena

### 3. Enforcement Modes Flexíveis
**Decisão**: 3 modos (block, warn, allow_with_audit)  
**Razão**: Permite testes e transições suaves  
**Uso Produção**: Sempre "block"

### 4. Fingerprint para Segurança
**Decisão**: Coletar múltiplos atributos do device  
**Razão**: Detectar mudanças suspeitas (device hijacking)  
**Trade-off**: Pode mudar com atualizações de browser (tolerância necessária)

## Fluxos Críticos

### Happy Path: Primeiro Login
```
1. Usuário abre app → Tela de login
2. Digite email/senha → Clique "Entrar"
3. Sistema gera device_id → Salva no localStorage
4. Sistema gera fingerprint → Envia com credenciais
5. Backend valida → Verifica limite de licenças
6. Limite OK → Cria sessão + retorna tokens
7. Frontend salva tokens → Redireciona para dashboard
```

### Happy Path: Login com Extensão
```
1. Usuário já logado no web
2. Abre extensão Chrome → Compartilha device_id
3. Extensão valida sessão existente → Acesso imediato
4. Atividade na extensão → Atualiza timestamp da sessão
5. Sessão permanece ativa para ambos (web + extension)
```

### Edge Case: Limite Atingido
```
1. Empresa tem plano Básico (2 devices)
2. Já existem 2 sessões ativas
3. Terceiro usuário tenta login → Backend retorna 403
4. Frontend mostra modal → Lista 2 sessões ativas
5. Usuário clica "Desconectar" em uma → Revoga sessão
6. Clica "Tentar novamente" → Login sucede
```

### Edge Case: Token Expirando
```
1. Usuário trabalhando há 40 minutos
2. Sistema detecta token < 5min → Inicia refresh
3. Refresh em background → Sucesso
4. Atualiza tokens no localStorage → Usuário nem percebe
5. Trabalho continua sem interrupção
```

## Métricas de Sucesso

### Técnicas
- ✅ 100% das sessões devem ter device_id válido
- ✅ Auto-refresh deve ocorrer antes de expiração (< 1% de falhas)
- ✅ Tempo médio de login < 2 segundos
- ✅ Zero sessões compartilhadas de devices diferentes

### Negócio
- ✅ 0% de logins bloqueados incorretamente
- ✅ 100% de tentativas acima do limite bloqueadas (modo block)
- ✅ Auditoria completa de 100% das sessões
- ✅ < 5% de reclamações sobre gestão de sessões

### Segurança
- ✅ 100% de eventos de autenticação logados
- ✅ Detecção de atividade suspeita em < 30 segundos
- ✅ Sessões expiram exatamente aos 45min de inatividade
- ✅ Tokens são rotacionados a cada refresh (0% de reuso)

## Próximos Passos

1. **Stakeholders**: Revisar `spec.md` e aprovar requisitos
2. **Tech Lead**: Revisar `research.md` e validar padrões
3. **Devs**: Ler `INTEGRATION_GUIDE_REACT_FRONTEND.md` para implementação
4. **QA**: Preparar casos de teste baseados em cenários do `spec.md`

---

**Perguntas?** Consulte a documentação completa na pasta `specs/003-sistema-de-autenticação/`
