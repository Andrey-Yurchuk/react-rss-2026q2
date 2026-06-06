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

function countDetailsCalls(id: number) {
  return loadPokemonByIdMock.mock.calls.filter(([actualId]) => actualId === id).length;
}

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
  describe('details query behavior', () => {
    it('shows Loading details… while the details query is pending', async () => {
      let resolveDetails: (value: {
        id: number;
        name: string;
        description: string;
      }) => void = () => undefined;
      loadPokemonByIdMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDetails = resolve;
          })
      );

      renderDetailsPanel();

      expect(screen.getByText('Loading details…')).toBeInTheDocument();
      expect(countDetailsCalls(25)).toBe(1);

      resolveDetails({
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
      });

      await waitFor(() =>
        expect(screen.queryByText('Loading details…')).not.toBeInTheDocument()
      );
    });

    it('shows pokemon details when the details query succeeds', async () => {
      loadPokemonByIdMock.mockResolvedValue({
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
      });

      renderDetailsPanel();

      expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'pikachu', level: 3 })).toBeInTheDocument();
      expect(screen.getByText('Types: electric. Height: 4, weight: 60.')).toBeInTheDocument();
      expect(countDetailsCalls(25)).toBe(1);
    });

    it('does not fetch and shows not found when details id is invalid', async () => {
      renderDetailsPanel('/?page=1&details=abc');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Pokemon details were not found.'
      );
      expect(loadPokemonByIdMock).not.toHaveBeenCalled();
      expect(countDetailsCalls(25)).toBe(0);
    });

    it('shows API error message when detail fetch fails with ApiRequestError', async () => {
      loadPokemonByIdMock.mockRejectedValueOnce(
        new ApiRequestError('No Pokemon found for that id.', 404)
      );

      renderDetailsPanel();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No Pokemon found for that id.'
      );
      expect(countDetailsCalls(25)).toBe(1);
    });

    it('shows generic error when detail fetch fails unexpectedly', async () => {
      loadPokemonByIdMock.mockRejectedValueOnce(new Error('network down'));

      renderDetailsPanel();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Unable to load Pokemon details. Check your connection'
      );
      expect(countDetailsCalls(25)).toBe(1);
    });

    it('navigates back to the list while preserving the page on close', async () => {
      const user = userEvent.setup();
      loadPokemonByIdMock.mockResolvedValue({
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
      expect(countDetailsCalls(25)).toBe(1);

      await user.click(screen.getByRole('button', { name: /refresh details/i }));

      await waitFor(() => expect(countDetailsCalls(25)).toBe(2));
      expect(screen.getByText('Pokedex #25')).toBeInTheDocument();
    });

    it('shows Refreshing details… while manually refreshing cached details', async () => {
      let resolveRefresh: (value: {
        id: number;
        name: string;
        description: string;
      }) => void = () => undefined;
      loadPokemonByIdMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRefresh = resolve;
          })
      );

      const user = userEvent.setup();
      renderDetailsPanel();

      await waitFor(() => expect(countDetailsCalls(25)).toBe(1));
      resolveRefresh({
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
      });
      expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();

      loadPokemonByIdMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRefresh = resolve;
          })
      );

      await user.click(screen.getByRole('button', { name: /refresh details/i }));

      expect(screen.getByText('Refreshing details…')).toBeInTheDocument();
      resolveRefresh({
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
      });
      await waitFor(() =>
        expect(screen.queryByText('Refreshing details…')).not.toBeInTheDocument()
      );
      expect(countDetailsCalls(25)).toBe(2);
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
      expect(countDetailsCalls(25)).toBe(1);

      unmount();

      renderWithRouter(panel, { route: '/?page=2&details=25', queryClient });

      expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
      expect(countDetailsCalls(25)).toBe(1);
    });
  });
});
