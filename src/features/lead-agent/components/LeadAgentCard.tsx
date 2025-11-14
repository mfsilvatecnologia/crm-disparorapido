import React from 'react';
import { LeadData, PorteEmpresa, LeadStatus, STATUS_LABELS } from '../types/agent';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface LeadAgentCardProps {
  lead: LeadData;
  onUpdateLead: (updates: Partial<LeadData>) => void;
  changedKeys: string[];
  isLoading: boolean;
}

export function LeadAgentCard({ lead, onUpdateLead, changedKeys, isLoading }: LeadAgentCardProps) {

  // Handlers
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ nomeEmpresa: e.target.value });
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ cnpj: e.target.value });
  };

  const handleSegmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ segmento: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateLead({ status: e.target.value as LeadStatus });
  };

  const handlePorteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateLead({ porteEmpresa: e.target.value as PorteEmpresa });
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(0, Number(e.target.value)));
    onUpdateLead({ scoreQualificacao: value });
  };

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateLead({ observacoes: e.target.value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    onUpdateLead({ tags });
  };

  // Contact field handlers
  const handleNomeContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ nomeContato: e.target.value });
  };

  const handleCargoContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ cargoContato: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ email: e.target.value });
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateLead({ telefone: e.target.value });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Extract Google Maps data from dadosOriginais
  const googleMapsData = (lead.dadosOriginais || {}) as any;
  const avaliacao = googleMapsData.avaliacao as string | undefined;
  const totalAvaliacoes = googleMapsData.totalAvaliacoes as string | undefined;
  const verificado = googleMapsData.verificado as boolean | undefined;
  const fotos = googleMapsData.fotos as number | undefined;
  const categoria = googleMapsData.categoria as string | undefined;
  const horarioFuncionamento = googleMapsData.horarioFuncionamento as string | undefined;

  return (
    <div className="lead-agent-card-container">
      {/* Header with Company Name and Key Metrics */}
      <Card className="header-card">
        <CardContent className="header-content">
          <input
            type="text"
            value={lead.nomeEmpresa || ''}
            onChange={handleCompanyNameChange}
            placeholder="Nome da Empresa"
            className="company-name-input"
            disabled={isLoading}
          />

          <div className="metrics-row">
            <div className="metric-badge">
              <span className="metric-label">Status</span>
              <select
                className="metric-select"
                value={lead.status}
                onChange={handleStatusChange}
                disabled={isLoading}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="metric-badge">
              <span className="metric-label">Porte</span>
              <select
                className="metric-select"
                value={lead.porteEmpresa}
                onChange={handlePorteChange}
                disabled={isLoading}
              >
                {Object.values(PorteEmpresa).map((porte) => (
                  <option key={porte} value={porte}>
                    {porte}
                  </option>
                ))}
              </select>
            </div>

            <div className="metric-badge">
              <span className="metric-label">Score</span>
              <input
                type="number"
                min="0"
                max="100"
                value={lead.scoreQualificacao}
                onChange={handleScoreChange}
                className="score-input"
                style={{ color: getScoreColor(lead.scoreQualificacao) }}
                disabled={isLoading}
              />
              <span className="score-max">/100</span>
            </div>

            {lead.fonte && (
              <div className="metric-badge">
                <span className="metric-label">Fonte</span>
                <Badge variant="outline">{lead.fonte}</Badge>
              </div>
            )}
          </div>

          {/* Google Maps Quick Info */}
          {(avaliacao || verificado || fotos) && (
            <div className="gmaps-quick-info">
              {verificado && (
                <Badge variant="default" className="verified-badge">
                  ✓ Verificado
                </Badge>
              )}
              {avaliacao && (
                <div className="rating-badge">
                  <span className="star-icon">★</span>
                  <span className="rating-value">{avaliacao}</span>
                  {totalAvaliacoes && (
                    <span className="rating-count">({totalAvaliacoes})</span>
                  )}
                </div>
              )}
              {fotos && (
                <span className="photos-badge">📷 {fotos} fotos</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados Gerais */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle className="section-title">Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="fields-grid">
            <div className="field-group">
              <label>CNPJ</label>
              <input
                type="text"
                value={lead.cnpj || ''}
                onChange={handleCNPJChange}
                placeholder="00.000.000/0000-00"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('cnpj') && <ChangedIndicator />}
            </div>

            <div className="field-group">
              <label>Segmento</label>
              <input
                type="text"
                value={lead.segmento || ''}
                onChange={handleSegmentChange}
                placeholder="Ex: Tecnologia"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('segmento') && <ChangedIndicator />}
            </div>

            {lead.numFuncionarios && (
              <div className="field-group">
                <label>Funcionários</label>
                <div className="readonly-field">{lead.numFuncionarios}</div>
              </div>
            )}

            {lead.receitaAnualEstimada && (
              <div className="field-group">
                <label>Receita Anual Est.</label>
                <div className="readonly-field">
                  R$ {lead.receitaAnualEstimada.toLocaleString('pt-BR')}
                </div>
              </div>
            )}

            {lead.linkedinUrl && (
              <div className="field-group full-width">
                <label>LinkedIn</label>
                <a
                  href={lead.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-field"
                >
                  {lead.linkedinUrl}
                </a>
              </div>
            )}

            {lead.siteEmpresa && (
              <div className="field-group full-width">
                <label>Site</label>
                <a
                  href={lead.siteEmpresa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-field"
                >
                  {lead.siteEmpresa}
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="field-group tags-section">
            <label>Tags</label>
            <input
              type="text"
              value={lead.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="Separe as tags por vírgula"
              className="field-input"
              disabled={isLoading}
            />
            <div className="tags-display">
              {lead.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            {changedKeys.includes('tags') && <ChangedIndicator />}
          </div>
        </CardContent>
      </Card>

      {/* Contato Principal */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle className="section-title">Contato Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="fields-grid">
            <div className="field-group">
              <label>Nome do Contato</label>
              <input
                type="text"
                value={lead.nomeContato || ''}
                onChange={handleNomeContatoChange}
                placeholder="Nome completo"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('nomeContato') && <ChangedIndicator />}
            </div>

            <div className="field-group">
              <label>Cargo</label>
              <input
                type="text"
                value={lead.cargoContato || ''}
                onChange={handleCargoContatoChange}
                placeholder="Ex: Diretor de TI"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('cargoContato') && <ChangedIndicator />}
            </div>

            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                value={lead.email || ''}
                onChange={handleEmailChange}
                placeholder="email@empresa.com"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('email') && <ChangedIndicator />}
            </div>

            <div className="field-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={lead.telefone || ''}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                className="field-input"
                disabled={isLoading}
              />
              {changedKeys.includes('telefone') && <ChangedIndicator />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle className="section-title">Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="fields-grid">
            <div className="field-group">
              <label>Cidade</label>
              <div className="readonly-field">{lead.endereco?.cidade || '-'}</div>
            </div>
            <div className="field-group">
              <label>Estado</label>
              <div className="readonly-field">{lead.endereco?.estado || '-'}</div>
            </div>
            <div className="field-group">
              <label>País</label>
              <div className="readonly-field">{lead.endereco?.pais || 'Brasil'}</div>
            </div>

            {googleMapsData.enderecoCompleto?.rua && (
              <div className="field-group full-width">
                <label>Rua</label>
                <div className="readonly-field">
                  {String(googleMapsData.enderecoCompleto.rua)}, {String(googleMapsData.enderecoCompleto.numero || '')}
                </div>
              </div>
            )}

            {googleMapsData.enderecoCompleto?.cep && (
              <div className="field-group">
                <label>CEP</label>
                <div className="readonly-field">{String(googleMapsData.enderecoCompleto.cep)}</div>
              </div>
            )}

            {googleMapsData.enderecoCompleto?.bairro && (
              <div className="field-group">
                <label>Bairro</label>
                <div className="readonly-field">{String(googleMapsData.enderecoCompleto.bairro)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Data */}
      {(categoria || horarioFuncionamento || fotos) && (
        <Card className="section-card">
          <CardHeader>
            <CardTitle className="section-title">📍 Dados do Google Maps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="gmaps-details">
              {categoria && (
                <div className="field-group">
                  <label>Categoria</label>
                  <div className="readonly-field">{String(categoria)}</div>
                </div>
              )}

              {horarioFuncionamento && (
                <div className="field-group full-width">
                  <label>Horário de Funcionamento</label>
                  <div className="horario-display">
                    {String(horarioFuncionamento).split(';').map((horario: string, idx: number) => (
                      <div key={idx} className="horario-item">
                        {horario.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {googleMapsData.googleMapsUrl && (
                <div className="field-group full-width">
                  <label>Link do Google Maps</label>
                  <a
                    href={String(googleMapsData.googleMapsUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-field"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      <Card className="section-card">
        <CardHeader>
          <CardTitle className="section-title">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="field-group observations-section">
            <label>Anotações e Histórico</label>
            <textarea
              value={lead.observacoes || ''}
              onChange={handleObservacoesChange}
              placeholder="Adicione observações importantes sobre o lead, histórico de contatos, anotações de reuniões, etc..."
              className="observations-textarea"
              rows={6}
              disabled={isLoading}
            />
            {changedKeys.includes('observacoes') && <ChangedIndicator />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChangedIndicator() {
  return (
    <span className="changed-indicator" title="Campo modificado pela IA">
      <span className="pulse-dot"></span>
      Modificado
    </span>
  );
}
