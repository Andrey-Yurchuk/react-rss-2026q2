import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiRequestError,
  loadPokemonById,
} from '../../services/pokemonApi';
import {
  createTestQueryClient,
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils/render';
import { PokemonDetailsPanel } from './PokemonDetailsPanel';

vi.mock('../../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonById: vi.fn(),
  };
});

const loadPokemonByIdMock = vi.mocked(loadPokemonById);

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="current-location">{location.pathname}{location.search}</p>;
}

function renderDetailsPanel(route = '/?page=2&details=25', queryClient = createTestQueryClient()) {
  return renderWithRouter(
    <>
      <Routes>
        <Route path="/" element={<PokemonDetailsPanel />} />
      </Routes>
      <LocationProbe />
    </>,
    { route, queryClient }
  );
}

beforeEach(() => {
  loadPokemonByIdMock.mockReset();
});

describe('PokemonDetailsPanel', () => {
  it('shows loading state then pokemon details', async () => {
    let resolveDetails: (value: {
      id: number;
      name: string;
      description: string;
    }) => void = () => undefined;
    loadPokemonByIdMock.mockReturnValue(
      new Promise((resolve) => {
        resolveDetails = resolve;
      })
    );

    renderDetailsPanel();

    expect(screen.getByText('Loading details…')).toBeInTheDocument();
    resolveDetails({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'pikachu', level: 3 })).toBeInTheDocument();
    expect(loadPokemonByIdMock).toHaveBeenCalledWith(25);
  });

  it('shows error when details id is invalid', async () => {
    renderDetailsPanel('/?page=1&details=abc');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pokemon details were not found.'
    );
    expect(loadPokemonByIdMock).not.toHaveBeenCalled();
  });

  it('shows API error message when detail fetch fails', async () => {
    loadPokemonByIdMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that id.', 404)
    );

    renderDetailsPanel();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No Pokemon found for that id.'
    );
  });

  it('shows generic error when detail fetch fails unexpectedly', async () => {
    loadPokemonByIdMock.mockRejectedValueOnce(new Error('network down'));

    renderDetailsPanel();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load Pokemon details. Check your connection'
    );
  });

  it('navigates back to the list while preserving the page on close', async () => {
    const user = userEvent.setup();
    loadPokemonByIdMock.mockResolvedValueOnce({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderDetailsPanel();

    await screen.findByText('Pokedex #25');
    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=2')
    );
  });

  it('manually refreshes the current details query', async () => {
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    const user = userEvent.setup();
    renderDetailsPanel();

    await screen.findByText('Pokedex #25');
    expect(loadPokemonByIdMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /refresh details/i }));

    await waitFor(() => expect(loadPokemonByIdMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Pokedex #25')).toBeInTheDocument();
  });

  it('does not show Refresh details for an invalid id', async () => {
    renderDetailsPanel('/?page=1&details=abc');

    await screen.findByRole('alert');
    expect(
      screen.queryByRole('button', { name: /refresh details/i })
    ).not.toBeInTheDocument();
    expect(loadPokemonByIdMock).not.toHaveBeenCalled();
  });

  it('reuses cached details when reopening the same pokemon id', async () => {
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    const queryClient = createTestQueryClient();
    const panel = (
      <Routes>
        <Route path="/" element={<PokemonDetailsPanel />} />
      </Routes>
    );

    const { unmount } = renderWithRouter(panel, {
      route: '/?page=2&details=25',
      queryClient,
    });

    await screen.findByText('Pokedex #25');
    expect(loadPokemonByIdMock).toHaveBeenCalledTimes(1);

    unmount();

    renderWithRouter(panel, { route: '/?page=2&details=25', queryClient });

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(loadPokemonByIdMock).toHaveBeenCalledTimes(1);
  });
});
