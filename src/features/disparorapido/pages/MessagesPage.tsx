import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Calendar, 
  User, 
  Link2, 
  Search, 
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DisparoRapidoService } from '../services/api';
import {
  MessageFilters,
  MessageResultItem,
  QueryMessagesResponse,
  PaginationMeta
} from '../types/api';
import { useToast } from '@/shared/hooks/use-toast';

interface MessagesPageProps {
  title?: string;
}

export function MessagesPage({ title = 'Mensagens DisparoRapido' }: MessagesPageProps) {
  // Estado
  const [messages, setMessages] = useState<MessageResultItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({
    page: 1,
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  // Filtros temporários (para o formulário)
  const [tempFilters, setTempFilters] = useState({
    telefone: '',
    dataInicio: '',
    dataFim: '',
    codigoWhatsapp: ''
  });

  // Buscar mensagens
  const fetchMessages = useCallback(async (newFilters?: MessageFilters) => {
    setIsLoading(true);
    
    try {
      const filtersToUse = newFilters || filters;
      const response = await DisparoRapidoService.getMessages(filtersToUse);
      
      setMessages(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: 'Erro ao carregar mensagens',
        description: 'Ocorreu um erro ao buscar as mensagens. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  // Carregar mensagens inicial
  useEffect(() => {
    fetchMessages();
  }, []);

  // Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters: MessageFilters = {
      page: 1,
      limit: filters.limit,
      ...(tempFilters.telefone && { 
        telefone: DisparoRapidoService.formatPhoneForSearch(tempFilters.telefone) 
      }),
      ...(tempFilters.codigoWhatsapp && { codigo_whatsapp: tempFilters.codigoWhatsapp }),
      ...(tempFilters.dataInicio && { data_inicio: tempFilters.dataInicio }),
      ...(tempFilters.dataFim && { data_fim: tempFilters.dataFim }),
    };

    setFilters(newFilters);
    fetchMessages(newFilters);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    const clearFilters = { page: 1, limit: 50 };
    setTempFilters({ telefone: '', dataInicio: '', dataFim: '', codigoWhatsapp: '' });
    setFilters(clearFilters);
    fetchMessages(clearFilters);
  };

  // Mudar página
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchMessages(newFilters);
  };

  // Atalhos de data
  const handleDateShortcut = (shortcut: 'hoje' | 'ontem' | 'ultimaSemana' | 'ultimoMes') => {
    const shortcuts = DisparoRapidoService.createDateFilters();
    const selected = shortcuts[shortcut];
    
    setTempFilters(prev => ({
      ...prev,
      dataInicio: selected.data_inicio.slice(0, 16), // Para datetime-local
      dataFim: selected.data_fim.slice(0, 16)
    }));
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const vinculadas = messages.filter(m => m.conversation.leadId).length;
    const naoVinculadas = messages.length - vinculadas;
    
    return {
      total: messages.length,
      vinculadas,
      naoVinculadas,
      percentualVinculacao: messages.length > 0 
        ? Math.round((vinculadas / messages.length) * 100) 
        : 0
    };
  }, [messages]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            Consulte mensagens e conversas do DisparoRapido
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{pagination?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vinculadas</p>
                <p className="text-xl font-bold">{stats.vinculadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Não Vinculadas</p>
                <p className="text-xl font-bold">{stats.naoVinculadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">% Vinculação</p>
                <p className="text-xl font-bold">{stats.percentualVinculacao}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  placeholder="Ex: 11999887766"
                  value={tempFilters.telefone}
                  onChange={(e) => setTempFilters(prev => ({ 
                    ...prev, 
                    telefone: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Código WhatsApp</label>
                <Input
                  placeholder="Ex: 5511999887766"
                  value={tempFilters.codigoWhatsapp}
                  onChange={(e) => setTempFilters(prev => ({ 
                    ...prev, 
                    codigoWhatsapp: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="datetime-local"
                  value={tempFilters.dataInicio}
                  onChange={(e) => setTempFilters(prev => ({ 
                    ...prev, 
                    dataInicio: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="datetime-local"
                  value={tempFilters.dataFim}
                  onChange={(e) => setTempFilters(prev => ({ 
                    ...prev, 
                    dataFim: e.target.value 
                  }))}
                />
              </div>
            </div>

            {/* Atalhos de Data */}
            <div>
              <label className="text-sm font-medium mb-2 block">Atalhos de Data</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'hoje', label: 'Hoje' },
                  { key: 'ontem', label: 'Ontem' },
                  { key: 'ultimaSemana', label: 'Última Semana' },
                  { key: 'ultimoMes', label: 'Último Mês' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateShortcut(key as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Mensagens 
            {pagination && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando mensagens...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma mensagem encontrada</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item.message.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {item.conversation.nome || item.conversation.telefone}
                          </span>
                        </div>
                        
                        {item.conversation.leadId ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <Link2 className="h-3 w-3 mr-1" />
                            Lead Vinculado
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Sem Vinculação
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span>📱 {item.conversation.codigoWhatsapp}</span>
                        <span>📞 {item.conversation.telefone}</span>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {formatDate(item.message.createdAt)}
                    </div>
                  </div>

                  {item.message.content && (
                    <div className="bg-gray-50 rounded p-3 mt-3">
                      <p className="text-sm">{item.message.content}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>ID: #{item.conversation.id}</span>
                      <span>Msg: #{item.message.id}</span>
                      <span>Status: {item.message.status}</span>
                      <span>Tipo: {item.message.messageType}</span>
                    </div>
                    
                    {item.conversation.leadId && (
                      <Button variant="outline" size="sm">
                        Ver Lead
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages} 
                ({pagination.total} itens total)
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <span className="px-3 py-1 text-sm font-medium">
                  {pagination.page}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || isLoading}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MessagesPage;