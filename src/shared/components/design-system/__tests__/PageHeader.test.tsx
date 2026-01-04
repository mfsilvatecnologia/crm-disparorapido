/**
 * PageHeader Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';
import { Users, Home, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

describe('PageHeader', () => {
  describe('Title and subtitle', () => {
    it('renders title', () => {
      render(<PageHeader title="Leads" />);
      expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<PageHeader title="Leads" subtitle="Gerencie sua base de leads" />);
      expect(screen.getByText('Gerencie sua base de leads')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<PageHeader title="Leads" />);
      const heading = screen.getByRole('heading', { name: 'Leads' });
      const parent = heading.parentElement;
      expect(parent?.querySelectorAll('p')).toHaveLength(0);
    });
  });

  describe('Icon', () => {
    it('renders icon when provided', () => {
      const { container } = render(<PageHeader title="Leads" icon={Users} />);
      const iconContainer = container.querySelector('.bg-primary\\/10');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render icon container when not provided', () => {
      const { container } = render(<PageHeader title="Leads" />);
      const iconContainer = container.querySelector('.bg-primary\\/10');
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'CRM', href: '/crm' },
      { label: 'Página Atual' },
    ];

    it('renders breadcrumbs', () => {
      render(<PageHeader title="Leads" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('CRM')).toBeInTheDocument();
      expect(screen.getByText('Página Atual')).toBeInTheDocument();
    });

    it('renders breadcrumb links for items with href', () => {
      render(<PageHeader title="Leads" breadcrumbs={breadcrumbs} />);
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('does not render link for last breadcrumb', () => {
      render(<PageHeader title="Leads" breadcrumbs={breadcrumbs} />);
      // The breadcrumb 'Página Atual' should not be a link (last item)
      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      const items = nav.querySelectorAll('li');
      const lastItem = items[items.length - 1];
      expect(lastItem?.querySelector('a')).toBeNull();
    });

    it('renders breadcrumb icons when provided', () => {
      const breadcrumbsWithIcons = [
        { label: 'Dashboard', href: '/dashboard', icon: Home },
        { label: 'Leads' },
      ];
      const { container } = render(<PageHeader title="Leads" breadcrumbs={breadcrumbsWithIcons} />);
      const nav = container.querySelector('nav');
      expect(nav?.querySelectorAll('svg').length).toBeGreaterThan(0);
    });

    it('does not render breadcrumbs when empty', () => {
      render(<PageHeader title="Leads" breadcrumbs={[]} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('Stats', () => {
    const stats = [
      { id: 'total', label: 'Total', value: 1234 },
      { id: 'new', label: 'Novos', value: 45, color: 'primary' as const },
    ];

    it('renders stats widget when stats provided', () => {
      render(<PageHeader title="Leads" stats={stats} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('1.234')).toBeInTheDocument();
      expect(screen.getByText('Novos')).toBeInTheDocument();
    });

    it('does not render stats widget when stats is empty', () => {
      render(<PageHeader title="Leads" stats={[]} />);
      expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders actions when provided', () => {
      render(
        <PageHeader 
          title="Leads" 
          actions={
            <>
              <Button variant="outline">Importar</Button>
              <Button>Novo Lead</Button>
            </>
          }
        />
      );
      expect(screen.getByText('Importar')).toBeInTheDocument();
      expect(screen.getByText('Novo Lead')).toBeInTheDocument();
    });
  });

  describe('Full example', () => {
    it('renders complete page header', () => {
      const breadcrumbs = [
        { label: 'Dashboard', href: '/dashboard', icon: Home },
        { label: 'CRM', href: '/crm', icon: Building2 },
        { label: 'Leads' },
      ];

      const stats = [
        { id: 'total', label: 'Total', value: 1234 },
        { id: 'new', label: 'Novos', value: 45, color: 'primary' as const },
      ];

      render(
        <PageHeader 
          title="Leads"
          subtitle="Gerencie sua base de leads qualificados"
          icon={Users}
          breadcrumbs={breadcrumbs}
          stats={stats}
          actions={<Button>Novo Lead</Button>}
        />
      );

      // Title and subtitle
      expect(screen.getByRole('heading', { name: 'Leads' })).toBeInTheDocument();
      expect(screen.getByText('Gerencie sua base de leads qualificados')).toBeInTheDocument();

      // Breadcrumbs
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();

      // Stats
      expect(screen.getByText('Total')).toBeInTheDocument();

      // Actions
      expect(screen.getByText('Novo Lead')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<PageHeader title="Leads" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Leads');
    });

    it('has breadcrumb navigation with aria-label', () => {
      const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Leads' }];
      render(<PageHeader title="Leads" breadcrumbs={breadcrumbs} />);
      expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    });
  });
});
