import { routing } from '../../i18n/routing.ts';
import {
  buildLocalizedHomeSearchHref,
  normalizeQueryParam,
} from '../../utils/homeSearchParams.ts';

function normalizeLocaleParam(locale: string): string {
  if (routing.locales.some((supportedLocale) => supportedLocale === locale)) {
    return locale;
  }

  return routing.defaultLocale;
}

export function buildSearchRedirectHref(locale: string, formData: FormData): string {
  const normalizedLocale = normalizeLocaleParam(locale);
  const normalizedQuery = normalizeQueryParam(formData.get('query')?.toString());

  return buildLocalizedHomeSearchHref(normalizedLocale, {
    query: normalizedQuery,
    page: 1,
  });
}
