import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/utils/utils';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
  suggestedTags?: string[];
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagSelector({
  value,
  onChange,
  label,
  placeholder = "Adicionar tag...",
  suggestedTags = [],
  maxTags,
  className,
  disabled = false,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedTags.filter(
    tag => 
      !value.includes(tag) && 
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !value.includes(trimmedTag) &&
      (!maxTags || value.length < maxTags)
    ) {
      onChange([...value, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <span>{tag}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-2 w-2" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      {!disabled && (!maxTags || value.length < maxTags) && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md">
              <div className="p-1 space-y-1 max-h-48 overflow-y-auto">
                {filteredSuggestions.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="w-full text-left px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Max tags indicator */}
      {maxTags && (
        <div className="text-xs text-muted-foreground">
          {value.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
}