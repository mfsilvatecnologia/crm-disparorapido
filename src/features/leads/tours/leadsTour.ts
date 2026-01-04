/**
 * Leads Tour Configuration
 * 
 * Guided tour for the Leads page.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { TourConfig } from '@/shared/components/tour';
import { TOUR_IDS } from '@/shared/components/tour';

/**
 * Tour configuration for Leads page
 */
export const leadsTour: TourConfig = {
  id: TOUR_IDS.LEADS,
  name: 'Tour de Leads',
  autoStart: false, // Will be triggered manually or on first visit
  steps: [
    {
      id: 'header',
      target: '[data-tour="leads-header"]',
      title: 'Visão Geral de Leads',
      content: 'Esta é a página principal de Leads. Aqui você pode visualizar e gerenciar todos os seus leads. Use os widgets de estatísticas acima para ter uma visão rápida dos seus leads.',
      position: 'bottom',
    },
    {
      id: 'stats',
      target: '[data-tour="leads-stats"]',
      title: 'Estatísticas de Leads',
      content: 'Os widgets mostram métricas importantes: Total (todos os leads), Novos (leads recém-criados), Qualificados (leads prontos para contato) e Convertidos (leads que viraram clientes).',
      position: 'bottom',
    },
    {
      id: 'filters',
      target: '[data-tour="leads-filters"]',
      title: 'Filtros Rápidos',
      content: 'Use os filtros rápidos para visualizar leads por status. Clique em qualquer status para filtrar a lista instantaneamente.',
      position: 'bottom',
    },
    {
      id: 'view-switcher',
      target: '[data-tour="leads-view-switcher"]',
      title: 'Alternar Visualização',
      content: 'Você pode visualizar seus leads de três formas diferentes: Lista (tabela), Cards (visualização em cards) e Kanban (visualização por status).',
      position: 'bottom',
    },
    {
      id: 'actions',
      target: '[data-tour="leads-actions"]',
      title: 'Ações Rápidas',
      content: 'Use o botão "Novo Lead" para criar um novo lead rapidamente. Você também pode usar o atalho de teclado Ctrl+L (ou Cmd+L no Mac).',
      position: 'bottom',
    },
  ],
  onComplete: () => {
    console.log('Leads tour completed!');
  },
  onSkip: () => {
    console.log('Leads tour skipped');
  },
  onStart: () => {
    console.log('Leads tour started');
  },
};
