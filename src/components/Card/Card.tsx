import { useTranslations } from 'next-intl';
import type {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
} from 'react';
import type { PokemonCardModel } from '../../services/pokemonApi';

type CardProps = {
  item: PokemonCardModel;
  selected?: boolean;
  selectionChecked?: boolean;
  onSelect?: (id: number) => void;
  onSelectionToggle?: (item: PokemonCardModel) => void;
};

export function Card({
  item,
  selected = false,
  selectionChecked = false,
  onSelect,
  onSelectionToggle,
}: CardProps) {
  const t = useTranslations('Card');

  const openDetails = () => {
    onSelect?.(item.id);
  };

  const handleArticleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    openDetails();
  };

  const handleArticleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    openDetails();
  };

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
    onSelectionToggle?.(item);
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
      onClick={onSelect ? handleArticleClick : undefined}
      onKeyDown={onSelect ? handleArticleKeyDown : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? t('viewDetailsFor', { name: item.name }) : undefined}
    >
      {onSelectionToggle ? (
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
      ) : null}
      <h3 className="card__name">{item.name}</h3>
      <p className="card__description">{item.description}</p>
      {onSelect ? (
        <span className="card__button" aria-hidden="true">
          {t('viewDetails')}
        </span>
      ) : null}
    </article>
  );
}
