/**
 * Cursor Pagination Utility (Frontend)
 *
 * Implementa paginação baseada em cursor para o frontend, compatível com o backend.
 * Segue o padrão PH3A de cursor-based pagination.
 *
 * Features:
 * - Cursor encoding/decoding (Base64url)
 * - Filter consistency validation
 * - Type-safe pagination metadata
 * - URL-safe cursor format
 */

/**
 * Cursor Data Structure (matches backend)
 */
export interface CursorData {
  k: string; // lastKey: último ID/campo processado
  t: string; // tenantId: empresa_id (tenant binding)
  f: string; // filtersHash: SHA-256 dos filtros (16 chars)
  l: number; // limit: tamanho da página
}

/**
 * Pagination Metadata (frontend)
 */
export interface PaginationMetadata {
  hasMore: boolean;
  nextCursor: string | null;
  limit: number;
  totalReturned: number;
}

/**
 * Paginated Result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Query Filters Type
 */
export type QueryFilters = Record<string, any>;

/**
 * Normaliza filtros para hash consistente
 * - Ordena as chaves alfabeticamente
 * - Remove valores undefined/null
 */
function normalizeFiltersForHash(filters: QueryFilters): QueryFilters {
  const sortedFilters: QueryFilters = {};
  Object.keys(filters)
    .sort()
    .forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        sortedFilters[key] = filters[key];
      }
    });
  return sortedFilters;
}

/**
 * Gera hash SHA-256 dos filtros (client-side version)
 * Usa Web Crypto API quando disponível, fallback para hash simples
 */
export async function hashFilters(filters: QueryFilters): Promise<string> {
  const normalized = normalizeFiltersForHash(filters);
  const filtersJson = JSON.stringify(normalized);

  // Use Web Crypto API se disponível
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(filtersJson);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 16);
    } catch (error) {
      console.warn('Failed to use Web Crypto API, falling back to simple hash', error);
    }
  }

  // Fallback: hash simples (não criptográfico, mas consistente)
  let hash = 0;
  for (let i = 0; i < filtersJson.length; i++) {
    const char = filtersJson.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
}

/**
 * Versão síncrona do hash para casos onde async não é possível
 */
export function hashFiltersSync(filters: QueryFilters): string {
  const normalized = normalizeFiltersForHash(filters);
  const filtersJson = JSON.stringify(normalized);

  // Hash simples síncrono
  let hash = 0;
  for (let i = 0; i < filtersJson.length; i++) {
    const char = filtersJson.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
}

/**
 * Decodifica cursor (frontend - validação básica)
 *
 * @param cursor - Cursor codificado em base64url
 * @returns Dados do cursor decodificados
 * @throws Error se cursor inválido
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    const json = atob(cursor.replace(/-/g, '+').replace(/_/g, '/'));
    const data = JSON.parse(json) as CursorData;

    // Validação de estrutura
    if (!data || typeof data !== 'object' || !('k' in data) || !('t' in data) || !('f' in data) || !('l' in data)) {
      throw new Error('Invalid cursor structure');
    }

    // Validação de limite
    if (data.l < 1 || data.l > 10000) {
      throw new Error('Invalid limit in cursor');
    }

    return data;
  } catch (error) {
    console.error('Failed to decode cursor:', error);
    throw new Error('Invalid or corrupted cursor');
  }
}

/**
 * Extrai informações do cursor sem validação completa
 * Útil para debugging ou UI
 */
export function peekCursor(cursor: string): Partial<CursorData> | null {
  try {
    return decodeCursor(cursor);
  } catch {
    return null;
  }
}

/**
 * Params para requisição com cursor
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  [key: string]: any; // Permite outros filtros
}

/**
 * Hook helper para gerenciar estado de paginação por cursor
 */
export interface CursorPaginationState {
  cursor: string | null;
  limit: number;
  filters: QueryFilters;
}

/**
 * Cria estado inicial de paginação
 */
export function createInitialPaginationState(limit: number = 10): CursorPaginationState {
  return {
    cursor: null,
    limit,
    filters: {},
  };
}

/**
 * Atualiza estado de paginação
 */
export function updatePaginationState(
  state: CursorPaginationState,
  updates: Partial<CursorPaginationState>
): CursorPaginationState {
  return {
    ...state,
    ...updates,
  };
}

/**
 * Reset de paginação quando filtros mudam
 */
export function resetPaginationOnFilterChange(
  state: CursorPaginationState,
  newFilters: QueryFilters
): CursorPaginationState {
  // Se filtros mudaram, reseta cursor
  const filtersChanged = JSON.stringify(state.filters) !== JSON.stringify(newFilters);

  if (filtersChanged) {
    return {
      ...state,
      cursor: null,
      filters: newFilters,
    };
  }

  return state;
}
