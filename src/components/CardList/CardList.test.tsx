import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { render, screen } from '../../test-utils/render';
import { CardListClient } from './CardListClient';

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

const defaultListProps = {
  page: 1,
  query: '',
  detailsId: null,
};

beforeEach(() => {
  useSelectedItemsStore.setState({ selectedItems: [] });
});

describe('CardListClient', () => {
  it('renders all cards when items are provided', () => {
    render(
      <CardListClient items={[pikachu, bulbasaur]} {...defaultListProps} />
    );

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(screen.queryByText('No results to show.')).not.toBeInTheDocument();
  });

  it('shows empty state when items are empty', () => {
    render(<CardListClient items={[]} {...defaultListProps} />);

    expect(screen.getByText('No results to show.')).toBeInTheDocument();
  });

  it('passes checked selection state to the matching card', () => {
    useSelectedItemsStore.setState({
      selectedItems: [
        {
          id: 25,
          name: 'pikachu',
          description: pikachu.description,
          detailsUrl: 'https://pokeapi.co/api/v2/pokemon/25',
        },
      ],
    });

    render(
      <CardListClient items={[pikachu, bulbasaur]} {...defaultListProps} />
    );

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    ).not.toBeChecked();
  });

  it('invokes Zustand selection when a checkbox is toggled', async () => {
    const user = userEvent.setup();

    render(
      <CardListClient items={[pikachu, bulbasaur]} {...defaultListProps} />
    );

    await user.click(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    );

    expect(useSelectedItemsStore.getState().selectedItems.map((item) => item.id)).toEqual([
      1,
    ]);
  });
});
