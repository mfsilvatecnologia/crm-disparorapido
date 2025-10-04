# 🧪 Manual de Testes Beta - Sistema de Autenticação LeadsRapido

**Versão**: 1.0.0
**Feature**: Sistema de Autenticação e Gerenciamento de Sessões
**Branch**: `003-sistema-de-autenticação`
**Data**: 2025-10-03

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Cenários de Teste](#cenários-de-teste)
5. [Checklist de Testes](#checklist-de-testes)
6. [Reportando Problemas](#reportando-problemas)

---

## 🎯 Visão Geral

O sistema de autenticação implementa:

- ✅ **Login/Logout** com credenciais
- ✅ **Sessões compartilhadas** entre web e extensão Chrome
- ✅ **Controle de licenças** por plano da empresa
- ✅ **Refresh automático** de tokens (a cada ~40 minutos)
- ✅ **Gerenciamento de sessões** ativas com revogação remota
- ✅ **Device fingerprinting** para segurança
- ✅ **Timeout de inatividade** (45 minutos)
- ✅ **Auditoria** de eventos de sessão

---

## 🔧 Pré-requisitos

### Contas de Teste

Você precisará de credenciais de teste para diferentes cenários:

1. **Usuário Regular** (Plano Básico - 2 dispositivos)
   - Email: `teste.basico@leadsrapido.com`
   - Password: `Teste123!`

2. **Usuário Empresa Admin** (Plano Profissional - 5 dispositivos)
   - Email: `admin.empresa@leadsrapido.com`
   - Password: `Admin123!`

3. **Usuário Super Admin** (Sem limites)
   - Email: `admin@leadsrapido.com`
   - Password: `SuperAdmin123!`

### Dispositivos

Para testar sessões múltiplas, você precisará de:
- ✅ 1 computador (navegador web)
- ✅ 1 smartphone ou tablet (opcional, para testar limite de dispositivos)
- ✅ Navegadores diferentes (Chrome, Firefox) no mesmo PC

### Ferramentas

- ✅ **DevTools** do navegador (F12) - para verificar localStorage e console
- ✅ **Modo Anônimo** - para simular novos dispositivos
- ✅ Bloco de notas para anotar resultados

---

## ⚙️ Ambiente

O aplicativo está disponível em: `https://leadsrapido.netlify.app` 

### 2. Verificar Conexão com Backend

1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Acesse a página de login
4. Verifique se não há erros de conexão

---

## 🧪 Cenários de Teste

### Cenário 1: Login Básico ✅

**Objetivo**: Verificar se o login funciona corretamente

**Passos**:
1. Acesse `https://leadsrapido.netlify.app/login`
2. Digite email: `teste.basico@leadsrapido.com`
3. Digite senha: `Teste123!`
4. Clique em "Login"

**Resultado Esperado**:
- ✅ Redirecionamento para página inicial/dashboard
- ✅ Mensagem de boas-vindas com nome do usuário
- ✅ Sem erros no console

**Como Verificar**:
```javascript
// Abra o Console (F12) e execute:
localStorage.getItem('leadsrapido_auth_token')
// Deve retornar um token JWT (string longa)

localStorage.getItem('leadsrapido_device_id')
// Deve retornar um UUID (ex: "abc-123-def-456")
```

---

### Cenário 2: Device ID Persistente 🔑

**Objetivo**: Verificar se o device ID é criado e persiste entre sessões

**Passos**:
1. Faça login normalmente
2. Abra o DevTools → Console
3. Anote o device_id:
   ```javascript
   localStorage.getItem('leadsrapido_device_id')
   ```
4. Faça logout
5. Feche o navegador completamente
6. Abra novamente e faça login
7. Verifique o device_id novamente

**Resultado Esperado**:
- ✅ O device_id é **o mesmo** antes e depois do logout/login
- ✅ Isto significa que você não está consumindo uma nova licença

---

### Cenário 3: Limite de Licenças (Plano Básico) 🚫

**Objetivo**: Verificar se o sistema bloqueia login quando atingir limite de dispositivos

**Pré-requisito**: Use conta com Plano Básico (2 dispositivos)

**Passos**:
1. Faça login no navegador Chrome normal
2. Abra uma janela **Anônima** no Chrome (Ctrl+Shift+N)
3. Faça login com a mesma conta na janela anônima
4. Abra outro navegador (Firefox)
5. Tente fazer login novamente com a mesma conta

**Resultado Esperado**:
- ✅ No 3º dispositivo, você deve ver um **modal de limite atingido**
- ✅ O modal deve listar as 2 sessões ativas com informações:
  - Dispositivo
  - Cliente (web/extension)
  - Último acesso
- ✅ Deve haver opção para **desconectar uma sessão**

**Teste Adicional**:
1. Clique para desconectar uma das sessões ativas
2. Tente fazer login novamente
3. Agora deve permitir (pois liberou 1 slot)

---

### Cenário 4: Gerenciamento de Sessões 📱

**Objetivo**: Visualizar e gerenciar todas as sessões ativas

**Passos**:
1. Faça login em 2 dispositivos diferentes (ou navegadores)
2. Em um deles, navegue para **Configurações → Sessões Ativas** (ou `/sessions`)
3. Observe a lista de sessões

**Resultado Esperado**:
- ✅ Todas as sessões ativas devem aparecer listadas
- ✅ Cada sessão deve mostrar:
  - Device ID
  - Tipo de cliente (web)
  - Última atividade (timestamp)
  - Botão "Revogar"
- ✅ Ao clicar em "Revogar" em uma sessão:
  - A sessão some da lista
  - Se você revogar sua própria sessão, deve ser deslogado

---

### Cenário 5: Refresh Automático de Token 🔄

**Objetivo**: Verificar se o token é renovado automaticamente

**Atenção**: Este teste leva ~40 minutos!

**Passos**:
1. Faça login
2. Abra o DevTools → Console
3. Anote o token atual:
   ```javascript
   const tokenInicial = localStorage.getItem('leadsrapido_auth_token')
   console.log('Token Inicial:', tokenInicial)
   ```
4. Deixe a aplicação aberta e **interaja ocasionalmente** (clique, navegue)
5. Após ~40 minutos, verifique novamente:
   ```javascript
   const tokenNovo = localStorage.getItem('leadsrapido_auth_token')
   console.log('Token Novo:', tokenNovo)
   console.log('Tokens são diferentes?', tokenInicial !== tokenNovo)
   ```

**Resultado Esperado**:
- ✅ O token deve ser **diferente** após ~40 minutos
- ✅ Você **não** deve ter sido deslogado
- ✅ Você **não** deve ter visto nenhum erro ou interrupção
- ✅ No console, pode aparecer uma mensagem tipo: "Token refreshed successfully"

**Teste Rápido (alternativo)**:
```javascript
// Simular token expirado (apenas para teste)
// AVISO: Isso vai deslogar você!
localStorage.removeItem('leadsrapido_auth_token')
// Espere alguns segundos e veja se é redirecionado ao login
```

---

### Cenário 6: Timeout de Inatividade ⏱️

**Objetivo**: Verificar se a sessão expira após 45 minutos de inatividade

**Passos**:
1. Faça login
2. **NÃO INTERAJA** com a aplicação (não mexa no mouse, não clique)
3. Aguarde 45 minutos
4. Após 45 minutos, tente clicar em algo ou navegar

**Resultado Esperado**:
- ✅ Após 45 minutos, você deve ser **redirecionado para a tela de login**
- ✅ Pode aparecer uma mensagem: "Sessão expirada por inatividade"

**Como Testar Mais Rápido**:
```javascript
// Simular último acesso há 46 minutos atrás
const fortySixMinutesAgo = Date.now() - (46 * 60 * 1000)
localStorage.setItem('leadsrapido_last_activity', fortySixMinutesAgo.toString())

// Recarregue a página
location.reload()

// Deve ser deslogado automaticamente
```

---

### Cenário 7: Aviso de Expiração de Sessão ⚠️

**Objetivo**: Verificar se o usuário recebe aviso antes da sessão expirar

**Passos**:
1. Faça login
2. Fique inativo por ~40 minutos
3. Observe se aparece um **banner de aviso** na parte superior

**Resultado Esperado**:
- ✅ Quando faltar ~5 minutos para expirar, deve aparecer:
  - Banner amarelo/laranja no topo
  - Mensagem: "Sua sessão vai expirar em breve. Salve seu trabalho!"
  - Botão "Continuar conectado" (opcional)

---

### Cenário 8: Logout Manual 🚪

**Objetivo**: Verificar se o logout funciona corretamente

**Passos**:
1. Faça login
2. Clique no botão "Sair" / "Logout"

**Resultado Esperado**:
- ✅ Redirecionamento imediato para `/login`
- ✅ Token removido do localStorage:
  ```javascript
  localStorage.getItem('leadsrapido_auth_token') // null
  ```
- ✅ Se você tentar acessar uma rota protegida, deve ser bloqueado

---

### Cenário 9: Proteção de Rotas 🛡️

**Objetivo**: Verificar se rotas protegidas bloqueiam acesso sem login

**Passos**:
1. **SEM fazer login**, tente acessar diretamente:
   - `https://leadsrapido.netlify.app/dashboard`
   - `https://leadsrapido.netlify.app/sessions`
   - `https://leadsrapido.netlify.app/admin`

**Resultado Esperado**:
- ✅ Deve ser **redirecionado para `/login`** imediatamente
- ✅ Após fazer login, deve voltar para a rota original (deep linking)

---

### Cenário 10: Detecção de Atividade do Usuário 🖱️

**Objetivo**: Verificar se o sistema detecta atividade e atualiza timestamp

**Passos**:
1. Faça login
2. Abra o Console e execute:
   ```javascript
   setInterval(() => {
     const lastActivity = localStorage.getItem('leadsrapido_last_activity')
     console.log('Última atividade:', new Date(parseInt(lastActivity)))
   }, 5000)
   ```
3. Movimente o mouse, clique, role a página
4. Observe o console

**Resultado Esperado**:
- ✅ O timestamp de "Última atividade" deve **atualizar** quando você interage
- ✅ Se você ficar parado, o timestamp não muda

---

### Cenário 11: Tratamento de Erros de Login ❌

**Objetivo**: Verificar mensagens de erro em casos de falha

**Testes**:

1. **Senha Incorreta**:
   - Email: `teste.basico@leadsrapido.com`
   - Senha: `SenhaErrada123!`
   - **Esperado**: "Credenciais inválidas" ou similar

2. **Email Inexistente**:
   - Email: `naoexiste@leadsrapido.com`
   - Senha: `Teste123!`
   - **Esperado**: "Usuário não encontrado"

3. **Campos Vazios**:
   - Deixe email e senha em branco
   - **Esperado**: Botão de login desabilitado OU mensagens de validação

4. **Email Inválido**:
   - Email: `emailinvalido`
   - **Esperado**: Mensagem de validação "Email inválido"

---

### Cenário 12: Device Fingerprinting 🔍

**Objetivo**: Verificar se o sistema gera fingerprint do dispositivo

**Passos**:
1. Faça login
2. Abra o DevTools → Application → Local Storage
3. Procure por chaves relacionadas a fingerprint

**Como Verificar**:
```javascript
// No console
localStorage.getItem('leadsrapido_device_fingerprint')
// OU verifique na requisição de login no Network tab
```

**Resultado Esperado**:
- ✅ Deve existir um fingerprint único
- ✅ Formato esperado: `fp_web_[hash]` (ex: `fp_web_abc123def456`)

---

### Cenário 13: Interface de Limite de Sessão Modal 🪟

**Objetivo**: Verificar a UI do modal de limite de sessões

**Passos**:
1. Force um erro de limite (use Cenário 3)
2. Observe o modal que aparece

**Verificar**:
- ✅ Modal com título "Limite de Licença Atingido"
- ✅ Mensagem explicativa
- ✅ Lista de sessões ativas com:
  - Device ID (ou nome amigável)
  - Tipo de cliente (web/extension)
  - Data/hora do último acesso
  - Botão "Desconectar" em cada sessão
- ✅ Botão "Cancelar" para fechar o modal
- ✅ Design consistente com o resto da aplicação

---

### Cenário 14: Teste de Segurança - Token Expirado 🔐

**Objetivo**: Verificar comportamento quando token expira

**Passos**:
1. Faça login
2. Aguarde até o token expirar (ou force manualmente)
3. Tente fazer uma ação que requer autenticação

**Forçar Expiração (Dev)**:
```javascript
// Substituir token por um expirado (simular)
localStorage.setItem('leadsrapido_auth_token', 'token.expirado.invalido')

// Tentar acessar uma API protegida
fetch('/api/sessions/active', {
  headers: { 'Authorization': 'Bearer token.expirado.invalido' }
})
```

**Resultado Esperado**:
- ✅ Sistema detecta token inválido
- ✅ Redireciona para `/login`
- ✅ Mensagem: "Sessão expirada. Faça login novamente."

---

## ✅ Checklist de Testes

Marque cada item conforme completar:

### Funcionalidades Básicas
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro apropriado
- [ ] Logout funciona e limpa dados
- [ ] Device ID é criado e persiste
- [ ] Rotas protegidas bloqueiam acesso sem login

### Gerenciamento de Sessões
- [ ] Listagem de sessões ativas funciona
- [ ] Revogação de sessão funciona
- [ ] Revogar própria sessão desloga o usuário
- [ ] Limite de licença é respeitado
- [ ] Modal de limite aparece quando necessário

### Token & Refresh
- [ ] Token é armazenado após login
- [ ] Refresh automático funciona (~40 min)
- [ ] Timeout de inatividade funciona (45 min)
- [ ] Aviso de expiração aparece (~5 min antes)
- [ ] Token expirado força re-login

### Segurança & Device
- [ ] Device fingerprint é gerado
- [ ] Detecção de atividade funciona (mouse, teclado)
- [ ] Timestamp de última atividade atualiza corretamente

### Interface & UX
- [ ] Formulário de login é responsivo
- [ ] Mensagens de erro são claras
- [ ] Loading states aparecem quando apropriado
- [ ] Modal de sessões tem boa UX
- [ ] Navegação entre páginas funciona

### Edge Cases
- [ ] Múltiplos logins simultâneos funcionam
- [ ] Abrir em aba anônima cria novo device
- [ ] Limpar localStorage e relogar cria novo device
- [ ] Sessões expiradas são removidas da lista

---

## 🐛 Reportando Problemas

### Como Reportar um Bug

Quando encontrar um problema, anote:

1. **Título**: Resumo em uma linha
   - Exemplo: "Login falha com senha correta"

2. **Passos para Reproduzir**:
   ```
   1. Acesse /login
   2. Digite email: teste@example.com
   3. Digite senha: Teste123!
   4. Clique em "Login"
   ```

3. **Resultado Esperado**:
   - "Deveria redirecionar para /dashboard"

4. **Resultado Atual**:
   - "Fica carregando indefinidamente"

5. **Informações Adicionais**:
   - Navegador: Chrome 120
   - Sistema: Windows 11
   - Console Errors: (copie do DevTools)
   - Screenshot: (se aplicável)

### Template de Bug Report

```markdown
## Bug: [Título curto]

**Severidade**: [ ] Crítico  [ ] Alto  [ ] Médio  [ ] Baixo

**Passos para Reproduzir**:
1.
2.
3.

**Resultado Esperado**:


**Resultado Atual**:


**Ambiente**:
- Navegador:
- SO:
- URL:

**Evidências**:
- Console log:
- Screenshot:
- Network tab:

**Observações**:

```

---

## 📊 Relatório de Testes

Ao final dos testes, preencha:

**Data do Teste**: ___/___/_____
**Testador**: _________________
**Duração Total**: ______ horas

### Resumo

- **Total de Cenários Testados**: ___ / 14
- **Cenários com Sucesso**: ___
- **Cenários com Falha**: ___
- **Bugs Encontrados**: ___

### Impressões Gerais

**Pontos Positivos**:
-
-

**Pontos Negativos**:
-
-

**Sugestões de Melhoria**:
-
-

---

## 🆘 Suporte

**Problemas durante o teste?**

- 📧 Email: dev@leadsrapido.com
- 💬 Slack: #beta-testing
- 📝 GitHub Issues: [Link do repositório]

---

**Obrigado por ajudar a melhorar o LeadsRapido! 🚀**
