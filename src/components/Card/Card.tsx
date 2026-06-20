import { getTranslations } from 'next-intl/server';
import type { PokemonCardModel } from '../../services/pokemonApi';
import { buildHomeSearchHref } from '../../utils/homeSearchParams.ts';
import { CardContent } from './CardContent.tsx';
import { CardSelectionShell } from './CardSelectionShell.tsx';
import { SelectedPokemonCheckbox } from './SelectedPokemonCheckbox.tsx';

export type CardProps = {
  item: PokemonCardModel;
  page: number;
  query: string;
  detailsId: number | null;
};

export async function Card({ item, page, query, detailsId }: CardProps) {
  const t = await getTranslations('Card');
  const detailsSelected = item.id === detailsId;
  const detailsHref = buildHomeSearchHref({
    query,
    page,
    detailsId: item.id,
  });

  return (
    <CardSelectionShell itemId={item.id} detailsSelected={detailsSelected}>
      <SelectedPokemonCheckbox item={item} />
      <CardContent
        item={item}
        detailsHref={detailsHref}
        viewDetailsLabel={t('viewDetails')}
        viewDetailsAriaLabel={t('viewDetailsFor', { name: item.name })}
      />
    </CardSelectionShell>
  );
}
