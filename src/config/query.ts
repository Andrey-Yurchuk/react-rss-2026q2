const DEFAULT_QUERY_CACHE_TTL_MS = 5 * 60 * 1000;

function parsePositiveMs(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export const QUERY_CACHE_TTL_MS =
  parsePositiveMs(process.env.NEXT_PUBLIC_QUERY_CACHE_TTL_MS) ??
  DEFAULT_QUERY_CACHE_TTL_MS;
