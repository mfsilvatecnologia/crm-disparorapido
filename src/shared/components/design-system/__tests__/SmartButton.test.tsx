/**
 * SmartButton Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartButton } from '../SmartButton';
import { FileText, Target } from 'lucide-react';

describe('SmartButton', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      render(<SmartButton label="Contratos" />);
      expect(screen.getByText('Contratos')).toBeInTheDocument();
    });

    it('renders with icon', () => {
      const { container } = render(<SmartButton label="Contratos" icon={FileText} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders with count badge', () => {
      render(<SmartButton label="Contratos" count={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows count 0 when count is 0', () => {
      render(<SmartButton label="Contratos" count={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('does not show count badge when count is undefined', () => {
      render(<SmartButton label="Contratos" />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<SmartButton label="Contratos" onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });

    it('navigates to href when provided', () => {
      // Mock window.location
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      render(<SmartButton label="Contratos" href="/contracts" />);
      fireEvent.click(screen.getByRole('button'));
      
      expect(window.location.href).toBe('/contracts');

      // Restore
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });
  });

  describe('Loading state', () => {
    it('shows loader when loading', () => {
      const { container } = render(<SmartButton label="Contratos" loading />);
      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<SmartButton label="Contratos" loading />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('hides icon when loading', () => {
      const { container } = render(<SmartButton label="Contratos" icon={FileText} loading />);
      // Only the loader icon should be visible, not the FileText icon
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(1); // Only loader
    });
  });

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<SmartButton label="Contratos" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<SmartButton label="Contratos" onClick={onClick} disabled />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      render(<SmartButton label="Contratos" variant="primary" />);
      const button = screen.getByRole('button');
      // Primary variant uses 'default' button style
      expect(button).toBeInTheDocument();
    });

    it('renders secondary variant (default)', () => {
      render(<SmartButton label="Contratos" variant="secondary" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('renders ghost variant', () => {
      render(<SmartButton label="Contratos" variant="ghost" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      render(<SmartButton label="Contratos" size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('renders medium size (default)', () => {
      render(<SmartButton label="Contratos" size="md" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });
  });

  describe('Full example', () => {
    it('renders complete smart button', () => {
      const onClick = vi.fn();
      render(
        <SmartButton 
          label="Oportunidades" 
          count={3} 
          icon={Target} 
          onClick={onClick}
        />
      );

      expect(screen.getByText('Oportunidades')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });
  });
});
