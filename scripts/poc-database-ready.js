/**
 * POC AVANÇADA - Extração completa de dados para banco
 * Extrai dados detalhados clicando em cada estabelecimento
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AdvancedGoogleMapsScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.extractedData = [];
  }

  async init() {
    console.log('🚀 Iniciando scraper avançado...');
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // User agent realístico
    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Remover assinatura de automação
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });
  }

  async searchAndExtract(searchTerm, maxResults = 10) {
    try {
      console.log(`🔍 Buscando: "${searchTerm}"`);
      
      // Navegar para Google Maps
      await this.page.goto('https://maps.google.com', { waitUntil: 'networkidle2' });
      await delay(3000);
      
      // Fazer busca
      await this.page.click('#searchboxinput');
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.page.type('#searchboxinput', searchTerm, { delay: 100 });
      await this.page.keyboard.press('Enter');
      
      console.log('⏳ Aguardando resultados...');
      await delay(5000);
      
      // Aguardar lista de resultados
      try {
        await this.page.waitForSelector('[role="main"]', { timeout: 15000 });
        console.log('✅ Lista de resultados carregada');
      } catch (e) {
        console.log('⚠️ Timeout aguardando resultados');
      }
      
      // Scroll para carregar mais resultados
      await this.page.evaluate(() => {
        const resultsPanel = document.querySelector('[role="main"]');
        if (resultsPanel) {
          resultsPanel.scrollBy(0, 1500);
        }
      });
      await delay(3000);
      
      // Extrair lista básica de estabelecimentos
      const businessList = await this.page.evaluate(() => {
        const results = [];
        const links = document.querySelectorAll('a[href*="/maps/place/"]');
        
        const processedUrls = new Set();
        
        links.forEach((link, index) => {
          try {
            const href = link.href;
            if (processedUrls.has(href)) return;
            processedUrls.add(href);
            
            // Extrair nome básico da URL
            const urlMatch = href.match(/\/maps\/place\/([^\/\?]+)/);
            let nome = '';
            if (urlMatch) {
              nome = decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ');
            }
            
            // Tentar pegar coordenadas da URL
            const coordMatch = href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            let latitude = '', longitude = '';
            if (coordMatch) {
              latitude = coordMatch[1];
              longitude = coordMatch[2];
            }
            
            if (nome && nome.length > 2) {
              results.push({
                nome,
                url: href,
                latitude,
                longitude,
                index: results.length
              });
            }
          } catch (e) {
            console.log('Erro processando link:', e);
          }
        });
        
        return results.slice(0, 15); // Máximo 15 para não demorar muito
      });
      
      console.log(`📋 Encontrados ${businessList.length} estabelecimentos para análise detalhada`);
      
      // Para cada estabelecimento, extrair dados detalhados
      for (let i = 0; i < Math.min(businessList.length, maxResults); i++) {
        console.log(`\n📊 Extraindo detalhes ${i + 1}/${Math.min(businessList.length, maxResults)}: ${businessList[i].nome}`);
        
        const detailedData = await this.extractDetailedData(businessList[i], i);
        if (detailedData) {
          this.extractedData.push(detailedData);
        }
        
        // Delay entre extrações para evitar bloqueios
        await delay(2000);
      }
      
      return this.extractedData;
      
    } catch (error) {
      console.error('❌ Erro na busca:', error.message);
      return [];
    }
  }

  async extractDetailedData(business, index) {
    try {
      console.log(`   🔗 Acessando: ${business.nome}`);
      
      // Navegar para a página do estabelecimento
      await this.page.goto(business.url, { waitUntil: 'networkidle2' });
      await delay(3000);
      
      // Extrair dados detalhados
      const details = await this.page.evaluate(() => {
        const data = {
          // Dados básicos
          nome: '',
          endereco: '',
          telefone: '',
          website: '',
          email: '',
          
          // Categoria e tipo
          categoria: '',
          tipoEstabelecimento: '',
          
          // Avaliações
          avaliacao: '',
          totalAvaliacoes: '',
          
          // Horário de funcionamento
          horarioFuncionamento: '',
          aberto24h: false,
          
          // Localização
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          
          // Informações adicionais
          descricao: '',
          servicos: [],
          formasPagamento: [],
          acessibilidade: '',
          
          // Dados técnicos
          placeId: '',
          verificado: false,
          
          // Social
          fotos: 0,
          reviews: []
        };
        
        try {
          // Nome do estabelecimento
          const nameSelectors = [
            'h1[data-attrid="title"]',
            'h1.DUwDvf',
            'h1.x3AX1-LfntMc-header-title-title',
            '[data-value="Name"]'
          ];
          
          for (const selector of nameSelectors) {
            const nameEl = document.querySelector(selector);
            if (nameEl && nameEl.textContent.trim()) {
              data.nome = nameEl.textContent.trim();
              break;
            }
          }
          
          // Endereço
          const addressSelectors = [
            '[data-item-id="address"] .Io6YTe',
            '[data-attrid="kc:/location/location:address"]',
            '.Io6YTe.fontBodyMedium',
            '[aria-label*="Endereço"]'
          ];
          
          for (const selector of addressSelectors) {
            const addrEl = document.querySelector(selector);
            if (addrEl && addrEl.textContent.trim()) {
              data.endereco = addrEl.textContent.trim();
              
              // Extrair componentes do endereço
              const enderecoText = data.endereco;
              if (enderecoText.includes('São Paulo')) {
                data.cidade = 'São Paulo';
                data.estado = 'SP';
              }
              
              // Tentar extrair bairro
              const bairroMatch = enderecoText.match(/[-,]\s*([^,]+)(?=,\s*São Paulo)/);
              if (bairroMatch) {
                data.bairro = bairroMatch[1].trim();
              }
              
              // Tentar extrair CEP
              const cepMatch = enderecoText.match(/(\d{5}-?\d{3})/);
              if (cepMatch) {
                data.cep = cepMatch[1];
              }
              
              break;
            }
          }
          
          // Telefone
          const phoneSelectors = [
            '[data-item-id*="phone"] .Io6YTe',
            'a[href^="tel:"]',
            '[aria-label*="Telefone"]'
          ];
          
          for (const selector of phoneSelectors) {
            const phoneEl = document.querySelector(selector);
            if (phoneEl) {
              data.telefone = phoneEl.textContent?.trim() || phoneEl.getAttribute('href')?.replace('tel:', '') || '';
              if (data.telefone) break;
            }
          }
          
          // Website
          const websiteSelectors = [
            '[data-item-id*="authority"] a',
            'a[href^="http"]:not([href*="maps.google"]):not([href*="google.com/search"])',
            '[aria-label*="Website"]'
          ];
          
          for (const selector of websiteSelectors) {
            const websiteEl = document.querySelector(selector);
            if (websiteEl && websiteEl.href) {
              data.website = websiteEl.href;
              break;
            }
          }
          
          // Categoria
          const categorySelectors = [
            '.DkEaL',
            '[data-value="Category"]',
            '.YhemCb'
          ];
          
          for (const selector of categorySelectors) {
            const catEl = document.querySelector(selector);
            if (catEl && catEl.textContent.trim()) {
              data.categoria = catEl.textContent.trim();
              break;
            }
          }
          
          // Avaliação
          const ratingEl = document.querySelector('.F7nice span[aria-hidden="true"]');
          if (ratingEl) {
            data.avaliacao = ratingEl.textContent.trim();
          }
          
          // Total de avaliações
          const reviewsEl = document.querySelector('.F7nice .UY7F9');
          if (reviewsEl) {
            const reviewText = reviewsEl.textContent.trim();
            const reviewMatch = reviewText.match(/\(([\d\.]+)\)/);
            if (reviewMatch) {
              data.totalAvaliacoes = reviewMatch[1];
            }
          }
          
          // Horário de funcionamento
          const hoursEl = document.querySelector('[data-item-id*="oh"] .Io6YTe');
          if (hoursEl) {
            data.horarioFuncionamento = hoursEl.textContent.trim();
            data.aberto24h = data.horarioFuncionamento.toLowerCase().includes('24') || 
                           data.horarioFuncionamento.toLowerCase().includes('sempre aberto');
          }
          
          // Verificar se é estabelecimento verificado
          const verifiedEl = document.querySelector('[aria-label*="Verificad"]');
          data.verificado = !!verifiedEl;
          
          // Contar fotos
          const photoElements = document.querySelectorAll('[data-photo-index]');
          data.fotos = photoElements.length;
          
          // Extrair Place ID da URL
          const currentUrl = window.location.href;
          const placeIdMatch = currentUrl.match(/0x[a-f0-9]+:0x[a-f0-9]+/);
          if (placeIdMatch) {
            data.placeId = placeIdMatch[0];
          }
          
          // Serviços oferecidos (se disponível)
          const serviceElements = document.querySelectorAll('[data-value*="service"], [data-value*="amenity"]');
          serviceElements.forEach(el => {
            const service = el.textContent?.trim();
            if (service && service.length > 2) {
              data.servicos.push(service);
            }
          });
          
        } catch (e) {
          console.log('Erro extraindo dados:', e);
        }
        
        return data;
      });
      
      // Enriquecer dados com informações básicas
      const enrichedData = {
        id: index + 1,
        ...details,
        latitude: business.latitude,
        longitude: business.longitude,
        googleMapsUrl: business.url,
        fonte: 'google-maps-avancado',
        dataColeta: new Date().toISOString(),
        termoBusca: 'padarias São Paulo',
        status: 'ativo'
      };
      
      // Garantir que temos pelo menos o nome
      if (!enrichedData.nome || enrichedData.nome.length < 2) {
        enrichedData.nome = business.nome;
      }
      
      console.log(`   ✅ Extraído: ${enrichedData.nome}`);
      if (enrichedData.telefone) console.log(`      📞 ${enrichedData.telefone}`);
      if (enrichedData.website) console.log(`      🌐 ${enrichedData.website}`);
      if (enrichedData.avaliacao) console.log(`      ⭐ ${enrichedData.avaliacao} (${enrichedData.totalAvaliacoes} avaliações)`);
      
      return enrichedData;
      
    } catch (error) {
      console.log(`   ❌ Erro extraindo ${business.nome}:`, error.message);
      return null;
    }
  }

  async saveToAdvancedCSV(filename) {
    if (this.extractedData.length === 0) {
      console.log('⚠️ Nenhum dado para salvar');
      return null;
    }
    
    // Headers expandidos para banco de dados
    const headers = [
      'id',
      'nome',
      'endereco',
      'bairro',
      'cidade',
      'estado',
      'cep',
      'telefone',
      'email',
      'website',
      'categoria',
      'tipo_estabelecimento',
      'avaliacao',
      'total_avaliacoes',
      'horario_funcionamento',
      'aberto_24h',
      'latitude',
      'longitude',
      'place_id',
      'verificado',
      'fotos',
      'servicos',
      'formas_pagamento',
      'acessibilidade',
      'descricao',
      'google_maps_url',
      'fonte',
      'data_coleta',
      'termo_busca',
      'status'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    this.extractedData.forEach(item => {
      const row = [
        item.id || '',
        `"${(item.nome || '').replace(/"/g, '""')}"`,
        `"${(item.endereco || '').replace(/"/g, '""')}"`,
        `"${(item.bairro || '').replace(/"/g, '""')}"`,
        `"${(item.cidade || '').replace(/"/g, '""')}"`,
        `"${(item.estado || '').replace(/"/g, '""')}"`,
        `"${(item.cep || '').replace(/"/g, '""')}"`,
        `"${(item.telefone || '').replace(/"/g, '""')}"`,
        `"${(item.email || '').replace(/"/g, '""')}"`,
        `"${(item.website || '').replace(/"/g, '""')}"`,
        `"${(item.categoria || '').replace(/"/g, '""')}"`,
        `"${(item.tipoEstabelecimento || '').replace(/"/g, '""')}"`,
        `"${(item.avaliacao || '').replace(/"/g, '""')}"`,
        `"${(item.totalAvaliacoes || '').replace(/"/g, '""')}"`,
        `"${(item.horarioFuncionamento || '').replace(/"/g, '""')}"`,
        item.aberto24h ? 'true' : 'false',
        `"${(item.latitude || '').replace(/"/g, '""')}"`,
        `"${(item.longitude || '').replace(/"/g, '""')}"`,
        `"${(item.placeId || '').replace(/"/g, '""')}"`,
        item.verificado ? 'true' : 'false',
        item.fotos || 0,
        `"${(Array.isArray(item.servicos) ? item.servicos.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(Array.isArray(item.formasPagamento) ? item.formasPagamento.join('; ') : '').replace(/"/g, '""')}"`,
        `"${(item.acessibilidade || '').replace(/"/g, '""')}"`,
        `"${(item.descricao || '').replace(/"/g, '""')}"`,
        `"${(item.googleMapsUrl || '').replace(/"/g, '""')}"`,
        `"${(item.fonte || '').replace(/"/g, '""')}"`,
        `"${(item.dataColeta || '').replace(/"/g, '""')}"`,
        `"${(item.termoBusca || '').replace(/"/g, '""')}"`,
        `"${(item.status || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    fs.writeFileSync(filename, csvContent, 'utf8');
    console.log(`📄 CSV avançado salvo: ${filename}`);
    return filename;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador fechado');
    }
  }

  displayAdvancedSummary() {
    console.log('\n📊 RESUMO AVANÇADO DOS DADOS:');
    console.log(`Total de registros: ${this.extractedData.length}`);
    
    const stats = {
      comTelefone: 0,
      comWebsite: 0,
      comAvaliacao: 0,
      verificados: 0,
      aberto24h: 0
    };
    
    this.extractedData.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.nome}`);
      if (item.endereco) console.log(`   📍 ${item.endereco}`);
      if (item.telefone) {
        console.log(`   📞 ${item.telefone}`);
        stats.comTelefone++;
      }
      if (item.website) {
        console.log(`   🌐 ${item.website}`);
        stats.comWebsite++;
      }
      if (item.avaliacao) {
        console.log(`   ⭐ ${item.avaliacao} (${item.totalAvaliacoes} avaliações)`);
        stats.comAvaliacao++;
      }
      if (item.horarioFuncionamento) console.log(`   🕒 ${item.horarioFuncionamento}`);
      if (item.verificado) {
        console.log(`   ✅ Verificado`);
        stats.verificados++;
      }
      if (item.aberto24h) stats.aberto24h++;
    });
    
    console.log('\n📈 ESTATÍSTICAS:');
    console.log(`- Com telefone: ${stats.comTelefone}/${this.extractedData.length}`);
    console.log(`- Com website: ${stats.comWebsite}/${this.extractedData.length}`);
    console.log(`- Com avaliação: ${stats.comAvaliacao}/${this.extractedData.length}`);
    console.log(`- Verificados: ${stats.verificados}/${this.extractedData.length}`);
    console.log(`- Aberto 24h: ${stats.aberto24h}/${this.extractedData.length}`);
  }
}

// Função principal
async function runAdvancedScraper() {
  const scraper = new AdvancedGoogleMapsScraper();
  
  try {
    await scraper.init();
    
    const searchTerm = 'padarias São Paulo';
    const maxResults = 8; // Número controlado para não demorar muito
    
    console.log(`🎯 Iniciando extração avançada: "${searchTerm}" (max: ${maxResults})`);
    
    const results = await scraper.searchAndExtract(searchTerm, maxResults);
    
    if (results.length > 0) {
      scraper.displayAdvancedSummary();
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `leads_database_ready_${timestamp}.csv`;
      const filepath = await scraper.saveToAdvancedCSV(filename);
      
      console.log(`\n🎉 Extração avançada concluída!`);
      console.log(`📄 Arquivo pronto para banco: ${filepath}`);
      console.log(`📊 ${results.length} registros com dados detalhados`);
      
    } else {
      console.log('❌ Nenhum dado foi extraído');
    }
    
  } catch (error) {
    console.error('❌ Erro na execução:', error);
  } finally {
    await scraper.close();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAdvancedScraper().catch(console.error);
}

export { AdvancedGoogleMapsScraper };
