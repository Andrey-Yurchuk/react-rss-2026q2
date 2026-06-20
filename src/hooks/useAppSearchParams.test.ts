import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getNavigationSnapshot } from './navigationStore.ts';
import { resetMockNavigation } from '../test-utils/navigationStore.ts';
import { useAppSearchParams } from './useAppSearchParams.ts';

describe('useAppSearchParams', () => {
  beforeEach(() => {
    resetMockNavigation('/en?page=1');
  });

  it('returns pathname and search params from the navigation store in tests', () => {
    const { result } = renderHook(() => useAppSearchParams());

    expect(result.current.pathname).toBe('/en');
    expect(result.current.searchParams.get('page')).toBe('1');
  });

  it('updates search params via setSearchParams', () => {
    const { result } = renderHook(() => useAppSearchParams());

    act(() => {
      result.current.setSearchParams(
        new URLSearchParams('page=2&query=pikachu')
      );
    });

    expect(getNavigationSnapshot().searchParams.toString()).toBe(
      'page=2&query=pikachu'
    );
  });

  it('clears query when setSearchParams receives empty params', () => {
    resetMockNavigation('/en?page=1&query=pikachu');
    const { result } = renderHook(() => useAppSearchParams());

    act(() => {
      result.current.setSearchParams(new URLSearchParams());
    });

    expect(getNavigationSnapshot().pathname).toBe('/en');
    expect(getNavigationSnapshot().searchParams.toString()).toBe('');
  });

  it('supports functional updater for setSearchParams', () => {
    resetMockNavigation('/en?page=1');
    const { result } = renderHook(() => useAppSearchParams());

    act(() => {
      result.current.setSearchParams((current) => {
        current.set('query', 'bulbasaur');
        return current;
      });
    });

    expect(getNavigationSnapshot().searchParams.get('query')).toBe('bulbasaur');
  });

  it('navigateToSearch updates href in test env', () => {
    resetMockNavigation('/en?page=1');
    const { result } = renderHook(() => useAppSearchParams());

    act(() => {
      result.current.navigateToSearch('page=2&query=charizard');
    });

    expect(getNavigationSnapshot().searchParams.toString()).toBe(
      'page=2&query=charizard'
    );
  });

  it('navigateToSearch clears query when query string is empty', () => {
    resetMockNavigation('/en?page=1&query=pikachu');
    const { result } = renderHook(() => useAppSearchParams());

    act(() => {
      result.current.navigateToSearch('');
    });

    expect(getNavigationSnapshot().pathname).toBe('/en');
    expect(getNavigationSnapshot().searchParams.toString()).toBe('');
  });
});
