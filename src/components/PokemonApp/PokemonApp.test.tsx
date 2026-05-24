import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POKEAPI_POKEMON_URL, POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { seedLocalStorage } from '../../test-utils/mocks';
import {
  fireEvent,
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils/render';
import { AboutPage } from '../../pages/AboutPage/index.ts';
import { PokemonDetailsPanel } from '../PokemonDetailsPanel/index.ts';
import { PokemonApp } from './PokemonApp';

vi.mock('../../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonResults: vi.fn(),
    loadPokemonById: vi.fn(),
  };
});

import {
  ApiRequestError,
  loadPokemonById,
  loadPokemonResults,
} from '../../services/pokemonApi';

const loadPokemonResultsMock = vi.mocked(loadPokemonResults);
const loadPokemonByIdMock = vi.mocked(loadPokemonById);

beforeEach(() => {
  loadPokemonResultsMock.mockReset();
  loadPokemonByIdMock.mockReset();
  useSelectedItemsStore.setState({ selectedItems: [] });
});

function renderPokemonApp(route = '/?page=1') {
  return renderWithRouter(<PokemonApp />, { route });
}

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="current-location">{location.pathname}{location.search}</p>;
}

function renderPokemonAppRoutes(route = '/?page=1') {
  return renderWithRouter(
    <>
      <Routes>
        <Route path="/" element={<PokemonApp />}>
          <Route index element={<PokemonDetailsPanel />} />
        </Route>
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

function renderPokemonAppWithAboutRoute(route = '/?page=1') {
  return renderWithRouter(
    <>
      <Routes>
        <Route path="/" element={<PokemonApp />}>
          <Route index element={<PokemonDetailsPanel />} />
        </Route>
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

describe('PokemonApp', () => {
  it('loads initial data from hydrated localStorage value', async () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PIKACHU ');
    loadPokemonResultsMock.mockResolvedValueOnce({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonApp();

    await waitFor(() => {
      expect(loadPokemonResultsMock).toHaveBeenCalledWith('pikachu', 1);
    });
    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
  });

  it('shows loading state while request is pending', async () => {
    let resolveRequest: (value: {
      items: Array<{ id: number; name: string; description: string }>;
      totalCount: number;
    }) => void = () => undefined;
    const pendingRequest = new Promise<{
      items: Array<{ id: number; name: string; description: string }>;
      totalCount: number;
    }>((resolve) => {
      resolveRequest = resolve;
    });
    loadPokemonResultsMock.mockReturnValueOnce(pendingRequest);

    renderPokemonApp();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    resolveRequest({ items: [], totalCount: 0 });
    await waitFor(() =>
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    );
  });

  it('shows API error message when request fails with ApiRequestError', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that name.', 404)
    );

    renderPokemonApp();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No Pokemon found for that name.'
    );
  });

  it('normalizes search query, saves it to localStorage and avoids duplicate request', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock
      .mockResolvedValueOnce({ items: [], totalCount: 0 })
      .mockResolvedValueOnce({ items: [], totalCount: 0 })
      .mockResolvedValueOnce({
        items: [
          {
            id: 25,
            name: 'pikachu',
            description: 'Types: electric. Height: 4, weight: 60.',
          },
        ],
        totalCount: 1,
      });

    renderPokemonApp();
    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));

    await user.clear(screen.getByLabelText(/search pok.mon by exact name/i));
    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      '  PiKaChu '
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(loadPokemonResultsMock).toHaveBeenCalledWith('pikachu', 1)
    );
    await waitFor(() =>
      expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBe('pikachu')
    );
    const callsAfterFirstSearch = loadPokemonResultsMock.mock.calls.length;

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(loadPokemonResultsMock.mock.calls.length).toBe(callsAfterFirstSearch);
  });

  it('loads results when page changes in URL', async () => {
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    const user = userEvent.setup();
    renderPokemonApp('/?page=1');

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(screen.getByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
  });

  it('opens details in the Outlet and closes them while preserving the page', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 40,
    });
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

    renderPokemonAppRoutes('/?page=2');

    expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
      .toBeInTheDocument();
    await screen.findByRole('heading', { name: 'pikachu' });

    await user.click(screen.getByRole('button', { name: /view details for pikachu/i }));

    expect(screen.getByText('Loading details…')).toBeInTheDocument();
    resolveDetails({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });
    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=2&details=25'
    );

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
        .toBeInTheDocument()
    );
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=2');
  });

  it('keeps the details panel open when changing page', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));
    loadPokemonByIdMock.mockResolvedValue({
      id: 1,
      name: 'bulbasaur',
      description: 'Types: grass, poison. Height: 7, weight: 69.',
    });

    renderPokemonAppRoutes('/?page=1&details=1');

    expect(await screen.findByText('Pokedex #1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(screen.getByText('Pokedex #1')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=2&details=1'
    );
  });

  it('shows pagination only after items are loaded', async () => {
    loadPokemonResultsMock.mockResolvedValueOnce({
      items: [
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 40,
    });

    renderPokemonApp();

    expect(screen.queryByRole('navigation', { name: /results pagination/i })).not
      .toBeInTheDocument();

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('resets page to 1 in the URL when search input changes', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 2,
          name: 'pokemon-2',
          description: 'Page 2 item.',
        },
      ],
      totalCount: 40,
    });

    renderPokemonAppRoutes('/?page=2');

    await screen.findByRole('heading', { name: 'pokemon-2' });
    await user.type(screen.getByLabelText(/search pok.mon by exact name/i), 'a');

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1')
    );
  });

  it('closes details when clicking the main results panel', async () => {
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 40,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=2&details=25');

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('main', { name: /main pokemon results panel/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
        .toBeInTheDocument()
    );
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=2');
  });

  it('adds page=1 to the URL on first visit when page param is missing', async () => {
    loadPokemonResultsMock.mockResolvedValue({ items: [], totalCount: 0 });

    renderPokemonAppRoutes('/');

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1')
    );
  });

  it('shows generic error when list request fails unexpectedly', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(new Error('network down'));

    renderPokemonApp();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to reach the Pokemon API. Check your connection.'
    );
  });

  it('toggles Zustand selection on checkbox click without opening details', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonAppRoutes('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(useSelectedItemsStore.getState().selectedItems).toEqual([
      {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
        detailsUrl: `${POKEAPI_POKEMON_URL}/25`,
      },
    ]);
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1');
    expect(
      screen.queryByRole('complementary', { name: /pokemon details/i })
    ).not.toBeInTheDocument();
    expect(loadPokemonByIdMock).not.toHaveBeenCalled();
  });

  it('opens details on card body click without modifying Zustand selection', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(
      screen.getByRole('button', { name: /view details for pikachu/i })
    );

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=1&details=25'
    );
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).not.toBeChecked();
  });

  it('keeps checkbox selection across page navigation', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    renderPokemonAppRoutes('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /select pokemon-1/i }));
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);
    expect(
      screen.getByRole('checkbox', { name: /select pokemon-2/i })
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /select pokemon-1/i })
    ).toBeChecked();
  });

  it('keeps checkbox selection across details open/close', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    await user.click(
      screen.getByRole('button', { name: /view details for pikachu/i })
    );
    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();

    await user.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() =>
      expect(
        screen.queryByRole('complementary', { name: /pokemon details/i })
      ).not.toBeInTheDocument()
    );
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });

  it('shows flyout with count after selecting items and clears it via Unselect all', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 2,
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    expect(
      screen.queryByRole('region', { name: /selected pokemon/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    const flyout = await screen.findByRole('region', {
      name: /selected pokemon/i,
    });
    expect(flyout).toHaveTextContent('1 item selected');
    expect(
      screen.getByRole('button', { name: /download/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    );

    expect(
      screen.getByRole('region', { name: /selected pokemon/i })
    ).toHaveTextContent('2 items selected');

    await user.click(screen.getByRole('button', { name: /unselect all/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: /selected pokemon/i })
      ).not.toBeInTheDocument()
    );
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
  });

  it('keeps Zustand selection when navigating to /about and back', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonAppWithAboutRoute('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);

    await user.click(screen.getByRole('link', { name: /about/i }));
    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/about')
    );
    expect(screen.queryByRole('heading', { name: 'pikachu' })).not.toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);

    await user.click(screen.getByRole('link', { name: /back to pokemon search/i }));

    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });
});
