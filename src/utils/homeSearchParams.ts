import { parsePageParam } from './urlParams.ts';

export type HomeSearchParams = {
  page: number;
  query: string;
  detailsId: number | null;
};

export type HomeSearchParamsInput = Record<
  string,
  string | string[] | undefined
>;

function getSingleParam(
  raw: HomeSearchParamsInput,
  key: string
): string | undefined {
  const value = raw[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function normalizeQueryParam(raw: string | null | undefined): string {
  if (raw == null || raw === '') {
    return '';
  }

  return raw.trim().toLowerCase();
}

export function parseDetailsParam(
  raw: string | null | undefined
): number | null {
  if (raw == null || raw === '') {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function parseHomeSearchParams(
  raw: HomeSearchParamsInput
): HomeSearchParams {
  return {
    page: parsePageParam(getSingleParam(raw, 'page') ?? null),
    query: normalizeQueryParam(getSingleParam(raw, 'query')),
    detailsId: parseDetailsParam(getSingleParam(raw, 'details')),
  };
}

export function hasPageSearchParam(raw: HomeSearchParamsInput): boolean {
  return getSingleParam(raw, 'page') !== undefined;
}

export type BuildHomeSearchHrefOptions = {
  query: string;
  page: number;
  detailsId?: number | null;
};

export function buildHomeSearchQueryString({
  query,
  page,
  detailsId = null,
}: BuildHomeSearchHrefOptions): string {
  const params = new URLSearchParams();
  params.set('page', String(page));

  if (query !== '') {
    params.set('query', query);
  }

  if (detailsId != null && detailsId > 0) {
    params.set('details', String(detailsId));
  }

  return params.toString();
}

export function buildHomeSearchHref(
  options: BuildHomeSearchHrefOptions
): string {
  return `/?${buildHomeSearchQueryString(options)}`;
}

export function buildLocalizedHomeSearchHref(
  locale: string,
  options: BuildHomeSearchHrefOptions
): string {
  const query = buildHomeSearchQueryString(options);
  return `/${locale}?${query}`;
}

export function parseHomeSearchParamsFromHref(href: string): HomeSearchParams {
  const url = new URL(href, 'http://localhost');
  return parseHomeSearchParams({
    page: url.searchParams.get('page') ?? undefined,
    query: url.searchParams.get('query') ?? undefined,
    details: url.searchParams.get('details') ?? undefined,
  });
}
