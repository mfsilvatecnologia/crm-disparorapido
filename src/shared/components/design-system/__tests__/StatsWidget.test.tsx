/**
 * StatsWidget Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsWidget, StatItem } from '../StatsWidget';
import { Users } from 'lucide-react';

const mockStats: StatItem[] = [
  { id: 'total', label: 'Total Leads', value: 1234 },
  { id: 'converted', label: 'Convertidos', value: 89, change: 12, changeDirection: 'up' },
  { id: 'mrr', label: 'MRR', value: 45000, format: 'currency', color: 'success' },
];

describe('StatsWidget', () => {
  describe('Rendering', () => {
    it('renders all stats', () => {
      render(<StatsWidget stats={mockStats} />);
      expect(screen.getByText('Total Leads')).toBeInTheDocument();
      expect(screen.getByText('Convertidos')).toBeInTheDocument();
      expect(screen.getByText('MRR')).toBeInTheDocument();
    });

    it('renders nothing when stats array is empty', () => {
      const { container } = render(<StatsWidget stats={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Value formatting', () => {
    it('formats number values with locale', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 1234 }]} />);
      expect(screen.getByText('1.234')).toBeInTheDocument();
    });

    it('formats currency values', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 45000, format: 'currency' }]} />);
      // Should format as R$ 45.000
      expect(screen.getByText(/R\$.*45/)).toBeInTheDocument();
    });

    it('formats percentage values', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 75, format: 'percentage' }]} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('displays string values as-is', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 'Custom' }]} />);
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('Change indicator', () => {
    it('shows change percentage when provided', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 100, change: 12, changeDirection: 'up' }]} />);
      expect(screen.getByText('12%')).toBeInTheDocument();
    });

    it('shows up arrow for positive change', () => {
      const { container } = render(
        <StatsWidget stats={[{ id: 'test', label: 'Test', value: 100, change: 12, changeDirection: 'up' }]} />
      );
      // The ArrowUp icon should be present
      const arrowUp = container.querySelector('svg');
      expect(arrowUp).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('shows icon when provided', () => {
      const { container } = render(
        <StatsWidget stats={[{ id: 'test', label: 'Test', value: 100, icon: Users }]} />
      );
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Colors', () => {
    it('applies color class based on color prop', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 100, color: 'success' }]} />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('text-green-600');
    });
  });

  describe('Layout', () => {
    it('renders horizontal layout by default', () => {
      const { container } = render(<StatsWidget stats={mockStats} />);
      const widget = container.firstChild;
      expect(widget).toHaveClass('flex');
    });

    it('renders vertical layout when specified', () => {
      const { container } = render(<StatsWidget stats={mockStats} layout="vertical" />);
      const widget = container.firstChild;
      expect(widget).toHaveClass('flex-col');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 100 }]} size="sm" />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('text-lg');
    });

    it('applies medium size classes (default)', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 100 }]} size="md" />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('text-2xl');
    });

    it('applies large size classes', () => {
      render(<StatsWidget stats={[{ id: 'test', label: 'Test', value: 100 }]} size="lg" />);
      const value = screen.getByText('100');
      expect(value).toHaveClass('text-3xl');
    });
  });

  describe('Progress bar', () => {
    it('shows progress bar when progress is provided', () => {
      const { container } = render(
        <StatsWidget stats={[{ id: 'test', label: 'Test', value: 100, progress: 75 }]} />
      );
      // Progress component uses role="progressbar"
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
