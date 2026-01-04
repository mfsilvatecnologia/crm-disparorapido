/**
 * ViewSwitcher Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewSwitcher, ViewMode } from '../ViewSwitcher';

describe('ViewSwitcher', () => {
  const views: ViewMode[] = ['list', 'kanban', 'cards'];

  describe('Rendering', () => {
    it('renders all specified view options', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
        />
      );
      // Should have 3 buttons
      const buttons = screen.getAllByRole('tab');
      expect(buttons).toHaveLength(3);
    });

    it('renders nothing when views array is empty', () => {
      const { container } = render(
        <ViewSwitcher 
          views={[]} 
          activeView="list" 
          onViewChange={vi.fn()} 
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders with labels when showLabels is true', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
          showLabels 
        />
      );
      expect(screen.getByText('Lista')).toBeInTheDocument();
      expect(screen.getByText('Kanban')).toBeInTheDocument();
      expect(screen.getByText('Cards')).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    it('marks active view as selected', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="kanban" 
          onViewChange={vi.fn()} 
        />
      );
      const buttons = screen.getAllByRole('tab');
      // Find the kanban button (second one)
      const kanbanButton = buttons[1];
      expect(kanbanButton).toHaveAttribute('aria-selected', 'true');
    });

    it('marks inactive views as not selected', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
        />
      );
      const buttons = screen.getAllByRole('tab');
      // Kanban and cards should not be selected
      expect(buttons[1]).toHaveAttribute('aria-selected', 'false');
      expect(buttons[2]).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Interaction', () => {
    it('calls onViewChange when clicking a view', () => {
      const onChange = vi.fn();
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={onChange} 
        />
      );
      
      const buttons = screen.getAllByRole('tab');
      fireEvent.click(buttons[1]); // Click kanban
      expect(onChange).toHaveBeenCalledWith('kanban');
    });

    it('calls onViewChange with correct view id', () => {
      const onChange = vi.fn();
      render(
        <ViewSwitcher 
          views={['list', 'calendar', 'timeline']} 
          activeView="list" 
          onViewChange={onChange} 
        />
      );
      
      const buttons = screen.getAllByRole('tab');
      fireEvent.click(buttons[2]); // Click timeline
      expect(onChange).toHaveBeenCalledWith('timeline');
    });
  });

  describe('View configurations', () => {
    it('renders calendar view correctly', () => {
      render(
        <ViewSwitcher 
          views={['calendar']} 
          activeView="calendar" 
          onViewChange={vi.fn()} 
          showLabels
        />
      );
      expect(screen.getByText('Calendário')).toBeInTheDocument();
    });

    it('renders timeline view correctly', () => {
      render(
        <ViewSwitcher 
          views={['timeline']} 
          activeView="timeline" 
          onViewChange={vi.fn()} 
          showLabels
        />
      );
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has correct role="tablist"', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
        />
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has aria-label for each view button', () => {
      render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
        />
      );
      const buttons = screen.getAllByRole('tab');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Sizes', () => {
    it('applies small size class', () => {
      const { container } = render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
          size="sm"
        />
      );
      // Should have smaller icon sizes
      const icons = container.querySelectorAll('svg');
      expect(icons[0]).toHaveClass('h-4', 'w-4');
    });

    it('applies medium size class (default)', () => {
      const { container } = render(
        <ViewSwitcher 
          views={views} 
          activeView="list" 
          onViewChange={vi.fn()} 
          size="md"
        />
      );
      const icons = container.querySelectorAll('svg');
      expect(icons[0]).toHaveClass('h-5', 'w-5');
    });
  });
});
