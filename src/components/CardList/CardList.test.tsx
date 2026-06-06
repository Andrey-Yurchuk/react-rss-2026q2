import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { CardList } from './CardList';

const pikachu = {
  id: 25,
  name: 'pikachu',
  description: 'Types: electric. Height: 4, weight: 60.',
};

const bulbasaur = {
  id: 1,
  name: 'bulbasaur',
  description: 'Types: grass, poison. Height: 7, weight: 69.',
};

describe('CardList', () => {
  it('renders all cards when items are provided', () => {
    render(<CardList items={[pikachu, bulbasaur]} />);

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(screen.queryByText('No results to show.')).not.toBeInTheDocument();
  });

  it('shows empty state when items are empty', () => {
    render(<CardList items={[]} />);

    expect(screen.getByText('No results to show.')).toBeInTheDocument();
  });

  it('passes checked selection state to the matching card', () => {
    render(
      <CardList
        items={[pikachu, bulbasaur]}
        selectedIds={new Set([25])}
        onSelectionToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    ).not.toBeChecked();
  });

  it('invokes onSelectionToggle with the item whose checkbox was toggled', async () => {
    const user = userEvent.setup();
    const onSelectionToggle = vi.fn();

    render(
      <CardList
        items={[pikachu, bulbasaur]}
        onSelectionToggle={onSelectionToggle}
      />
    );

    await user.click(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    );

    expect(onSelectionToggle).toHaveBeenCalledTimes(1);
    expect(onSelectionToggle).toHaveBeenCalledWith(bulbasaur);
  });
});
