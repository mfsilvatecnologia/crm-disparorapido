/**
 * Script para corrigir CSV existente - extrai nomes das URLs
 */

import fs from 'fs';

// Função para extrair nome da URL do Google Maps
function extractNameFromUrl(url) {
  try {
    // Exemplo: /maps/place/Padaria+Bella+Paulista/
    const match = url.match(/\/maps\/place\/([^\/\?]+)/);
    if (match) {
      let name = decodeURIComponent(match[1]);
      
      // Substituir + por espaços
      name = name.replace(/\+/g, ' ');
      
      // Decodificar caracteres especiais comuns
      name = name.replace(/%C3%A3/g, 'ã');
      name = name.replace(/%C3%A9/g, 'é');
      name = name.replace(/%C3%A7/g, 'ç');
      name = name.replace(/%C3%83/g, 'Ã');
      name = name.replace(/%C3%81/g, 'Á');
      name = name.replace(/%C3%94/g, 'Ô');
      name = name.replace(/%26/g, '&');
      
      // Limpar caracteres extras
      name = name.trim();
      
      return name;
    }
  } catch (e) {
    console.log('Erro extraindo nome da URL:', e.message);
  }
  return null;
}

function fixCSV() {
  console.log('🔧 Corrigindo arquivo CSV existente...');
  
  // Ler arquivo original
  const originalFile = 'leads_extraidos_2025-08-20T12-38-52.csv';
  
  if (!fs.existsSync(originalFile)) {
    console.log('❌ Arquivo original não encontrado:', originalFile);
    return;
  }
  
  const csvContent = fs.readFileSync(originalFile, 'utf8');
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) {
    console.log('❌ Arquivo CSV vazio ou inválido');
    return;
  }
  
  const headers = lines[0];
  console.log('📋 Headers:', headers);
  
  const fixedLines = [headers]; // Manter cabeçalho
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse da linha CSV (simplificado)
    const columns = line.split(',');
    
    if (columns.length >= 6) { // Verificar se tem colunas suficientes
      const url = columns[5]; // Website está na coluna 5
      
      if (url && url.includes('/maps/place/')) {
        // Extrair nome da URL
        const extractedName = extractNameFromUrl(url);
        
        if (extractedName) {
          // Substituir "Nome não encontrado" pelo nome extraído
          columns[1] = `"${extractedName}"`;
          console.log(`✅ Corrigido: ${extractedName}`);
        }
      }
    }
    
    fixedLines.push(columns.join(','));
  }
  
  // Salvar arquivo corrigido
  const fixedContent = fixedLines.join('\n');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const fixedFilename = `leads_corrigidos_manual_${timestamp}.csv`;
  
  fs.writeFileSync(fixedFilename, fixedContent, 'utf8');
  
  console.log(`\n📄 Arquivo corrigido salvo: ${fixedFilename}`);
  console.log(`📊 Total de linhas processadas: ${fixedLines.length - 1}`);
  
  // Mostrar preview
  console.log('\n📋 PREVIEW DO ARQUIVO CORRIGIDO:');
  const previewLines = fixedLines.slice(1, 6); // Primeiras 5 linhas de dados
  previewLines.forEach((line, index) => {
    const columns = line.split(',');
    if (columns.length > 1) {
      console.log(`${index + 1}. ${columns[1].replace(/"/g, '')}`);
    }
  });
  
  return fixedFilename;
}

// Executar correção
const fixedFile = fixCSV();
if (fixedFile) {
  console.log(`\n🎉 Correção concluída! Arquivo: ${fixedFile}`);
}
