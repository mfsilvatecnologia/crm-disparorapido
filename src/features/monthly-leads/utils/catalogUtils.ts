export interface CatalogSegment {
  segment: string;
  availableLeads: number;
}

export interface CatalogState {
  state: string;
  segments: CatalogSegment[];
}

export function getStatesForSegment(catalog: CatalogState[], segment: string): CatalogState[] {
  if (!segment) return catalog;
  return catalog.filter((entry) => entry.segments.some((item) => item.segment === segment));
}

export function getSegmentsForState(catalog: CatalogState[], state: string): CatalogSegment[] {
  if (!state) {
    const segmentMap = new Map<string, CatalogSegment>();
    for (const entry of catalog) {
      for (const segmentItem of entry.segments) {
        if (!segmentMap.has(segmentItem.segment)) {
          segmentMap.set(segmentItem.segment, segmentItem);
        }
      }
    }
    return Array.from(segmentMap.values()).sort((a, b) => a.segment.localeCompare(b.segment, 'pt-BR'));
  }

  const entry = catalog.find((item) => item.state === state);
  return entry?.segments ?? [];
}

export function getAvailability(catalog: CatalogState[], state: string, segment: string): number | null {
  if (!state || !segment) return null;
  const entry = catalog.find((item) => item.state === state);
  const segmentEntry = entry?.segments.find((item) => item.segment === segment);
  return segmentEntry?.availableLeads ?? 0;
}

export function formatLeadCount(value: number): string {
  return value.toLocaleString('pt-BR');
}
