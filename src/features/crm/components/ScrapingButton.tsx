import React, { useState } from 'react';
import {
  Globe,
  Search,
  Target,
  Filter,
  Play,
  X,
  Info,
  Sparkles
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

interface ScrapingButtonProps {
  open: boolean;
  onClose: () => void;
}

export function ScrapingButton({ open, onClose }: ScrapingButtonProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [segment, setSegment] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('100');

  const handleStartScraping = async () => {
    console.log('Iniciando scraping:', { searchTerm, segment, location, quantity });
    // TODO: Implementar chamada à API de scraping
    // Fechar modal após iniciar
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Globe className="h-6 w-6 text-blue-600" />
            Buscar Leads na Internet
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros de busca para encontrar leads qualificados automaticamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informação */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Como funciona?</p>
                  <p className="text-blue-800">
                    Nosso sistema busca empresas e contatos na internet usando seus critérios.
                    Os leads encontrados serão automaticamente adicionados ao seu CRM com score de qualidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termo de Busca */}
          <div className="space-y-2">
            <Label htmlFor="search-term" className="text-sm font-semibold">
              Termo de Busca *
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="search-term"
                placeholder="Ex: empresas de tecnologia, restaurantes, clínicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-600">
              Digite o tipo de empresa ou serviço que deseja encontrar
            </p>
          </div>

          {/* Segmento */}
          <div className="space-y-2">
            <Label htmlFor="segment" className="text-sm font-semibold">
              Segmento
            </Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-semibold">
              Localização
            </Label>
            <Input
              id="location"
              placeholder="Ex: São Paulo - SP, Brasil"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-xs text-gray-600">
              Cidade, estado ou país para filtrar resultados
            </p>
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-semibold">
              Quantidade de Leads
            </Label>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 leads</SelectItem>
                <SelectItem value="100">100 leads</SelectItem>
                <SelectItem value="250">250 leads</SelectItem>
                <SelectItem value="500">500 leads</SelectItem>
                <SelectItem value="1000">1000 leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custo Estimado */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-900">Custo Estimado</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    {quantity} leads × R$ 2,50 = R$ {(parseInt(quantity) * 2.5).toFixed(2)}
                  </p>
                </div>
                <Badge className="bg-blue-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
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
            onClick={handleStartScraping}
            disabled={!searchTerm}
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Busca
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
