import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { getNavigationSnapshot } from '../../hooks/navigationStore.ts';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { render, screen } from '../../test-utils/render';
import { resetMockNavigation } from '../../test-utils/navigationStore.ts';
import { PokemonCardClient } from './PokemonCardClient';

const pikachu = {
  id: 25,
  name: 'pikachu',
  description: 'Types: electric. Height: 4, weight: 60.',
};

const defaultCardProps = {
  page: 1,
  query: '',
  detailsId: null,
};

beforeEach(() => {
  useSelectedItemsStore.setState({ selectedItems: [] });
  resetMockNavigation('/?page=1');
});

describe('PokemonCardClient', () => {
  it('renders pokemon name and description', () => {
    render(<PokemonCardClient item={pikachu} {...defaultCardProps} />);

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByText('Types: electric. Height: 4, weight: 60.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeInTheDocument();
  });

  it('navigates to details when the card link is clicked', async () => {
    const user = userEvent.setup();

    render(<PokemonCardClient item={pikachu} {...defaultCardProps} />);

    await user.click(
      screen.getByRole('link', { name: /view details/i })
    );

    expect(getNavigationSnapshot().searchParams.toString()).toBe(
      'page=1&details=25'
    );
  });

  it('reflects selected details state in aria-current', () => {
    render(
      <PokemonCardClient item={pikachu} {...defaultCardProps} detailsId={25} />
    );

    expect(screen.getByRole('heading', { name: 'pikachu' }).closest('article')).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('reflects selectionChecked in the checkbox state', () => {
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

    render(<PokemonCardClient item={pikachu} {...defaultCardProps} />);

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });

  it('toggles Zustand selection when the checkbox is toggled', async () => {
    const user = userEvent.setup();

    render(<PokemonCardClient item={pikachu} {...defaultCardProps} />);

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(useSelectedItemsStore.getState().selectedItems).toHaveLength(1);
    expect(getNavigationSnapshot().searchParams.toString()).toBe('page=1');
  });
});
