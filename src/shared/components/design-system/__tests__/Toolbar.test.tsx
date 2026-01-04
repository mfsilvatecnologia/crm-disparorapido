/**
 * Toolbar Component Tests
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../Toolbar';
import { Button } from '@/shared/components/ui/button';

describe('Toolbar', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <Toolbar>
          <div data-testid="child">Child content</div>
        </Toolbar>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Toolbar className="custom-class">
          <div>Content</div>
        </Toolbar>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Toolbar.Search', () => {
    it('renders search input with placeholder', () => {
      render(
        <Toolbar>
          <Toolbar.Search placeholder="Buscar leads..." />
        </Toolbar>
      );
      expect(screen.getByPlaceholderText('Buscar leads...')).toBeInTheDocument();
    });

    it('calls onChange when typing', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Toolbar>
          <Toolbar.Search value="" onChange={onChange} />
        </Toolbar>
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      
      expect(onChange).toHaveBeenCalled();
    });

    it('shows clear button when has value', () => {
      render(
        <Toolbar>
          <Toolbar.Search value="test" onChange={vi.fn()} />
        </Toolbar>
      );
      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    });

    it('clears value when clicking clear button', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(
        <Toolbar>
          <Toolbar.Search value="test" onChange={onChange} />
        </Toolbar>
      );
      
      await user.click(screen.getByRole('button', { name: /limpar/i }));
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('uses default placeholder when not provided', () => {
      render(
        <Toolbar>
          <Toolbar.Search />
        </Toolbar>
      );
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });
  });

  describe('Toolbar.Filters', () => {
    it('renders filter children', () => {
      render(
        <Toolbar>
          <Toolbar.Filters>
            <button data-testid="filter">Filter</button>
          </Toolbar.Filters>
        </Toolbar>
      );
      expect(screen.getByTestId('filter')).toBeInTheDocument();
    });
  });

  describe('Toolbar.ViewSwitcher', () => {
    it('renders view switcher children', () => {
      render(
        <Toolbar>
          <Toolbar.ViewSwitcher>
            <div data-testid="view-switcher">Views</div>
          </Toolbar.ViewSwitcher>
        </Toolbar>
      );
      expect(screen.getByTestId('view-switcher')).toBeInTheDocument();
    });
  });

  describe('Toolbar.Actions', () => {
    it('renders action children', () => {
      render(
        <Toolbar>
          <Toolbar.Actions>
            <Button>Novo Lead</Button>
          </Toolbar.Actions>
        </Toolbar>
      );
      expect(screen.getByText('Novo Lead')).toBeInTheDocument();
    });

    it('positions actions on the right', () => {
      const { container } = render(
        <Toolbar>
          <Toolbar.Actions>
            <Button>Action</Button>
          </Toolbar.Actions>
        </Toolbar>
      );
      const actionsContainer = container.querySelector('.ml-auto');
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe('Toolbar.Separator', () => {
    it('renders separator', () => {
      const { container } = render(
        <Toolbar>
          <div>Left</div>
          <Toolbar.Separator />
          <div>Right</div>
        </Toolbar>
      );
      const separator = container.querySelector('.bg-border');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Compound pattern', () => {
    it('renders full toolbar with all components', () => {
      render(
        <Toolbar>
          <Toolbar.Search placeholder="Buscar..." />
          <Toolbar.Filters>
            <button>Filter 1</button>
            <button>Filter 2</button>
          </Toolbar.Filters>
          <Toolbar.Separator />
          <Toolbar.ViewSwitcher>
            <button>List</button>
            <button>Grid</button>
          </Toolbar.ViewSwitcher>
          <Toolbar.Actions>
            <Button>New</Button>
          </Toolbar.Actions>
        </Toolbar>
      );

      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
      expect(screen.getByText('Filter 1')).toBeInTheDocument();
      expect(screen.getByText('Filter 2')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });
});
