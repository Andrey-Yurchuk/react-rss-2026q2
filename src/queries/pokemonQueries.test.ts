import { describe, expect, it } from 'vitest';
import { ApiRequestError } from '../services/pokemonApi.ts';
import {
  getPokemonDetailsErrorMessage,
  getPokemonListErrorMessage,
  pokemonQueryKeys,
} from './pokemonQueries.ts';

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
