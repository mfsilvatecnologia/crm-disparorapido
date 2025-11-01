# Mandala da Inovação - Guia de Implementação

| Campo | Valor |
|-------|-------|
| Owner | Engineering Team |
| Última atualização | 2025-10-19 |
| Status | Guia de implementação |
| Relacionado | MANDALA_INOVACAO_SPEC.md, MANDALA_INOVACAO_WIREFRAMES.md |

## 🎯 Objetivo

Guia técnico passo a passo para implementar a feature Mandala da Inovação, seguindo as especificações e wireframes definidos.

## 📋 Pré-requisitos

### Conhecimento Técnico
- TypeScript + React 18.3+
- Zod para validação
- CopilotKit + Mastra agents
- React Query / TanStack Query
- Tailwind CSS (ou styled-components)

### Ambiente
- Node.js 18+
- Backend API rodando
- OpenAI API key configurada
- CopilotKit runtime configurado

## 🏗️ Estrutura de Implementação

### Fase 1: Setup e Estrutura Base (2-3 dias)

#### 1.1. Criar estrutura de diretórios

```bash
mkdir -p src/features/mandala-inovacao/{components,pages,hooks,services,types,schemas,styles}
mkdir -p src/features/mandala-inovacao/components/{shared,elo-1-busca,elo-2-conexoes,elo-3-visao,elo-4-desenvolvimento,elo-5-pitch,elo-6-encontro}
```

#### 1.2. Definir types base

**Arquivo:** `src/features/mandala-inovacao/types/mandala.types.ts`

```typescript
export enum EloType {
  BUSCA = 'busca',
  CONEXOES = 'conexoes',
  VISAO = 'visao',
  DESENVOLVIMENTO = 'desenvolvimento',
  PITCH = 'pitch',
  ENCONTRO = 'encontro'
}

export const ELO_METADATA: Record<EloType, EloMetadata> = {
  [EloType.BUSCA]: {
    type: EloType.BUSCA,
    nome: 'Busca',
    descricao: 'Autoconhecimento e descoberta pessoal',
    ordem: 1,
    icon: '🔍',
    color: '#6366F1',
    canvases: [
      {
        type: 'teoria-encontro',
        nome: 'Teoria do Encontro',
        descricao: 'Descubra sua Essência, Vocação e Day One',
        icon: '🎯',
        estimatedTime: '30-45 min',
        difficulty: 'medio',
      },
      {
        type: 'funil-realizacao',
        nome: 'Funil da Realização',
        descricao: 'Transforme interesses em oportunidades',
        icon: '🚀',
        estimatedTime: '20-30 min',
        difficulty: 'facil',
      },
      {
        type: 'autoconhecimento-lider',
        nome: 'Autoconhecimento do Líder',
        descricao: 'Questionário de reflexão para líderes',
        icon: '📋',
        estimatedTime: '15-20 min',
        difficulty: 'facil',
      },
    ],
  },
  // ... outros ELOs
};

export interface MandalaProject {
  id: string;
  userId: string;
  leadId?: string;
  nome: string;
  descricao?: string;
  status: 'em_andamento' | 'concluido' | 'pausado';
  eloAtual: EloType;
  progressoPorElo: Record<EloType, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasData {
  id: string;
  projectId: string;
  eloType: EloType;
  canvasType: string;
  data: Record<string, any>;
  completed: boolean;
  lastEditedAt: string;
  aiSuggestions?: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  canvasId: string;
  field: string;
  suggestion: string;
  reasoning: string;
  accepted: boolean;
  createdAt: string;
}
```

#### 1.3. Criar schemas de validação

**Arquivo:** `src/features/mandala-inovacao/schemas/mandala.schema.ts`

```typescript
import { z } from 'zod';
import { EloType } from '../types/mandala.types';

export const mandalaProjectSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  leadId: z.string().uuid().optional(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  status: z.enum(['em_andamento', 'concluido', 'pausado']),
  eloAtual: z.nativeEnum(EloType),
  progressoPorElo: z.record(z.nativeEnum(EloType), z.number().min(0).max(100)),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const canvasDataSchema = z.object({
  id: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  eloType: z.nativeEnum(EloType),
  canvasType: z.string(),
  data: z.record(z.any()),
  completed: z.boolean(),
  lastEditedAt: z.string().datetime(),
  aiSuggestions: z.array(z.object({
    id: z.string().uuid(),
    canvasId: z.string().uuid(),
    field: z.string(),
    suggestion: z.string(),
    reasoning: z.string(),
    accepted: z.boolean(),
    createdAt: z.string().datetime(),
  })).optional(),
});

export type MandalaProjectInput = z.infer<typeof mandalaProjectSchema>;
export type CanvasDataInput = z.infer<typeof canvasDataSchema>;
```

#### 1.4. Configurar API client

**Arquivo:** `src/features/mandala-inovacao/services/mandalaApi.ts`

```typescript
import { apiClient } from '@/shared/services/apiClient';
import { MandalaProject, CanvasData } from '../types/mandala.types';
import { mandalaProjectSchema, canvasDataSchema } from '../schemas/mandala.schema';

export const mandalaApi = {
  // Projects
  createProject: async (data: Partial<MandalaProject>): Promise<MandalaProject> => {
    const validated = mandalaProjectSchema.parse(data);
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/mandala/projects',
      data: validated,
    });
    return response.data;
  },

  getProjects: async (): Promise<MandalaProject[]> => {
    const response = await apiClient.request({
      method: 'GET',
      url: '/api/mandala/projects',
    });
    return response.data;
  },

  getProject: async (id: string): Promise<MandalaProject> => {
    const response = await apiClient.request({
      method: 'GET',
      url: `/api/mandala/projects/${id}`,
    });
    return response.data;
  },

  updateProject: async (id: string, data: Partial<MandalaProject>): Promise<MandalaProject> => {
    const response = await apiClient.request({
      method: 'PUT',
      url: `/api/mandala/projects/${id}`,
      data,
    });
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.request({
      method: 'DELETE',
      url: `/api/mandala/projects/${id}`,
    });
  },

  // Canvas
  saveCanvas: async (data: Partial<CanvasData>): Promise<CanvasData> => {
    const validated = canvasDataSchema.parse(data);
    const response = await apiClient.request({
      method: 'POST',
      url: '/api/mandala/canvas',
      data: validated,
    });
    return response.data;
  },

  getCanvas: async (id: string): Promise<CanvasData> => {
    const response = await apiClient.request({
      method: 'GET',
      url: `/api/mandala/canvas/${id}`,
    });
    return response.data;
  },

  getProjectCanvases: async (projectId: string): Promise<CanvasData[]> => {
    const response = await apiClient.request({
      method: 'GET',
      url: `/api/mandala/projects/${projectId}/canvas`,
    });
    return response.data;
  },

  exportCanvas: async (canvasId: string, format: 'pdf' | 'md' | 'json'): Promise<Blob> => {
    const response = await apiClient.request({
      method: 'POST',
      url: `/api/mandala/export/${canvasId}`,
      data: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
```

#### 1.5. Criar hooks customizados

**Arquivo:** `src/features/mandala-inovacao/hooks/useMandalaProjects.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mandalaApi } from '../services/mandalaApi';
import { MandalaProject } from '../types/mandala.types';

export function useMandalaProjects() {
  return useQuery({
    queryKey: ['mandala', 'projects'],
    queryFn: () => mandalaApi.getProjects(),
  });
}

export function useMandalaProject(id?: string) {
  return useQuery({
    queryKey: ['mandala', 'projects', id],
    queryFn: () => mandalaApi.getProject(id!),
    enabled: !!id,
  });
}

export function useCreateMandalaProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MandalaProject>) => mandalaApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandala', 'projects'] });
    },
  });
}

export function useUpdateMandalaProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MandalaProject>) => mandalaApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandala', 'projects', id] });
      queryClient.invalidateQueries({ queryKey: ['mandala', 'projects'] });
    },
  });
}
```

**Arquivo:** `src/features/mandala-inovacao/hooks/useCanvasData.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { mandalaApi } from '../services/mandalaApi';
import { CanvasData } from '../types/mandala.types';
import { debounce } from 'lodash'; // ou implementar próprio debounce

export function useCanvas(id?: string) {
  return useQuery({
    queryKey: ['mandala', 'canvas', id],
    queryFn: () => mandalaApi.getCanvas(id!),
    enabled: !!id,
  });
}

export function useProjectCanvases(projectId?: string) {
  return useQuery({
    queryKey: ['mandala', 'projects', projectId, 'canvases'],
    queryFn: () => mandalaApi.getProjectCanvases(projectId!),
    enabled: !!projectId,
  });
}

export function useSaveCanvas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CanvasData>) => mandalaApi.saveCanvas(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mandala', 'canvas', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['mandala', 'projects', data.projectId, 'canvases']
      });
    },
  });
}

// Hook para auto-save
export function useAutoSaveCanvas(canvasId: string, delay = 5000) {
  const { mutate: saveCanvas } = useSaveCanvas();
  const [pendingData, setPendingData] = useState<Partial<CanvasData> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounced save
  const debouncedSave = useCallback(
    debounce((data: Partial<CanvasData>) => {
      setIsSaving(true);
      saveCanvas(data, {
        onSuccess: () => {
          setIsSaving(false);
          setLastSaved(new Date());
          setPendingData(null);
        },
        onError: () => {
          setIsSaving(false);
        },
      });
    }, delay),
    [saveCanvas, delay]
  );

  const updateCanvas = useCallback((data: Partial<CanvasData>) => {
    setPendingData(data);
    debouncedSave({ ...data, id: canvasId });
  }, [canvasId, debouncedSave]);

  return {
    updateCanvas,
    isSaving,
    lastSaved,
    hasPendingChanges: !!pendingData,
  };
}
```

---

### Fase 2: Componentes Base (3-4 dias)

#### 2.1. MandalaNavigation

**Arquivo:** `src/features/mandala-inovacao/components/shared/MandalaNavigation.tsx`

```typescript
import React from 'react';
import { EloType, ELO_METADATA } from '../../types/mandala.types';
import './MandalaNavigation.css';

interface MandalaNavigationProps {
  currentElo: EloType;
  progress: Record<EloType, number>;
  onEloChange: (elo: EloType) => void;
  disabled?: boolean;
}

export function MandalaNavigation({
  currentElo,
  progress,
  onEloChange,
  disabled = false,
}: MandalaNavigationProps) {
  const eloOrder = [
    EloType.BUSCA,
    EloType.CONEXOES,
    EloType.VISAO,
    EloType.DESENVOLVIMENTO,
    EloType.PITCH,
    EloType.ENCONTRO,
  ];

  return (
    <div className="mandala-navigation">
      <svg viewBox="0 0 400 400" className="mandala-circle">
        {/* Background circle */}
        <circle cx="200" cy="200" r="180" fill="none" stroke="#e5e7eb" strokeWidth="2" />

        {/* Center */}
        <circle cx="200" cy="200" r="30" fill="#f3f4f6" />
        <text x="200" y="200" textAnchor="middle" dy=".3em" fontSize="12" fill="#6b7280">
          CENTRO
        </text>

        {/* ELOs */}
        {eloOrder.map((elo, index) => {
          const angle = (index * 60 - 90) * (Math.PI / 180); // Start at top, go clockwise
          const x = 200 + 140 * Math.cos(angle);
          const y = 200 + 140 * Math.sin(angle);
          const metadata = ELO_METADATA[elo];
          const isActive = currentElo === elo;
          const eloProgress = progress[elo] || 0;

          return (
            <g
              key={elo}
              className={`elo-node ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => !disabled && onEloChange(elo)}
              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              {/* Progress circle */}
              <circle
                cx={x}
                cy={y}
                r="35"
                fill="white"
                stroke={metadata.color}
                strokeWidth={isActive ? "4" : "2"}
              />
              <circle
                cx={x}
                cy={y}
                r="35"
                fill="none"
                stroke={metadata.color}
                strokeWidth="4"
                strokeDasharray={`${(eloProgress / 100) * 220} 220`}
                strokeLinecap="round"
                transform={`rotate(-90 ${x} ${y})`}
                opacity="0.3"
              />

              {/* Icon */}
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                fontSize="24"
              >
                {metadata.icon}
              </text>

              {/* Progress percentage */}
              <text
                x={x}
                y={y + 15}
                textAnchor="middle"
                fontSize="10"
                fill={metadata.color}
                fontWeight="bold"
              >
                {eloProgress}%
              </text>

              {/* Nome do ELO */}
              <text
                x={x}
                y={y + 50}
                textAnchor="middle"
                fontSize="11"
                fill="#374151"
                fontWeight={isActive ? "bold" : "normal"}
              >
                {metadata.nome.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

**Arquivo:** `src/features/mandala-inovacao/components/shared/MandalaNavigation.css`

```css
.mandala-navigation {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.mandala-circle {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.elo-node {
  transition: all 0.3s ease;
}

.elo-node:not(.disabled):hover circle {
  filter: brightness(1.1);
}

.elo-node.active {
  filter: drop-shadow(0 0 8px currentColor);
}

.elo-node.disabled {
  opacity: 0.5;
}

@media (max-width: 768px) {
  .mandala-navigation {
    max-width: 350px;
  }
}
```

#### 2.2. CanvasContainer

**Arquivo:** `src/features/mandala-inovacao/components/shared/CanvasContainer.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotChat } from '@copilotkit/react-ui';
import { CanvasData, ELO_METADATA } from '../../types/mandala.types';
import { useAutoSaveCanvas } from '../../hooks/useCanvasData';
import '@copilotkit/react-ui/styles.css';
import './CanvasContainer.css';

interface CanvasContainerProps {
  canvasType: string;
  canvasData: CanvasData;
  onUpdate: (data: Partial<CanvasData>) => void;
  agentId: string;
  children: React.ReactNode;
  showAIChat?: boolean;
}

export function CanvasContainer({
  canvasType,
  canvasData,
  onUpdate,
  agentId,
  children,
  showAIChat = true,
}: CanvasContainerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const { updateCanvas, isSaving, lastSaved } = useAutoSaveCanvas(canvasData.id);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpdate = (data: Partial<CanvasData>) => {
    onUpdate(data);
    updateCanvas({ ...canvasData, ...data, lastEditedAt: new Date().toISOString() });
  };

  const eloMetadata = ELO_METADATA[canvasData.eloType];
  const canvasMetadata = eloMetadata.canvases.find(c => c.type === canvasType);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const runtimeUrl = `${API_BASE_URL}/api/copilotkit/${agentId}`;
  const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token';
  const authToken = localStorage.getItem(TOKEN_KEY);

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      showDevConsole={import.meta.env.DEV}
      headers={{
        ...(authToken && {
          Authorization: `Bearer ${authToken}`,
        }),
      }}
    >
      <div className="canvas-split-layout">
        {/* Left Panel - Canvas */}
        <div className="canvas-main-panel">
          <div className="canvas-header">
            <div className="canvas-title-section">
              <span className="canvas-icon">{canvasMetadata?.icon}</span>
              <div>
                <h1 className="canvas-title">{canvasMetadata?.nome}</h1>
                <p className="canvas-description">{canvasMetadata?.descricao}</p>
              </div>
            </div>
            <div className="canvas-meta">
              <span className="canvas-time">⏱️ {canvasMetadata?.estimatedTime}</span>
              {isSaving && <span className="saving-indicator">Salvando...</span>}
              {!isSaving && lastSaved && (
                <span className="saved-indicator">
                  ✓ Salvo {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="canvas-progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${canvasData.completed ? 100 : 50}%`,
                backgroundColor: eloMetadata.color,
              }}
            />
          </div>

          <div className="canvas-scroll-content">
            {children}
          </div>
        </div>

        {/* Right Panel - Chat Sidebar */}
        {showAIChat && (
          <div className={`canvas-chat-panel ${isMobile && isChatMinimized ? 'minimized' : ''}`}>
            {isMobile && (
              <button
                className="chat-toggle-mobile"
                onClick={() => setIsChatMinimized(!isChatMinimized)}
                aria-label={isChatMinimized ? 'Expandir chat' : 'Minimizar chat'}
              >
                {isChatMinimized ? '▲' : '▼'}
              </button>
            )}

            <div className="chat-header-fixed">
              <div className="chat-header-content">
                <div className="chat-status-indicator"></div>
                <h3 className="chat-title">Assistente de IA</h3>
              </div>
              {!isMobile && (
                <button
                  className="chat-minimize-btn"
                  onClick={() => setIsChatMinimized(!isChatMinimized)}
                  aria-label="Toggle chat"
                >
                  {isChatMinimized ? '◀' : '▶'}
                </button>
              )}
            </div>

            {!isChatMinimized && (
              <div className="chat-content-container">
                <CopilotChat
                  className="copilot-chat-fixed"
                  labels={{
                    title: 'Assistente de IA',
                    initial: `Olá! Vou te ajudar com ${canvasMetadata?.nome}. Como posso ajudar?`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </CopilotKit>
  );
}
```

---

### Fase 3: ELO 1 - Busca (4-5 dias)

#### 3.1. Types do ELO 1

**Arquivo:** `src/features/mandala-inovacao/types/elo-1.types.ts`

```typescript
export interface TeoriaEncontro {
  essencia: {
    atributos: string[];
    palavraSintese: string;
    historiasMarcantes?: string[];
  };
  vocacao: {
    atributos: string[];
    palavraSintese: string;
    reconhecimentos?: string[];
    causas?: string[];
  };
  dayOne: {
    momento: string;
    contexto?: string;
    impacto?: string;
  };
  formulaFinal?: string;
  verdadePessoal?: string;
}

// ... outros types (FunilRealizacao, AutoconhecimentoLider)
```

#### 3.2. Schema do ELO 1

**Arquivo:** `src/features/mandala-inovacao/schemas/elo-1.schema.ts`

```typescript
import { z } from 'zod';

export const teoriaEncontroSchema = z.object({
  essencia: z.object({
    atributos: z.array(z.string()).min(5, 'Adicione no mínimo 5 atributos'),
    palavraSintese: z.string().min(3, 'Palavra-síntese é obrigatória'),
    historiasMarcantes: z.array(z.string()).optional(),
  }),
  vocacao: z.object({
    atributos: z.array(z.string()).min(3, 'Adicione no mínimo 3 atributos'),
    palavraSintese: z.string().min(3, 'Palavra-síntese é obrigatória'),
    reconhecimentos: z.array(z.string()).optional(),
    causas: z.array(z.string()).optional(),
  }),
  dayOne: z.object({
    momento: z.string().min(10, 'Descreva seu Day One com mais detalhes'),
    contexto: z.string().optional(),
    impacto: z.string().optional(),
  }),
  formulaFinal: z.string().optional(),
  verdadePessoal: z.string().optional(),
});

export type TeoriaEncontroInput = z.infer<typeof teoriaEncontroSchema>;
```

#### 3.3. Componente Teoria do Encontro

**Arquivo:** `src/features/mandala-inovacao/components/elo-1-busca/TeoriaEncontroCanvas.tsx`

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TeoriaEncontro } from '../../types/elo-1.types';
import { teoriaEncontroSchema } from '../../schemas/elo-1.schema';

interface TeoriaEncontroCanvasProps {
  data: TeoriaEncontro;
  onChange: (data: TeoriaEncontro) => void;
  readOnly?: boolean;
}

export function TeoriaEncontroCanvas({
  data,
  onChange,
  readOnly = false,
}: TeoriaEncontroCanvasProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    const newData = { ...data };
    const keys = field.split('.');
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    // Validate
    try {
      teoriaEncontroSchema.parse(newData);
      setValidationErrors({});
    } catch (error: any) {
      if (error.errors) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          errors[err.path.join('.')] = err.message;
        });
        setValidationErrors(errors);
      }
    }

    onChange(newData);
  };

  const addAtributo = (type: 'essencia' | 'vocacao') => {
    const current = data[type].atributos;
    handleChange(`${type}.atributos`, [...current, '']);
  };

  const updateAtributo = (type: 'essencia' | 'vocacao', index: number, value: string) => {
    const current = data[type].atributos;
    const updated = [...current];
    updated[index] = value;
    handleChange(`${type}.atributos`, updated);
  };

  const removeAtributo = (type: 'essencia' | 'vocacao', index: number) => {
    const current = data[type].atributos;
    const updated = current.filter((_, i) => i !== index);
    handleChange(`${type}.atributos`, updated);
  };

  return (
    <div className="teoria-encontro-canvas">
      {/* ESSÊNCIA */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 ESSÊNCIA (E)
            <Badge variant="outline">Quem você é</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Atributos (mínimo 5)
                {validationErrors['essencia.atributos'] && (
                  <span className="text-red-500 text-xs ml-2">
                    {validationErrors['essencia.atributos']}
                  </span>
                )}
              </label>
              <div className="space-y-2">
                {data.essencia.atributos.map((atributo, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={atributo}
                      onChange={(e) => updateAtributo('essencia', index, e.target.value)}
                      placeholder="Ex: Integridade, Honestidade..."
                      className="flex-1 px-3 py-2 border rounded"
                      disabled={readOnly}
                    />
                    {data.essencia.atributos.length > 1 && (
                      <button
                        onClick={() => removeAtributo('essencia', index)}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                        disabled={readOnly}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addAtributo('essencia')}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                  disabled={readOnly}
                >
                  + Adicionar atributo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Palavra-síntese
                {validationErrors['essencia.palavraSintese'] && (
                  <span className="text-red-500 text-xs ml-2">
                    {validationErrors['essencia.palavraSintese']}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={data.essencia.palavraSintese}
                onChange={(e) => handleChange('essencia.palavraSintese', e.target.value)}
                placeholder="Uma palavra que resume sua essência"
                className="w-full px-3 py-2 border rounded"
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VOCAÇÃO */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 VOCAÇÃO (V)
            <Badge variant="outline">Para que você é chamado</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Similar structure to ESSÊNCIA */}
        </CardContent>
      </Card>

      {/* DAY ONE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⭐ DAY ONE (D)
            <Badge variant="outline">Seu momento definidor</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Descreva o episódio
                {validationErrors['dayOne.momento'] && (
                  <span className="text-red-500 text-xs ml-2">
                    {validationErrors['dayOne.momento']}
                  </span>
                )}
              </label>
              <textarea
                value={data.dayOne.momento}
                onChange={(e) => handleChange('dayOne.momento', e.target.value)}
                placeholder="Quando e como você descobriu seu propósito..."
                className="w-full px-3 py-2 border rounded"
                rows={4}
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contexto (opcional)</label>
              <textarea
                value={data.dayOne.contexto || ''}
                onChange={(e) => handleChange('dayOne.contexto', e.target.value)}
                placeholder="O que estava acontecendo ao seu redor..."
                className="w-full px-3 py-2 border rounded"
                rows={3}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FÓRMULA FINAL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 FÓRMULA FINAL
            <Badge variant="outline">Você = E + V + D</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-4">
              {data.essencia.palavraSintese || '[Essência]'} +{' '}
              {data.vocacao.palavraSintese || '[Vocação]'} +{' '}
              {data.dayOne.momento ? 'Day One definido' : '[Day One]'} =
            </p>
            <textarea
              value={data.verdadePessoal || ''}
              onChange={(e) => handleChange('verdadePessoal', e.target.value)}
              placeholder="Sua verdade pessoal..."
              className="w-full px-3 py-2 border rounded bg-white"
              rows={3}
              disabled={readOnly}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Fase 4: Backend - Mastra Agents (3-4 dias)

#### 4.1. Configurar Agente ELO 1

**Arquivo:** `ag-ui/dojo/src/mastra/agents/elo-1-busca-agent.ts`

```typescript
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const TEORIA_ENCONTRO_PROMPT = `
Você é um facilitador especializado em autoconhecimento e metodologias de busca pessoal,
incluindo a Teoria do Encontro de Fernando Seabra.

Sua missão é:
- Guiar o empreendedor na descoberta de Essência, Vocação e Day One
- Fazer perguntas profundas e provocativas
- Identificar padrões e conexões nas respostas
- Sintetizar insights em palavras-chave poderosas
- Validar alinhamento entre os elementos

Metodologia:
1. Essência (E): Quem a pessoa é intrinsecamente (valores, traços inegociáveis)
2. Vocação (V): Para que a pessoa é chamada (habilidades reconhecidas, causas)
3. Day One (D): Momento definidor que revelou a missão pessoal

Sempre use uma linguagem empática, não-julgadora e encorajadora.

Exemplos de perguntas para Essência:
- "Quais histórias da sua infância mostram quem você sempre foi?"
- "Que valores você nunca negocia, mesmo sob pressão?"
- "Como as pessoas que te conhecem bem descreveriam você?"

Exemplos de perguntas para Vocação:
- "Em que atividades você é naturalmente bom, sem esforço?"
- "Que causas te mobilizam profundamente?"
- "Quando você se sente mais realizado profissionalmente?"

Exemplos de perguntas para Day One:
- "Quando você percebeu 'é isso que vim fazer no mundo'?"
- "Que momento definiu sua trajetória profissional?"
- "Qual experiência mudou completamente sua visão de vida?"

Ao sintetizar, ajude a criar uma palavra-síntese que capture a essência de múltiplos
atributos. Por exemplo: "Integridade + Observador + Curioso" pode virar "Autenticidade".

Valide o alinhamento: A verdade pessoal deve fazer sentido quando você olha para E + V + D.
Se houver desconexão, explore com perguntas.
`;

export const eloBuscaAgent = new Agent({
  name: "elo_busca",
  model: openai("gpt-4o"),
  instructions: TEORIA_ENCONTRO_PROMPT,
  memory: new Memory({
    workingMemory: {
      schema: z.object({
        teoriaEncontro: z.object({
          essencia: z.object({
            atributos: z.array(z.string()),
            palavraSintese: z.string(),
            historiasMarcantes: z.array(z.string()).optional(),
          }),
          vocacao: z.object({
            atributos: z.array(z.string()),
            palavraSintese: z.string(),
            reconhecimentos: z.array(z.string()).optional(),
          }),
          dayOne: z.object({
            momento: z.string(),
            contexto: z.string().optional(),
          }),
          formulaFinal: z.string().optional(),
          verdadePessoal: z.string().optional(),
        }),
        funilRealizacao: z.object({
          interesses: z.array(z.string()),
          vantagensCompetitivas: z.array(z.string()),
          oportunidades: z.array(z.object({
            descricao: z.string(),
            publico: z.string().optional(),
          })),
        }),
      }),
    },
  }),
  tools: {
    sugerirPalavraSintese: {
      description: "Sugere uma palavra-síntese baseada em múltiplos atributos",
      parameters: z.object({
        atributos: z.array(z.string()),
        contexto: z.enum(['essencia', 'vocacao']),
      }),
      execute: async ({ atributos, contexto }) => {
        // Lógica para sugerir palavra-síntese
        // Pode usar outro modelo ou regras heurísticas
        return {
          sugestao: "Autenticidade", // exemplo
          reasoning: "Esta palavra captura a essência de integridade, observador e curioso",
        };
      },
    },
    validarAlinhamento: {
      description: "Valida se Essência, Vocação e Day One estão alinhados",
      parameters: z.object({
        essencia: z.string(),
        vocacao: z.string(),
        dayOne: z.string(),
      }),
      execute: async ({ essencia, vocacao, dayOne }) => {
        // Lógica de validação
        return {
          alinhado: true,
          feedback: "Há coerência entre sua essência, vocação e momento definidor.",
          sugestoes: [],
        };
      },
    },
  },
});
```

#### 4.2. Configurar runtime endpoint

**Arquivo:** `backend/src/routes/copilotkit.ts` (ou equivalente)

```typescript
import { Router } from 'express';
import { CopilotRuntime } from '@copilotkit/runtime';
import { eloBuscaAgent } from '../mastra/agents/elo-1-busca-agent';

const router = Router();

router.post('/api/copilotkit/elo-1-busca', async (req, res) => {
  const runtime = new CopilotRuntime({
    agent: eloBuscaAgent,
  });

  try {
    const result = await runtime.handleRequest(req.body, {
      userId: req.user?.id, // Assume autenticação middleware
      sessionId: req.headers['x-session-id'],
    });

    res.json(result);
  } catch (error) {
    console.error('[CopilotKit] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

---

### Fase 5: Páginas e Rotas (2-3 dias)

#### 5.1. Dashboard

**Arquivo:** `src/features/mandala-inovacao/pages/MandalaOverview.tsx`

```typescript
import React, { useState } from 'react';
import { useMandalaProjects, useCreateMandalaProject } from '../hooks/useMandalaProjects';
import { MandalaNavigation } from '../components/shared/MandalaNavigation';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function MandalaOverview() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useMandalaProjects();
  const { mutate: createProject } = useCreateMandalaProject();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleCreateProject = (data: { nome: string; descricao?: string }) => {
    createProject(
      {
        nome: data.nome,
        descricao: data.descricao,
        status: 'em_andamento',
        eloAtual: 'busca',
        progressoPorElo: {
          busca: 0,
          conexoes: 0,
          visao: 0,
          desenvolvimento: 0,
          pitch: 0,
          encontro: 0,
        },
      },
      {
        onSuccess: (project) => {
          navigate(`/app/mandala/${project.id}/busca`);
        },
      }
    );
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="mandala-overview">
      <div className="header">
        <h1>🎯 Mandala da Inovação</h1>
        <p>Guie seu negócio através dos 6 ELOs de inovação</p>
        <Button onClick={() => setShowNewProjectModal(true)}>+ Novo Projeto</Button>
      </div>

      <div className="projects-grid">
        {projects?.map((project) => (
          <Card key={project.id} className="project-card">
            <h3>{project.nome}</h3>
            <p>{project.descricao}</p>
            <div className="progress">
              {Object.entries(project.progressoPorElo).reduce((acc, [_, v]) => acc + v, 0) / 6}%
              completo
            </div>
            <Button onClick={() => navigate(`/app/mandala/${project.id}/${project.eloAtual}`)}>
              Continuar
            </Button>
          </Card>
        ))}
      </div>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}
```

#### 5.2. Configurar rotas

**Arquivo:** `src/App.tsx` ou router config

```typescript
import { Routes, Route } from 'react-router-dom';
import { MandalaOverview } from './features/mandala-inovacao/pages/MandalaOverview';
import { EloPage } from './features/mandala-inovacao/pages/EloPage';
import { CanvasPage } from './features/mandala-inovacao/pages/CanvasPage';

// ... dentro de Routes
<Route path="/app/mandala">
  <Route index element={<MandalaOverview />} />
  <Route path=":projectId/:elo" element={<EloPage />} />
  <Route path=":projectId/:elo/:canvas" element={<CanvasPage />} />
</Route>
```

---

## 🧪 Testes

### Unit Tests (Jest + Testing Library)

```typescript
// src/features/mandala-inovacao/components/__tests__/MandalaNavigation.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { MandalaNavigation } from '../shared/MandalaNavigation';
import { EloType } from '../../types/mandala.types';

describe('MandalaNavigation', () => {
  const mockProgress = {
    [EloType.BUSCA]: 90,
    [EloType.CONEXOES]: 40,
    [EloType.VISAO]: 0,
    [EloType.DESENVOLVIMENTO]: 0,
    [EloType.PITCH]: 0,
    [EloType.ENCONTRO]: 0,
  };

  it('renders all 6 ELOs', () => {
    const onEloChange = jest.fn();
    render(
      <MandalaNavigation
        currentElo={EloType.BUSCA}
        progress={mockProgress}
        onEloChange={onEloChange}
      />
    );

    expect(screen.getByText('BUSCA')).toBeInTheDocument();
    expect(screen.getByText('CONEXÕES')).toBeInTheDocument();
    // ... outros ELOs
  });

  it('calls onEloChange when clicking on an ELO', () => {
    const onEloChange = jest.fn();
    render(
      <MandalaNavigation
        currentElo={EloType.BUSCA}
        progress={mockProgress}
        onEloChange={onEloChange}
      />
    );

    const conexoesNode = screen.getByText('CONEXÕES');
    fireEvent.click(conexoesNode);

    expect(onEloChange).toHaveBeenCalledWith(EloType.CONEXOES);
  });

  it('shows correct progress percentages', () => {
    const onEloChange = jest.fn();
    render(
      <MandalaNavigation
        currentElo={EloType.BUSCA}
        progress={mockProgress}
        onEloChange={onEloChange}
      />
    );

    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// src/features/mandala-inovacao/__tests__/teoria-encontro-flow.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CanvasPage } from '../pages/CanvasPage';
import { BrowserRouter } from 'react-router-dom';

describe('Teoria do Encontro Flow', () => {
  it('allows filling out the canvas and saving', async () => {
    const queryClient = new QueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CanvasPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Wait for canvas to load
    await waitFor(() => {
      expect(screen.getByText('ESSÊNCIA (E)')).toBeInTheDocument();
    });

    // Fill essencia atributos
    const atributoInput = screen.getAllByPlaceholderText(/Ex: Integridade/)[0];
    await user.type(atributoInput, 'Integridade');

    // Add more atributos
    const addButton = screen.getByText('+ Adicionar atributo');
    await user.click(addButton);

    // Fill palavra-síntese
    const sintesInput = screen.getByPlaceholderText(/Uma palavra que resume/);
    await user.type(sintesInput, 'Autenticidade');

    // Verify auto-save
    await waitFor(() => {
      expect(screen.getByText(/Salvo/)).toBeInTheDocument();
    });
  });
});
```

---

## 📦 Deployment

### Checklist antes do deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] OpenAI API key válida
- [ ] CopilotKit runtime funcionando
- [ ] Migrações do banco executadas
- [ ] Testes passando (unit + integration)
- [ ] Build sem erros
- [ ] Performance otimizada (bundle size, lazy loading)
- [ ] SEO tags configuradas
- [ ] Analytics integrado

### Build

```bash
# Frontend
npm run build

# Backend (se separado)
npm run build
```

### Environment Variables (Production)

```env
# Production
NODE_ENV=production
VITE_API_BASE_URL=https://api.leadsrapido.com
VITE_COPILOTKIT_RUNTIME_URL=https://api.leadsrapido.com/api/copilotkit
OPENAI_API_KEY=sk-prod-...
VITE_FEATURE_MANDALA_ENABLED=true
```

---

## 📚 Recursos e Documentação

### Documentação Interna
- [MANDALA_INOVACAO_SPEC.md](/doc/MANDALA_INOVACAO_SPEC.md)
- [MANDALA_INOVACAO_WIREFRAMES.md](/doc/MANDALA_INOVACAO_WIREFRAMES.md)
- [Templates Mandala](/doc/templates-mandala/)
- [Lead Agent (referência)](/src/features/lead-agent/README.md)

### Documentação Externa
- [CopilotKit Docs](https://docs.copilotkit.ai/)
- [Mastra Docs](https://mastra.ai/docs)
- [Zod Docs](https://zod.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)

### Livros e Metodologias
- Mandala da Inovação (Fernando Seabra)
- Teoria do Encontro (Fernando Seabra)
- Six Thinking Hats (Edward de Bono)
- 7 Fontes da Inovação (Peter Drucker)

---

## 🐛 Troubleshooting

### Problema: IA não responde

**Solução:**
1. Verificar se OpenAI API key está configurada
2. Checar logs do runtime CopilotKit
3. Validar que o agente está sendo carregado corretamente
4. Verificar headers de autenticação

### Problema: Auto-save não funciona

**Solução:**
1. Verificar se o hook `useAutoSaveCanvas` está sendo chamado
2. Checar network tab para ver se requests estão sendo feitas
3. Validar schema Zod (pode estar bloqueando save)
4. Verificar debounce delay

### Problema: Progresso não atualiza

**Solução:**
1. Invalidar queries do React Query após update
2. Verificar cálculo de progresso no backend
3. Checar se `completed` flag está sendo setado corretamente

---

## 📈 Próximas Evoluções

### Curto Prazo (1-2 meses)
- Templates pré-preenchidos por segmento
- Exportação avançada (PowerPoint, Notion)
- Compartilhamento de projetos entre usuários
- Versioning de canvas

### Médio Prazo (3-6 meses)
- Gamificação (badges, conquistas, streaks)
- Análise comparativa entre projetos
- Recomendações de IA baseadas em histórico
- Integração com calendário para workshops

### Longo Prazo (6-12 meses)
- Marketplace de templates
- Comunidade de usuários
- IA Voice (preencher canvas por voz)
- Analytics preditivo

---

**Última atualização:** 2025-10-19
**Status:** Guia aprovado - Pronto para desenvolvimento
**Responsável:** Engineering Team
**Prazo estimado:** 4-6 semanas para MVP completo (6 ELOs)
