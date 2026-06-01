import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  ApiRequestError,
  loadPokemonById,
  loadPokemonResults,
  type PokemonCardModel,
  type PokemonListPageResult,
} from '../services/pokemonApi.ts';

const POKEMON_LIST_GENERIC_ERROR =
  'Unable to reach the Pokemon API. Check your connection.';
const POKEMON_DETAILS_GENERIC_ERROR =
  'Unable to load Pokemon details. Check your connection';

export const pokemonQueryKeys = {
  all: ['pokemon'] as const,
  results: (normalizedQuery: string, page: number) =>
    [...pokemonQueryKeys.all, 'results', normalizedQuery, page] as const,
  details: (id: number) =>
    [...pokemonQueryKeys.all, 'details', id] as const,
};

type UsePokemonResultsQueryOptions = Omit<
  UseQueryOptions<PokemonListPageResult, Error>,
  'queryKey' | 'queryFn'
>;

type UsePokemonDetailsQueryOptions = Omit<
  UseQueryOptions<PokemonCardModel, Error>,
  'queryKey' | 'queryFn' | 'enabled'
>;

export function getPokemonListErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return POKEMON_LIST_GENERIC_ERROR;
}

export function getPokemonDetailsErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  return POKEMON_DETAILS_GENERIC_ERROR;
}

export function usePokemonResultsQuery(
  normalizedQuery: string,
  page: number,
  options?: UsePokemonResultsQueryOptions
) {
  return useQuery({
    ...options,
    queryKey: pokemonQueryKeys.results(normalizedQuery, page),
    queryFn: () => loadPokemonResults(normalizedQuery, page),
  });
}

export function usePokemonDetailsQuery(
  id: number | null,
  options?: UsePokemonDetailsQueryOptions
) {
  const enabled = id !== null && (options?.enabled ?? true);

  return useQuery({
    ...options,
    queryKey:
      id !== null ? pokemonQueryKeys.details(id) : pokemonQueryKeys.all,
    queryFn: () => {
      if (id === null) {
        throw new Error('Pokemon id is required');
      }

      return loadPokemonById(id);
    },
    enabled,
  });
}
