import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { POKEMON_SEARCH_STORAGE_KEY } from '../constants';
import { seedLocalStorage } from '../test-utils/mocks';
import { render, screen, waitFor } from '../test-utils/render';
import { PokemonApp } from './PokemonApp';

vi.mock('../services/pokemonApi', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
  loadPokemonResults: vi.fn(),
}));

import { ApiRequestError, loadPokemonResults } from '../services/pokemonApi';

const loadPokemonResultsMock = vi.mocked(loadPokemonResults);

describe('PokemonApp', () => {
  it('loads initial data from hydrated localStorage value', async () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PIKACHU ');
    loadPokemonResultsMock.mockResolvedValueOnce([
      { name: 'pikachu', description: 'Types: electric. Height: 4, weight: 60.' },
    ]);

    render(<PokemonApp />);

    await waitFor(() => {
      expect(loadPokemonResultsMock).toHaveBeenCalledWith('pikachu');
    });
    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
  });

  it('shows loading state while request is pending', async () => {
    let resolveRequest: (value: Array<{ name: string; description: string }>) => void =
      () => undefined;
    const pendingRequest = new Promise<Array<{ name: string; description: string }>>(
      (resolve) => {
        resolveRequest = resolve;
      }
    );
    loadPokemonResultsMock.mockReturnValueOnce(pendingRequest);

    render(<PokemonApp />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    resolveRequest([]);
    await waitFor(() =>
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    );
  });

  it('shows API error message when request fails with ApiRequestError', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that name.', 404)
    );

    render(<PokemonApp />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No Pokemon found for that name.'
    );
  });

  it('normalizes search query, saves it to localStorage and avoids duplicate request', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { name: 'pikachu', description: 'Types: electric. Height: 4, weight: 60.' },
      ]);

    render(<PokemonApp />);
    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith(''));

    await user.clear(screen.getByLabelText(/search pok.mon by exact name/i));
    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      '  PiKaChu '
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('pikachu'));
    await waitFor(() =>
      expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBe('pikachu')
    );
    const callsAfterFirstSearch = loadPokemonResultsMock.mock.calls.length;

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(loadPokemonResultsMock.mock.calls.length).toBe(callsAfterFirstSearch);
  });
});
