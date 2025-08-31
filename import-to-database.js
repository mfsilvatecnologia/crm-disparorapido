/**
 * Script para importar CSV do Google Maps para PostgreSQL
 * Conecta no banco e insere dados extraídos
 */

import fs from 'fs';
import pg from 'pg';
import csv from 'csv-parser';

const { Client } = pg;

class GoogleMapsToDatabase {
  constructor(dbConfig) {
    this.client = new Client(dbConfig);
    this.connected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('✅ Conectado ao banco de dados PostgreSQL');
    } catch (error) {
      console.error('❌ Erro conectando ao banco:', error.message);
      throw error;
    }
  }

  async createTableIfNotExists() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS leads_google_maps (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        endereco TEXT,
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(9),
        telefone VARCHAR(20),
        email VARCHAR(255),
        website TEXT,
        categoria VARCHAR(100),
        tipo_estabelecimento VARCHAR(100),
        avaliacao DECIMAL(2,1),
        total_avaliacoes INTEGER,
        horario_funcionamento TEXT,
        aberto_24h BOOLEAN DEFAULT FALSE,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        place_id VARCHAR(100),
        google_maps_url TEXT,
        verificado BOOLEAN DEFAULT FALSE,
        fotos INTEGER DEFAULT 0,
        servicos TEXT,
        formas_pagamento TEXT,
        acessibilidade TEXT,
        descricao TEXT,
        fonte VARCHAR(50) DEFAULT 'google-maps',
        data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        termo_busca VARCHAR(255),
        status VARCHAR(20) DEFAULT 'ativo',
        organization_id UUID,
        lead_convertido BOOLEAN DEFAULT FALSE,
        lead_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_place_id UNIQUE (place_id),
        CONSTRAINT valid_rating CHECK (avaliacao IS NULL OR (avaliacao >= 0 AND avaliacao <= 5))
      );
    `;

    try {
      await this.client.query(createTableSQL);
      console.log('✅ Tabela leads_google_maps criada/verificada');
    } catch (error) {
      console.error('❌ Erro criando tabela:', error.message);
      throw error;
    }
  }

  async importCSV(csvFilePath, organizationId = null) {
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`Arquivo CSV não encontrado: ${csvFilePath}`);
    }

    console.log(`📄 Importando dados de: ${csvFilePath}`);

    const results = [];
    let imported = 0;
    let errors = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          console.log(`📊 Processando ${results.length} registros...`);

          for (const [index, row] of results.entries()) {
            try {
              await this.insertRecord(row, organizationId);
              imported++;
              
              if ((index + 1) % 10 === 0) {
                console.log(`   Processados: ${index + 1}/${results.length}`);
              }
            } catch (error) {
              errors++;
              console.error(`❌ Erro na linha ${index + 1}:`, error.message);
            }
          }

          console.log(`\n✅ Importação concluída:`);
          console.log(`   - Importados: ${imported}`);
          console.log(`   - Erros: ${errors}`);
          console.log(`   - Total: ${results.length}`);

          resolve({ imported, errors, total: results.length });
        })
        .on('error', reject);
    });
  }

  async insertRecord(row, organizationId) {
    const insertSQL = `
      INSERT INTO leads_google_maps (
        nome, endereco, bairro, cidade, estado, cep,
        telefone, email, website, categoria, tipo_estabelecimento,
        avaliacao, total_avaliacoes, horario_funcionamento, aberto_24h,
        latitude, longitude, place_id, google_maps_url,
        verificado, fotos, servicos, formas_pagamento,
        acessibilidade, descricao, fonte, termo_busca,
        status, organization_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29
      )
      ON CONFLICT (place_id) DO UPDATE SET
        nome = EXCLUDED.nome,
        endereco = EXCLUDED.endereco,
        telefone = EXCLUDED.telefone,
        website = EXCLUDED.website,
        avaliacao = EXCLUDED.avaliacao,
        total_avaliacoes = EXCLUDED.total_avaliacoes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      row.nome || '',
      row.endereco || '',
      row.bairro || '',
      row.cidade || '',
      row.estado || '',
      row.cep || '',
      row.telefone || '',
      row.email || '',
      row.website || '',
      row.categoria || '',
      row.tipo_estabelecimento || '',
      this.parseFloat(row.avaliacao),
      this.parseInt(row.total_avaliacoes),
      row.horario_funcionamento || '',
      this.parseBoolean(row.aberto_24h),
      this.parseFloat(row.latitude),
      this.parseFloat(row.longitude),
      row.place_id || '',
      row.google_maps_url || '',
      this.parseBoolean(row.verificado),
      this.parseInt(row.fotos) || 0,
      row.servicos || '',
      row.formas_pagamento || '',
      row.acessibilidade || '',
      row.descricao || '',
      row.fonte || 'google-maps',
      row.termo_busca || '',
      row.status || 'ativo',
      organizationId
    ];

    const result = await this.client.query(insertSQL, values);
    return result.rows[0]?.id;
  }

  // Helpers para parsing
  parseFloat(value) {
    if (!value || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  parseInt(value) {
    if (!value || value === '') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  }

  parseBoolean(value) {
    if (!value || value === '') return false;
    return value.toLowerCase() === 'true' || value === '1';
  }

  async getStats() {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 END) as com_telefone,
        COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as com_website,
        COUNT(CASE WHEN avaliacao IS NOT NULL THEN 1 END) as com_avaliacao,
        AVG(avaliacao) as avaliacao_media,
        COUNT(CASE WHEN verificado = true THEN 1 END) as verificados,
        categoria,
        COUNT(*) as por_categoria
      FROM leads_google_maps 
      WHERE status = 'ativo'
      GROUP BY categoria
      ORDER BY por_categoria DESC;
    `;

    try {
      const result = await this.client.query(statsQuery);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro buscando estatísticas:', error.message);
      return [];
    }
  }

  async close() {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
      console.log('🔒 Conexão com banco fechada');
    }
  }
}

// Configuração do banco (ajustar conforme necessário)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'leadsrapido',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Função principal para importação
async function importGoogleMapsData() {
  const importer = new GoogleMapsToDatabase(dbConfig);

  try {
    console.log('🚀 Iniciando importação para banco de dados...');
    
    await importer.connect();
    await importer.createTableIfNotExists();

    // Buscar arquivo CSV mais recente
    const csvFiles = fs.readdirSync('.')
      .filter(file => file.startsWith('leads_') && file.endsWith('.csv'))
      .sort()
      .reverse();

    if (csvFiles.length === 0) {
      console.log('❌ Nenhum arquivo CSV de leads encontrado');
      return;
    }

    const latestCSV = csvFiles[0];
    console.log(`📄 Arquivo selecionado: ${latestCSV}`);

    // Importar dados
    const result = await importer.importCSV(latestCSV);

    if (result.imported > 0) {
      console.log('\n📊 Buscando estatísticas...');
      const stats = await importer.getStats();
      
      if (stats.length > 0) {
        console.log('\n📈 ESTATÍSTICAS DO BANCO:');
        stats.forEach(stat => {
          console.log(`- ${stat.categoria}: ${stat.por_categoria} estabelecimentos`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
  } finally {
    await importer.close();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  importGoogleMapsData().catch(console.error);
}

export { GoogleMapsToDatabase };
