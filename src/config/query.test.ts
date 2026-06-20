import { afterEach, describe, expect, it, vi } from 'vitest';

describe('QUERY_CACHE_TTL_MS', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses default cache ttl when env is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_QUERY_CACHE_TTL_MS', undefined);
    const { QUERY_CACHE_TTL_MS } = await import('./query.ts');

    expect(QUERY_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });

  it('uses positive env value when provided', async () => {
    vi.stubEnv('NEXT_PUBLIC_QUERY_CACHE_TTL_MS', '120000');
    const { QUERY_CACHE_TTL_MS } = await import('./query.ts');

    expect(QUERY_CACHE_TTL_MS).toBe(120000);
  });

  it('falls back to default for invalid env values', async () => {
    vi.stubEnv('NEXT_PUBLIC_QUERY_CACHE_TTL_MS', 'not-a-number');
    const { QUERY_CACHE_TTL_MS } = await import('./query.ts');

    expect(QUERY_CACHE_TTL_MS).toBe(5 * 60 * 1000);
  });
});
