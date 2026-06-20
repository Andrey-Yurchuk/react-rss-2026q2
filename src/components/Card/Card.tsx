'use client';

import { useTranslations } from 'next-intl';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { Link } from '../../i18n/navigation.ts';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { buildHomeSearchHref } from '../../utils/homeSearchParams.ts';

type CardProps = {
  item: PokemonCardModel;
  page: number;
  query: string;
  detailsId: number | null;
};

export function Card({ item, page, query, detailsId }: CardProps) {
  const t = useTranslations('Card');
  const selected = item.id === detailsId;
  const selectionChecked = useSelectedItemsStore((state) =>
    state.selectedItems.some((selectedItem) => selectedItem.id === item.id)
  );
  const toggleSelectedItem = useSelectedItemsStore(
    (state) => state.toggleSelectedItem
  );
  const detailsHref = buildHomeSearchHref({
    query,
    page,
    detailsId: item.id,
  });

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

  const classNames = ['card'];
  if (selected) {
    classNames.push('card--selected');
  }
  if (selectionChecked) {
    classNames.push('card--selection-checked');
  }

  return (
    <article
      className={classNames.join(' ')}
      aria-current={selected ? 'true' : undefined}
    >
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
      <h3 className="card__name">{item.name}</h3>
      <p className="card__description">{item.description}</p>
      <Link
        href={detailsHref}
        className="card__button"
        aria-label={t('viewDetailsFor', { name: item.name })}
      >
        {t('viewDetails')}
      </Link>
    </article>
  );
}
