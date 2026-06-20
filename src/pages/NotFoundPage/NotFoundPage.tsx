'use client';

import { useTranslations } from 'next-intl';
import { Link } from 'react-router-dom';
import '../../app/App.css';

export function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <main className="static-page static-page--not-found">
      <p className="static-page__eyebrow">{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p className="static-page__lead">{t('lead')}</p>
      <Link className="static-page__home-link" to="/?page=1">
        {t('backHome')}
      </Link>
    </main>
  );
}
