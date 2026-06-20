import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '../test-utils/queryClient.ts';
import { mockFetchJsonSequence } from '../test-utils/mocks.ts';
import { ApiRequestError } from '../services/pokemonApi.ts';
import {
  getPokemonDetailsErrorMessage,
  getPokemonListErrorMessage,
  pokemonQueryKeys,
  usePokemonDetailsQuery,
} from './pokemonQueries.ts';

function createQueryWrapper() {
  const queryClient = createTestQueryClient();

  function QueryWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return QueryWrapper;
}

describe('pokemonQueryKeys', () => {
  it('builds stable root, results, and details keys', () => {
    expect(pokemonQueryKeys.all).toEqual(['pokemon']);
    expect(pokemonQueryKeys.results('pikachu', 2)).toEqual([
      'pokemon',
      'results',
      'pikachu',
      2,
    ]);
    expect(pokemonQueryKeys.details(25)).toEqual(['pokemon', 'details', 25]);
  });

  it('keeps distinct keys for different results queries', () => {
    const first = pokemonQueryKeys.results('', 1);
    const second = pokemonQueryKeys.results('charizard', 3);

    expect(first).not.toEqual(second);
  });
});

describe('pokemon query error helpers', () => {
  it('returns ApiRequestError message for list errors', () => {
    const error = new ApiRequestError('No Pokemon found for that name.', 404);

    expect(getPokemonListErrorMessage(error)).toBe(
      'No Pokemon found for that name.'
    );
  });

  it('returns generic list message for unknown errors', () => {
    expect(getPokemonListErrorMessage(new Error('network'))).toBe(
      'Unable to reach the Pokemon API. Check your connection.'
    );
    expect(getPokemonListErrorMessage(null)).toBe(
      'Unable to reach the Pokemon API. Check your connection.'
    );
  });

  it('returns ApiRequestError message for details errors', () => {
    const error = new ApiRequestError('The server returned an error. Please try again later.', 500);

    expect(getPokemonDetailsErrorMessage(error)).toBe(
      'The server returned an error. Please try again later.'
    );
  });

  it('returns generic details message for unknown errors', () => {
    expect(getPokemonDetailsErrorMessage(new Error('network'))).toBe(
      'Unable to load Pokemon details. Check your connection'
    );
  });
});

describe('usePokemonDetailsQuery', () => {
  it('loads pokemon details when id is provided', async () => {
    mockFetchJsonSequence([
      {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        types: [{ type: { name: 'electric' } }],
      },
    ]);

    const { result } = renderHook(() => usePokemonDetailsQuery(25), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });
  });

  it('stays idle when id is null', () => {
    const { result } = renderHook(() => usePokemonDetailsQuery(null), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
