'use client';

import { useTranslations } from 'next-intl';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';

type SelectedPokemonCheckboxProps = {
  item: PokemonCardModel;
};

export function SelectedPokemonCheckbox({ item }: SelectedPokemonCheckboxProps) {
  const t = useTranslations('Card');
  const selectionChecked = useSelectedItemsStore((state) =>
    state.selectedItems.some((selectedItem) => selectedItem.id === item.id)
  );
  const toggleSelectedItem = useSelectedItemsStore(
    (state) => state.toggleSelectedItem
  );

  const handleCheckboxClick = (event: MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  const handleCheckboxKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    toggleSelectedItem(item);
  };

  const handleLabelClick = (event: MouseEvent<HTMLLabelElement>) => {
    event.stopPropagation();
  };

  return (
    <label className="card__selection" onClick={handleLabelClick}>
      <input
        type="checkbox"
        className="card__selection-checkbox"
        checked={selectionChecked}
        onChange={handleCheckboxChange}
        onClick={handleCheckboxClick}
        onKeyDown={handleCheckboxKeyDown}
      />
      <span className="card__selection-label">
        {t('select', { name: item.name })}
      </span>
    </label>
  );
}
