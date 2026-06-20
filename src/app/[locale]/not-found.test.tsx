import { notFound } from 'next/navigation';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { IntlTestProvider } from '../../test-utils/intl.tsx';
import CatchAllPage from './[...rest]/page';
import LocaleNotFoundPage from './not-found';

describe('LocaleNotFoundPage', () => {
  it('renders localized English copy via client intl provider', () => {
    render(
      <IntlTestProvider locale="en">
        <LocaleNotFoundPage />
      </IntlTestProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Page not found' })
    ).toBeInTheDocument();
    expect(screen.getByText('404 error')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to Pokemon search' })
    ).toBeInTheDocument();
  });

  it('renders localized Russian copy via client intl provider', () => {
    render(
      <IntlTestProvider locale="ru">
        <LocaleNotFoundPage />
      </IntlTestProvider>
    );

    expect(
      screen.getByRole('heading', { name: 'Страница не найдена' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ошибка 404')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Назад к поиску Pokemon' })
    ).toBeInTheDocument();
  });
});

describe('CatchAllPage', () => {
  it('calls notFound for unknown locale routes', () => {
    CatchAllPage();

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
