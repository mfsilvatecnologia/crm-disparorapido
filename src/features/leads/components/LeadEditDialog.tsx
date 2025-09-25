import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { X, Plus } from 'lucide-react';
import { Lead } from '../types/leads';

interface LeadEditDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave?: (updatedLead: Lead) => void;
}

export const LeadEditDialog: React.FC<LeadEditDialogProps> = ({
  lead,
  open,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lead && open) {
      setFormData({
        ...lead,
        endereco: lead.endereco || {},
      });
      setTags(lead.tags || []);
    }
  }, [lead, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!lead || !onSave) return;

    setIsLoading(true);
    try {
      const updatedLead: Lead = {
        ...lead,
        ...formData,
        tags,
        dataAtualizacao: new Date().toISOString()
      };

      onSave(updatedLead);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.currentTarget === document.activeElement) {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag();
      }
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead: {lead.nomeEmpresa}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Informações do Contato */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="nomeContato">Nome do Contato</Label>
                    <Input
                      id="nomeContato"
                      value={formData.nomeContato || ''}
                      onChange={(e) => handleInputChange('nomeContato', e.target.value)}
                      placeholder="Nome completo do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargoContato">Cargo</Label>
                    <Input
                      id="cargoContato"
                      value={formData.cargoContato || ''}
                      onChange={(e) => handleInputChange('cargoContato', e.target.value)}
                      placeholder="Cargo do contato"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone || ''}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="+55 (11) 99999-9999"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={formData.nomeEmpresa || ''}
                    onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.exemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="segmento">Segmento</Label>
                  <Input
                    id="segmento"
                    value={formData.segmento || ''}
                    onChange={(e) => handleInputChange('segmento', e.target.value)}
                    placeholder="Setor de atuação"
                  />
                </div>

                <div>
                  <Label htmlFor="descricaoEmpresa">Descrição da Empresa</Label>
                  <Textarea
                    id="descricaoEmpresa"
                    value={formData.descricaoEmpresa || ''}
                    onChange={(e) => handleInputChange('descricaoEmpresa', e.target.value)}
                    placeholder="Descrição sobre a empresa..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Status e Outros */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status e Qualificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || 'novo'}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="qualificado">Qualificado</SelectItem>
                      <SelectItem value="contatado">Contatado</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="descartado">Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scoreQualificacao">Score de Qualificação (%)</Label>
                  <Input
                    id="scoreQualificacao"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.scoreQualificacao || ''}
                    onChange={(e) => handleInputChange('scoreQualificacao', parseInt(e.target.value) || 0)}
                    placeholder="0-100"
                  />
                </div>

                <div>
                  <Label htmlFor="fonte">Fonte</Label>
                  <Select
                    value={formData.fonte || ''}
                    onValueChange={(value) => handleInputChange('fonte', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="referencia">Referência</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="custoAquisicao">Custo de Aquisição (R$)</Label>
                  <Input
                    id="custoAquisicao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.custoAquisicao || ''}
                    onChange={(e) => handleInputChange('custoAquisicao', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.endereco?.cidade || ''}
                    onChange={(e) => handleAddressChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.endereco?.estado || ''}
                    onChange={(e) => handleAddressChange('estado', e.target.value)}
                    placeholder="Estado"
                  />
                </div>

                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.endereco?.cep || ''}
                    onChange={(e) => handleAddressChange('cep', e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag..."
                    onKeyPress={handleKeyPress}
                  />
                  <Button onClick={handleAddTag} size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-destructive hover:text-destructive-foreground rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.observacoes || ''}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  placeholder="Observações adicionais sobre o lead..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};