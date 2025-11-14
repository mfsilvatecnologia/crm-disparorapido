import React, { useState, useEffect, useCallback } from 'react';
import { DisparoRapidoService } from '../services/api';
import { VinculacaoPendente } from '../types/api';
import useVinculacoesPendentes from '../hooks/useVinculacoesPendentes';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Separator } from '@/shared/components/ui/separator';
import { useToast } from '@/shared/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { 
  Users, 
  Link, 
  ExternalLink, 
  Calendar, 
  MessageCircle, 
  Phone,
  Mail,
  User,
  Search,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

export const VinculacoesPendentesPage: React.FC = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [searchTerm, setSearchTerm] = useState('');
  const { vinculacoes, isLoading, error, refresh, fetchVinculacoes, setVinculacoes } = useVinculacoesPendentes(true);
  
  // Estados do modal de vinculação manual
  const [showVinculacaoModal, setShowVinculacaoModal] = useState(false);
  const [selectedVinculacao, setSelectedVinculacao] = useState<VinculacaoPendente | null>(null);
  const [leadIdManual, setLeadIdManual] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isVinculando, setIsVinculando] = useState(false);

  // Buscar vinculações pendentes
  // Erro vindo do hook
  useEffect(() => {
    if (error) {
      toast({
        title: 'Erro ao carregar vinculações',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Filtrar vinculações baseado no termo de pesquisa
  const vinculacoesFiltradas = vinculacoes.filter(vinculacao =>
    vinculacao.dados_conversa.telefone.includes(searchTerm) ||
    vinculacao.dados_conversa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vinculacao.candidatos?.some(candidato => 
      candidato.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidato.telefone?.includes(searchTerm)
    )
  );

  // Abrir modal de vinculação manual
  const handleVincularManual = (vinculacao: VinculacaoPendente) => {
    setSelectedVinculacao(vinculacao);
    setLeadIdManual('');
    setObservacoes('');
    setShowVinculacaoModal(true);
  };

  // Executar vinculação manual
  const executeVinculacaoManual = async () => {
    if (!selectedVinculacao || !leadIdManual.trim()) {
      toast({
        title: 'Dados incompletos',
        description: 'Por favor, informe o ID do lead para vinculação.',
        variant: 'destructive'
      });
      return;
    }

    // Validar UUID
    if (!DisparoRapidoService.isValidUUID(leadIdManual.trim())) {
      toast({
        title: 'ID inválido',
        description: 'O ID do lead informado não parece ser um UUID válido.',
        variant: 'destructive'
      });
      return;
    }

    setIsVinculando(true);

    try {
      await DisparoRapidoService.vincularLeadManual({
        conversation_id: selectedVinculacao.conversation_id,
        lead_id: leadIdManual,
        observacoes: observacoes.trim() || undefined
      });

      toast({
        title: 'Vinculação realizada',
        description: 'Lead vinculado com sucesso!',
        variant: 'default'
      });

      // Fechar modal e atualizar lista
      setShowVinculacaoModal(false);
  // Atualizar localmente: marcar como revisado ou remover
  setVinculacoes(prev => prev.map(v => v.conversation_id === selectedVinculacao.conversation_id ? ({ ...v, revisado: true }) : v));
    } catch (error) {
      console.error('Erro ao vincular lead:', error);
      toast({
        title: 'Erro na vinculação',
        description: 'Não foi possível vincular o lead. Verifique se o ID é válido.',
        variant: 'destructive'
      });
    } finally {
      setIsVinculando(false);
    }
  };

  // Formatar data
  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  // Estatísticas
  const stats = {
    total: vinculacoes.length,
    comCandidatos: vinculacoes.filter(v => v.candidatos && v.candidatos.length > 0).length,
    semCandidatos: vinculacoes.filter(v => !v.candidatos || v.candidatos.length === 0).length,
    revisadas: vinculacoes.filter(v => v.revisado).length,
    pendentes: vinculacoes.filter(v => !v.revisado).length
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vinculações Pendentes</h1>
          <p className="text-muted-foreground">
            Gerencie as vinculações pendentes entre contatos do WhatsApp e leads
          </p>
        </div>
        <Button onClick={refresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vinculações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Candidatos</CardTitle>
            <Link className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.comCandidatos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Candidatos</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.semCandidatos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisadas</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.revisadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendentes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por número, nome ou dados dos leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vinculações */}
      <Card>
        <CardHeader>
          <CardTitle>
            Vinculações Pendentes 
            {vinculacoesFiltradas.length !== vinculacoes.length && (
              <Badge variant="secondary" className="ml-2">
                {vinculacoesFiltradas.length} de {vinculacoes.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Carregando...
            </div>
          ) : vinculacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'Nenhuma vinculação encontrada com os filtros aplicados.' : 'Nenhuma vinculação pendente encontrada.'}
            </div>
          ) : (
            <div className="space-y-4">
              {vinculacoesFiltradas.map((vinculacao, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Informações do Contato WhatsApp */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="h-4 w-4 text-green-600" />
                          <h3 className="font-semibold">Contato WhatsApp</h3>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Número:</span>
                            <Badge variant="outline">{vinculacao.dados_conversa.telefone}</Badge>
                          </div>
                          
                          {vinculacao.dados_conversa.nome && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{vinculacao.dados_conversa.nome}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Criado em: {formatarData(vinculacao.criado_em)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Status:</span>
                            <Badge variant={vinculacao.revisado ? 'default' : 'secondary'}>
                              {vinculacao.revisado ? 'Revisado' : 'Pendente'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Conversation ID:</span>
                            <Badge variant="outline">{vinculacao.conversation_id}</Badge>
                          </div>
                        </div>
                      </div>

                      <Separator orientation="vertical" className="hidden lg:block" />

                      {/* Candidatos ou Ações */}
                      <div className="flex-1">
                        {vinculacao.candidatos && vinculacao.candidatos.length > 0 ? (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Link className="h-4 w-4 text-blue-600" />
                              <h4 className="font-semibold">Candidatos Encontrados</h4>
                              <Badge variant="secondary">{vinculacao.candidatos.length}</Badge>
                            </div>
                            
                            <div className="space-y-3">
                              {vinculacao.candidatos.map((candidato, candidatoIndex) => (
                                <Card key={candidatoIndex} className="bg-muted/50">
                                  <CardContent className="p-4">
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">ID:</span>
                                        <Badge variant="outline">{candidato.id}</Badge>
                                      </div>
                                      
                                      {candidato.nome && (
                                        <div className="flex items-center gap-2">
                                          <User className="h-3 w-3" />
                                          <span>{candidato.nome}</span>
                                        </div>
                                      )}
                                      
                                      {candidato.email && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3 w-3" />
                                          <span>{candidato.email}</span>
                                        </div>
                                      )}
                                      
                                      {candidato.telefone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3 w-3" />
                                          <span>{candidato.telefone}</span>
                                        </div>
                                      )}

                                      {candidato.empresa && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">Empresa:</span>
                                          <span>{candidato.empresa}</span>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">Score:</span>
                                        <Badge variant={candidato.score > 80 ? 'default' : 'secondary'}>
                                          {candidato.score}%
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t">
                                      <Button 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => {
                                          setLeadIdManual(candidato.id);
                                          handleVincularManual(vinculacao);
                                        }}
                                      >
                                        <Check className="h-3 w-3 mr-2" />
                                        Vincular este Lead
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <X className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">
                              Nenhum candidato encontrado automaticamente
                            </p>
                            <Button 
                              variant="outline"
                              onClick={() => handleVincularManual(vinculacao)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Vincular Manualmente
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Vinculação Manual */}
      <Dialog open={showVinculacaoModal} onOpenChange={setShowVinculacaoModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vinculação Manual</DialogTitle>
            <DialogDescription>
              Vincule manualmente este contato do WhatsApp a um lead específico.
            </DialogDescription>
          </DialogHeader>

          {selectedVinculacao && (
            <div className="space-y-4">
              {/* Informações do contato */}
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold mb-2">Contato WhatsApp</h4>
                <div className="space-y-1 text-sm">
                  <div>Número: <Badge variant="outline">{selectedVinculacao.dados_conversa.telefone}</Badge></div>
                  {selectedVinculacao.dados_conversa.nome && (
                    <div>Nome: {selectedVinculacao.dados_conversa.nome}</div>
                  )}
                  <div>Conversation ID: <Badge variant="outline">{selectedVinculacao.conversation_id}</Badge></div>
                </div>
              </div>

              {/* Campo de ID do Lead */}
              <div className="space-y-2">
                <label htmlFor="lead-id" className="text-sm font-medium">
                  ID do Lead *
                </label>
                <Input
                  id="lead-id"
                  type="text"
                  placeholder="Digite o ID do lead (UUID)"
                  value={leadIdManual}
                  onChange={(e) => setLeadIdManual(e.target.value)}
                />
              </div>

              {/* Campo de observações */}
              <div className="space-y-2">
                <label htmlFor="observacoes" className="text-sm font-medium">
                  Observações (opcional)
                </label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações sobre esta vinculação..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVinculacaoModal(false)}
              disabled={isVinculando}
            >
              Cancelar
            </Button>
            <Button
              onClick={executeVinculacaoManual}
              disabled={isVinculando || !leadIdManual.trim()}
            >
              {isVinculando && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VinculacoesPendentesPage;