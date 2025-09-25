/**
 * POC SIMPLES - Extração com CSV
 * Versão simplificada que funciona e gera CSV
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

// Função helper para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractToCSV() {
  console.log('🚀 Iniciando extração para CSV...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Navegador visível
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar para Google Maps
    console.log('📍 Navegando para Google Maps...');
    await page.goto('https://maps.google.com', { waitUntil: 'networkidle2' });
    console.log('✅ Página carregada!');
    
    // Fazer busca
    await delay(3000);
    console.log('🔍 Fazendo busca por "padarias São Paulo"...');
    await page.click('#searchboxinput');
    await page.type('#searchboxinput', 'padarias São Paulo', { delay: 100 });
    await page.keyboard.press('Enter');
    
    // Aguardar resultados
    console.log('⏳ Aguardando resultados carregarem...');
    await delay(8000);
    
    // Extrair dados da página
    console.log('📊 Extraindo dados...');
    const results = await page.evaluate(() => {
      const data = [];
      
      // Tentar diferentes estratégias de seleção
      const strategies = [
        // Estratégia 1: Links para places
        () => {
          const links = document.querySelectorAll('a[href*="/maps/place/"]');
          console.log(`Estratégia 1: ${links.length} links encontrados`);
          return Array.from(links).map(link => ({
            nome: link.textContent?.trim() || 'Nome não encontrado',
            url: link.href,
            fonte: 'link-place'
          }));
        },
        
        // Estratégia 2: Elementos com data-result-index
        () => {
          const elements = document.querySelectorAll('div[data-result-index]');
          console.log(`Estratégia 2: ${elements.length} elementos data-result-index`);
          return Array.from(elements).map((el, index) => {
            const nome = el.querySelector('h3')?.textContent?.trim() || 
                        el.querySelector('[role="img"]')?.getAttribute('aria-label') || 
                        `Estabelecimento ${index + 1}`;
            return {
              nome,
              index,
              fonte: 'data-result-index'
            };
          });
        },
        
        // Estratégia 3: Busca geral por texto
        () => {
          const allElements = document.querySelectorAll('*');
          const businessElements = [];
          
          allElements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && 
                text.length > 3 && 
                text.length < 100 && 
                (text.includes('Padaria') || 
                 text.includes('Bakery') || 
                 text.includes('Pães') ||
                 /^[A-ZÀÁÂÃÄÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+$/.test(text))) {
              businessElements.push({
                nome: text,
                fonte: 'busca-geral'
              });
            }
          });
          
          // Remover duplicatas
          const unique = businessElements.filter((item, index, arr) => 
            arr.findIndex(i => i.nome === item.nome) === index
          );
          
          console.log(`Estratégia 3: ${unique.length} nomes encontrados`);
          return unique.slice(0, 10); // Máximo 10
        }
      ];
      
      // Tentar cada estratégia até conseguir dados
      for (const strategy of strategies) {
        try {
          const result = strategy();
          if (result && result.length > 0) {
            console.log(`Estratégia funcionou! ${result.length} resultados`);
            return result;
          }
        } catch (e) {
          console.log('Estratégia falhou:', e.message);
        }
      }
      
      return [];
    });
    
    // Processar e enriquecer dados
    const processedData = results.map((item, index) => ({
      id: index + 1,
      nome: item.nome || 'N/A',
      endereco: 'São Paulo, SP', // Genérico baseado na busca
      telefone: '', // Seria extraído com mais detalhes
      website: item.url || '',
      categoria: 'Padaria',
      avaliacao: '',
      totalAvaliacoes: '',
      horario: '',
      latitude: '',
      longitude: '',
      fonte: item.fonte || 'google-maps',
      dataColeta: new Date().toISOString(),
      termoBusca: 'padarias São Paulo'
    }));
    
    console.log(`✅ Dados extraídos: ${processedData.length} registros`);
    
    // Gerar CSV
    if (processedData.length > 0) {
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
        'Fonte',
        'Data_Coleta',
        'Termo_Busca'
      ];
      
      let csvContent = headers.join(',') + '\n';
      
      processedData.forEach(item => {
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
          `"${item.fonte}"`,
          `"${item.dataColeta}"`,
          `"${item.termoBusca}"`
        ];
        csvContent += row.join(',') + '\n';
      });
      
      // Salvar arquivo
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `leads_extraidos_${timestamp}.csv`;
      fs.writeFileSync(filename, csvContent, 'utf8');
      
      console.log(`\n📄 CSV gerado: ${filename}`);
      console.log(`📊 Total de registros: ${processedData.length}`);
      
      // Mostrar preview dos dados
      console.log('\n📋 PREVIEW DOS DADOS:');
      processedData.forEach((item, index) => {
        console.log(`${index + 1}. ${item.nome} (${item.fonte})`);
      });
      
      console.log(`\n🎉 Extração concluída! Arquivo salvo: ${filename}`);
      
    } else {
      console.log('❌ Nenhum dado foi extraído');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    console.log('\n⏳ Aguardando 5 segundos antes de fechar...');
    await delay(5000);
    await browser.close();
    console.log('🔒 Navegador fechado');
  }
}

// Executar
extractToCSV().catch(console.error);
