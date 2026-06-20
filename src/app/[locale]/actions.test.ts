import { describe, expect, it } from 'vitest';
import { buildSearchRedirectHref } from './actions';

describe('buildSearchRedirectHref', () => {
  it('builds locale-aware redirect with normalized query', () => {
    const formData = new FormData();
    formData.set('query', '  PiKaChu ');

    expect(buildSearchRedirectHref('ru', formData)).toBe('/ru?page=1&query=pikachu');
  });

  it('omits query when submitted value is empty', () => {
    const formData = new FormData();
    formData.set('query', '   ');

    expect(buildSearchRedirectHref('en', formData)).toBe('/en?page=1');
  });

  it('falls back to default locale for unsupported locale', () => {
    const formData = new FormData();
    formData.set('query', 'pikachu');

    expect(buildSearchRedirectHref('de', formData)).toBe('/en?page=1&query=pikachu');
  });
});
