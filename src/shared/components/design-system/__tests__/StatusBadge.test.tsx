/**
 * StatusBadge Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  describe('Lead status', () => {
    it('renders lead status "novo" correctly', () => {
      render(<StatusBadge type="lead" status="novo" />);
      expect(screen.getByText('Novo')).toBeInTheDocument();
    });

    it('renders lead status "qualificado" correctly', () => {
      render(<StatusBadge type="lead" status="qualificado" />);
      expect(screen.getByText('Qualificado')).toBeInTheDocument();
    });

    it('renders lead status "contatado" correctly', () => {
      render(<StatusBadge type="lead" status="contatado" />);
      expect(screen.getByText('Contatado')).toBeInTheDocument();
    });

    it('renders lead status "convertido" correctly', () => {
      render(<StatusBadge type="lead" status="convertido" />);
      expect(screen.getByText('Convertido')).toBeInTheDocument();
    });

    it('renders lead status "descartado" correctly', () => {
      render(<StatusBadge type="lead" status="descartado" />);
      expect(screen.getByText('Descartado')).toBeInTheDocument();
    });
  });

  describe('Opportunity status', () => {
    it('renders opportunity status correctly', () => {
      render(<StatusBadge type="opportunity" status="proposta" />);
      expect(screen.getByText('Proposta')).toBeInTheDocument();
    });

    it('renders opportunity "fechado_ganho" correctly', () => {
      render(<StatusBadge type="opportunity" status="fechado_ganho" />);
      expect(screen.getByText('Fechado (Ganho)')).toBeInTheDocument();
    });
  });

  describe('Campaign status', () => {
    it('renders campaign status correctly', () => {
      render(<StatusBadge type="campaign" status="ativa" />);
      expect(screen.getByText('Ativa')).toBeInTheDocument();
    });
  });

  describe('Contract status', () => {
    it('renders contract status correctly', () => {
      render(<StatusBadge type="contract" status="ativo" />);
      expect(screen.getByText('Ativo')).toBeInTheDocument();
    });
  });

  describe('Customer status', () => {
    it('renders customer status correctly', () => {
      render(<StatusBadge type="customer" status="ativo" />);
      expect(screen.getByText('Ativo')).toBeInTheDocument();
    });

    it('renders customer "churned" status correctly', () => {
      render(<StatusBadge type="customer" status="churned" />);
      expect(screen.getByText('Churned')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders solid variant', () => {
      render(<StatusBadge type="lead" status="novo" variant="solid" />);
      const badge = screen.getByText('Novo').closest('span');
      expect(badge).toHaveClass('bg-primary-100');
    });

    it('renders outline variant', () => {
      render(<StatusBadge type="lead" status="novo" variant="outline" />);
      const badge = screen.getByText('Novo').closest('span');
      expect(badge).toHaveClass('border');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<StatusBadge type="lead" status="novo" size="sm" />);
      const badge = screen.getByText('Novo').closest('span');
      expect(badge).toHaveClass('text-xs');
    });

    it('renders medium size', () => {
      render(<StatusBadge type="lead" status="novo" size="md" />);
      const badge = screen.getByText('Novo').closest('span');
      expect(badge).toHaveClass('text-sm');
    });

    it('renders large size', () => {
      render(<StatusBadge type="lead" status="novo" size="lg" />);
      const badge = screen.getByText('Novo').closest('span');
      expect(badge).toHaveClass('text-base');
    });
  });

  describe('Icon', () => {
    it('shows icon by default', () => {
      render(<StatusBadge type="lead" status="novo" />);
      const badge = screen.getByText('Novo').closest('span');
      const svg = badge?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
      render(<StatusBadge type="lead" status="novo" showIcon={false} />);
      const badge = screen.getByText('Novo').closest('span');
      const svg = badge?.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });
  });
});
