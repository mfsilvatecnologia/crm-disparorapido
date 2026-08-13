export const ALL_STATES_VALUE = 'ALL';

export interface CatalogSegment {
  segment: string;
  availableLeads: number;
}

export interface CatalogState {
  state: string;
  segments: CatalogSegment[];
}

export function isAllStates(state: string): boolean {
  return state.trim().toUpperCase() === ALL_STATES_VALUE;
}

export function formatEstadoLabel(estado: string): string {
  return isAllStates(estado) ? 'Todos os estados' : estado;
}

export function getStatesForSegment(catalog: CatalogState[], segment: string): CatalogState[] {
  if (!segment) return catalog;
  return catalog.filter((entry) => entry.segments.some((item) => item.segment === segment));
}

function aggregateSegments(catalog: CatalogState[]): CatalogSegment[] {
  const segmentMap = new Map<string, number>();
  for (const entry of catalog) {
    for (const segmentItem of entry.segments) {
      segmentMap.set(segmentItem.segment, (segmentMap.get(segmentItem.segment) ?? 0) + segmentItem.availableLeads);
    }
  }
  return Array.from(segmentMap.entries())
    .map(([segment, availableLeads]) => ({ segment, availableLeads }))
    .sort((a, b) => a.segment.localeCompare(b.segment, 'pt-BR'));
}

export function getSegmentsForState(catalog: CatalogState[], state: string): CatalogSegment[] {
  if (!state || isAllStates(state)) {
    return aggregateSegments(catalog);
  }

  const entry = catalog.find((item) => item.state === state);
  return entry?.segments ?? [];
}

export function getAvailability(catalog: CatalogState[], state: string, segment: string): number | null {
  if (!state || !segment) return null;
  if (isAllStates(state)) {
    return catalog.reduce((total, entry) => {
      const segmentEntry = entry.segments.find((item) => item.segment === segment);
      return total + (segmentEntry?.availableLeads ?? 0);
    }, 0);
  }
  const entry = catalog.find((item) => item.state === state);
  const segmentEntry = entry?.segments.find((item) => item.segment === segment);
  return segmentEntry?.availableLeads ?? 0;
}

export function formatLeadCount(value: number): string {
  return value.toLocaleString('pt-BR');
}
