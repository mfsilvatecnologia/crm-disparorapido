import React, { useState, useEffect } from 'react';
import { Save, Star, Trash2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    searchTerm?: string;
    status?: string;
    qualityRange?: { min: number; max: number };
    segments?: string[];
    sources?: string[];
    dateRange?: { from: string; to: string };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  isFavorite?: boolean;
  createdAt: string;
}

interface SavedFiltersProps {
  currentFilters: SavedFilter['filters'];
  onApplyFilter: (filters: SavedFilter['filters']) => void;
}

export function SavedFilters({ currentFilters, onApplyFilter }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Load saved filters from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('leadsSavedFilters');
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    }
  }, []);

  // Save to localStorage whenever filters change
  const persistFilters = (filters: SavedFilter[]) => {
    localStorage.setItem('leadsSavedFilters', JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const saveCurrentFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: currentFilters,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    persistFilters([...savedFilters, newFilter]);
    setFilterName('');
    setIsDialogOpen(false);
  };

  const deleteFilter = (id: string) => {
    persistFilters(savedFilters.filter(f => f.id !== id));
  };

  const toggleFavorite = (id: string) => {
    persistFilters(
      savedFilters.map(f => 
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  const getFilterDescription = (filter: SavedFilter['filters']) => {
    const parts: string[] = [];
    
    if (filter.status && filter.status !== 'all') {
      parts.push(`Status: ${filter.status}`);
    }
    if (filter.segments && filter.segments.length > 0) {
      parts.push(`${filter.segments.length} segmento(s)`);
    }
    if (filter.qualityRange && (filter.qualityRange.min > 0 || filter.qualityRange.max < 100)) {
      parts.push(`Qualidade: ${filter.qualityRange.min}-${filter.qualityRange.max}%`);
    }
    if (filter.searchTerm) {
      parts.push(`Busca: "${filter.searchTerm}"`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Sem filtros';
  };

  const favoriteFilters = savedFilters.filter(f => f.isFavorite);
  const regularFilters = savedFilters.filter(f => !f.isFavorite);

  return (
    <div className="flex items-center gap-2">
      {/* Quick Access Favorites */}
      {favoriteFilters.length > 0 && (
        <div className="flex items-center gap-1">
          {favoriteFilters.map((filter) => (
            <Button
              key={filter.id}
              variant="outline"
              size="sm"
              onClick={() => onApplyFilter(filter.filters)}
              className="text-xs"
            >
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {filter.name}
            </Button>
          ))}
        </div>
      )}

      {/* Saved Filters Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Filtros Salvos
            {savedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          {savedFilters.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum filtro salvo ainda
            </div>
          ) : (
            <>
              {favoriteFilters.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                    Favoritos
                  </div>
                  {favoriteFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.id}
                      className="flex items-start gap-2 cursor-pointer"
                      onSelect={() => onApplyFilter(filter.filters)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star 
                            className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0 cursor-pointer" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(filter.id);
                            }}
                          />
                          <span className="font-medium text-sm truncate">{filter.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {getFilterDescription(filter.filters)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFilter(filter.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </DropdownMenuItem>
                  ))}
                  {regularFilters.length > 0 && <DropdownMenuSeparator />}
                </>
              )}

              {regularFilters.length > 0 && (
                <>
                  {favoriteFilters.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                      Outros
                    </div>
                  )}
                  {regularFilters.map((filter) => (
                    <DropdownMenuItem
                      key={filter.id}
                      className="flex items-start gap-2 cursor-pointer"
                      onSelect={() => onApplyFilter(filter.filters)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star 
                            className="h-3 w-3 text-gray-300 flex-shrink-0 cursor-pointer hover:text-yellow-400" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(filter.id);
                            }}
                          />
                          <span className="font-medium text-sm truncate">{filter.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {getFilterDescription(filter.filters)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFilter(filter.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </>
          )}
          
          <DropdownMenuSeparator />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Salvar Filtro Atual
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Filtro</DialogTitle>
                <DialogDescription>
                  Dê um nome para seus filtros atuais para reutilizá-los depois.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Nome do filtro (ex: Leads Quentes SP)"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveCurrentFilter();
                      }
                    }}
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-2">Filtros que serão salvos:</p>
                  <p className="text-xs text-gray-500">
                    {getFilterDescription(currentFilters)}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveCurrentFilter} disabled={!filterName.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
