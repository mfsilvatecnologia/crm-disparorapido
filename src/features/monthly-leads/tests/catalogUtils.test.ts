import { describe, expect, it } from 'vitest';
import {
  ALL_STATES_VALUE,
  formatEstadoLabel,
  getAvailability,
  getSegmentsForState,
  isAllStates,
  type CatalogState,
} from '../utils/catalogUtils';

const catalog: CatalogState[] = [
  {
    state: 'SP',
    segments: [
      { segment: 'Advogados', availableLeads: 10 },
      { segment: 'Dentistas', availableLeads: 4 },
    ],
  },
  {
    state: 'RJ',
    segments: [{ segment: 'Advogados', availableLeads: 7 }],
  },
];

describe('catalogUtils all states', () => {
  it('reconhece a opção todos os estados', () => {
    expect(isAllStates(ALL_STATES_VALUE)).toBe(true);
    expect(formatEstadoLabel(ALL_STATES_VALUE)).toBe('Todos os estados');
  });

  it('soma disponibilidade do segmento em todos os estados', () => {
    expect(getAvailability(catalog, ALL_STATES_VALUE, 'Advogados')).toBe(17);
  });

  it('lista segmentos únicos quando todos os estados estão selecionados', () => {
    const segments = getSegmentsForState(catalog, ALL_STATES_VALUE).map((item) => item.segment);
    expect(segments).toEqual(['Advogados', 'Dentistas']);
  });
});
