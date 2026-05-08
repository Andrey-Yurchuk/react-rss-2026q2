import { describe, expect, it } from 'vitest';
import { LIST_PAGE_SIZE, POKEAPI_POKEMON_URL } from '../constants';
import { mockFetchJsonSequence } from '../test-utils/mocks';
import {
  ApiRequestError,
  loadPokemonByName,
  loadPokemonListPage,
  loadPokemonResults,
} from './pokemonApi';

describe('pokemonApi', () => {
  it('loads first pokemon list page and maps card models', async () => {
    const fetchMock = mockFetchJsonSequence(
      [
        {
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25' },
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1' },
          ],
        },
      ],
      [{ name: 'pikachu', height: 4, weight: 60, types: [{ type: { name: 'electric' } }] }],
      [
        {
          name: 'bulbasaur',
          height: 7,
          weight: 69,
          types: [{ type: { name: 'grass' } }, { type: { name: 'poison' } }],
        },
      ]
    );

    const cards = await loadPokemonListPage();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      `${POKEAPI_POKEMON_URL}?limit=${LIST_PAGE_SIZE}&offset=0`
    );
    expect(cards).toEqual([
      { name: 'pikachu', description: 'Types: electric. Height: 4, weight: 60.' },
      {
        name: 'bulbasaur',
        description: 'Types: grass, poison. Height: 7, weight: 69.',
      },
    ]);
  });

  it('loads pokemon by name and normalizes search term', async () => {
    const fetchMock = mockFetchJsonSequence([
      { name: 'pikachu', height: 4, weight: 60, types: [{ type: { name: 'electric' } }] },
    ]);

    const cards = await loadPokemonByName('  PIKACHU ');

    expect(fetchMock).toHaveBeenCalledWith(`${POKEAPI_POKEMON_URL}/pikachu`);
    expect(cards).toEqual([
      { name: 'pikachu', description: 'Types: electric. Height: 4, weight: 60.' },
    ]);
  });

  it('throws ApiRequestError with 404 message', async () => {
    mockFetchJsonSequence([{}, 404]);

    await expect(loadPokemonByName('unknown')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
      message: 'No Pokemon found for that name.',
    } satisfies Partial<ApiRequestError>);
  });

  it('throws ApiRequestError with 4xx generic message', async () => {
    mockFetchJsonSequence([{}, 400]);

    await expect(loadPokemonByName('bad-request')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      message: 'The request could not be completed.',
    } satisfies Partial<ApiRequestError>);
  });

  it('throws ApiRequestError with 5xx message', async () => {
    mockFetchJsonSequence([{}, 500]);

    await expect(loadPokemonByName('server-fail')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 500,
      message: 'The server returned an error. Please try again later.',
    } satisfies Partial<ApiRequestError>);
  });

  it('throws validation ApiRequestError for invalid search query', async () => {
    await expect(loadPokemonResults('пикачу')).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
      message:
        'For Pokemon search, use a Pokedex number or an English name (Latin letters, digits, and hyphens only)',
    } satisfies Partial<ApiRequestError>);
  });

  it('delegates empty query to list page loader', async () => {
    const fetchMock = mockFetchJsonSequence(
      [{ results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25' }] }],
      [{ name: 'pikachu', height: 4, weight: 60, types: [{ type: { name: 'electric' } }] }]
    );

    const cards = await loadPokemonResults('');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(cards).toEqual([
      { name: 'pikachu', description: 'Types: electric. Height: 4, weight: 60.' },
    ]);
  });
});
