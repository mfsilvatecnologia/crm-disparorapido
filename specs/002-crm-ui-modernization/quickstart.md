# Quickstart: Modernização UI/UX do CRM

**Branch**: `002-crm-ui-modernization` | **Date**: 2026-01-03 | **Phase**: 1
**Objective**: Guia passo-a-passo para implementar o primeiro componente do design system

---

## Pré-requisitos

Antes de começar, certifique-se de que:

1. ✅ Node.js 20+ instalado
2. ✅ Branch `002-crm-ui-modernization` criado
3. ✅ Dependências instaladas (`npm install`)
4. ✅ Servidor de desenvolvimento funcional (`npm run dev`)

```bash
# Verificar branch
git checkout -b 002-crm-ui-modernization

# Instalar dependências (se necessário)
npm install

# Iniciar dev server
npm run dev
```

---

## Passo 1: Criar Estrutura de Pastas

Crie a estrutura base para os componentes do design system:

```bash
# Criar pastas
mkdir -p src/shared/components/design-system
mkdir -p src/shared/components/command-palette
mkdir -p src/shared/components/tour
mkdir -p src/config

# Criar arquivos base
touch src/shared/components/design-system/index.ts
touch src/config/design-tokens.ts
```

---

## Passo 2: Configurar Design Tokens

### 2.1 Criar arquivo de tokens

```typescript
// src/config/design-tokens.ts

import {
  Circle,
  CheckCircle2,
  Phone,
  ArrowRightCircle,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

// Status colors para Lead
export const leadStatusConfig = {
  novo: {
    label: 'Novo',
    icon: Circle,
    colors: {
      bg: 'bg-primary-100',
      text: 'text-primary-700',
      border: 'border-primary-500',
    },
  },
  qualificado: {
    label: 'Qualificado',
    icon: CheckCircle2,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  contatado: {
    label: 'Contatado',
    icon: Phone,
    colors: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-500',
    },
  },
  convertido: {
    label: 'Convertido',
    icon: ArrowRightCircle,
    colors: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-500',
    },
  },
  descartado: {
    label: 'Descartado',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-500',
    },
  },
} as const;

export type LeadStatus = keyof typeof leadStatusConfig;

// Score colors
export const scoreConfig = {
  low: { min: 0, max: 50, color: 'text-red-500', bg: 'bg-red-100', label: 'Baixo' },
  medium: { min: 51, max: 70, color: 'text-amber-500', bg: 'bg-amber-100', label: 'Médio' },
  high: { min: 71, max: 89, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Alto' },
  excellent: { min: 90, max: 100, color: 'text-green-500', bg: 'bg-green-100', label: 'Excelente' },
} as const;

export function getScoreConfig(score: number) {
  if (score <= 50) return scoreConfig.low;
  if (score <= 70) return scoreConfig.medium;
  if (score <= 89) return scoreConfig.high;
  return scoreConfig.excellent;
}
```

---

## Passo 3: Implementar StatusBadge (Primeiro Componente)

O StatusBadge é o componente mais reutilizado - ideal para começar.

### 3.1 Criar o componente

```typescript
// src/shared/components/design-system/StatusBadge.tsx

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { leadStatusConfig, type LeadStatus } from '@/config/design-tokens';
import type { LucideIcon } from 'lucide-react';

// Size variants
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

// Variant styles
const variantClasses = {
  solid: (colors: { bg: string; text: string }) => 
    `${colors.bg} ${colors.text}`,
  soft: (colors: { bg: string; text: string }) => 
    `${colors.bg}/50 ${colors.text}`,
  outline: (colors: { border: string; text: string }) => 
    `bg-transparent border ${colors.border} ${colors.text}`,
};

export interface StatusBadgeProps {
  status: LeadStatus;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  variant = 'soft',
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = leadStatusConfig[status];
  const Icon = config.icon;

  const variantStyle = variant === 'outline'
    ? variantClasses.outline(config.colors)
    : variantClasses[variant](config.colors);

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        sizeClasses[size],
        variantStyle,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
```

### 3.2 Exportar no barrel

```typescript
// src/shared/components/design-system/index.ts

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

// Re-export tokens for convenience
export { leadStatusConfig, scoreConfig, getScoreConfig } from '@/config/design-tokens';
export type { LeadStatus } from '@/config/design-tokens';
```

---

## Passo 4: Criar Testes

### 4.1 Teste unitário do StatusBadge

```typescript
// src/shared/components/design-system/__tests__/StatusBadge.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('renders with default props', () => {
    render(<StatusBadge status="novo" />);
    expect(screen.getByText('Novo')).toBeInTheDocument();
  });

  it('renders all status variants', () => {
    const statuses = ['novo', 'qualificado', 'contatado', 'convertido', 'descartado'] as const;
    
    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(new RegExp(status, 'i'))).toBeInTheDocument();
      unmount();
    });
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<StatusBadge status="novo" size="sm" />);
    expect(screen.getByText('Novo').closest('span')).toHaveClass('text-xs');

    rerender(<StatusBadge status="novo" size="lg" />);
    expect(screen.getByText('Novo').closest('span')).toHaveClass('text-base');
  });

  it('hides icon when showIcon is false', () => {
    render(<StatusBadge status="novo" showIcon={false} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StatusBadge status="novo" className="custom-class" />);
    expect(screen.getByText('Novo').closest('span')).toHaveClass('custom-class');
  });
});
```

### 4.2 Executar testes

```bash
# Executar testes unitários
npm run test:run -- StatusBadge

# Executar com watch mode
npm run test -- StatusBadge
```

---

## Passo 5: Usar na LeadsPage

### 5.1 Substituir badges existentes

Localize a LeadsPage e substitua os badges hardcoded:

```typescript
// src/features/leads/pages/LeadsPage.tsx

// Adicionar import
import { StatusBadge } from '@/shared/components/design-system';

// Substituir renderização de status
// ANTES:
<Badge variant="secondary">{lead.status}</Badge>

// DEPOIS:
<StatusBadge status={lead.status as LeadStatus} />
```

### 5.2 Verificar visualmente

1. Abra http://localhost:5173/app/crm/leads
2. Verifique que os badges estão renderizando corretamente
3. Teste os diferentes status (Novo, Qualificado, Contatado, etc.)

---

## Passo 6: Implementar ScoreBadge (Segundo Componente)

Agora que você entendeu o padrão, implemente o ScoreBadge:

```typescript
// src/shared/components/design-system/ScoreBadge.tsx

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { getScoreConfig } from '@/config/design-tokens';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  size = 'md',
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  const config = getScoreConfig(score);

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-bold',
          sizeClasses[size],
          config.bg,
          config.color
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
```

---

## Próximos Passos

Após concluir o quickstart, prossiga para:

1. **Implementar Toolbar** - Container para search + filters + actions
2. **Implementar QuickFilters** - Botões de filtro rápido com contadores
3. **Implementar StatsWidget** - Widget compacto de métricas
4. **Implementar PageHeader** - Header padronizado com breadcrumbs

### Ordem Recomendada de Implementação

| Ordem | Componente | Dependências | User Story |
|-------|------------|--------------|------------|
| 1 | StatusBadge ✅ | Nenhuma | US-2 |
| 2 | ScoreBadge | Nenhuma | US-2 |
| 3 | RelativeTime | date-fns | US-2 |
| 4 | StatsWidget | Nenhuma | US-2 |
| 5 | QuickFilters | Nenhuma | US-2 |
| 6 | FilterChip | Popover | US-2 |
| 7 | ViewSwitcher | Nenhuma | US-2 |
| 8 | Toolbar | Search, ViewSwitcher | US-2 |
| 9 | SmartButton | Button | US-2 |
| 10 | PageHeader | Breadcrumb, StatsWidget | US-2 |

---

## Checklist de Validação

Antes de marcar o componente como concluído:

- [ ] Componente implementado seguindo o contrato TypeScript
- [ ] Testes unitários escritos e passando
- [ ] Exportado via barrel file (`index.ts`)
- [ ] Usado em pelo menos uma página real
- [ ] Revisão visual em diferentes tamanhos (sm, md, lg)
- [ ] Verificado dark mode (se aplicável)
- [ ] Verificado acessibilidade básica (contraste, focus states)

---

## Troubleshooting

### Erro: "Cannot find module '@/config/design-tokens'"

Verifique se o path alias está configurado no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: "Type 'string' is not assignable to type 'LeadStatus'"

Use type assertion ou valide o valor:

```typescript
// Option 1: Type assertion (quando você tem certeza)
<StatusBadge status={lead.status as LeadStatus} />

// Option 2: Validação (mais seguro)
import { leadStatusConfig } from '@/config/design-tokens';

const isValidStatus = (s: string): s is LeadStatus => 
  s in leadStatusConfig;

{isValidStatus(lead.status) && <StatusBadge status={lead.status} />}
```

### Cores não aparecendo corretamente

Verifique se as classes de cor estão no safelist do Tailwind ou se estão sendo geradas dinamicamente. Para cores dinâmicas, adicione ao `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  safelist: [
    // Status colors
    'bg-primary-100', 'text-primary-700', 'border-primary-500',
    'bg-green-100', 'text-green-700', 'border-green-500',
    'bg-amber-100', 'text-amber-700', 'border-amber-500',
    'bg-emerald-100', 'text-emerald-700', 'border-emerald-500',
    'bg-red-100', 'text-red-700', 'border-red-500',
  ],
};
```

---

*Quickstart completed: 2026-01-03*
