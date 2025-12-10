import React, { useState } from 'react';
import { Plus, X, Tag as TagIcon, Check } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Separator } from '@/shared/components/ui/separator';

interface TagsManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  availableTags?: string[];
  maxTags?: number;
  readOnly?: boolean;
  compact?: boolean;
}

const DEFAULT_TAGS = [
  'Quente',
  'Frio',
  'Follow-up',
  'Interessado',
  'Aguardando Retorno',
  'Decisor',
  'Influenciador',
  'Orçamento Aprovado',
  'Sem Orçamento',
  'Alta Prioridade',
  'Baixa Prioridade',
  'Qualificado',
  'Desqualificado',
];

export function TagsManager({
  tags,
  onAddTag,
  onRemoveTag,
  availableTags = DEFAULT_TAGS,
  maxTags = 10,
  readOnly = false,
  compact = false
}: TagsManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onAddTag(trimmedTag);
      setNewTag('');
      setSearchTerm('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onRemoveTag(tag);
  };

  const filteredAvailableTags = availableTags.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'Quente': 'bg-red-100 text-red-800 border-red-200',
      'Frio': 'bg-blue-100 text-blue-800 border-blue-200',
      'Follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Interessado': 'bg-green-100 text-green-800 border-green-200',
      'Alta Prioridade': 'bg-red-100 text-red-800 border-red-200',
      'Baixa Prioridade': 'bg-gray-100 text-gray-800 border-gray-200',
      'Qualificado': 'bg-green-100 text-green-800 border-green-200',
      'Desqualificado': 'bg-red-100 text-red-800 border-red-200',
      'Decisor': 'bg-purple-100 text-purple-800 border-purple-200',
      'Orçamento Aprovado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    };
    
    return colors[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {tags.length === 0 && (
          <span className="text-xs text-gray-400">Sem tags</span>
        )}
        {tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`text-xs ${getTagColor(tag)}`}
          >
            {tag}
            {!readOnly && (
              <X
                className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag);
                }}
              />
            )}
          </Badge>
        ))}
        {tags.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 3}
          </Badge>
        )}
        {!readOnly && tags.length < maxTags && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <TagEditor
                newTag={newTag}
                setNewTag={setNewTag}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredAvailableTags={filteredAvailableTags}
                handleAddTag={handleAddTag}
                getTagColor={getTagColor}
                tags={tags}
                maxTags={maxTags}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TagIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Tags</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tags.length}/{maxTags}
        </Badge>
      </div>

      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && (
          <p className="text-sm text-gray-400">Nenhuma tag adicionada</p>
        )}
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className={`text-sm ${getTagColor(tag)}`}
          >
            {tag}
            {!readOnly && (
              <X
                className="h-3 w-3 ml-2 cursor-pointer hover:text-red-600"
                onClick={() => handleRemoveTag(tag)}
              />
            )}
          </Badge>
        ))}
      </div>

      {/* Add Tag Interface */}
      {!readOnly && tags.length < maxTags && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <TagEditor
              newTag={newTag}
              setNewTag={setNewTag}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredAvailableTags={filteredAvailableTags}
              handleAddTag={handleAddTag}
              getTagColor={getTagColor}
              tags={tags}
              maxTags={maxTags}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

interface TagEditorProps {
  newTag: string;
  setNewTag: (tag: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredAvailableTags: string[];
  handleAddTag: (tag: string) => void;
  getTagColor: (tag: string) => string;
  tags: string[];
  maxTags: number;
}

function TagEditor({
  newTag,
  setNewTag,
  searchTerm,
  setSearchTerm,
  filteredAvailableTags,
  handleAddTag,
  getTagColor,
  tags,
  maxTags
}: TagEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-2">Criar Nova Tag</p>
        <div className="flex gap-2">
          <Input
            placeholder="Digite e pressione Enter"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTag(newTag);
              }
            }}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={() => handleAddTag(newTag)}
            disabled={!newTag.trim() || tags.length >= maxTags}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-medium mb-2">Tags Sugeridas</p>
        <Input
          placeholder="Buscar tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm mb-2"
        />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filteredAvailableTags.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Nenhuma tag encontrada
            </p>
          ) : (
            filteredAvailableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className={`
                  w-full text-left px-3 py-2 rounded-md text-sm
                  hover:bg-gray-50 transition-colors
                  flex items-center justify-between
                `}
                disabled={tags.length >= maxTags}
              >
                <span className={`font-medium ${getTagColor(tag)}`}>{tag}</span>
                <Plus className="h-3 w-3 text-gray-400" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
