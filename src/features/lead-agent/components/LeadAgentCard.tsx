import React from 'react';
import { LeadData, LeadContact, LeadActivity, PorteEmpresa, LeadStatus, STATUS_LABELS, ACTIVITY_ICONS, ActivityType } from '../types/agent';
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
    onUpdateLead({ score: value });
  };

  const handleObservacoesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateLead({ observacoes: e.target.value });
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    onUpdateLead({ tags });
  };

  // Contact management
  const addContact = () => {
    onUpdateLead({
      contacts: [...lead.contacts, { nome: '', cargo: '', email: '', telefone: '' }],
    });
  };

  const updateContact = (index: number, field: keyof LeadContact, value: string) => {
    const updatedContacts = [...lead.contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    onUpdateLead({ contacts: updatedContacts });
  };

  const removeContact = (index: number) => {
    const updatedContacts = [...lead.contacts];
    updatedContacts.splice(index, 1);
    onUpdateLead({ contacts: updatedContacts });
  };

  // Activity management
  const addActivity = () => {
    onUpdateLead({
      activities: [
        ...lead.activities,
        { tipo: 'nota' as ActivityType, descricao: '', data: new Date().toISOString() },
      ],
    });
  };

  const updateActivity = (index: number, field: keyof LeadActivity, value: string) => {
    const updatedActivities = [...lead.activities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    onUpdateLead({ activities: updatedActivities });
  };

  const removeActivity = (index: number) => {
    const updatedActivities = [...lead.activities];
    updatedActivities.splice(index, 1);
    onUpdateLead({ activities: updatedActivities });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  // Extract Google Maps data
  const googleMapsData = (lead.apiData?.dadosOriginais || {}) as any;
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
                value={lead.score}
                onChange={handleScoreChange}
                className="score-input"
                style={{ color: getScoreColor(lead.score) }}
                disabled={isLoading}
              />
              <span className="score-max">/100</span>
            </div>

            {lead.apiData?.fonte && (
              <div className="metric-badge">
                <span className="metric-label">Fonte</span>
                <Badge variant="outline">{lead.apiData.fonte}</Badge>
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

            {lead.apiData?.numFuncionarios && (
              <div className="field-group">
                <label>Funcionários</label>
                <div className="readonly-field">{lead.apiData.numFuncionarios}</div>
              </div>
            )}

            {lead.apiData?.receitaAnualEstimada && (
              <div className="field-group">
                <label>Receita Anual Est.</label>
                <div className="readonly-field">
                  R$ {lead.apiData.receitaAnualEstimada.toLocaleString('pt-BR')}
                </div>
              </div>
            )}

            {lead.apiData?.linkedinUrl && (
              <div className="field-group full-width">
                <label>LinkedIn</label>
                <a
                  href={lead.apiData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-field"
                >
                  {lead.apiData.linkedinUrl}
                </a>
              </div>
            )}

            {lead.apiData?.siteEmpresa && (
              <div className="field-group full-width">
                <label>Site</label>
                <a
                  href={lead.apiData.siteEmpresa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-field"
                >
                  {lead.apiData.siteEmpresa}
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

      {/* Contatos */}
      <Card className="section-card">
        <CardHeader className="card-header-flex">
          <CardTitle className="section-title">Contatos</CardTitle>
          <button
            type="button"
            className="add-btn"
            onClick={addContact}
            disabled={isLoading}
          >
            + Adicionar
          </button>
        </CardHeader>
        <CardContent>
          <div className="contacts-list">
            {lead.contacts.map((contact, index) => (
              <div key={index} className="contact-item">
                <div className="contact-fields">
                  <input
                    type="text"
                    value={contact.nome || ''}
                    onChange={(e) => updateContact(index, 'nome', e.target.value)}
                    placeholder="Nome completo"
                    className="contact-name-input"
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    value={contact.cargo || ''}
                    onChange={(e) => updateContact(index, 'cargo', e.target.value)}
                    placeholder="Cargo"
                    className="contact-cargo-input"
                    disabled={isLoading}
                  />
                  <div className="contact-info-row">
                    <input
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => updateContact(index, 'email', e.target.value)}
                      placeholder="email@empresa.com"
                      className="contact-email-input"
                      disabled={isLoading}
                    />
                    <input
                      type="tel"
                      value={contact.telefone || ''}
                      onChange={(e) => updateContact(index, 'telefone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="contact-phone-input"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {lead.contacts.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeContact(index)}
                    aria-label="Remover contato"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {changedKeys.includes('contacts') && <ChangedIndicator />}
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

      {/* Histórico e Atividades */}
      <Card className="section-card">
        <CardHeader className="card-header-flex">
          <CardTitle className="section-title">Histórico de Atividades</CardTitle>
          <button
            type="button"
            className="add-btn"
            onClick={addActivity}
            disabled={isLoading}
          >
            + Adicionar
          </button>
        </CardHeader>
        <CardContent>
          <div className="activities-list">
            {lead.activities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {ACTIVITY_ICONS[activity.tipo]}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <select
                      value={activity.tipo}
                      onChange={(e) => updateActivity(index, 'tipo', e.target.value)}
                      className="activity-type-select"
                      disabled={isLoading}
                    >
                      {Object.entries(ACTIVITY_ICONS).map(([type, icon]) => (
                        <option key={type} value={type}>
                          {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={activity.data ? new Date(activity.data).toISOString().slice(0, 16) : ''}
                      onChange={(e) => updateActivity(index, 'data', new Date(e.target.value).toISOString())}
                      className="activity-date-input"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeActivity(index)}
                      aria-label="Remover atividade"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={activity.descricao || ''}
                    onChange={(e) => updateActivity(index, 'descricao', e.target.value)}
                    placeholder="Descreva a atividade..."
                    className="activity-textarea"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>
          {changedKeys.includes('activities') && <ChangedIndicator />}

          {/* Observations */}
          <div className="field-group observations-section">
            <label>Observações</label>
            <textarea
              value={lead.observacoes || ''}
              onChange={handleObservacoesChange}
              placeholder="Adicione observações importantes sobre o lead..."
              className="observations-textarea"
              rows={3}
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
