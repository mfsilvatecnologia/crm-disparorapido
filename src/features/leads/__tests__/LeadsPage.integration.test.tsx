/**
 * LeadsPage Integration Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LeadsPage from '../pages/LeadsPage';

// Mock the hooks and contexts
vi.mock('@/shared/contexts/OrganizationContext', () => ({
  useOrganization: () => ({
    currentOrganization: { id: '1', name: 'Test Org' },
  }),
}));

vi.mock('@/shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', name: 'Test User' },
  }),
}));

vi.mock('../hooks/useLeads', () => ({
  useLeads: () => ({
    data: {
      items: [
        {
          id: '1',
          nomeContato: 'John Doe',
          nomeEmpresa: 'Acme Corp',
          email: 'john@acme.com',
          telefone: '11999999999',
          cargoContato: 'CEO',
          segmento: 'Tecnologia',
          status: 'novo',
          scoreQualificacao: 85,
          fonte: 'scraping',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          endereco: { cidade: 'São Paulo', estado: 'SP' },
          tags: ['enterprise', 'tech'],
        },
        {
          id: '2',
          nomeContato: 'Jane Smith',
          nomeEmpresa: 'Tech Inc',
          email: 'jane@tech.com',
          telefone: '11888888888',
          cargoContato: 'CTO',
          segmento: 'SaaS',
          status: 'qualificado',
          scoreQualificacao: 92,
          fonte: 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          endereco: { cidade: 'Rio de Janeiro', estado: 'RJ' },
          tags: ['startup'],
        },
      ],
      total: 2,
      page: 1,
      limit: 25,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    isLoading: false,
    error: null,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LeadsPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the page header with title', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
      });
    });

    it('renders leads in the table', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('renders company names', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
        expect(screen.getByText('Tech Inc')).toBeInTheDocument();
      });
    });
  });

  describe('Stats Widget', () => {
    it('shows lead counts', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        // Should show some stats
        expect(screen.getByText(/Novos/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filters', () => {
    it('renders status filter', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        // Should have filter options
        expect(screen.getByText(/Todos/i)).toBeInTheDocument();
      });
    });
  });

  describe('View Modes', () => {
    it('has table view active by default', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        // Table should be rendered
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    it('has export button', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Exportar/i)).toBeInTheDocument();
      });
    });

    it('has new lead button', async () => {
      render(<LeadsPage />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Novo lead/i)).toBeInTheDocument();
      });
    });
  });
});
