/**
 * POC DEBUG - Para ver o que está acontecendo na página
 */

import puppeteer from 'puppeteer';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugTest() {
  console.log('🚀 Iniciando teste DEBUG (navegador visível)...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Navegador visível!
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Ir para Google Maps
    console.log('📍 Navegando para Google Maps...');
    await page.goto('https://maps.google.com', { waitUntil: 'networkidle0' });
    console.log('✅ Página carregada!');
    
    // Aguardar e fazer busca
    await delay(3000);
    console.log('🔍 Fazendo busca por "padarias São Paulo"...');
    
    // Clicar na caixa de busca e digitar
    await page.click('#searchboxinput');
    await page.type('#searchboxinput', 'padarias São Paulo');
    await page.keyboard.press('Enter');
    
    console.log('⏳ Aguardando 15 segundos para você ver os resultados...');
    console.log('👀 OLHE O NAVEGADOR ABERTO para ver o que aconteceu!');
    await delay(15000);
    
    // Tentar extrair elementos que existem
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        resultElements: document.querySelectorAll('div[data-result-index]').length,
        allDivs: document.querySelectorAll('div').length,
        linksWithMaps: document.querySelectorAll('a[href*="/maps/place/"]').length
      };
    });
    
    console.log('\n📊 INFORMAÇÕES DA PÁGINA:');
    console.log('- Título:', pageInfo.title);
    console.log('- URL:', pageInfo.url);
    console.log('- Elementos com data-result-index:', pageInfo.resultElements);
    console.log('- Total de divs:', pageInfo.allDivs);
    console.log('- Links com /maps/place/:', pageInfo.linksWithMaps);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    console.log('\n⏳ Aguardando mais 10 segundos antes de fechar...');
    await delay(10000);
    await browser.close();
    console.log('🔒 Navegador fechado');
  }
}

// Executar teste
debugTest().catch(console.error);
