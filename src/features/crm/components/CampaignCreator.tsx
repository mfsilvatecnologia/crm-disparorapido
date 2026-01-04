import React, { useState } from 'react';
import {
  Megaphone,
  Mail,
  Phone,
  MessageSquare,
  Target,
  Users,
  Calendar,
  X,
  Play,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface CampaignCreatorProps {
  open: boolean;
  onClose: () => void;
}

export function CampaignCreator({ open, onClose }: CampaignCreatorProps) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateCampaign = async () => {
    console.log('Criando campanha:', { campaignName, campaignType, targetAudience, description });
    // TODO: Implementar criação de campanha
    onClose();
  };

  const campaignTypes = [
    { id: 'email', label: 'E-mail Marketing', icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'phone', label: 'Ligações', icon: Phone, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'mixed', label: 'Multi-canal', icon: Megaphone, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Megaphone className="h-6 w-6 text-blue-600" />
            Nova Campanha
          </DialogTitle>
          <DialogDescription>
            Crie uma campanha para engajar seus leads e convertê-los em oportunidades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Fluxo Automático</p>
                  <p className="text-blue-800">
                    Leads qualificados desta campanha serão automaticamente convertidos em
                    oportunidades quando responderem positivamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nome da Campanha */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name" className="text-sm font-semibold">
              Nome da Campanha *
            </Label>
            <Input
              id="campaign-name"
              placeholder="Ex: Campanha Q1 2026 - Tecnologia"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          {/* Tipo de Campanha */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Tipo de Campanha *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {campaignTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all ${
                    campaignType === type.id
                      ? 'border-2 border-blue-500 shadow-md'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCampaignType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.bgColor} ${type.color}`}>
                        {React.createElement(type.icon, { className: 'h-5 w-5' })}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{type.label}</p>
                      </div>
                      {campaignType === type.id && (
                        <Badge className="bg-blue-600">
                          Selecionado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Público Alvo */}
          <div className="space-y-2">
            <Label htmlFor="target-audience" className="text-sm font-semibold">
              Público Alvo *
            </Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o público alvo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-leads">Todos os Leads</SelectItem>
                <SelectItem value="new-leads">Leads Novos</SelectItem>
                <SelectItem value="qualified-leads">Leads Qualificados</SelectItem>
                <SelectItem value="contacted-leads">Leads Contatados</SelectItem>
                <SelectItem value="segment-tech">Segmento: Tecnologia</SelectItem>
                <SelectItem value="segment-health">Segmento: Saúde</SelectItem>
                <SelectItem value="high-score">Score Alto (&gt;80)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>~247 leads correspondem a este filtro</span>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva os objetivos e estratégia desta campanha..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Preview de Automação */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">
                Automação Configurada
              </p>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span>Leads qualificados → Criar Oportunidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span>Oportunidade fechada → Criar Cliente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span>Cliente ativo → Gerar Contrato</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={handleCreateCampaign}
            disabled={!campaignName || !campaignType || !targetAudience}
          >
            <Play className="mr-2 h-4 w-4" />
            Criar Campanha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
