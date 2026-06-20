'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '../../i18n/navigation.ts';

export function PokemonDetailsRefreshButton() {
  const t = useTranslations('DetailsPanel');
  const router = useRouter();

  return (
    <button
      type="button"
      className="details-panel__refresh"
      aria-label={t('refreshAria')}
      onClick={() => router.refresh()}
    >
      {t('refresh')}
    </button>
  );
}
