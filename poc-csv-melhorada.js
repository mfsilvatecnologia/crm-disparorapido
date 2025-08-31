/**
 * POC CSV MELHORADA - Extração corrigida com nomes dos URLs
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para extrair nome da URL do Google Maps
function extractNameFromUrl(url) {
  try {
    // Exemplo: /maps/place/Padaria+Bella+Paulista/
    const match = url.match(/\/maps\/place\/([^\/]+)/);
    if (match) {
      let name = decodeURIComponent(match[1]);
      // Substituir + por espaços
      name = name.replace(/\+/g, ' ');
      // Decodificar caracteres especiais
      name = name.replace(/%C3%A3/g, 'ã');
      name = name.replace(/%C3%A9/g, 'é');
      name = name.replace(/%C3%A7/g, 'ç');
      name = name.replace(/%C3%83/g, 'Ã');
      return name;
    }
  } catch (e) {
    console.log('Erro extraindo nome da URL:', e.message);
  }
  return null;
}

async function extractToCSVImproved() {
  console.log('🚀 Iniciando extração melhorada para CSV...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // User agent realístico
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📍 Navegando para Google Maps...');
    await page.goto('https://maps.google.com', { waitUntil: 'networkidle2' });
    
    await delay(3000);
    console.log('🔍 Fazendo busca por "padarias São Paulo"...');
    
    // Limpar campo e fazer busca
    await page.click('#searchboxinput');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('#searchboxinput', 'padarias São Paulo', { delay: 100 });
    await page.keyboard.press('Enter');
    
    console.log('⏳ Aguardando resultados carregarem...');
    await delay(8000);
    
    // Scroll para carregar mais resultados
    console.log('📜 Fazendo scroll para carregar mais resultados...');
    await page.evaluate(() => {
      const resultsPanel = document.querySelector('[role="main"]');
      if (resultsPanel) {
        resultsPanel.scrollBy(0, 1000);
      }
    });
    await delay(3000);
    
    // Extrair dados melhorados
    console.log('📊 Extraindo dados melhorados...');
    const results = await page.evaluate(() => {
      const data = [];
      
      // Estratégia melhorada: buscar links e extrair informações
      const links = document.querySelectorAll('a[href*="/maps/place/"]');
      console.log(`Encontrados ${links.length} links de estabelecimentos`);
      
      const processedUrls = new Set(); // Evitar duplicatas
      
      links.forEach((link, index) => {
        try {
          const href = link.href;
          
          // Evitar duplicatas
          if (processedUrls.has(href)) return;
          processedUrls.add(href);
          
          // Tentar extrair nome do link
          let nome = '';
          
          // Método 1: texto do link
          const linkText = link.textContent?.trim();
          if (linkText && linkText.length > 2 && linkText.length < 100) {
            nome = linkText;
          }
          
          // Método 2: buscar em elementos próximos
          if (!nome || nome === 'Ver no Google Maps' || nome.includes('directions')) {
            const parent = link.closest('div[data-result-index], div[role="article"]');
            if (parent) {
              const nameElements = parent.querySelectorAll('h3, [role="img"][aria-label], .section-result-title');
              for (const el of nameElements) {
                const text = el.textContent?.trim() || el.getAttribute('aria-label')?.trim();
                if (text && text.length > 2 && text.length < 100 && 
                    !text.includes('estrela') && !text.includes('rating')) {
                  nome = text;
                  break;
                }
              }
            }
          }
          
          // Método 3: extrair da URL como fallback
          if (!nome || nome.length < 3) {
            const urlMatch = href.match(/\/maps\/place\/([^\/]+)/);
            if (urlMatch) {
              nome = decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ');
            }
          }
          
          // Extrair coordenadas da URL
          let latitude = '', longitude = '';
          const coordMatch = href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordMatch) {
            latitude = coordMatch[1];
            longitude = coordMatch[2];
          }
          
          // Adicionar apenas se temos um nome válido
          if (nome && nome.length > 2) {
            data.push({
              nome: nome,
              url: href,
              latitude: latitude,
              longitude: longitude,
              index: data.length + 1
            });
          }
          
        } catch (e) {
          console.log(`Erro processando link ${index}:`, e.message);
        }
      });
      
      console.log(`Processados ${data.length} estabelecimentos únicos`);
      return data.slice(0, 15); // Máximo 15 resultados
    });
    
    console.log(`✅ Dados extraídos: ${results.length} registros`);
    
    // Enriquecer dados
    const enrichedData = results.map((item, index) => {
      // Tentar extrair mais informações da URL
      let endereco = 'São Paulo, SP';
      let categoria = 'Padaria';
      
      // Se a URL contém coordenadas, podemos inferir localização mais específica
      if (item.latitude && item.longitude) {
        const lat = parseFloat(item.latitude);
        const lng = parseFloat(item.longitude);
        
        // Regiões aproximadas de São Paulo baseadas em coordenadas
        if (lat > -23.55 && lng > -46.65) {
          endereco = 'Centro, São Paulo - SP';
        } else if (lat > -23.57 && lng < -46.67) {
          endereco = 'Zona Oeste, São Paulo - SP';
        } else if (lat < -23.57 && lng > -46.60) {
          endereco = 'Zona Sul, São Paulo - SP';
        } else {
          endereco = 'São Paulo - SP';
        }
      }
      
      return {
        id: index + 1,
        nome: item.nome,
        endereco: endereco,
        telefone: '', // Seria extraído com análise individual
        website: '', // Seria extraído com análise individual  
        categoria: categoria,
        avaliacao: '',
        totalAvaliacoes: '',
        horario: '',
        latitude: item.latitude,
        longitude: item.longitude,
        googleMapsUrl: item.url,
        fonte: 'google-maps-melhorado',
        dataColeta: new Date().toISOString(),
        termoBusca: 'padarias São Paulo'
      };
    });
    
    // Gerar CSV melhorado
    if (enrichedData.length > 0) {
      const headers = [
        'ID',
        'Nome',
        'Endereço', 
        'Telefone',
        'Website',
        'Categoria',
        'Avaliação',
        'Total_Avaliações',
        'Horário',
        'Latitude',
        'Longitude',
        'Google_Maps_URL',
        'Fonte',
        'Data_Coleta',
        'Termo_Busca'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      enrichedData.forEach(item => {
        const row = [
          item.id,
          `"${item.nome.replace(/"/g, '""')}"`,
          `"${item.endereco}"`,
          `"${item.telefone}"`,
          `"${item.website}"`,
          `"${item.categoria}"`,
          `"${item.avaliacao}"`,
          `"${item.totalAvaliacoes}"`,
          `"${item.horario}"`,
          `"${item.latitude}"`,
          `"${item.longitude}"`,
          `"${item.googleMapsUrl}"`,
          `"${item.fonte}"`,
          `"${item.dataColeta}"`,
          `"${item.termoBusca}"`
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Salvar arquivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `leads_corrigidos_${timestamp}.csv`;
      fs.writeFileSync(filename, csvContent, 'utf8');
      
      console.log(`\n📄 CSV corrigido gerado: ${filename}`);
      console.log(`📊 Total de registros: ${enrichedData.length}`);
      
      // Preview dos dados
      console.log('\n📋 PREVIEW DOS DADOS CORRIGIDOS:');
      enrichedData.forEach((item, index) => {
        console.log(`${index + 1}. ${item.nome}`);
        if (item.latitude && item.longitude) {
          console.log(`   📍 Lat: ${item.latitude}, Lng: ${item.longitude}`);
        }
        console.log(`   🔗 ${item.googleMapsUrl.substring(0, 60)}...`);
      });
      
      console.log(`\n🎉 Extração melhorada concluída! Arquivo: ${filename}`);
      
    } else {
      console.log('❌ Nenhum dado foi extraído');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    console.log('\n⏳ Aguardando 5 segundos antes de fechar...');
    await delay(5000);
    await browser.close();
    console.log('🔒 Navegador fechado');
  }
}

// Executar
extractToCSVImproved().catch(console.error);
