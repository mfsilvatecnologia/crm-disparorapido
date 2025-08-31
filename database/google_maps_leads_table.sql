-- Tabela otimizada para receber dados extraídos do Google Maps
-- Compatível com o schema existente do CRM

CREATE TABLE IF NOT EXISTS leads_google_maps (
    -- Identificação única
    id SERIAL PRIMARY KEY,
    
    -- Dados básicos do estabelecimento
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    
    -- Contato
    telefone VARCHAR(20),
    email VARCHAR(255),
    website TEXT,
    
    -- Classificação
    categoria VARCHAR(100),
    tipo_estabelecimento VARCHAR(100),
    
    -- Avaliações e reputação
    avaliacao DECIMAL(2,1), -- Ex: 4.5
    total_avaliacoes INTEGER,
    
    -- Funcionamento
    horario_funcionamento TEXT,
    aberto_24h BOOLEAN DEFAULT FALSE,
    
    -- Localização geográfica
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Identificadores externos
    place_id VARCHAR(100), -- Google Place ID
    google_maps_url TEXT,
    
    -- Status e qualificação
    verificado BOOLEAN DEFAULT FALSE,
    fotos INTEGER DEFAULT 0,
    
    -- Informações adicionais
    servicos TEXT, -- JSON ou texto separado por ;
    formas_pagamento TEXT,
    acessibilidade TEXT,
    descricao TEXT,
    
    -- Metadados da coleta
    fonte VARCHAR(50) DEFAULT 'google-maps',
    data_coleta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    termo_busca VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo',
    
    -- Relacionamento com CRM (futuro)
    organization_id UUID, -- FK para organizations
    lead_convertido BOOLEAN DEFAULT FALSE,
    lead_id UUID, -- FK para leads se convertido
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    CONSTRAINT unique_place_id UNIQUE (place_id),
    CONSTRAINT valid_rating CHECK (avaliacao IS NULL OR (avaliacao >= 0 AND avaliacao <= 5))
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_leads_gm_nome ON leads_google_maps(nome);
CREATE INDEX IF NOT EXISTS idx_leads_gm_cidade_bairro ON leads_google_maps(cidade, bairro);
CREATE INDEX IF NOT EXISTS idx_leads_gm_categoria ON leads_google_maps(categoria);
CREATE INDEX IF NOT EXISTS idx_leads_gm_avaliacao ON leads_google_maps(avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_leads_gm_data_coleta ON leads_google_maps(data_coleta DESC);
CREATE INDEX IF NOT EXISTS idx_leads_gm_status ON leads_google_maps(status);
CREATE INDEX IF NOT EXISTS idx_leads_gm_location ON leads_google_maps(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_leads_gm_organization ON leads_google_maps(organization_id);

-- Índice GiST para consultas geográficas (se PostGIS estiver disponível)
-- CREATE INDEX IF NOT EXISTS idx_leads_gm_geo ON leads_google_maps USING GIST (ST_Point(longitude, latitude));

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_google_maps_updated_at 
    BEFORE UPDATE ON leads_google_maps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View para relatórios e análises
CREATE OR REPLACE VIEW v_leads_google_maps_stats AS
SELECT 
    categoria,
    COUNT(*) as total_estabelecimentos,
    AVG(avaliacao) as avaliacao_media,
    COUNT(CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 END) as com_telefone,
    COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as com_website,
    COUNT(CASE WHEN verificado = true THEN 1 END) as verificados,
    COUNT(CASE WHEN aberto_24h = true THEN 1 END) as aberto_24h,
    MAX(data_coleta) as ultima_coleta
FROM leads_google_maps
WHERE status = 'ativo'
GROUP BY categoria
ORDER BY total_estabelecimentos DESC;

-- View para integração com CRM
CREATE OR REPLACE VIEW v_leads_para_crm AS
SELECT 
    id,
    nome,
    CASE 
        WHEN telefone IS NOT NULL AND telefone != '' THEN telefone
        ELSE NULL 
    END as telefone,
    CASE 
        WHEN email IS NOT NULL AND email != '' THEN email
        ELSE NULL 
    END as email,
    endereco,
    cidade,
    estado,
    categoria as segmento,
    avaliacao,
    'google-maps' as origem,
    google_maps_url as fonte_url,
    data_coleta
FROM leads_google_maps
WHERE status = 'ativo'
    AND lead_convertido = FALSE
    AND (telefone IS NOT NULL OR email IS NOT NULL OR website IS NOT NULL)
ORDER BY avaliacao DESC NULLS LAST, total_avaliacoes DESC NULLS LAST;

-- Função para converter lead do Google Maps para CRM
CREATE OR REPLACE FUNCTION converter_lead_google_maps(
    p_google_maps_id INTEGER,
    p_organization_id UUID,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_lead_id UUID;
    v_google_data RECORD;
BEGIN
    -- Buscar dados do Google Maps
    SELECT * INTO v_google_data
    FROM leads_google_maps
    WHERE id = p_google_maps_id AND status = 'ativo' AND lead_convertido = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead do Google Maps não encontrado ou já convertido';
    END IF;
    
    -- Inserir novo lead no CRM
    INSERT INTO leads (
        id,
        organization_id,
        name,
        email,
        phone,
        address,
        city,
        state,
        source,
        segment,
        notes,
        custom_fields,
        created_by,
        created_at
    ) VALUES (
        gen_random_uuid(),
        p_organization_id,
        v_google_data.nome,
        v_google_data.email,
        v_google_data.telefone,
        v_google_data.endereco,
        v_google_data.cidade,
        v_google_data.estado,
        'google-maps',
        v_google_data.categoria,
        CONCAT('Avaliação: ', COALESCE(v_google_data.avaliacao::text, 'N/A'), 
               ' | Total avaliações: ', COALESCE(v_google_data.total_avaliacoes::text, '0'),
               ' | Horário: ', COALESCE(v_google_data.horario_funcionamento, 'N/A')),
        json_build_object(
            'google_maps_url', v_google_data.google_maps_url,
            'place_id', v_google_data.place_id,
            'categoria', v_google_data.categoria,
            'avaliacao', v_google_data.avaliacao,
            'latitude', v_google_data.latitude,
            'longitude', v_google_data.longitude,
            'verificado', v_google_data.verificado
        ),
        p_user_id,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_lead_id;
    
    -- Marcar como convertido no Google Maps
    UPDATE leads_google_maps
    SET lead_convertido = TRUE,
        lead_id = v_lead_id,
        organization_id = p_organization_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_google_maps_id;
    
    RETURN v_lead_id;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE leads_google_maps IS 'Dados de estabelecimentos extraídos do Google Maps para prospecção de leads';
COMMENT ON COLUMN leads_google_maps.place_id IS 'Identificador único do Google Maps para o estabelecimento';
COMMENT ON COLUMN leads_google_maps.avaliacao IS 'Avaliação média no Google Maps (0.0 a 5.0)';
COMMENT ON COLUMN leads_google_maps.organization_id IS 'FK para organizations - define qual organização coletou/possui este lead';
COMMENT ON FUNCTION converter_lead_google_maps IS 'Converte um registro do Google Maps em lead no CRM principal';
