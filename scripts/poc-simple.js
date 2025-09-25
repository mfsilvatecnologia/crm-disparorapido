/**
 * POC SIMPLES - Teste rápido de extração do Google Maps
 */

import puppeteer from 'puppeteer';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testSimple() {
  console.log('🚀 Iniciando teste simples...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null 
  });
  
  const page = await browser.newPage();
  
  try {
    // Ir para Google Maps
    console.log('📍 Navegando para Google Maps...');
    await page.goto('https://www.google.com/maps');
    
    // Aguardar caixa de pesquisa
    await page.waitForSelector('#searchboxinput', { timeout: 10000 });
    console.log('✅ Página carregada!');
    
    // Fazer uma busca simples
    console.log('🔍 Fazendo busca por "padarias São Paulo"...');
    await page.type('#searchboxinput', 'padarias São Paulo');
    await page.keyboard.press('Enter');
    
    // Aguardar resultados
    console.log('⏳ Aguardando resultados carregarem...');
    await delay(8000); // Mais tempo para carregar
    
    // Tentar aguardar por um seletor específico de resultados
    try {
      await page.waitForSelector('div[data-result-index]', { timeout: 10000 });
      console.log('✅ Resultados detectados!');
    } catch (e) {
      console.log('⚠️  Timeout ao aguardar resultados, tentando extrair mesmo assim...');
    }
    
    // Extrair nomes dos primeiros resultados
    console.log('🔍 Analisando página para encontrar resultados...');
    
    const results = await page.evaluate(() => {
      const names = [];
      
      // Debug: ver quantos elementos principais existem
      console.log('🔍 Elementos na página:');
      console.log('- div[data-result-index]:', document.querySelectorAll('div[data-result-index]').length);
      console.log('- [role="article"]:', document.querySelectorAll('[role="article"]').length);
      console.log('- a com href maps:', document.querySelectorAll('a[href*="/maps/place/"]').length);
      
      // Diferentes seletores que podem funcionar
      const selectors = [
        'div[data-result-index] h3',
        'div[data-result-index] span[role="img"]',
        'a[href*="/maps/place/"] h3',
        'a[href*="/maps/place/"] div[role="img"]',
        '[role="article"] h3',
        'div[jsaction*="click"] span[role="img"]'
      ];
      
      for (const selector of selectors) {
        console.log(`Testando seletor: ${selector}`);
        const elements = document.querySelectorAll(selector);
        console.log(`- Encontrados: ${elements.length} elementos`);
        
        elements.forEach((el, index) => {
          const text = el.textContent?.trim() || el.getAttribute('aria-label')?.trim();
          console.log(`  ${index}: "${text}"`);
          if (text && text.length > 2 && !names.includes(text)) {
            names.push(text);
          }
        });
        
        if (names.length > 0) {
          console.log(`✅ Seletor funcionou: ${selector}`);
          break;
        }
      }
      
      return names.slice(0, 5); // Máximo 5 resultados
    });    console.log('\n📋 RESULTADOS ENCONTRADOS:');
    results.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    
    if (results.length > 0) {
      console.log('\n✅ POC funcionando! Dados extraídos com sucesso!');
    } else {
      console.log('\n⚠️  Nenhum resultado encontrado. Pode ser necessário ajustar seletores.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    console.log('\n⏳ Aguardando 5 segundos para você ver os resultados...');
    await delay(5000);
    await browser.close();
    console.log('🔒 Navegador fechado');
  }
}

// Executar teste
testSimple().catch(console.error);
