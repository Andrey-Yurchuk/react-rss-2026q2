import { getTranslations } from 'next-intl/server';
import { Link } from '../../i18n/navigation.ts';

export default async function LocaleNotFoundPage() {
  const t = await getTranslations('NotFoundPage');

  return (
    <main className="static-page static-page--not-found">
      <p className="static-page__eyebrow">{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p className="static-page__lead">{t('lead')}</p>
      <Link className="static-page__home-link" href="/?page=1">
        {t('backHome')}
      </Link>
    </main>
  );
}
