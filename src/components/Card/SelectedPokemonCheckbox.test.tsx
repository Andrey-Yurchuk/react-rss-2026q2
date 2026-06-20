import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { render, screen } from '../../test-utils/render';
import { SelectedPokemonCheckbox } from './SelectedPokemonCheckbox';

const pikachu = {
  id: 25,
  name: 'pikachu',
  description: 'Types: electric. Height: 4, weight: 60.',
};

beforeEach(() => {
  useSelectedItemsStore.setState({ selectedItems: [] });
});

describe('SelectedPokemonCheckbox', () => {
  it('renders an accessible checkbox label for the pokemon', () => {
    render(<SelectedPokemonCheckbox item={pikachu} />);

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).not.toBeChecked();
  });

  it('reflects checked state from the Zustand store', () => {
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

    render(<SelectedPokemonCheckbox item={pikachu} />);

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });

  it('toggles selection in the Zustand store', async () => {
    const user = userEvent.setup();

    render(<SelectedPokemonCheckbox item={pikachu} />);

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(useSelectedItemsStore.getState().selectedItems).toHaveLength(1);
    expect(useSelectedItemsStore.getState().selectedItems[0]?.id).toBe(25);
  });
});
