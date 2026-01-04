/**
 * RelativeTime Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelativeTime } from '../RelativeTime';

describe('RelativeTime', () => {
  beforeEach(() => {
    // Mock the current date
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Date parsing', () => {
    it('handles ISO string dates', () => {
      render(<RelativeTime date="2024-01-15T11:00:00Z" showTooltip={false} />);
      expect(screen.getByText(/há/)).toBeInTheDocument();
    });

    it('handles Date objects', () => {
      const date = new Date('2024-01-15T11:00:00Z');
      render(<RelativeTime date={date} showTooltip={false} />);
      expect(screen.getByText(/há/)).toBeInTheDocument();
    });

    it('shows "Data inválida" for invalid dates', () => {
      render(<RelativeTime date="invalid-date" showTooltip={false} />);
      expect(screen.getByText('Data inválida')).toBeInTheDocument();
    });
  });

  describe('Relative time formatting', () => {
    it('shows "há 1 hora" for a date 1 hour ago', () => {
      const oneHourAgo = new Date('2024-01-15T11:00:00Z');
      render(<RelativeTime date={oneHourAgo} showTooltip={false} />);
      expect(screen.getByText(/há.*hora/i)).toBeInTheDocument();
    });

    it('shows "há 2 dias" for a date 2 days ago', () => {
      const twoDaysAgo = new Date('2024-01-13T12:00:00Z');
      render(<RelativeTime date={twoDaysAgo} showTooltip={false} />);
      expect(screen.getByText(/há.*2.*dias/i)).toBeInTheDocument();
    });
  });

  describe('Prefix', () => {
    it('shows prefix when provided', () => {
      render(
        <RelativeTime 
          date="2024-01-15T11:00:00Z" 
          prefix="Atualizado" 
          showTooltip={false}
        />
      );
      expect(screen.getByText(/Atualizado.*há/)).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders with tooltip by default', () => {
      render(<RelativeTime date="2024-01-15T11:00:00Z" />);
      const element = screen.getByText(/há/);
      expect(element).toHaveAttribute('tabIndex', '0');
    });

    it('does not add tabIndex when tooltip is disabled', () => {
      render(<RelativeTime date="2024-01-15T11:00:00Z" showTooltip={false} />);
      const element = screen.getByText(/há/);
      expect(element).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(
        <RelativeTime 
          date="2024-01-15T11:00:00Z" 
          className="custom-class"
          showTooltip={false}
        />
      );
      const element = screen.getByText(/há/);
      expect(element).toHaveClass('custom-class');
    });
  });
});
