import { beforeEach, describe, expect, it } from 'vitest';
import { POKEAPI_POKEMON_URL } from '../constants';
import type { PokemonCardModel } from '../services/pokemonApi';
import {
  buildPokemonDetailsUrl,
  selectIsItemSelected,
  selectSelectedItems,
  selectSelectedItemsCount,
  useSelectedItemsStore,
} from './selectedItemsStore';

const pikachu: PokemonCardModel = {
  id: 25,
  name: 'pikachu',
  description: 'Types: electric. Height: 4, weight: 60.',
};

const bulbasaur: PokemonCardModel = {
  id: 1,
  name: 'bulbasaur',
  description: 'Types: grass, poison. Height: 7, weight: 69.',
};

describe('selectedItemsStore', () => {
  beforeEach(() => {
    useSelectedItemsStore.setState({ selectedItems: [] });
  });

  it('adds a Pokemon via toggle with fields needed for CSV', () => {
    useSelectedItemsStore.getState().toggleSelectedItem(pikachu);

    expect(selectSelectedItems(useSelectedItemsStore.getState())).toEqual([
      {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
        detailsUrl: `${POKEAPI_POKEMON_URL}/25`,
      },
    ]);
  });

  it('removes a previously selected Pokemon on second toggle', () => {
    const store = useSelectedItemsStore.getState();

    store.toggleSelectedItem(pikachu);
    store.toggleSelectedItem(pikachu);

    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
  });

  it('keeps multiple selected Pokemon in insertion order', () => {
    const store = useSelectedItemsStore.getState();

    store.toggleSelectedItem(pikachu);
    store.toggleSelectedItem(bulbasaur);

    expect(
      useSelectedItemsStore.getState().selectedItems.map((item) => item.id)
    ).toEqual([25, 1]);
  });

  it('clearSelectedItems empties the selection', () => {
    const store = useSelectedItemsStore.getState();

    store.toggleSelectedItem(pikachu);
    store.toggleSelectedItem(bulbasaur);
    store.clearSelectedItems();

    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
  });

  it('isItemSelected returns true only for currently selected ids', () => {
    const store = useSelectedItemsStore.getState();
    store.toggleSelectedItem(pikachu);

    expect(useSelectedItemsStore.getState().isItemSelected(25)).toBe(true);
    expect(useSelectedItemsStore.getState().isItemSelected(1)).toBe(false);
  });

  it('selectIsItemSelected derives boolean from state', () => {
    useSelectedItemsStore.getState().toggleSelectedItem(pikachu);
    const state = useSelectedItemsStore.getState();

    expect(selectIsItemSelected(25)(state)).toBe(true);
    expect(selectIsItemSelected(1)(state)).toBe(false);
  });

  it('selectSelectedItemsCount tracks number of selected items', () => {
    const store = useSelectedItemsStore.getState();
    expect(selectSelectedItemsCount(useSelectedItemsStore.getState())).toBe(0);

    store.toggleSelectedItem(pikachu);
    store.toggleSelectedItem(bulbasaur);

    expect(selectSelectedItemsCount(useSelectedItemsStore.getState())).toBe(2);
  });

  it('buildPokemonDetailsUrl composes a PokeAPI details URL by id', () => {
    expect(buildPokemonDetailsUrl(25)).toBe(`${POKEAPI_POKEMON_URL}/25`);
  });

  it('returns a new array reference on toggle, leaving prior snapshot intact', () => {
    const store = useSelectedItemsStore.getState();

    store.toggleSelectedItem(pikachu);
    const before = useSelectedItemsStore.getState().selectedItems;

    store.toggleSelectedItem(bulbasaur);
    const after = useSelectedItemsStore.getState().selectedItems;

    expect(after).not.toBe(before);
    expect(before).toEqual([
      {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
        detailsUrl: `${POKEAPI_POKEMON_URL}/25`,
      },
    ]);
  });
});
