import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Kanban, 
  Plus, 
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ArrowRight,
  Calendar,
  User,
  Building2,
  DollarSign,
  Target,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Progress } from '@/shared/components/ui/progress';
import { useToast } from '@/shared/hooks/use-toast';
import { LoadingState } from '@/shared/components/common/LoadingState';
import { ErrorState } from '@/shared/components/common/ErrorState';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { apiClient } from '@/shared/services/client';
import type { PipelineStage, PipelineItem, PipelineStats, CreatePipelineItem, UpdatePipelineItem } from '@/shared/services/schemas';

const createItemSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  valor: z.number().optional(),
  probabilidade: z.number().min(0).max(100),
  empresaId: z.string().optional(),
  responsavelId: z.string().optional(),
  dataProximaAcao: z.string().optional(),
  proximaAcao: z.string().optional(),
  origem: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
});

type CreateItemForm = z.infer<typeof createItemSchema>;

interface SortableItemProps {
  item: PipelineItem;
  onEdit: (item: PipelineItem) => void;
  onDelete: (id: string) => void;
  onView: (item: PipelineItem) => void;
}

function SortableItem({ item, onEdit, onDelete, onView }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm line-clamp-2">{item.titulo}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(item.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Valor e Probabilidade */}
        <div className="flex justify-between items-center">
          {item.valor && (
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(item.valor)}
            </span>
          )}
          <Badge variant="outline" className="text-xs">
            {item.probabilidade}%
          </Badge>
        </div>

        {/* Empresa */}
        {item.empresa && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span className="truncate">{item.empresa.nome}</span>
          </div>
        )}

        {/* Responsável */}
        {item.responsavel && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="truncate">{item.responsavel.nome}</span>
          </div>
        )}

        {/* Próxima Ação */}
        {item.dataProximaAcao && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{new Date(item.dataProximaAcao).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <Progress value={item.probabilidade} className="h-1" />
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PipelineItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PipelineItem | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Fetch pipeline data
  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ['pipeline', 'stages'],
    queryFn: () => apiClient.getPipelineStages(),
  });

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: ['pipeline', 'items', timeRange, selectedStage],
    queryFn: () => apiClient.getPipelineItems({ 
      timeRange,
      stageId: selectedStage || undefined 
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['pipeline', 'stats', timeRange],
    queryFn: () => apiClient.getPipelineStats({ timeRange }),
  });

  // Create item form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
    setValue,
  } = useForm<CreateItemForm>({
    resolver: zodResolver(createItemSchema),
  });

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: (data: CreatePipelineItem) => apiClient.createPipelineItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      resetForm();
      setCreateDialogOpen(false);
      toast({
        title: "Oportunidade criada",
        description: "Nova oportunidade foi adicionada ao pipeline.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar oportunidade",
        description: error.message || "Ocorreu um erro ao criar a oportunidade.",
        variant: "destructive",
      });
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => 
      apiClient.movePipelineItem(id, stageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: "Oportunidade movida",
        description: "A oportunidade foi movida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao mover oportunidade",
        description: error.message || "Ocorreu um erro ao mover a oportunidade.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePipelineItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      toast({
        title: "Oportunidade removida",
        description: "A oportunidade foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover oportunidade",
        description: error.message || "Ocorreu um erro ao remover a oportunidade.",
        variant: "destructive",
      });
    },
  });

  const isLoading = stagesLoading || itemsLoading;

  // Group items by stage
  const itemsByStage = useMemo(() => {
    if (!items || !stages) return {};
    
    const grouped: Record<string, PipelineItem[]> = {};
    stages.forEach(stage => {
      grouped[stage.id] = items.filter(item => item.stageId === stage.id);
    });
    
    return grouped;
  }, [items, stages]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Find the target stage
    const targetStageId = over.id as string;
    const activeItem = items?.find(item => item.id === active.id);
    
    if (activeItem && activeItem.stageId !== targetStageId) {
      moveItemMutation.mutate({
        id: activeItem.id,
        stageId: targetStageId,
      });
    }
    
    setActiveId(null);
  };

  const onCreateItem = (data: CreateItemForm) => {
    const stageId = stages?.[0]?.id; // Default to first stage
    if (!stageId) return;
    
    createItemMutation.mutate({
      ...data,
      stageId,
    } as CreatePipelineItem);
  };

  const handleEditItem = (item: PipelineItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleViewItem = (item: PipelineItem) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta oportunidade?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <LoadingState message="Carregando pipeline..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Kanban className="h-8 w-8" />
            Pipeline de Vendas
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas oportunidades e acompanhe o funil de vendas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Adicione uma nova oportunidade ao pipeline
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onCreateItem)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    {...register('titulo')}
                    className={errors.titulo ? 'border-destructive' : ''}
                  />
                  {errors.titulo && (
                    <p className="text-sm text-destructive">{errors.titulo.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      {...register('valor', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="probabilidade">Probabilidade (%)</Label>
                    <Input
                      id="probabilidade"
                      type="number"
                      min="0"
                      max="100"
                      {...register('probabilidade', { valueAsNumber: true })}
                      className={errors.probabilidade ? 'border-destructive' : ''}
                    />
                    {errors.probabilidade && (
                      <p className="text-sm text-destructive">{errors.probabilidade.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proximaAcao">Próxima Ação</Label>
                  <Input
                    id="proximaAcao"
                    {...register('proximaAcao')}
                    placeholder="Ex: Enviar proposta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataProximaAcao">Data da Próxima Ação</Label>
                  <Input
                    id="dataProximaAcao"
                    type="date"
                    {...register('dataProximaAcao')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    {...register('notas')}
                    placeholder="Observações importantes..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Oportunidade'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Oportunidades</p>
                  <p className="text-2xl font-bold">{stats.totalOportunidades}</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa Conversão</p>
                  <p className="text-2xl font-bold">{stats.taxaConversaoGeral.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                  <p className="text-2xl font-bold">{stats.tempoMedioFechamento}d</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pipeline Kanban */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages?.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{stage.nome}</CardTitle>
                    <Badge variant="secondary">
                      {itemsByStage[stage.id]?.length || 0}
                    </Badge>
                  </div>
                  {stage.descricao && (
                    <CardDescription>{stage.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <SortableContext 
                    items={itemsByStage[stage.id]?.map(item => item.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[400px]">
                      {itemsByStage[stage.id]?.map((item) => (
                        <SortableItem
                          key={item.id}
                          item={item}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItem}
                          onView={handleViewItem}
                        />
                      ))}
                      
                      {(!itemsByStage[stage.id] || itemsByStage[stage.id].length === 0) && (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          <p className="text-sm">Nenhuma oportunidade</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border rounded-lg p-4 shadow-lg transform rotate-3">
              <div className="font-medium text-sm">
                {items?.find(item => item.id === activeId)?.titulo}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {(!stages || stages.length === 0) && (
        <EmptyState
          icon={Kanban}
          title="Pipeline não configurado"
          description="Configure as etapas do seu pipeline para começar a gerenciar oportunidades."
        />
      )}
    </div>
  );
}