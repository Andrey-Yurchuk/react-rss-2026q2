import { create } from 'zustand';
import { POKEAPI_POKEMON_URL } from '../constants';
import type { PokemonCardModel } from '../services/pokemonApi';

export type SelectedPokemonItem = {
  id: number;
  name: string;
  description: string;
  detailsUrl: string;
};

type SelectedItemsState = {
  selectedItems: SelectedPokemonItem[];
  toggleSelectedItem: (item: PokemonCardModel) => void;
  clearSelectedItems: () => void;
  isItemSelected: (id: number) => boolean;
};

export function buildPokemonDetailsUrl(id: number): string {
  return `${POKEAPI_POKEMON_URL}/${id}`;
}

export const useSelectedItemsStore = create<SelectedItemsState>()(
  (set, get) => ({
    selectedItems: [],
    toggleSelectedItem: (item) =>
      set((state) => {
        const alreadySelected = state.selectedItems.some(
          (existing) => existing.id === item.id
        );
        if (alreadySelected) {
          return {
            selectedItems: state.selectedItems.filter(
              (existing) => existing.id !== item.id
            ),
          };
        }
        const nextItem: SelectedPokemonItem = {
          id: item.id,
          name: item.name,
          description: item.description,
          detailsUrl: buildPokemonDetailsUrl(item.id),
        };
        return { selectedItems: [...state.selectedItems, nextItem] };
      }),
    clearSelectedItems: () => set({ selectedItems: [] }),
    isItemSelected: (id) =>
      get().selectedItems.some((existing) => existing.id === id),
  })
);

export function selectSelectedItems(
  state: SelectedItemsState
): SelectedPokemonItem[] {
  return state.selectedItems;
}

export function selectIsItemSelected(
  id: number
): (state: SelectedItemsState) => boolean {
  return (state) => state.selectedItems.some((existing) => existing.id === id);
}

export function selectSelectedItemsCount(state: SelectedItemsState): number {
  return state.selectedItems.length;
}
