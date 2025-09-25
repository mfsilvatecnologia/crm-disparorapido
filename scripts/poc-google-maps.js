/**
 * POC - Google Maps Lead Scraping
 * Demonstração simples de como extrair dados de estabelecimentos do Google Maps
 */

import puppeteer from 'puppeteer';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class GoogleMapsLeadScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Iniciando navegador...');
    this.browser = await puppeteer.launch({
      headless: false, // Deixar visível para demonstração
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Configurar user agent para parecer um navegador real
    await this.page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log('✅ Navegador iniciado com sucesso!');
  }

  async searchBusinesses(query, location) {
    try {
      console.log(`🔍 Buscando: "${query}" em "${location}"`);
      
      // Navegar para o Google Maps
      await this.page.goto('https://www.google.com/maps', { 
        waitUntil: 'networkidle2' 
      });

      // Aguardar e encontrar a caixa de pesquisa
      await this.page.waitForSelector('#searchboxinput', { timeout: 10000 });
      
      // Limpar e digitar a busca
      await this.page.click('#searchboxinput');
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      
      const searchTerm = `${query} ${location}`;
      await this.page.type('#searchboxinput', searchTerm);
      
      // Pressionar Enter para buscar
      await this.page.keyboard.press('Enter');
      
      // Aguardar os resultados carregarem
      console.log('⏳ Aguardando resultados...');
      await delay(3000);
      
      // Aguardar a lista de resultados aparecer
      await this.page.waitForSelector('[role="main"]', { timeout: 15000 });
      
      console.log('📋 Extraindo dados dos estabelecimentos...');
      
      // Extrair dados dos primeiros resultados
      const businesses = await this.page.evaluate(() => {
        const results = [];
        
        // Seletores para diferentes elementos dos cards de estabelecimentos
        const businessCards = document.querySelectorAll('div[data-result-index]');
        
        businessCards.forEach((card, index) => {
          try {
            // Nome do estabelecimento
            const nameElement = card.querySelector('div[class*="fontHeadlineSmall"] span');
            const name = nameElement ? nameElement.textContent.trim() : null;
            
            // Categoria/Tipo de negócio
            const categoryElement = card.querySelector('div[class*="fontBodyMedium"] span span');
            const category = categoryElement ? categoryElement.textContent.trim() : null;
            
            // Rating
            const ratingElement = card.querySelector('span[class*="fontBodyMedium"] span[aria-label*="estrelas"]');
            const rating = ratingElement ? ratingElement.getAttribute('aria-label') : null;
            
            // Endereço (aproximado, pode não estar sempre visível)
            const addressElements = card.querySelectorAll('div[class*="fontBodyMedium"] span');
            let address = null;
            addressElements.forEach(el => {
              const text = el.textContent.trim();
              if (text.includes(',') && text.length > 10) {
                address = text;
              }
            });
            
            // Só adicionar se tiver pelo menos nome
            if (name) {
              results.push({
                index: index + 1,
                name,
                category,
                rating,
                address,
                extractedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.log(`Erro ao extrair dados do card ${index}:`, error.message);
          }
        });
        
        return results;
      });

      return businesses;
      
    } catch (error) {
      console.error('❌ Erro durante a busca:', error.message);
      throw error;
    }
  }

  async getDetailedInfo(businessName) {
    try {
      console.log(`🔍 Buscando detalhes de: ${businessName}`);
      
      // Buscar especificamente pelo nome do estabelecimento
      await this.page.goto('https://www.google.com/maps', { 
        waitUntil: 'networkidle2' 
      });

      await this.page.waitForSelector('#searchboxinput');
      await this.page.click('#searchboxinput');
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('KeyA');
      await this.page.keyboard.up('Control');
      await this.page.type('#searchboxinput', businessName);
      await this.page.keyboard.press('Enter');
      
      await delay(3000);
      
      // Tentar clicar no primeiro resultado para abrir detalhes
      try {
        await this.page.waitForSelector('div[data-result-index="0"]', { timeout: 5000 });
        await this.page.click('div[data-result-index="0"]');
        await delay(2000);
      } catch (e) {
        console.log('⚠️ Não foi possível abrir detalhes automaticamente');
      }
      
      // Extrair informações detalhadas
      const details = await this.page.evaluate(() => {
        const result = {};
        
        try {
          // Nome
          const nameEl = document.querySelector('h1[class*="fontHeadlineLarge"]');
          result.name = nameEl ? nameEl.textContent.trim() : null;
          
          // Categoria
          const categoryEl = document.querySelector('div[class*="fontBodyMedium"] button span span');
          result.category = categoryEl ? categoryEl.textContent.trim() : null;
          
          // Rating e reviews
          const ratingEl = document.querySelector('div[class*="fontDisplayLarge"]');
          result.rating = ratingEl ? ratingEl.textContent.trim() : null;
          
          const reviewsEl = document.querySelector('span span[aria-label*="avaliações"]');
          result.reviews = reviewsEl ? reviewsEl.getAttribute('aria-label') : null;
          
          // Endereço
          const addressEl = document.querySelector('button[data-item-id="address"] div[class*="fontBodyMedium"]');
          result.address = addressEl ? addressEl.textContent.trim() : null;
          
          // Telefone
          const phoneEl = document.querySelector('button[data-item-id*="phone"] div[class*="fontBodyMedium"]');
          result.phone = phoneEl ? phoneEl.textContent.trim() : null;
          
          // Website
          const websiteEl = document.querySelector('button[data-item-id="authority"] div[class*="fontBodyMedium"]');
          result.website = websiteEl ? websiteEl.textContent.trim() : null;
          
          // Horário de funcionamento
          const hoursButton = document.querySelector('button[data-item-id*="oh"]');
          if (hoursButton) {
            const hoursText = hoursButton.querySelector('div[class*="fontBodyMedium"]');
            result.hours = hoursText ? hoursText.textContent.trim() : null;
          }
          
        } catch (error) {
          console.log('Erro ao extrair detalhes:', error.message);
        }
        
        return result;
      });
      
      return details;
      
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes:', error.message);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador fechado');
    }
  }
}

// Função principal para demonstração
async function runPOC() {
  const scraper = new GoogleMapsLeadScraper();
  
  try {
    await scraper.init();
    
    console.log('\n🎯 === POC GOOGLE MAPS LEAD SCRAPING ===\n');
    
    // Exemplo 1: Buscar restaurantes em São Paulo
    console.log('📍 EXEMPLO 1: Restaurantes em São Paulo');
    const restaurants = await scraper.searchBusinesses('restaurantes', 'São Paulo, SP');
    
    console.log(`\n✅ Encontrados ${restaurants.length} restaurantes:`);
    restaurants.slice(0, 5).forEach((business, index) => {
      console.log(`\n${index + 1}. ${business.name}`);
      console.log(`   Categoria: ${business.category || 'N/A'}`);
      console.log(`   Rating: ${business.rating || 'N/A'}`);
      console.log(`   Endereço: ${business.address || 'N/A'}`);
    });
    
    // Exemplo 2: Buscar detalhes de um estabelecimento específico
    if (restaurants.length > 0) {
      console.log('\n📋 EXEMPLO 2: Detalhes do primeiro restaurante');
      const firstRestaurant = restaurants[0];
      const details = await scraper.getDetailedInfo(firstRestaurant.name);
      
      if (details && details.name) {
        console.log('\n📊 DETALHES COMPLETOS:');
        console.log(`Nome: ${details.name}`);
        console.log(`Categoria: ${details.category || 'N/A'}`);
        console.log(`Rating: ${details.rating || 'N/A'}`);
        console.log(`Reviews: ${details.reviews || 'N/A'}`);
        console.log(`Endereço: ${details.address || 'N/A'}`);
        console.log(`Telefone: ${details.phone || 'N/A'}`);
        console.log(`Website: ${details.website || 'N/A'}`);
        console.log(`Horário: ${details.hours || 'N/A'}`);
      }
    }
    
    console.log('\n🎉 POC concluída com sucesso!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Implementar rate limiting');
    console.log('2. Adicionar rotação de proxies');
    console.log('3. Melhorar seletores CSS');
    console.log('4. Implementar retry logic');
    console.log('5. Salvar dados no banco');
    console.log('6. Integrar com RabbitMQ');
    
  } catch (error) {
    console.error('💥 Erro na POC:', error.message);
  } finally {
    await scraper.close();
  }
}

// Executar a POC se este arquivo for chamado diretamente
if (require.main === module) {
  runPOC().catch(console.error);
}

module.exports = GoogleMapsLeadScraper;
