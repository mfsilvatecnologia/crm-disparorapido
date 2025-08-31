/**
 * POC - Google Maps Lead Scraper com Export CSV
 * Extrai dados do Google Maps e salva em arquivo CSV
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para criar CSV
function createCSV(data, filename) {
  const headers = [
    'Nome',
    'Endereço',
    'Telefone',
    'Website',
    'Categoria',
    'Avaliação',
    'Total_Avaliações',
    'Horário_Funcionamento',
    'Latitude',
    'Longitude',
    'Data_Coleta'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(item => {
    const row = [
      `"${item.nome || ''}"`,
      `"${item.endereco || ''}"`,
      `"${item.telefone || ''}"`,
      `"${item.website || ''}"`,
      `"${item.categoria || ''}"`,
      `"${item.avaliacao || ''}"`,
      `"${item.totalAvaliacoes || ''}"`,
      `"${item.horario || ''}"`,
      `"${item.latitude || ''}"`,
      `"${item.longitude || ''}"`,
      `"${item.dataColeta || ''}"`
    ];
    csvContent += row.join(',') + '\n';
  });
  
  const filepath = path.join(process.cwd(), filename);
  fs.writeFileSync(filepath, csvContent, 'utf8');
  console.log(`📄 CSV salvo: ${filepath}`);
  return filepath;
}

class GoogleMapsCSVScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.extractedData = [];
  }

  async init() {
    console.log('🚀 Iniciando scraper...');
    this.browser = await puppeteer.launch({ 
      headless: false, // Visível para debug
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // User agent realístico
    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }

  async searchLocation(searchTerm, maxResults = 10) {
    try {
      console.log(`🔍 Buscando: "${searchTerm}"`);
      
      // Navegar para Google Maps
      await this.page.goto('https://maps.google.com', { waitUntil: 'networkidle2' });
      await delay(3000);
      
      // Fazer busca
      await this.page.click('#searchboxinput');
      await this.page.type('#searchboxinput', searchTerm, { delay: 100 });
      await this.page.keyboard.press('Enter');
      
      console.log('⏳ Aguardando resultados...');
      await delay(5000);
      
      // Aguardar lista de resultados
      try {
        await this.page.waitForSelector('[role="main"]', { timeout: 15000 });
      } catch (e) {
        console.log('⚠️ Timeout aguardando resultados');
      }
      
      // Extrair dados básicos da lista
      const results = await this.extractBasicData(maxResults);
      
      // Para cada resultado, tentar obter detalhes
      for (let i = 0; i < Math.min(results.length, maxResults); i++) {
        console.log(`📊 Extraindo detalhes ${i + 1}/${results.length}...`);
        const details = await this.extractDetailedData(i);
        if (details) {
          this.extractedData.push({
            ...results[i],
            ...details,
            dataColeta: new Date().toISOString()
          });
        }
        await delay(2000); // Delay entre extrações
      }
      
      return this.extractedData;
      
    } catch (error) {
      console.error('❌ Erro na busca:', error.message);
      return [];
    }
  }

  async extractBasicData(maxResults) {
    return await this.page.evaluate((max) => {
      const results = [];
      
      // Diferentes seletores para tentar
      const selectors = [
        'div[data-result-index]',
        'div[role="article"]',
        'a[href*="/maps/place/"]'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Testando ${selector}: ${elements.length} elementos`);
        
        elements.forEach((element, index) => {
          if (index >= max) return;
          
          try {
            // Tentar extrair nome
            let nome = '';
            const nameSelectors = [
              'h3',
              '[data-value="Name"]',
              '.section-result-title',
              'span[role="img"][aria-label]'
            ];
            
            for (const nameSelector of nameSelectors) {
              const nameEl = element.querySelector(nameSelector);
              if (nameEl) {
                nome = nameEl.textContent?.trim() || nameEl.getAttribute('aria-label')?.trim() || '';
                if (nome) break;
              }
            }
            
            // Tentar extrair endereço
            let endereco = '';
            const addressSelectors = [
              '[data-value="Address"]',
              '.section-result-location',
              'span[title]'
            ];
            
            for (const addrSelector of addressSelectors) {
              const addrEl = element.querySelector(addrSelector);
              if (addrEl) {
                endereco = addrEl.textContent?.trim() || addrEl.getAttribute('title')?.trim() || '';
                if (endereco) break;
              }
            }
            
            // Tentar extrair categoria
            let categoria = '';
            const categorySelectors = [
              '[data-value="Category"]',
              '.section-result-details span'
            ];
            
            for (const catSelector of categorySelectors) {
              const catEl = element.querySelector(catSelector);
              if (catEl) {
                categoria = catEl.textContent?.trim() || '';
                if (categoria) break;
              }
            }
            
            if (nome && nome.length > 2) {
              results.push({
                nome,
                endereco,
                categoria,
                index
              });
            }
          } catch (e) {
            console.log('Erro extraindo elemento:', e);
          }
        });
        
        if (results.length > 0) break;
      }
      
      return results.slice(0, max);
    }, maxResults);
  }

  async extractDetailedData(index) {
    try {
      // Tentar clicar no resultado para obter detalhes
      const selector = `div[data-result-index="${index}"], div[role="article"]:nth-child(${index + 1})`;
      
      try {
        await this.page.click(selector);
        await delay(3000);
      } catch (e) {
        console.log(`⚠️ Não foi possível clicar no resultado ${index}`);
        return null;
      }
      
      // Extrair detalhes da página de detalhes
      const details = await this.page.evaluate(() => {
        const data = {};
        
        // Telefone
        const phoneEl = document.querySelector('[data-item-id*="phone"], a[href^="tel:"]');
        if (phoneEl) {
          data.telefone = phoneEl.textContent?.trim() || phoneEl.getAttribute('href')?.replace('tel:', '') || '';
        }
        
        // Website
        const websiteEl = document.querySelector('[data-item-id*="authority"], a[href^="http"]:not([href*="maps.google"])');
        if (websiteEl) {
          data.website = websiteEl.getAttribute('href') || '';
        }
        
        // Avaliação
        const ratingEl = document.querySelector('[role="img"][aria-label*="estrela"]');
        if (ratingEl) {
          const ratingText = ratingEl.getAttribute('aria-label') || '';
          const ratingMatch = ratingText.match(/([0-9,\.]+)/);
          if (ratingMatch) {
            data.avaliacao = ratingMatch[1];
          }
        }
        
        // Total de avaliações
        const reviewsEl = document.querySelector('button[aria-label*="avaliações"], button[aria-label*="reviews"]');
        if (reviewsEl) {
          const reviewsText = reviewsEl.getAttribute('aria-label') || '';
          const reviewsMatch = reviewsText.match(/([0-9\.]+)/);
          if (reviewsMatch) {
            data.totalAvaliacoes = reviewsMatch[1];
          }
        }
        
        // Horário de funcionamento
        const hoursEl = document.querySelector('[data-item-id*="oh"], [aria-label*="Horário"]');
        if (hoursEl) {
          data.horario = hoursEl.textContent?.trim() || '';
        }
        
        // Coordenadas da URL
        const url = window.location.href;
        const coordMatch = url.match(/@(-?[0-9\.]+),(-?[0-9\.]+)/);
        if (coordMatch) {
          data.latitude = coordMatch[1];
          data.longitude = coordMatch[2];
        }
        
        return data;
      });
      
      return details;
      
    } catch (error) {
      console.log(`⚠️ Erro extraindo detalhes do resultado ${index}:`, error.message);
      return null;
    }
  }

  async saveToCSV(filename) {
    if (this.extractedData.length === 0) {
      console.log('⚠️ Nenhum dado para salvar');
      return null;
    }
    
    const filepath = createCSV(this.extractedData, filename);
    console.log(`✅ Dados salvos: ${this.extractedData.length} registros`);
    return filepath;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador fechado');
    }
  }

  // Método para exibir resumo
  displaySummary() {
    console.log('\n📊 RESUMO DOS DADOS EXTRAÍDOS:');
    console.log(`Total de registros: ${this.extractedData.length}`);
    
    this.extractedData.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.nome}`);
      if (item.endereco) console.log(`   📍 ${item.endereco}`);
      if (item.telefone) console.log(`   📞 ${item.telefone}`);
      if (item.website) console.log(`   🌐 ${item.website}`);
      if (item.avaliacao) console.log(`   ⭐ ${item.avaliacao} (${item.totalAvaliacoes || 0} avaliações)`);
    });
  }
}

// Função principal para execução
async function runScraper() {
  const scraper = new GoogleMapsCSVScraper();
  
  try {
    await scraper.init();
    
    // Configurar a busca
    const searchTerm = 'padarias São Paulo';
    const maxResults = 5; // Número máximo de resultados
    
    console.log(`🎯 Iniciando extração: "${searchTerm}" (max: ${maxResults})`);
    
    // Executar busca
    const results = await scraper.searchLocation(searchTerm, maxResults);
    
    if (results.length > 0) {
      // Exibir resumo
      scraper.displaySummary();
      
      // Salvar CSV
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `leads_google_maps_${timestamp}.csv`;
      const filepath = await scraper.saveToCSV(filename);
      
      console.log(`\n🎉 Extração concluída com sucesso!`);
      console.log(`📄 Arquivo CSV: ${filepath}`);
      
    } else {
      console.log('❌ Nenhum dado foi extraído');
    }
    
  } catch (error) {
    console.error('❌ Erro na execução:', error);
  } finally {
    await scraper.close();
  }
}

// Executar se este arquivo for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraper().catch(console.error);
}

export { GoogleMapsCSVScraper, createCSV };
