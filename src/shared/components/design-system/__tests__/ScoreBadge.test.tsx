/**
 * ScoreBadge Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBadge } from '../ScoreBadge';

describe('ScoreBadge', () => {
  describe('Score value display', () => {
    it('displays the score value by default', () => {
      render(<ScoreBadge score={85} />);
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('rounds score to nearest integer', () => {
      render(<ScoreBadge score={85.6} />);
      expect(screen.getByText('86')).toBeInTheDocument();
    });

    it('clamps score to max 100', () => {
      render(<ScoreBadge score={120} />);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('clamps score to min 0', () => {
      render(<ScoreBadge score={-10} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Score ranges and colors', () => {
    it('uses red color for low scores (0-50)', () => {
      render(<ScoreBadge score={45} />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('text-red-500');
    });

    it('uses amber color for medium scores (51-70)', () => {
      render(<ScoreBadge score={65} />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('text-amber-500');
    });

    it('uses blue color for high scores (71-89)', () => {
      render(<ScoreBadge score={85} />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('text-blue-500');
    });

    it('uses green color for excellent scores (90-100)', () => {
      render(<ScoreBadge score={95} />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('text-green-500');
    });
  });

  describe('Label display', () => {
    it('does not show label by default', () => {
      render(<ScoreBadge score={85} />);
      expect(screen.queryByText('Alto')).not.toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
      render(<ScoreBadge score={85} showLabel />);
      expect(screen.getByText('Alto')).toBeInTheDocument();
    });

    it('shows correct labels for each range', () => {
      const { rerender } = render(<ScoreBadge score={45} showLabel />);
      expect(screen.getByText('Baixo')).toBeInTheDocument();

      rerender(<ScoreBadge score={65} showLabel />);
      expect(screen.getByText('Médio')).toBeInTheDocument();

      rerender(<ScoreBadge score={85} showLabel />);
      expect(screen.getByText('Alto')).toBeInTheDocument();

      rerender(<ScoreBadge score={95} showLabel />);
      expect(screen.getByText('Excelente')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<ScoreBadge score={85} size="sm" />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('w-8', 'h-8');
    });

    it('renders medium size (default)', () => {
      render(<ScoreBadge score={85} size="md" />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('w-10', 'h-10');
    });

    it('renders large size', () => {
      render(<ScoreBadge score={85} size="lg" />);
      const badge = screen.getByRole('img', { name: /score/i });
      expect(badge).toHaveClass('w-12', 'h-12');
    });
  });

  describe('showValue prop', () => {
    it('hides value when showValue is false', () => {
      render(<ScoreBadge score={85} showValue={false} showLabel />);
      expect(screen.queryByText('85')).not.toBeInTheDocument();
      expect(screen.getByText('Alto')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label for score value', () => {
      render(<ScoreBadge score={85} />);
      const badge = screen.getByRole('img', { name: 'Score: 85' });
      expect(badge).toBeInTheDocument();
    });
  });
});
