# 🎯 POC - Google Maps Lead Scraping

Esta é uma **Proof of Concept (POC)** simples para demonstrar como extrair dados de estabelecimentos do Google Maps usando web scraping.

## 📋 O que esta POC demonstra:

1. **Navegação automatizada** no Google Maps
2. **Busca por estabelecimentos** em localizações específicas
3. **Extração de dados básicos** (nome, categoria, rating, endereço)
4. **Extração de dados detalhados** (telefone, website, horários)
5. **Tratamento de erros** e timeouts

## 🚀 Como executar:

### 1. Instalar dependências
```bash
# Instalar Puppeteer
npm install puppeteer

# Ou usar o package.json da POC
cp poc-package.json package.json
npm install
```

### 2. Executar teste simples
```bash
# Teste básico (mais rápido)
node poc-simple.js
```

### 3. Executar POC completa
```bash
# POC completa com mais funcionalidades
node poc-google-maps.js
```

## 📊 Exemplo de saída:

```
🚀 Iniciando navegador...
✅ Navegador iniciado com sucesso!

🎯 === POC GOOGLE MAPS LEAD SCRAPING ===

📍 EXEMPLO 1: Restaurantes em São Paulo
🔍 Buscando: "restaurantes" em "São Paulo, SP"
⏳ Aguardando resultados...
📋 Extraindo dados dos estabelecimentos...

✅ Encontrados 8 restaurantes:

1. Restaurante Famiglia Mancini
   Categoria: Restaurante italiano
   Rating: 4,3 estrelas
   Endereço: R. Avanhandava, 81 - Bela Vista, São Paulo

2. D.O.M.
   Categoria: Restaurante de alta gastronomia
   Rating: 4,4 estrelas
   Endereço: R. Barão de Capanema, 549 - Jardins, São Paulo

📋 EXEMPLO 2: Detalhes do primeiro restaurante
🔍 Buscando detalhes de: Restaurante Famiglia Mancini

📊 DETALHES COMPLETOS:
Nome: Restaurante Famiglia Mancini
Categoria: Restaurante italiano
Rating: 4,3
Reviews: 1.234 avaliações
Endereço: R. Avanhandava, 81 - Bela Vista, São Paulo - SP
Telefone: (11) 3256-4320
Website: www.famigliamancini.com.br
Horário: Aberto ⋅ Fecha às 23:30

🎉 POC concluída com sucesso!
```

## 🔧 Estrutura dos dados extraídos:

### Dados básicos (busca geral):
```javascript
{
  index: 1,
  name: "Nome do Estabelecimento",
  category: "Categoria/Tipo",
  rating: "4,5 estrelas",
  address: "Endereço completo",
  extractedAt: "2025-08-20T10:30:00.000Z"
}
```

### Dados detalhados:
```javascript
{
  name: "Nome do Estabelecimento",
  category: "Categoria/Tipo",
  rating: "4,5",
  reviews: "1.234 avaliações",
  address: "Endereço completo",
  phone: "(11) 1234-5678",
  website: "www.exemplo.com.br",
  hours: "Aberto ⋅ Fecha às 18:00"
}
```

## ⚙️ Configurações importantes:

### Navegador (Puppeteer):
- **headless: false** - Para visualizar o processo
- **defaultViewport: null** - Usar tamanho real da tela
- **User Agent personalizado** - Para parecer navegador real

### Rate Limiting (implementar em produção):
- Delay entre requests: 2-5 segundos
- Máximo de requests por minuto: 30
- Máximo de requests por hora: 1000

## 🚨 Limitações da POC:

1. **Seletores CSS podem mudar** - Google atualiza interface
2. **Rate limiting necessário** - Para evitar bloqueios
3. **Captcha pode aparecer** - Em uso intensivo
4. **Dados podem estar incompletos** - Nem todos campos sempre visíveis

## 🔄 Próximos passos (implementação real):

1. **Rate limiting inteligente**
2. **Rotação de proxies e user agents**
3. **Retry logic com backoff exponencial**
4. **Salvamento no banco de dados**
5. **Integração com RabbitMQ**
6. **Monitoramento e logs**
7. **Detecção e contorno de captchas**

## 📝 Notas técnicas:

- A POC usa **seletores CSS** que podem precisar de ajustes
- **Timeouts** configurados para conexões lentas
- **Error handling** básico implementado
- Funciona melhor em **resolução desktop**

## 🎯 Casos de uso testados:

- ✅ Busca por tipo de negócio + cidade
- ✅ Extração de dados básicos
- ✅ Extração de dados detalhados
- ✅ Tratamento de erros
- ✅ Navegação automatizada

Execute a POC e veja como o sistema vai funcionar na prática! 🚀
