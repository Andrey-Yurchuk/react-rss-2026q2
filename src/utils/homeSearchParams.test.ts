import { describe, expect, it } from 'vitest';
import {
  buildHomeSearchHref,
  buildLocalizedHomeSearchHref,
  buildHomeSearchQueryString,
  hasPageSearchParam,
  normalizeQueryParam,
  parseDetailsParam,
  parseHomeSearchParams,
  parseHomeSearchParamsFromHref,
} from './homeSearchParams';

describe('normalizeQueryParam', () => {
  it('returns empty string for missing values', () => {
    expect(normalizeQueryParam(null)).toBe('');
    expect(normalizeQueryParam(undefined)).toBe('');
    expect(normalizeQueryParam('')).toBe('');
  });

  it('trims and lowercases query values', () => {
    expect(normalizeQueryParam('  PiKaChu ')).toBe('pikachu');
  });
});

describe('parseDetailsParam', () => {
  it('returns null for missing or invalid values', () => {
    expect(parseDetailsParam(null)).toBeNull();
    expect(parseDetailsParam('')).toBeNull();
    expect(parseDetailsParam('abc')).toBeNull();
    expect(parseDetailsParam('0')).toBeNull();
  });

  it('returns positive integers', () => {
    expect(parseDetailsParam('25')).toBe(25);
  });
});

describe('parseHomeSearchParams', () => {
  it('applies defaults for missing params', () => {
    expect(parseHomeSearchParams({})).toEqual({
      page: 1,
      query: '',
      detailsId: null,
    });
  });

  it('normalizes page, query, and details params', () => {
    expect(
      parseHomeSearchParams({
        page: '2',
        query: '  PiKaChu ',
        details: '25',
      })
    ).toEqual({
      page: 2,
      query: 'pikachu',
      detailsId: 25,
    });
  });
});

describe('hasPageSearchParam', () => {
  it('detects when page param is present', () => {
    expect(hasPageSearchParam({ page: '2' })).toBe(true);
    expect(hasPageSearchParam({})).toBe(false);
  });
});

describe('buildHomeSearchQueryString', () => {
  it('builds pagination links without query', () => {
    expect(buildHomeSearchQueryString({ query: '', page: 2 })).toBe('page=2');
  });

  it('preserves query and details params', () => {
    expect(
      buildHomeSearchQueryString({
        query: 'pikachu',
        page: 1,
        detailsId: 25,
      })
    ).toBe('page=1&query=pikachu&details=25');
  });

  it('keeps details when paginating', () => {
    expect(
      buildHomeSearchQueryString({
        query: '',
        page: 2,
        detailsId: 1,
      })
    ).toBe('page=2&details=1');
  });
});

describe('buildHomeSearchHref', () => {
  it('builds localized home hrefs', () => {
    expect(
      buildHomeSearchHref({
        query: 'pikachu',
        page: 1,
      })
    ).toBe('/?page=1&query=pikachu');
  });
});

describe('buildLocalizedHomeSearchHref', () => {
  it('builds locale-prefixed home hrefs', () => {
    expect(
      buildLocalizedHomeSearchHref('ru', {
        query: 'pikachu',
        page: 1,
      })
    ).toBe('/ru?page=1&query=pikachu');
  });
});

describe('parseHomeSearchParamsFromHref', () => {
  it('parses query strings from href values', () => {
    expect(parseHomeSearchParamsFromHref('/?page=2&details=25')).toEqual({
      page: 2,
      query: '',
      detailsId: 25,
    });
  });
});
