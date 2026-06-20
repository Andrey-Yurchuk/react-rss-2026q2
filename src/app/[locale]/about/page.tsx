import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '../../../i18n/navigation.ts';

type AboutRoutePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: AboutRoutePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return {
    title: t('title'),
    description: t('lead'),
  };
}

export default async function AboutRoutePage({ params }: AboutRoutePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AboutPage' });

  return (
    <main className="static-page static-page--about">
      <p className="static-page__eyebrow">{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p className="static-page__lead">{t('lead')}</p>

      <section className="about-card" aria-labelledby="about-author-title">
        <h2 id="about-author-title">{t('authorTitle')}</h2>
        <p>
          {t('authorLead')}{' '}
          <a
            className="static-page__link"
            href="https://github.com/Andrey-Yurchuk"
            target="_blank"
            rel="noreferrer"
          >
            Andrey Yurchuk
          </a>
        </p>
      </section>

      <section className="about-card" aria-labelledby="about-course-title">
        <h2 id="about-course-title">{t('courseTitle')}</h2>
        <p>
          {t('courseLead')}{' '}
          <a
            className="static-page__link"
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            RS School ReactJS course
          </a>
        </p>
      </section>

      <Link className="static-page__home-link" href="/?page=1">
        {t('backHome')}
      </Link>
    </main>
  );
}
