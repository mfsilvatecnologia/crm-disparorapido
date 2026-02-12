import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Separator } from '@/shared/components/ui/separator';
import {
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Save,
  Users,
  X
} from 'lucide-react';
import {
  Segment,
  SegmentCondition,
  SegmentBuilderField,
  SegmentOperator
} from '../types/segments';
import { useSegmentBuilderFields, usePreviewSegment } from '../hooks/useSegments';

interface SegmentBuilderProps {
  segment?: Segment;
  onSave: (segmentData: Omit<Segment, 'id' | 'criadoEm' | 'atualizadoEm' | 'contadorLeads'>) => void;
  onCancel: () => void;
  className?: string;
}

const CORES_DISPONÍVEIS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#2563eb', '#1d4ed8', '#d946ef', '#ec4899', '#f43f5e'
];

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  segment,
  onSave,
  onCancel,
  className
}) => {
  const [formData, setFormData] = useState({
    nome: segment?.nome || '',
    descricao: segment?.descricao || '',
    tipo: segment?.tipo || 'personalizado' as Segment['tipo'],
    condicoes: segment?.condicoes || [] as SegmentCondition[],
    ativo: segment?.ativo ?? true,
    cor: segment?.cor || CORES_DISPONÍVEIS[0],
    tags: segment?.tags || [] as string[]
  });

  const [novaTag, setNovaTag] = useState('');
  const [previewData, setPreviewData] = useState<{ contagem: number; exemplos: any[] } | null>(null);

  const { data: builderFields, isLoading: loadingFields } = useSegmentBuilderFields();
  const previewMutation = usePreviewSegment();

  const adicionarCondicao = () => {
    const novaCondicao: SegmentCondition = {
      id: `cond_${Date.now()}`,
      campo: '',
      operador: 'igual',
      valor: '',
      tipo: 'texto',
      logico: formData.condicoes.length > 0 ? 'AND' : undefined
    };

    setFormData(prev => ({
      ...prev,
      condicoes: [...prev.condicoes, novaCondicao]
    }));
  };

  const removerCondicao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      condicoes: prev.condicoes.filter((_, i) => i !== index)
    }));
  };

  const atualizarCondicao = (index: number, campo: keyof SegmentCondition, valor: any) => {
    setFormData(prev => ({
      ...prev,
      condicoes: prev.condicoes.map((condicao, i) =>
        i === index ? { ...condicao, [campo]: valor } : condicao
      )
    }));
  };

  const adicionarTag = () => {
    if (novaTag.trim() && !formData.tags.includes(novaTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, novaTag.trim()]
      }));
      setNovaTag('');
    }
  };

  const removerTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const visualizarSegmento = () => {
    if (formData.condicoes.length === 0) return;

    previewMutation.mutate(formData.condicoes, {
      onSuccess: (data) => {
        setPreviewData(data);
      }
    });
  };

  const salvarSegmento = () => {
    onSave(formData);
  };

  const getCampoOptions = () => {
    return builderFields?.map(field => ({
      value: field.nome,
      label: field.label,
      tipo: field.tipo,
      operadores: field.operadoresPermitidos
    })) || [];
  };

  const getOperadorOptions = (campo: string) => {
    const campoData = builderFields?.find(f => f.nome === campo);
    return campoData?.operadoresPermitidos || ['igual'];
  };

  const renderCondicaoValue = (condicao: SegmentCondition, index: number) => {
    const campoData = builderFields?.find(f => f.nome === condicao.campo);

    if (campoData?.opcoes) {
      return (
        <Select
          value={condicao.valor}
          onValueChange={(value) => atualizarCondicao(index, 'valor', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {campoData.opcoes.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    switch (condicao.tipo) {
      case 'numero':
        return (
          <Input
            type="number"
            value={condicao.valor}
            onChange={(e) => atualizarCondicao(index, 'valor', e.target.value)}
            placeholder="Valor numérico"
          />
        );
      case 'data':
        return (
          <Input
            type="date"
            value={condicao.valor}
            onChange={(e) => atualizarCondicao(index, 'valor', e.target.value)}
          />
        );
      case 'booleano':
        return (
          <Select
            value={condicao.valor?.toString()}
            onValueChange={(value) => atualizarCondicao(index, 'valor', value === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={condicao.valor}
            onChange={(e) => atualizarCondicao(index, 'valor', e.target.value)}
            placeholder="Valor"
          />
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Segmento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Segmento</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do segmento"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o propósito deste segmento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo do Segmento</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: Segment['tipo']) =>
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demografico">Demográfico</SelectItem>
                  <SelectItem value="comportamental">Comportamental</SelectItem>
                  <SelectItem value="geografico">Geográfico</SelectItem>
                  <SelectItem value="psicografico">Psicográfico</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cor do Segmento</Label>
              <div className="flex gap-2 mt-2">
                {CORES_DISPONÍVEIS.map((cor) => (
                  <button
                    key={cor}
                    onClick={() => setFormData(prev => ({ ...prev, cor }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.cor === cor ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
            <Label htmlFor="ativo">Segmento ativo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              placeholder="Nova tag"
              onKeyPress={(e) => e.key === 'Enter' && adicionarTag()}
            />
            <Button onClick={adicionarTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removerTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Condições */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Condições do Segmento</CardTitle>
          <Button onClick={adicionarCondicao} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Condição
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.condicoes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma condição definida. Clique em "Adicionar Condição" para começar.
            </p>
          ) : (
            formData.condicoes.map((condicao, index) => (
              <div key={condicao.id} className="space-y-4">
                {index > 0 && (
                  <div className="flex items-center justify-center">
                    <Select
                      value={condicao.logico}
                      onValueChange={(value: 'AND' | 'OR') =>
                        atualizarCondicao(index, 'logico', value)
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">E</SelectItem>
                        <SelectItem value="OR">OU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Campo */}
                    <div>
                      <Label>Campo</Label>
                      <Select
                        value={condicao.campo}
                        onValueChange={(value) => {
                          const campo = getCampoOptions().find(c => c.value === value);
                          atualizarCondicao(index, 'campo', value);
                          atualizarCondicao(index, 'tipo', campo?.tipo || 'texto');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCampoOptions().map((campo) => (
                            <SelectItem key={campo.value} value={campo.value}>
                              {campo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operador */}
                    <div>
                      <Label>Operador</Label>
                      <Select
                        value={condicao.operador}
                        onValueChange={(value: SegmentOperator) =>
                          atualizarCondicao(index, 'operador', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperadorOptions(condicao.campo).map((operador) => (
                            <SelectItem key={operador} value={operador}>
                              {operador.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valor */}
                    <div>
                      <Label>Valor</Label>
                      {renderCondicaoValue(condicao, index)}
                    </div>

                    {/* Ação */}
                    <div className="flex items-end">
                      <Button
                        onClick={() => removerCondicao(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {formData.condicoes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visualização do Segmento</CardTitle>
            <Button
              onClick={visualizarSegmento}
              variant="outline"
              size="sm"
              disabled={previewMutation.isPending}
            >
              {previewMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Visualizar
            </Button>
          </CardHeader>
          <CardContent>
            {previewData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="h-5 w-5" />
                  {previewData.contagem.toLocaleString('pt-BR')} leads encontrados
                </div>
                {previewData.exemplos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Exemplos de leads:</h4>
                    <div className="space-y-1">
                      {previewData.exemplos.slice(0, 3).map((lead, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          {lead.nome || lead.email || `Lead ${index + 1}`}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Clique em "Visualizar" para ver quantos leads correspondem às condições definidas.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <div className="flex gap-4 justify-end">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button
          onClick={salvarSegmento}
          disabled={!formData.nome.trim() || formData.condicoes.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {segment ? 'Atualizar Segmento' : 'Criar Segmento'}
        </Button>
      </div>
    </div>
  );
};