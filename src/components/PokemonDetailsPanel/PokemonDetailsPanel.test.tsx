import { describe, expect, it, vi } from 'vitest';
import { ApiRequestError, loadPokemonById } from '../../services/pokemonApi';
import { loadPokemonDetailsPanelData } from './PokemonDetailsPanel';

vi.mock('../../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonById: vi.fn(),
  };
});

const loadPokemonByIdMock = vi.mocked(loadPokemonById);

describe('loadPokemonDetailsPanelData', () => {
  it('returns details payload on success', async () => {
    loadPokemonByIdMock.mockResolvedValueOnce({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    await expect(loadPokemonDetailsPanelData(25)).resolves.toEqual({
      details: {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
      },
      error: null,
    });
  });

  it('maps ApiRequestError to user-facing message', async () => {
    loadPokemonByIdMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that id.', 404)
    );

    await expect(loadPokemonDetailsPanelData(999)).resolves.toEqual({
      details: null,
      error: 'No Pokemon found for that id.',
    });
  });

  it('maps unknown errors to generic details message', async () => {
    loadPokemonByIdMock.mockRejectedValueOnce(new Error('network down'));

    await expect(loadPokemonDetailsPanelData(999)).resolves.toEqual({
      details: null,
      error: 'Unable to load Pokemon details. Check your connection',
    });
  });
});
