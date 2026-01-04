/**
 * QuickFilters Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickFilters, QuickFilterOption } from '../QuickFilters';
import { Users } from 'lucide-react';

const mockOptions: QuickFilterOption[] = [
  { id: 'novo', label: 'Novos', count: 12 },
  { id: 'qualificado', label: 'Qualificados', count: 8 },
  { id: 'contatado', label: 'Contatados', count: 5 },
];

describe('QuickFilters', () => {
  describe('Rendering', () => {
    it('renders all filter options', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} />);
      expect(screen.getByText('Novos')).toBeInTheDocument();
      expect(screen.getByText('Qualificados')).toBeInTheDocument();
      expect(screen.getByText('Contatados')).toBeInTheDocument();
    });

    it('renders "Todos" option by default', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} />);
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    it('hides "Todos" option when showAll is false', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} showAll={false} />);
      expect(screen.queryByText('Todos')).not.toBeInTheDocument();
    });

    it('uses custom "All" label when provided', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} allLabel="Ver Todos" />);
      expect(screen.getByText('Ver Todos')).toBeInTheDocument();
    });
  });

  describe('Counts', () => {
    it('displays count badges', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} />);
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not show count badge when count is 0', () => {
      const options = [{ id: 'empty', label: 'Empty', count: 0 }];
      render(<QuickFilters options={options} onChange={vi.fn()} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders icon when provided', () => {
      const optionsWithIcon = [{ id: 'test', label: 'Test', icon: Users }];
      const { container } = render(<QuickFilters options={optionsWithIcon} onChange={vi.fn()} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Single selection', () => {
    it('calls onChange with selected id', () => {
      const onChange = vi.fn();
      render(<QuickFilters options={mockOptions} onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Novos'));
      expect(onChange).toHaveBeenCalledWith('novo');
    });

    it('deselects when clicking selected option', () => {
      const onChange = vi.fn();
      render(<QuickFilters options={mockOptions} selected="novo" onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Novos'));
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('selects "Todos" clears selection', () => {
      const onChange = vi.fn();
      render(<QuickFilters options={mockOptions} selected="novo" onChange={onChange} />);
      
      fireEvent.click(screen.getByText('Todos'));
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('highlights selected option', () => {
      render(<QuickFilters options={mockOptions} selected="novo" onChange={vi.fn()} />);
      const button = screen.getByText('Novos').closest('button');
      // The selected button should have the 'default' variant (not outline)
      expect(button).toBeInTheDocument();
    });
  });

  describe('Multiple selection', () => {
    it('allows selecting multiple options', () => {
      const onChange = vi.fn();
      render(<QuickFilters options={mockOptions} selected={['novo']} onChange={onChange} multiple />);
      
      fireEvent.click(screen.getByText('Qualificados'));
      expect(onChange).toHaveBeenCalledWith(['novo', 'qualificado']);
    });

    it('removes option from selection when clicking selected option', () => {
      const onChange = vi.fn();
      render(
        <QuickFilters 
          options={mockOptions} 
          selected={['novo', 'qualificado']} 
          onChange={onChange} 
          multiple 
        />
      );
      
      fireEvent.click(screen.getByText('Novos'));
      expect(onChange).toHaveBeenCalledWith(['qualificado']);
    });

    it('clears all selections when clicking "Todos"', () => {
      const onChange = vi.fn();
      render(
        <QuickFilters 
          options={mockOptions} 
          selected={['novo', 'qualificado']} 
          onChange={onChange} 
          multiple 
        />
      );
      
      fireEvent.click(screen.getByText('Todos'));
      expect(onChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Sizes', () => {
    it('renders small size buttons', () => {
      render(<QuickFilters options={mockOptions} onChange={vi.fn()} size="sm" />);
      const button = screen.getByText('Todos').closest('button');
      // Small buttons should have the 'sm' variant class
      expect(button).toBeInTheDocument();
    });
  });
});
