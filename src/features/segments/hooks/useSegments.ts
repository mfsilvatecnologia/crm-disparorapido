import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { segmentService } from '../services/segments';
import {
  Segment,
  SegmentFilter,
  SegmentStats,
  SegmentAnalytics,
  SegmentBuilderField,
  SegmentExport
} from '../types/segments';

const SEGMENTS_QUERY_KEY = 'segments';

export function useSegments(filtros?: SegmentFilter) {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'list', filtros],
    queryFn: () => segmentService.getSegments(filtros),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSegment(id: string) {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'detail', id],
    queryFn: () => segmentService.getSegment(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSegmentStats() {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'stats'],
    queryFn: () => segmentService.getSegmentStats(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSegmentAnalytics(id: string, periodo?: string) {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'analytics', id, periodo],
    queryFn: () => segmentService.getSegmentAnalytics(id, periodo),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSegmentBuilderFields() {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'builder-fields'],
    queryFn: () => segmentService.getSegmentBuilderFields(),
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (segmento: Omit<Segment, 'id' | 'criadoEm' | 'atualizadoEm' | 'contadorLeads'>) =>
      segmentService.createSegment(segmento),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY] });
    },
  });
}

export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dadosAtualizacao }: { id: string; dadosAtualizacao: Partial<Segment> }) =>
      segmentService.updateSegment(id, dadosAtualizacao),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY] });
      queryClient.setQueryData([SEGMENTS_QUERY_KEY, 'detail', data.id], data);
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY] });
    },
  });
}

export function useDuplicateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, novoNome }: { id: string; novoNome?: string }) =>
      segmentService.duplicateSegment(id, novoNome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY] });
    },
  });
}

export function useRefreshSegmentCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => segmentService.refreshSegmentCount(id),
    onSuccess: (contadorLeads, id) => {
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY, 'detail', id] });
      queryClient.invalidateQueries({ queryKey: [SEGMENTS_QUERY_KEY, 'list'] });
    },
  });
}

export function usePreviewSegment() {
  return useMutation({
    mutationFn: (condicoes: any[]) => segmentService.previewSegment(condicoes),
  });
}

export function useExportSegment() {
  return useMutation({
    mutationFn: ({ id, configuracao }: { id: string; configuracao: SegmentExport }) =>
      segmentService.exportSegment(id, configuracao),
    onSuccess: (blob, { configuracao }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segmento-export.${configuracao.formato}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}

export function useSegmentLeads(id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [SEGMENTS_QUERY_KEY, 'leads', id, page, limit],
    queryFn: () => segmentService.getSegmentLeads(id, page, limit),
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}